#include <SFSE/SFSE.h>
#include <RE/Starfield.h>
#include <RE/B/BSScriptUtil.h>

#include <algorithm>
#include <atomic>
#include <charconv>
#include <cctype>
#include <cmath>
#include <cstdint>
#include <cstddef>
#include <cstdlib>
#include <cstdio>
#include <chrono>
#include <functional>
#include <memory>
#include <optional>
#include <string>
#include <string_view>
#include <vector>

#include "OSFUI_JSON.h"
#include "DirectQuery.h"

namespace
{
    OSFUI::API::Client g_ui;

    constexpr const char* kViewId = "console.command-center/main";
    constexpr const char* kBuildId = "1.0.6";
    constexpr std::size_t kMaxCommandLength = 1024;
    constexpr REL::Version kTestedRuntime{ 1, 16, 244, 0 };
    REL::Version g_runtimeVersion{};

    bool IsRuntimeSupported() noexcept
    {
        return g_runtimeVersion == kTestedRuntime;
    }

    std::string LowerASCII(std::string value)
    {
        std::transform(value.begin(), value.end(), value.begin(), [](unsigned char ch) {
            return static_cast<char>(std::tolower(ch));
        });
        return value;
    }

    std::atomic_bool g_captureActive{ false };
    struct CaptureLease
    {
        static std::shared_ptr<CaptureLease> TryAcquire()
        {
            bool expected = false;
            if (!g_captureActive.compare_exchange_strong(expected, true, std::memory_order_acq_rel)) {
                return {};
            }
            return std::shared_ptr<CaptureLease>{ new CaptureLease{} };
        }

        ~CaptureLease() { g_captureActive.store(false, std::memory_order_release); }

    private:
        CaptureLease() = default;
    };

    bool ExecuteConsoleCommand(std::string_view command) noexcept
    {
        if (command.empty() || command.size() > kMaxCommandLength) {
            return false;
        }

        try {
            std::string ownedCommand{ command };

            using Manager = void*;
            using ExecuteFunction = void(Manager, const char*);

            static REL::Relocation<Manager*> manager{ REL::ID(938528) };
            static REL::Relocation<ExecuteFunction*> execute{ REL::ID(113576) };

            if (!manager || !execute || !*manager) {
                return false;
            }

            execute(*manager, ownedCommand.c_str());
            return true;
        } catch (...) {
            return false;
        }
    }

    bool IsSafeBridgeString(std::string_view command) noexcept
    {
        if (command.empty() || command.size() > kMaxCommandLength) {
            return false;
        }

        // Reject line breaks and other control characters. Spaces, quotes,
        // semicolons, periods, brackets, etc. remain available to Starfield's
        // console parser for legitimate console commands.
        return std::none_of(command.begin(), command.end(), [](unsigned char ch) {
            return std::iscntrl(ch) != 0;
        });
    }

    bool QueueMainTaskAfter(
        std::chrono::milliseconds delay,
        std::function<void()> task,
        std::function<void()> onFailure = {}) noexcept;

    void OnExecute(const OSFUI::API::Request& raw, void*) noexcept
    {
        OSFUI::API::JsonRequest request{ raw };
        if (!request) {
            return;
        }

        // "command" is reserved by OSF UI for routing the bridge request.
        // Keep the actual Starfield console text in a differently named payload field.
        const auto command = request.Get<std::string>("consoleCommand");
        if (!command) {
            return;
        }
        if (!IsSafeBridgeString(*command)) {
            request.Reject("invalid-command", "Command is empty, too long, or contains control characters.");
            return;
        }
        if (g_captureActive.load(std::memory_order_acquire)) {
            request.Reject("query-busy", "Wait for the current inspection to finish before running another command.");
            return;
        }
        const bool closeBeforeExecute = request.Get<bool>("closeBeforeExecute").value_or(false);
        if (closeBeforeExecute) {
            if (!g_ui.RequestMenu(kViewId, false)) {
                request.Reject("close-failed", "OSF UI could not close CCC before opening the requested game menu.");
                return;
            }
            const std::string queuedCommand = *command;
            if (!QueueMainTaskAfter(std::chrono::milliseconds{ 150 }, [queuedCommand]() noexcept {
                (void)ExecuteConsoleCommand(queuedCommand);
            })) {
                request.Reject("execution-failed", "Could not schedule the command after closing CCC.");
                return;
            }
            (void)request.Respond("console.command-center.executeResult", OSFUI::API::Json{
                { "ok", true }, { "command", *command }, { "queuedAfterClose", true }
            });
            return;
        }
        if (!ExecuteConsoleCommand(*command)) {
            request.Reject("execution-failed", "Native Starfield console execution failed.");
            return;
        }

        (void)request.Respond("console.command-center.executeResult", OSFUI::API::Json{
            { "ok", true },
            { "command", *command }
        });
    }


    std::string ReadConsoleBuffer()
    {
        auto* consoleLog = RE::ConsoleLog::GetSingleton();
        if (!consoleLog || !consoleLog->buffer.data()) {
            return {};
        }

        const std::string_view view{ consoleLog->buffer };
        return std::string{ view };
    }

    std::string ConsoleBufferDelta(const std::string& before)
    {
        const auto after = ReadConsoleBuffer();
        if (after.size() >= before.size() && after.compare(0, before.size(), before) == 0) {
            return after.substr(before.size());
        }

        // Find a suffix/prefix overlap on rollover. Never return old history as
        // if it belonged to this query when the buffer cannot be correlated.
        for (auto offset = before.find('\n'); offset != std::string::npos; offset = before.find('\n', offset + 1)) {
            const auto suffix = std::string_view(before).substr(offset + 1);
            if (!suffix.empty() && after.starts_with(suffix)) return after.substr(suffix.size());
        }
        return {};
    }

    struct DelayedMainTask
    {
        std::chrono::steady_clock::time_point due;
        std::function<void()> task;
        std::function<void()> onFailure;
    };

    bool ScheduleDelayedMainTask(const std::shared_ptr<DelayedMainTask>& state) noexcept
    {
        try {
            const auto* taskInterface = SFSE::GetTaskInterface();
            if (!taskInterface) {
                return false;
            }

            taskInterface->AddTask([state]() mutable {
                if (std::chrono::steady_clock::now() < state->due) {
                    if (!ScheduleDelayedMainTask(state)) {
                        auto onFailure = std::move(state->onFailure);
                        state->task = {};
                        if (onFailure) onFailure();
                    }
                    return;
                }

                auto task = std::move(state->task);
                state->onFailure = {};
                if (task) task();
            });
            return true;
        } catch (...) {
            return false;
        }
    }

    bool QueueMainTaskAfter(
        std::chrono::milliseconds delay,
        std::function<void()> task,
        std::function<void()> onFailure) noexcept
    {
        try {
            auto state = std::make_shared<DelayedMainTask>();
            state->due = std::chrono::steady_clock::now() + delay;
            state->task = std::move(task);
            state->onFailure = std::move(onFailure);
            return ScheduleDelayedMainTask(state);
        } catch (...) {
            return false;
        }
    }

    struct ConsoleQueryCapture
    {
        std::shared_ptr<CaptureLease> lease;
        OSFUI::API::Request request{};
        std::string command;
        std::string bufferBefore;
        std::string lastOutput;
        std::uint32_t polls{ 0 };
        std::uint32_t stablePolls{ 0 };
    };

    constexpr std::uint32_t kConsoleQueryMaxPolls = 40;
    constexpr auto kConsoleQueryPollDelay = std::chrono::milliseconds{ 50 };

    void RejectConsoleQuery(const std::shared_ptr<ConsoleQueryCapture>& state, const char* code, const char* message) noexcept
    {
        if (state) {
            state->request.Reject(code, message);
        }
    }

    void RespondConsoleQuery(const std::shared_ptr<ConsoleQueryCapture>& state, const std::string& output) noexcept
    {
        try {
            const auto payload = OSFUI::API::Json{
                { "ok", true },
                { "command", state->command },
                { "output", output }
            }.dump();
            state->request.Respond("console.command-center.queryResult", payload.c_str());
        } catch (...) {
            RejectConsoleQuery(state, "query-failed", "Could not serialize console query output.");
        }
    }

    void PollConsoleQueryOutput(const std::shared_ptr<ConsoleQueryCapture>& state) noexcept
    {
        try {
            const auto output = ConsoleBufferDelta(state->bufferBefore);

            if (!output.empty() && output == state->lastOutput) {
                ++state->stablePolls;
            } else {
                state->lastOutput = output;
                state->stablePolls = 0;
            }

            // Console read commands can emit their result after the execution
            // call has returned. Wait until the new buffer text has stopped
            // changing for two polls before returning it to the UI.
            if (!output.empty() && state->stablePolls >= 2) {
                RespondConsoleQuery(state, output);
                return;
            }

            if (++state->polls >= kConsoleQueryMaxPolls) {
                RejectConsoleQuery(state, "query-timeout", "No complete console output was captured. The command may have run without printing text. Try it in Starfield's console; this is not a zero or empty result.");
                return;
            }

            if (!QueueMainTaskAfter(
                    kConsoleQueryPollDelay,
                    [state]() noexcept { PollConsoleQueryOutput(state); },
                    [state]() noexcept { RejectConsoleQuery(state, "query-failed", "The game task queue stopped before console output could be captured."); })) {
                RejectConsoleQuery(state, "query-failed", "Could not schedule console output capture.");
            }
        } catch (...) {
            RejectConsoleQuery(state, "query-failed", "Could not capture console query output.");
        }
    }

    void OnQuery(const OSFUI::API::Request& raw, void*) noexcept
    {
        OSFUI::API::JsonRequest request{ raw };
        if (!request) {
            return;
        }

        const auto command = request.Get<std::string>("consoleCommand");
        if (!command) {
            return;
        }
        if (!IsSafeBridgeString(*command)) {
            request.Reject("invalid-command", "Command is empty, too long, or contains control characters.");
            return;
        }

        try {
            if (const auto output = CCC::ReadDirectQuery(*command)) {
                // Game strings (and localized names) can contain non-UTF-8
                // bytes. Preserve IDs/counts and replace invalid text bytes
                // instead of rejecting the entire inventory snapshot.
                const auto payload = OSFUI::API::Json{
                    { "ok", true }, { "command", *command }, { "output", *output }, { "source", "direct" }
                }.dump(-1, ' ', false, OSFUI::API::Json::error_handler_t::replace);
                raw.Respond("console.command-center.queryResult", payload.c_str());
                return;
            }

            auto lease = CaptureLease::TryAcquire();
            if (!lease) {
                request.Reject("query-busy", "Wait for the current console-output inspection to finish.");
                return;
            }
            auto state = std::make_shared<ConsoleQueryCapture>();
            state->lease = std::move(lease);
            state->request = raw;
            state->command = *command;
            state->bufferBefore = ReadConsoleBuffer();

            if (!ExecuteConsoleCommand(*command)) {
                request.Reject("query-failed", "Native Starfield console execution failed.");
                return;
            }

            if (!QueueMainTaskAfter(
                    kConsoleQueryPollDelay,
                    [state]() noexcept { PollConsoleQueryOutput(state); },
                    [state]() noexcept { RejectConsoleQuery(state, "query-failed", "The game task queue stopped before console output could be captured."); })) {
                request.Reject("query-failed", "Could not schedule console output capture.");
            }
        } catch (const std::exception& error) {
            request.Reject("query-failed", error.what());
        } catch (...) {
            request.Reject("query-failed", "Could not start console output capture.");
        }
    }

    enum class QuestReadKind
    {
        currentStage,
        running,
        completed,
        stageDone
    };

    struct QuestReadCallback final : RE::BSScript::IStackCallbackFunctor
    {
        QuestReadCallback(
            OSFUI::API::Request a_request,
            std::string a_operation,
            std::uint32_t a_questID,
            std::optional<std::uint32_t> a_stage,
            QuestReadKind a_kind) :
            request(std::move(a_request)),
            operation(std::move(a_operation)),
            questID(a_questID),
            stage(a_stage),
            kind(a_kind)
        {}

        void CallQueued() override {}

        void CallCanceled() override
        {
            if (!finished.exchange(true, std::memory_order_acq_rel)) {
                request.Reject("quest-read-canceled", "Starfield canceled the quest-state read before returning a value.");
            }
        }

        void StartMultiDispatch() override {}
        void EndMultiDispatch() override {}

        void operator()(RE::BSScript::Variable value) override
        {
            if (finished.exchange(true, std::memory_order_acq_rel)) return;

            try {
                OSFUI::API::Json payload{
                    { "ok", true },
                    { "questId", std::format("{:08X}", questID) },
                    { "operation", operation }
                };
                if (stage) payload["stage"] = *stage;

                if (kind == QuestReadKind::currentStage) {
                    if (!value.is<std::int32_t>()) {
                        throw std::runtime_error("Starfield returned an unexpected current-stage value.");
                    }
                    payload["value"] = RE::BSScript::UnpackVariable<std::int32_t>(value);
                } else {
                    if (!value.is<bool>()) {
                        throw std::runtime_error("Starfield returned an unexpected quest-state value.");
                    }
                    payload["value"] = RE::BSScript::UnpackVariable<bool>(value);
                }

                const auto serialized = payload.dump();
                request.Respond("console.command-center.questReadResult", serialized.c_str());
            } catch (const std::exception& error) {
                request.Reject("quest-read-failed", error.what());
            } catch (...) {
                request.Reject("quest-read-failed", "Could not return the quest-state value.");
            }
        }

        OSFUI::API::Request request{};
        std::string operation;
        std::uint32_t questID{ 0 };
        std::optional<std::uint32_t> stage;
        QuestReadKind kind{ QuestReadKind::currentStage };
        std::atomic_bool finished{ false };
    };

    void OnQuestRead(const OSFUI::API::Request& raw, void*) noexcept
    {
        OSFUI::API::JsonRequest request{ raw };
        if (!request) return;

        const auto questText = request.Get<std::string>("questId");
        const auto operation = request.Get<std::string>("operation");
        if (!questText || !operation) {
            request.Reject("invalid-quest-read", "Quest ID and read operation are required.");
            return;
        }

        try {
            std::uint32_t questID = 0;
            const auto [end, error] = std::from_chars(questText->data(), questText->data() + questText->size(), questID, 16);
            if (questText->empty() || questText->size() > 8 || error != std::errc{} || end != questText->data() + questText->size() || questID == 0) {
                throw std::runtime_error("Enter a valid 1-8 digit hexadecimal Quest ID.");
            }

            QuestReadKind kind{};
            const char* functionName = nullptr;
            std::optional<std::uint32_t> stage;
            if (*operation == "currentStage") {
                kind = QuestReadKind::currentStage;
                functionName = "GetCurrentStageID";
            } else if (*operation == "isRunning") {
                kind = QuestReadKind::running;
                functionName = "IsRunning";
            } else if (*operation == "isCompleted") {
                kind = QuestReadKind::completed;
                functionName = "IsCompleted";
            } else if (*operation == "isStageDone") {
                kind = QuestReadKind::stageDone;
                functionName = "IsStageDone";
                stage = request.Get<std::uint32_t>("stage");
                if (!stage || *stage > 65535) {
                    throw std::runtime_error("A quest stage from 0 through 65535 is required.");
                }
            } else {
                throw std::runtime_error("Unsupported quest-state read operation.");
            }

            auto* form = RE::TESForm::LookupByID(questID);
            auto* quest = form ? starfield_cast<RE::TESQuest*>(form) : nullptr;
            if (!quest) throw std::runtime_error("Quest not found. Check the Form ID and installed game content.");

            auto* gameVM = RE::GameVM::GetSingleton();
            auto* vm = gameVM ? gameVM->GetVM() : nullptr;
            if (!vm) throw std::runtime_error("Starfield's scripting interface is not available yet.");

            auto& handles = vm->GetObjectHandlePolicy();
            const auto handle = handles.GetHandleForObject(RE::BSScript::GetVMTypeID<RE::TESQuest>(), quest);
            if (handle == handles.EmptyHandle()) throw std::runtime_error("Could not bind the selected quest to Starfield's scripting interface.");

            auto callback = RE::make_smart<QuestReadCallback>(raw, *operation, questID, stage, kind);
            const auto arguments = [stage](RE::BSScrapArray<RE::BSScript::Variable>& values) {
                if (stage) {
                    RE::BSScript::Variable value;
                    RE::BSScript::PackVariable(value, *stage);
                    values.push_back(std::move(value));
                }
                return true;
            };
            if (!vm->DispatchMethodCall(handle, "Quest", functionName, arguments, callback, 0)) {
                throw std::runtime_error("Starfield could not queue the quest-state read.");
            }
        } catch (const std::exception& error) {
            request.Reject("quest-read-failed", error.what());
        } catch (...) {
            request.Reject("quest-read-failed", "Could not start the quest-state read.");
        }
    }

    void OnSetEffectiveActorValue(const OSFUI::API::Request& raw, void*) noexcept
    {
        OSFUI::API::JsonRequest request{ raw };
        if (!request) return;

        const auto targetText = request.Get<std::string>("target");
        const auto actorValueName = request.Get<std::string>("actorValue");
        const auto desiredTotal = request.Get<double>("desiredTotal");
        const bool apply = request.Get<bool>("apply").value_or(false);
        if (!targetText || !actorValueName || !desiredTotal || !std::isfinite(*desiredTotal) || std::abs(*desiredTotal) > 1.0e9) {
            request.Reject("invalid-effective-total", "Target, actor value, and a finite desired total are required.");
            return;
        }
        if (actorValueName->empty() || actorValueName->size() > 64 || std::any_of(actorValueName->begin(), actorValueName->end(), [](unsigned char ch) {
                return std::isalnum(ch) == 0 && ch != '_';
            })) {
            request.Reject("invalid-actor-value", "The actor value name is invalid.");
            return;
        }

        try {
            std::uint32_t formID = 0;
            std::string normalizedTarget;
            if (LowerASCII(*targetText) == "player") {
                formID = 0x14;
                normalizedTarget = "player";
            } else {
                const auto [end, error] = std::from_chars(targetText->data(), targetText->data() + targetText->size(), formID, 16);
                if (targetText->empty() || targetText->size() > 8 || error != std::errc{} || end != targetText->data() + targetText->size() || formID == 0) {
                    throw std::runtime_error("Enter a valid player target or 1-8 digit hexadecimal Reference ID.");
                }
                normalizedTarget = std::format("{:08X}", formID);
            }

            auto* form = RE::TESForm::LookupByID(formID);
            auto* reference = form ? starfield_cast<RE::TESObjectREFR*>(form) : nullptr;
            if (!reference) throw std::runtime_error("Reference not found. Use a placed Reference ID, not a Base ID.");
            auto* actorValue = RE::TESForm::LookupByEditorID<RE::ActorValueInfo>(RE::BSFixedString(actorValueName->c_str()));
            if (!actorValue) throw std::runtime_error("Actor value not found: " + *actorValueName);

            const double currentBase = reference->GetBaseActorValue(*actorValue);
            const double currentEffective = reference->GetActorValue(*actorValue);
            const double modifierContribution = currentEffective - currentBase;
            const double calculatedBase = *desiredTotal - modifierContribution;
            if (!std::isfinite(calculatedBase) || std::abs(calculatedBase) > 1.0e9) {
                throw std::runtime_error("The calculated base value is outside CCC's supported range.");
            }

            const auto command = std::format("{}.setav {} {:.6f}", normalizedTarget, *actorValueName, calculatedBase);
            if (apply && !ExecuteConsoleCommand(command)) {
                throw std::runtime_error("Starfield rejected the calculated SetAV command.");
            }
            const double resultingEffective = apply ? reference->GetActorValue(*actorValue) : currentEffective;
            const auto payload = OSFUI::API::Json{
                { "ok", true },
                { "applied", apply },
                { "target", normalizedTarget },
                { "actorValue", *actorValueName },
                { "desiredTotal", *desiredTotal },
                { "currentBase", currentBase },
                { "currentEffective", currentEffective },
                { "modifierContribution", modifierContribution },
                { "calculatedBase", calculatedBase },
                { "resultingEffective", resultingEffective },
                { "command", command }
            }.dump();
            raw.Respond("console.command-center.setEffectiveActorValueResult", payload.c_str());
        } catch (const std::exception& error) {
            request.Reject("effective-total-failed", error.what());
        } catch (...) {
            request.Reject("effective-total-failed", "Could not calculate or apply the effective actor-value total.");
        }
    }

    void OnPing(const OSFUI::API::Request& raw, void*) noexcept
    {
        OSFUI::API::JsonRequest request{ raw };
        if (!request) {
            return;
        }

        (void)request.Respond("console.command-center.pingResult", OSFUI::API::Json{
            { "ok", true },
            { "backend", "ConsoleCommandCenter.dll" },
            { "build", kBuildId },
            { "executor", "native" },
            { "runtime", g_runtimeVersion.string() },
            { "testedRuntime", kTestedRuntime.string() },
            { "runtimeSupported", IsRuntimeSupported() }
        });
    }

    void OnClose(const OSFUI::API::Request& raw, void*) noexcept
    {
        OSFUI::API::JsonRequest request{ raw };
        if (!request) {
            return;
        }

        if (!g_ui.RequestMenu(kViewId, false)) {
            request.Reject("close-failed", "OSF UI could not queue the menu close request.");
            return;
        }

        (void)request.Respond("console.command-center.closeResult", OSFUI::API::Json{
            { "ok", true }
        });
    }

    void OnSFSEMessage(SFSE::MessagingInterface::Message* message)
    {
        if (message->type != SFSE::MessagingInterface::kPostLoad) {
            return;
        }
        if (!g_ui.Init()) {
            return;
        }

        g_ui.RegisterRequest("console.command-center.ping", &OnPing, nullptr);
        g_ui.RegisterRequest("console.command-center.close", &OnClose, nullptr);
        (void)g_ui.RegisterView(kViewId);
        if (!IsRuntimeSupported()) {
            return;
        }
        g_ui.RegisterRequest("console.command-center.execute", &OnExecute, nullptr);
        g_ui.RegisterRequest("console.command-center.query", &OnQuery, nullptr);
        g_ui.RegisterRequest("console.command-center.questRead", &OnQuestRead, nullptr);
        g_ui.RegisterRequest("console.command-center.setEffectiveActorValue", &OnSetEffectiveActorValue, nullptr);
    }
}

SFSE_PLUGIN_LOAD(const SFSE::LoadInterface* sfse)
{
    g_runtimeVersion = sfse->RuntimeVersion();
    SFSE::Init(sfse);

    auto* messaging = SFSE::GetMessagingInterface();
    if (!messaging) {
        return false;
    }

    messaging->RegisterListener(OnSFSEMessage);
    return true;
}
