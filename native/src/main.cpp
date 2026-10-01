#include <SFSE/SFSE.h>
#include <RE/Starfield.h>

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
#include <string>
#include <string_view>
#include <vector>

#include "OSFUI_JSON.h"
#include "DirectQuery.h"

namespace
{
    OSFUI::API::Client g_ui;

    constexpr const char* kViewId = "console.command-center/main";
    constexpr const char* kBuildId = "0.3.7";
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
