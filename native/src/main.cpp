#include "Translations.h"
#include <SFSE/SFSE.h>
#include <RE/Starfield.h>
#include <RE/B/BSScriptUtil.h>

#include <algorithm>
#include <array>
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
#include <mutex>
#include <limits>
#include <optional>
#include <string>
#include <string_view>
#include <vector>

#include "OSFUI_JSON.h"
#include "OSFSettings.h"
#include <REX/REX.h>
#include "DirectQuery.h"
#include "ScalarResult.h"
#include "NumericQuery.h"
#include "QueuedQueryMatch.h"
#include "ModCatalogs.h"
#include "CommandBatches.h"
#include "DevFeedback.h"
#include "ModelPreview.h"
#include "RecordDetails.h"
#include "PreviewTriggerInput.h"
#include "CommandBatchAutoRun.h"
#include "MenuHotkey.h"

namespace
{
    OSFUI::API::Client g_ui;
    OSFSettings::API::Client g_settings;

    constexpr const char* kViewId = "console.command-center/main";
    void OnOpenHotkey(const char*, const char*, void*) noexcept
    {
        if (!CCC::MenuHotkey::RequestOpen(g_ui)) REX::WARN("CCC hotkey could not queue its view");
    }

    constexpr const char* kBuildId = "1.4.0";
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
    std::atomic_uint64_t g_loadGeneration{ 0 };
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
            (void)request.Reply(OSFUI::API::Json{
                { "ok", true }, { "command", *command }, { "queuedAfterClose", true }
            });
            return;
        }
        if (!ExecuteConsoleCommand(*command)) {
            request.Reject("execution-failed", "Native Starfield console execution failed.");
            return;
        }

        (void)request.Reply(OSFUI::API::Json{
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
        std::optional<float> scalarResult;
        std::optional<float> numericResult;
        std::size_t numericSlot{ static_cast<std::size_t>(-1) };
        std::optional<CCC::NumericQuery::Plan> numericPlan;
        std::chrono::steady_clock::time_point numericDeadline{};
        bool complete{ false };
        std::uint32_t scalarTargetID{ 0 };
        std::uint32_t polls{ 0 };
        std::uint32_t stablePolls{ 0 };
    };

    // Capture only the exact no-argument sky query. Let Starfield compile,
    // resolve the reference, and invoke its existing execute callback normally.
    // Do not call the condition evaluator or approximate sky exposure by cell type.
    std::mutex g_skyQueryMutex;
    std::weak_ptr<ConsoleQueryCapture> g_skyQueryState;
    RE::SCRIPT_FUNCTION::ExecuteFunction_t g_originalSkyExecute{ nullptr };

    bool SkyQueryExecute(const RE::SCRIPT_PARAMETER* params, const char* data,
        RE::TESObjectREFR* object, RE::TESObjectREFR* container, RE::Script* script,
        RE::ScriptLocals* locals, float* result, std::uint32_t* offset)
    {
        std::shared_ptr<ConsoleQueryCapture> state;
        {
            std::scoped_lock lock{ g_skyQueryMutex };
            state = g_skyQueryState.lock();
        }
        const bool capture = state && object && result && object->GetFormID() == state->scalarTargetID;
        const auto outcome = CCC::ScalarResult::CaptureBoolean(result, capture, [&] {
            return g_originalSkyExecute(params, data, object, container, script, locals, result, offset);
        });
        if (outcome.value) {
            std::scoped_lock lock{ g_skyQueryMutex };
            state->scalarResult = *outcome.value;
        }
        return outcome.success;
    }

    void PrepareSkyQueryCapture(const std::shared_ptr<ConsoleQueryCapture>& state)
    {
        std::istringstream input(state->command);
        std::string verb, extra;
        input >> verb >> extra;
        const auto dot = verb.find('.');
        if (dot == std::string::npos || LowerASCII(verb.substr(dot + 1)) != "actorexposedtosky") return;
        if (!extra.empty()) throw std::runtime_error("ActorExposedToSky takes no arguments.");
        const auto target = LowerASCII(verb.substr(0, dot));
        std::uint32_t id = 0;
        if (target == "player") id = 0x14;
        else {
            const auto [end, error] = std::from_chars(target.data(), target.data() + target.size(), id, 16);
            if (target.empty() || target.size() > 8 || error != std::errc{} || end != target.data() + target.size() || id == 0) {
                throw std::runtime_error("Enter player. or a valid placed Actor Reference ID prefix.");
            }
        }
        auto* form = RE::TESForm::LookupByID(id);
        if (!form || !starfield_cast<RE::Actor*>(form)) throw std::runtime_error("Sky exposure requires a loaded Actor Reference ID.");
        auto* function = RE::Script::LocateScriptCommand("ActorExposedToSky");
        if (!function || !function->executeFunction || function->numParams != 0) {
            throw std::runtime_error("Starfield's sky-exposure result handler is unavailable or has an unexpected signature.");
        }
        std::scoped_lock lock{ g_skyQueryMutex };
        if (!g_originalSkyExecute) {
            g_originalSkyExecute = function->executeFunction;
            if (!REL::WriteSafeData(reinterpret_cast<std::uintptr_t>(&function->executeFunction), &SkyQueryExecute)) {
                g_originalSkyExecute = nullptr;
                throw std::runtime_error("Could not install the sky-exposure result capture.");
            }
        } else if (function->executeFunction != &SkyQueryExecute) {
            throw std::runtime_error("Another plugin replaced the sky-exposure result handler; CCC cannot capture it safely.");
        }
        state->scalarTargetID = id;
        g_skyQueryState = state;
    }

    // Numeric execute callbacks often set a return value without adding any
    // ConsoleLog text. Observe the game's normal compiled invocation; never
    // invoke execute/condition callbacks ourselves or reconstruct their args.
    std::mutex g_numericQueryMutex;
    std::array<RE::SCRIPT_FUNCTION::ExecuteFunction_t, CCC::NumericQuery::specs.size()> g_numericOriginals{};
    std::array<CCC::QueuedQuery::PendingSlot<ConsoleQueryCapture>, CCC::NumericQuery::specs.size()> g_numericPending;
    thread_local unsigned g_numericDepth = 0;

    template <std::size_t Slot>
    bool NumericQueryExecute(const RE::SCRIPT_PARAMETER* params, const char* data,
        RE::TESObjectREFR* object, RE::TESObjectREFR* container, RE::Script* script,
        RE::ScriptLocals* locals, float* result, std::uint32_t* offset)
    {
        RE::SCRIPT_FUNCTION::ExecuteFunction_t original;
        { std::scoped_lock lock{g_numericQueryMutex}; original = g_numericOriginals[Slot]; }
        if (!original) return false;
        std::shared_ptr<ConsoleQueryCapture> state;
        {
            std::scoped_lock lock{g_numericQueryMutex};
            state = g_numericPending[Slot].Active(std::chrono::steady_clock::now());
        }
        const auto& spec = CCC::NumericQuery::specs[Slot];
        const bool targetMatches = state && (!spec.target || (object && object->GetFormID() == state->scalarTargetID));
        const auto source = state && targetMatches && g_numericDepth == 0
            ? CCC::QueuedQuery::ReadSource(reinterpret_cast<std::uintptr_t>(script), [](std::uintptr_t address, void* destination, std::size_t size) {
                SIZE_T copied = 0;
                return ::ReadProcessMemory(::GetCurrentProcess(), reinterpret_cast<const void*>(address), destination, size, &copied) && copied == size;
            }) : std::nullopt;
        const bool capture = state && state->numericPlan && targetMatches && source
            && CCC::QueuedQuery::MatchesSource(*source, *state->numericPlan) && g_numericDepth == 0;
        if (state) REX::INFO("CCC queued query {}: target match={}, source readable={}, source match={}", spec.name, targetMatches, source.has_value(), capture);
        struct Depth { Depth(){ ++g_numericDepth; } ~Depth(){ --g_numericDepth; } } depth;
        const auto outcome = CCC::ScalarResult::CaptureNumber(result, capture, [&] {
            return original(params, data, object, container, script, locals, result, offset);
        });
        if (capture) REX::INFO("CCC numeric query {}: callback success={}, wrote finite result={}", spec.name, outcome.success, outcome.value.has_value());
        if (outcome.value && CCC::NumericQuery::ValidResult(spec.kind, *outcome.value)) {
            std::scoped_lock lock{g_numericQueryMutex};
            if (!state->complete && !state->numericResult && std::chrono::steady_clock::now() <= state->numericDeadline)
                state->numericResult = *outcome.value;
        }
        return outcome.success;
    }

    constexpr std::array<RE::SCRIPT_FUNCTION::ExecuteFunction_t, CCC::NumericQuery::specs.size()> kNumericWrappers{
        &NumericQueryExecute<0>, &NumericQueryExecute<1>, &NumericQueryExecute<2>,
        &NumericQueryExecute<3>, &NumericQueryExecute<4>, &NumericQueryExecute<5>,
        &NumericQueryExecute<6>, &NumericQueryExecute<7>, &NumericQueryExecute<8>,
        &NumericQueryExecute<9>, &NumericQueryExecute<10>
    };

    void PrepareNumericQueryCapture(const std::shared_ptr<ConsoleQueryCapture>& state)
    {
        const auto plan = CCC::NumericQuery::Parse(state->command);
        if (!plan) return;
        const auto& spec = CCC::NumericQuery::specs[plan->slot];
        if (spec.target) {
            auto* form = RE::TESForm::LookupByID(plan->targetID);
            auto* reference = form ? starfield_cast<RE::TESObjectREFR*>(form) : nullptr;
            if (!reference || (spec.actor && !starfield_cast<RE::Actor*>(form)))
                throw std::runtime_error("The chosen reference is unavailable or is not a suitable actor. Use a placed Reference ID, not a Base ID.");
        }
        if (std::string_view(spec.name) == "GetItemCount" && !RE::TESForm::LookupByID(CCC::NumericQuery::FormID(plan->argument)))
            throw std::runtime_error("Item Form ID not found in the loaded game.");
        auto* function = RE::Script::LocateScriptCommand(spec.name);
        if (!function || !function->executeFunction || function->numParams < spec.params
            || (function->numParams && !function->params))
            throw std::runtime_error("This command's result handler is unavailable or has an unexpected signature.");
        for (unsigned i = spec.params; i < function->numParams; ++i) {
            if (!function->params[i].optional) throw std::runtime_error("This command requires additional parameters that CCC does not support.");
        }
        std::scoped_lock lock{g_numericQueryMutex};
        auto& original = g_numericOriginals[plan->slot];
        if (!original) {
            original = function->executeFunction;
            if (!REL::WriteSafeData(reinterpret_cast<std::uintptr_t>(&function->executeFunction), kNumericWrappers[plan->slot])) {
                original = nullptr;
                throw std::runtime_error("Could not install this command's result capture.");
            }
        } else if (function->executeFunction != kNumericWrappers[plan->slot]) {
            throw std::runtime_error("Another plugin replaced this command's handler; CCC cannot capture it safely.");
        }
        state->numericSlot = plan->slot;
        state->numericPlan = *plan;
        state->scalarTargetID = plan->targetID;
        state->numericDeadline = std::chrono::steady_clock::now() + std::chrono::seconds{2};
        g_numericPending[plan->slot].Arm(state);
        REX::INFO("CCC numeric query armed: {}, target={:08X}", spec.name, plan->targetID);
    }

    constexpr std::uint32_t kConsoleQueryMaxPolls = 40;
    constexpr auto kConsoleQueryPollDelay = std::chrono::milliseconds{ 50 };

    void RejectConsoleQuery(const std::shared_ptr<ConsoleQueryCapture>& state, const char* code, const char* message) noexcept
    {
        if (state) {
            { std::scoped_lock lock{g_numericQueryMutex}; state->complete = true; }
            state->request.Reject(code, message);
        }
    }

    void RespondConsoleQuery(const std::shared_ptr<ConsoleQueryCapture>& state, const std::string& output) noexcept
    {
        try {
            { std::scoped_lock lock{g_numericQueryMutex}; state->complete = true; }
            const auto payload = OSFUI::API::Json{
                { "ok", true },
                { "command", state->command },
                { "output", output }
            }.dump();
            state->request.Reply(payload.c_str());
        } catch (...) {
            RejectConsoleQuery(state, "query-failed", "Could not serialize console query output.");
        }
    }

    void PollConsoleQueryOutput(const std::shared_ptr<ConsoleQueryCapture>& state) noexcept
    {
        try {
            {
                std::optional<float> numeric;
                { std::scoped_lock lock{g_numericQueryMutex}; numeric = state->numericResult; }
                if (numeric) {
                    RespondConsoleQuery(state, std::format("{} >> {:.9g}", state->command, *numeric));
                    return;
                }
            }
            std::optional<float> scalar;
            {
                std::scoped_lock lock{ g_skyQueryMutex };
                scalar = state->scalarResult;
            }
            if (scalar) {
                RespondConsoleQuery(state, std::format("ActorExposedToSky >> {:.2f}\n{}", *scalar,
                    *scalar == 1.0f ? "Actor is exposed to the sky." : "Actor is not exposed to the sky."));
                return;
            }
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
                if (state->numericSlot < CCC::NumericQuery::specs.size())
                    REX::WARN("CCC numeric query timed out: {}. No matching valid return or new console text was captured.", state->command);
                RejectConsoleQuery(state, "query-timeout", "No result was captured. This command may return a value without printing text; this is not a zero result.");
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
                raw.Reply(payload.c_str());
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
            PrepareSkyQueryCapture(state);
            PrepareNumericQueryCapture(state);

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
                request.Reply(serialized.c_str());
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

    OSFUI::API::Json AreaForm(RE::TESForm* form)
    {
        if (!form) return nullptr;
        const auto* full = starfield_cast<RE::TESFullName*>(form);
        return {{"id", std::format("{:08X}", form->GetFormID())},
                {"editorId", CCC::ModCatalogs::ReadSafeText(form->GetFormEditorID(), 256).value_or("")},
                {"name", CCC::ModCatalogs::ReadSafeText(full ? full->GetFullName() : nullptr, 256).value_or("")}};
    }

    void OnIdentifyCurrentArea(const OSFUI::API::Request& raw, void*) noexcept
    {
        if (!IsRuntimeSupported()) { raw.Reject("unsupported-runtime", "Current-area identification is unavailable on this runtime."); return; }
        const auto* tasks=SFSE::GetTaskInterface();
        if(!tasks){raw.Reject("area-unavailable","The game task queue is unavailable.");return;}
        const auto generation=g_loadGeneration.load();
        tasks->AddTask([reply=raw,generation]() {
            try {
                if(generation!=g_loadGeneration.load())throw std::runtime_error("The save changed. Identify the area again.");
                auto* player=RE::PlayerCharacter::GetSingleton();
                if(!player||!player->parentCell)throw std::runtime_error("Load a save and stand in the destination before identifying it.");
                const auto cell=AreaForm(player->parentCell);
                auto* location=player->GetCurrentLocation();
                OSFUI::API::Json locations=OSFUI::API::Json::array();std::vector<std::uint32_t> seen;
                for(unsigned depth=0;location&&depth<8;++depth){
                    if(std::find(seen.begin(),seen.end(),location->GetFormID())!=seen.end())break;
                    seen.push_back(location->GetFormID());locations.push_back(AreaForm(location));location=location->parentLocation.get();
                }
                const auto payload=OSFUI::API::Json{{"ok",true},{"cell",cell},{"locations",locations},{"world",AreaForm(player->GetParentWorldSpace())}}.dump(-1,' ',false,OSFUI::API::Json::error_handler_t::replace);
                reply.Reply(payload.c_str());
            }catch(const std::exception& error){reply.Reject("area-unavailable",error.what());}
            catch(...){reply.Reject("area-unavailable","Could not inspect the current area.");}
        });
    }

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
            raw.Reply(payload.c_str());
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

        (void)request.Reply(OSFUI::API::Json{
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

        (void)request.Reply(OSFUI::API::Json{
            { "ok", true }
        });
    }

    void OnModCatalogs(const OSFUI::API::Request& raw, void*) noexcept
    {
        OSFUI::API::JsonRequest request{ raw };
        if (!request) return;
        try {
            (void)request.Reply(CCC::ModCatalogs::ScanPluginFiles());
        } catch (const std::exception& error) {
            request.Reject("mod-catalogs-failed", error.what());
        } catch (...) {
            request.Reject("mod-catalogs-failed", "Could not scan loaded mod IDs.");
        }
    }

    void OnPluginLoadOrder(const OSFUI::API::Request& raw, void*) noexcept
    {
        OSFUI::API::JsonRequest request{ raw };
        if (!request) return;
        try {
            (void)request.Reply(CCC::ModCatalogs::PluginLoadOrder());
        } catch (const std::exception& error) {
            request.Reject("plugin-load-order-failed", error.what());
        } catch (...) {
            request.Reject("plugin-load-order-failed", "Could not read the active plugin load order.");
        }
    }

    void OnModCatalogRecords(const OSFUI::API::Request& raw, void*) noexcept
    {
        OSFUI::API::JsonRequest request{ raw };
        if (!request) return;
        const auto plugin = request.Get<std::string>("plugin");
        if (!plugin || plugin->empty() || plugin->size() > 260) return;
        try {
            (void)request.Reply(CCC::ModCatalogs::ScanPluginRecords(*plugin));
        } catch (const std::exception& error) {
            request.Reject("mod-catalog-records-failed", error.what());
        } catch (...) {
            request.Reject("mod-catalog-records-failed", "Could not scan the selected mod's IDs.");
        }
    }

    void OnDevFeedbackExport(const OSFUI::API::Request& raw, void*) noexcept
    {
        OSFUI::API::JsonRequest request{ raw };
        if (!request) return;
        try {
            const auto& payload=request.Payload();
            if(payload.contains("action")){
                static CCC::DevFeedback::Uploads uploads;
                auto result=uploads.Accept(payload);
                if(payload.value("action",std::string{})=="finish")result=CCC::DevFeedback::Export(result.at("content").get<std::string>());
                (void)request.Reply(result);
            }else{
                const auto content=request.Get<std::string>("content");
                if(!content)throw std::runtime_error("Missing report content. Install the matching CCC UI and DLL.");
                (void)request.Reply(CCC::DevFeedback::Export(*content));
            }
        }
        catch (const std::exception& error) { request.Reject("dev-feedback-export-failed", error.what()); }
        catch (...) { request.Reject("dev-feedback-export-failed", "Could not export test reports."); }
    }

    void OnCommandBatchList(const OSFUI::API::Request& raw, void*) noexcept
    {
        OSFUI::API::JsonRequest request{ raw };
        if (!request) return;
        try {
            const auto& payload = request.Payload();
            const auto legacy = payload.contains("legacyBatches") ? payload["legacyBatches"] : OSFUI::API::Json::array();
            (void)request.Reply(CCC::CommandBatches::List(legacy));
        } catch (const std::exception& error) {
            request.Reject("command-batch-list-failed", error.what());
        } catch (...) {
            request.Reject("command-batch-list-failed", "Could not read the user Command Batches folder.");
        }
    }

    void OnIncludedBatch(const OSFUI::API::Request& raw, void*) noexcept
    {
        OSFUI::API::JsonRequest request{raw};
        if (!request) return;
        try { (void)request.Reply(CCC::CommandBatches::Included(request.Payload())); }
        catch (const std::exception& error) { request.Reject("included-batch-failed", error.what()); }
        catch (...) { request.Reject("included-batch-failed", "Could not read included batch files."); }
    }

    void OnCommandBatchSave(const OSFUI::API::Request& raw, void*) noexcept
    {
        OSFUI::API::JsonRequest request{ raw };
        if (!request) return;
        const auto name = request.Get<std::string>("name");
        const auto content = request.Get<std::string>("content");
        if (!name || !content) return;
        try { (void)request.Reply(CCC::CommandBatches::Save(*name, *content)); }
        catch (const std::exception& error) { request.Reject("command-batch-save-failed", error.what()); }
        catch (...) { request.Reject("command-batch-save-failed", "Could not save the command batch."); }
    }

    void OnCommandBatchDelete(const OSFUI::API::Request& raw, void*) noexcept
    {
        OSFUI::API::JsonRequest request{ raw };
        if (!request) return;
        const auto name = request.Get<std::string>("name");
        if (!name) return;
        try {
            const auto reply = CCC::CommandBatches::Delete(*name);
            CCC::CommandBatchAutoRun::RemoveBatch(*name);
            (void)request.Reply(reply);
        }
        catch (const std::exception& error) { request.Reject("command-batch-delete-failed", error.what()); }
        catch (...) { request.Reject("command-batch-delete-failed", "Could not delete the command batch."); }
    }

    void OnCommandBatchDeleteAll(const OSFUI::API::Request& raw, void*) noexcept
    {
        OSFUI::API::JsonRequest request{ raw };
        if (!request) return;
        try {
            const auto reply = CCC::CommandBatches::DeleteAll();
            CCC::CommandBatchAutoRun::ClearBatches();
            (void)request.Reply(reply);
        }
        catch (const std::exception& error) { request.Reject("command-batch-delete-all-failed", error.what()); }
        catch (...) { request.Reject("command-batch-delete-all-failed", "Could not delete the command batch files."); }
    }

    void OnCommandBatchAutoRunGet(const OSFUI::API::Request& raw, void*) noexcept
    {
        OSFUI::API::JsonRequest request{ raw };
        if (!request) return;
        try { (void)request.Reply(CCC::CommandBatchAutoRun::Get()); }
        catch (const std::exception& error) { request.Reject("command-batch-auto-run-read-failed", error.what()); }
        catch (...) { request.Reject("command-batch-auto-run-read-failed", "Could not read Auto Run settings."); }
    }

    void OnCommandBatchAutoRunEnable(const OSFUI::API::Request& raw, void*) noexcept
    {
        OSFUI::API::JsonRequest request{ raw };
        if (!request) return;
        const auto enabled = request.Get<bool>("enabled");
        if (!enabled) return;
        try { (void)request.Reply(CCC::CommandBatchAutoRun::SetEnabled(*enabled)); }
        catch (const std::exception& error) { request.Reject("command-batch-auto-run-write-failed", error.what()); }
        catch (...) { request.Reject("command-batch-auto-run-write-failed", "Could not update Auto Run settings."); }
    }

    void OnCommandBatchAutoRunBatch(const OSFUI::API::Request& raw, void*) noexcept
    {
        OSFUI::API::JsonRequest request{ raw };
        if (!request) return;
        const auto name = request.Get<std::string>("name");
        const auto enabled = request.Get<bool>("enabled");
        if (!name || !enabled) return;
        try { (void)request.Reply(CCC::CommandBatchAutoRun::SetBatch(*name, *enabled)); }
        catch (const std::exception& error) { request.Reject("command-batch-auto-run-write-failed", error.what()); }
        catch (...) { request.Reject("command-batch-auto-run-write-failed", "Could not update the batch Auto Run setting."); }
    }

    void OnCommandBatchAutoRunReports(const OSFUI::API::Request& raw, void*) noexcept
    {
        OSFUI::API::JsonRequest request{ raw };
        if (!request) return;
        try { (void)request.Reply(CCC::CommandBatchAutoRun::ConsumeReports()); }
        catch (...) { request.Reject("command-batch-auto-run-report-failed", "Could not read Auto Run reports."); }
    }

    class LoadGameEventSink final : public RE::BSTEventSink<RE::TESLoadGameEvent>
    {
    public:
        RE::BSEventNotifyControl ProcessEvent(const RE::TESLoadGameEvent&, RE::BSTEventSource<RE::TESLoadGameEvent>*) override
        {
            const auto generation = g_loadGeneration.fetch_add(1, std::memory_order_acq_rel) + 1;
            (void)QueueMainTaskAfter(std::chrono::seconds{ CCC::CommandBatchAutoRun::kDelaySeconds }, [generation]() noexcept {
                if (g_loadGeneration.load(std::memory_order_acquire) != generation) return;
                CCC::CommandBatchAutoRun::Run([](std::string_view command) noexcept {
                    return IsSafeBridgeString(command) && ExecuteConsoleCommand(command);
                });
            });
            return RE::BSEventNotifyControl::kContinue;
        }
    };

    LoadGameEventSink g_loadGameEventSink;
    bool g_loadGameSinkRegistered{ false };

    void OnSFSEMessage(SFSE::MessagingInterface::Message* message)
    {
        if (message->type == SFSE::MessagingInterface::kPostDataLoad && IsRuntimeSupported() && g_ui) {
            CCC::MenuHotkey::Install(g_ui);
        }
        if (message->type != SFSE::MessagingInterface::kPostPostLoad) {
            return;
        }
        if (IsRuntimeSupported() && !g_loadGameSinkRegistered) {
            if (auto* source = RE::TESLoadGameEvent::GetEventSource()) {
                source->RegisterSink(&g_loadGameEventSink);
                g_loadGameSinkRegistered = true;
            }
        }
        if (!g_ui.Init()) {
            return;
        }

        g_ui.RegisterRequest("console.command-center.ping", &OnPing, nullptr);
        g_ui.RegisterRequest("console.command-center.close", &OnClose, nullptr);
        (void)g_ui.RegisterView(kViewId);
        if (g_settings.Init() && g_settings.IsReady()) {
            const auto status = g_settings.RegisterHotkey("console.command-center", "openCCC", &OnOpenHotkey, nullptr);
            if (status != OSFSettings::API::Status::Ok) REX::WARN("CCC hotkey registration failed: {}", static_cast<unsigned>(status));
        } else {
            REX::WARN("OSF Settings unavailable; CCC can still open from its launcher");
        }
        if (!IsRuntimeSupported()) {
            return;
        }
        g_ui.RegisterRequest("console.command-center.execute", &OnExecute, nullptr);
        g_ui.RegisterRequest("console.command-center.query", &OnQuery, nullptr);
        g_ui.RegisterRequest("console.command-center.identifyCurrentArea", &OnIdentifyCurrentArea, nullptr);
        g_ui.RegisterRequest("console.command-center.questRead", &OnQuestRead, nullptr);
        g_ui.RegisterRequest("console.command-center.setEffectiveActorValue", &OnSetEffectiveActorValue, nullptr);
        g_ui.RegisterRequest("console.command-center.modCatalogs", &OnModCatalogs, nullptr);
        g_ui.RegisterRequest("console.command-center.modCatalogRecords", &OnModCatalogRecords, nullptr);
        g_ui.RegisterRequest("console.command-center.pluginLoadOrder", &OnPluginLoadOrder, nullptr);
        g_ui.RegisterRequest("console.command-center.inspectRecord", &CCC::RecordDetails::OnInspect, nullptr);
        g_ui.RegisterRequest("console.command-center.previewModel", &CCC::ModelPreview::OnModel, nullptr);
        g_ui.RegisterRequest("console.command-center.previewChunk", &CCC::ModelPreview::OnChunk, nullptr);
        CCC::PreviewTriggerInput::Install(g_ui);
        // One lifecycle registration owns both observers; do not replace the
        // controller-preview observer with an independent hotkey callback.
        g_ui.RegisterViewLifecycle(kViewId, [](const char* view, OSFUI::API::ViewLifecyclePhase phase, void* context) noexcept {
            CCC::MenuHotkey::OnView(phase);
            CCC::PreviewTriggerInput::OnView(view, phase, context);
        }, nullptr);
        g_ui.RegisterRequest("console.command-center.devFeedbackExport", &OnDevFeedbackExport, nullptr);
        g_ui.RegisterRequest("console.command-center.includedBatch", &OnIncludedBatch, nullptr);
        g_ui.RegisterRequest("console.command-center.translationPack", &CCC::Translations::OnRead, nullptr);
        g_ui.RegisterRequest("console.command-center.commandBatchList", &OnCommandBatchList, nullptr);
        g_ui.RegisterRequest("console.command-center.commandBatchSave", &OnCommandBatchSave, nullptr);
        g_ui.RegisterRequest("console.command-center.commandBatchDelete", &OnCommandBatchDelete, nullptr);
        g_ui.RegisterRequest("console.command-center.commandBatchDeleteAll", &OnCommandBatchDeleteAll, nullptr);
        g_ui.RegisterRequest("console.command-center.commandBatchAutoRunGet", &OnCommandBatchAutoRunGet, nullptr);
        g_ui.RegisterRequest("console.command-center.commandBatchAutoRunEnable", &OnCommandBatchAutoRunEnable, nullptr);
        g_ui.RegisterRequest("console.command-center.commandBatchAutoRunBatch", &OnCommandBatchAutoRunBatch, nullptr);
        g_ui.RegisterRequest("console.command-center.commandBatchAutoRunReports", &OnCommandBatchAutoRunReports, nullptr);
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
