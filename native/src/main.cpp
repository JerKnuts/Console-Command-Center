#include <SFSE/SFSE.h>
#include <RE/Starfield.h>

#include <algorithm>
#include <cctype>
#include <cstdint>
#include <cstddef>
#include <cstdlib>
#include <cstdio>
#include <chrono>
#include <functional>
#include <memory>
#include <string>
#include <string_view>
#include <thread>
#include <vector>

#include "OSFUI_JSON.h"
#include "DirectQuery.h"

namespace
{
    OSFUI::API::Client g_ui;

    constexpr const char* kViewId = "console.command-center/main";
    constexpr std::size_t kMaxCommandLength = 1024;

    bool g_captureActive = false;
    struct CaptureLease
    {
        CaptureLease() { g_captureActive = true; }
        ~CaptureLease() { g_captureActive = false; }
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

    bool QueueMainTaskAfter(std::chrono::milliseconds delay, std::function<void()> task) noexcept;

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
        if (g_captureActive) {
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
                if (queuedCommand == "showmenu sleepwaitmenu") {
                    if (auto* messages = RE::UIMessageQueue::GetSingleton()) {
                        (void)messages->AddMessage(RE::BSFixedString{ "SleepWaitMenu" }, RE::UI_MESSAGE_TYPE::kShow);
                    }
                    return;
                }
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

    bool ParseGetStageOutput(std::string_view output, std::uint16_t& stage) noexcept
    {
        constexpr std::string_view marker = "GetStage >>";
        const auto markerPos = output.rfind(marker);
        if (markerPos == std::string_view::npos) {
            return false;
        }

        auto valuePos = markerPos + marker.size();
        while (valuePos < output.size() && std::isspace(static_cast<unsigned char>(output[valuePos])) != 0) {
            ++valuePos;
        }
        if (valuePos >= output.size()) {
            return false;
        }

        const std::string valueText{ output.substr(valuePos) };
        char* end = nullptr;
        const double value = std::strtod(valueText.c_str(), &end);
        if (end == valueText.c_str() || value < 0.0 || value > 65535.0) {
            return false;
        }

        stage = static_cast<std::uint16_t>(value);
        return true;
    }

    std::vector<std::uint16_t> ParseSQSCompletedStages(std::string_view output)
    {
        std::vector<std::uint16_t> completedStages;
        constexpr std::string_view marker = "(done)";

        std::size_t lineStart = 0;
        while (lineStart < output.size()) {
            const auto lineEnd = output.find('\n', lineStart);
            const auto line = output.substr(
                lineStart,
                lineEnd == std::string_view::npos ? output.size() - lineStart : lineEnd - lineStart);

            const auto markerPos = line.find(marker);
            if (markerPos != std::string_view::npos) {
                auto valuePos = markerPos + marker.size();
                while (valuePos < line.size() && std::isspace(static_cast<unsigned char>(line[valuePos])) != 0) {
                    ++valuePos;
                }

                if (valuePos < line.size()) {
                    const std::string valueText{ line.substr(valuePos) };
                    char* end = nullptr;
                    const long value = std::strtol(valueText.c_str(), &end, 10);
                    if (end != valueText.c_str() && value >= 0 && value <= 65535) {
                        completedStages.push_back(static_cast<std::uint16_t>(value));
                    }
                }
            }

            if (lineEnd == std::string_view::npos) {
                break;
            }
            lineStart = lineEnd + 1;
        }

        std::sort(completedStages.begin(), completedStages.end());
        completedStages.erase(std::unique(completedStages.begin(), completedStages.end()), completedStages.end());
        return completedStages;
    }

    struct QuestStatusCapture
    {
        std::shared_ptr<CaptureLease> lease;
        OSFUI::API::Request request{};
        std::string questIDText;
        std::uint16_t currentStage{ 0 };

        std::string getStageBufferBefore;
        std::uint32_t getStagePolls{ 0 };

        std::string sqsBufferBefore;
        std::string lastSqsOutput;
        std::uint32_t sqsPolls{ 0 };
        std::uint32_t sqsStablePolls{ 0 };
    };

    constexpr std::uint32_t kQuestStatusMaxPolls = 24;
    constexpr auto kGetStagePollDelay = std::chrono::milliseconds{ 50 };
    constexpr auto kSqsPollDelay = std::chrono::milliseconds{ 75 };

    bool QueueMainTaskAfter(std::chrono::milliseconds delay, std::function<void()> task) noexcept
    {
        try {
            const auto* taskInterface = SFSE::GetTaskInterface();
            if (!taskInterface) {
                return false;
            }

            std::thread([taskInterface, delay, task = std::move(task)]() mutable {
                std::this_thread::sleep_for(delay);
                try {
                    taskInterface->AddTask(std::move(task));
                } catch (...) {
                    // The game may be shutting down. There is nothing useful
                    // to do from the worker thread if the queue is unavailable.
                }
            }).detach();
            return true;
        } catch (...) {
            return false;
        }
    }

    void RejectQuestStatus(const std::shared_ptr<QuestStatusCapture>& state, const char* code, const char* message) noexcept
    {
        if (state) {
            state->request.Reject(code, message);
        }
    }

    void RespondQuestStatus(const std::shared_ptr<QuestStatusCapture>& state, const std::vector<std::uint16_t>& completedStages, bool historyAvailable = true) noexcept
    {
        try {
            const auto payload = OSFUI::API::Json{
                { "ok", true },
                { "questId", state->questIDText },
                { "currentStage", state->currentStage },
                { "completedStages", completedStages },
                { "historyAvailable", historyAvailable }
            }.dump();
            state->request.Respond("console.command-center.questStatusResult", payload.c_str());
        } catch (...) {
            RejectQuestStatus(state, "quest-status-failed", "Could not serialize quest stage state.");
        }
    }

    void PollSQSOutput(const std::shared_ptr<QuestStatusCapture>& state) noexcept;

    void PollGetStageOutput(const std::shared_ptr<QuestStatusCapture>& state) noexcept
    {
        try {
            const auto output = ConsoleBufferDelta(state->getStageBufferBefore);
            std::uint16_t currentStage = 0;
            if (ParseGetStageOutput(output, currentStage)) {
                state->currentStage = currentStage;
                state->sqsBufferBefore = ReadConsoleBuffer();

                const std::string sqsCommand = std::string{ "sqs " } + state->questIDText;
                if (!ExecuteConsoleCommand(sqsCommand)) {
                    RejectQuestStatus(state, "quest-status-failed", "Could not execute SQS for this quest.");
                    return;
                }

                if (!QueueMainTaskAfter(kSqsPollDelay, [state]() noexcept { PollSQSOutput(state); })) {
                    RejectQuestStatus(state, "quest-status-failed", "Could not schedule SQS output capture.");
                }
                return;
            }

            if (++state->getStagePolls >= kQuestStatusMaxPolls) {
                RejectQuestStatus(state, "quest-status-unavailable", "GetStage did not return a quest stage. The quest may not exist or may be unavailable on this save.");
                return;
            }

            if (!QueueMainTaskAfter(kGetStagePollDelay, [state]() noexcept { PollGetStageOutput(state); })) {
                RejectQuestStatus(state, "quest-status-failed", "Could not schedule GetStage output capture.");
            }
        } catch (...) {
            RejectQuestStatus(state, "quest-status-failed", "Could not capture GetStage output.");
        }
    }

    void PollSQSOutput(const std::shared_ptr<QuestStatusCapture>& state) noexcept
    {
        try {
            const auto output = ConsoleBufferDelta(state->sqsBufferBefore);
            const bool hasStageTable = output.find("(done)") != std::string::npos || output.find("(not set)") != std::string::npos;

            if (!output.empty() && output == state->lastSqsOutput) {
                ++state->sqsStablePolls;
            } else {
                state->lastSqsOutput = output;
                state->sqsStablePolls = 0;
            }

            // SQS can print a long table. Wait until the captured output has
            // stopped changing for a full game tick so we do not return a
            // partially-written list of completed stages.
            if (hasStageTable && state->sqsStablePolls >= 1) {
                RespondQuestStatus(state, ParseSQSCompletedStages(output));
                return;
            }

            if (++state->sqsPolls >= kQuestStatusMaxPolls) {
                // The scalar stage is still useful. An unavailable SQS table
                // must not be reported as an empty completed-stage history.
                RespondQuestStatus(state, {}, false);
                return;
            }

            if (!QueueMainTaskAfter(kSqsPollDelay, [state]() noexcept { PollSQSOutput(state); })) {
                RejectQuestStatus(state, "quest-status-failed", "Could not schedule SQS output capture.");
            }
        } catch (...) {
            RejectQuestStatus(state, "quest-status-failed", "Could not capture SQS output.");
        }
    }

    void OnQuestStatus(const OSFUI::API::Request& raw, void*) noexcept
    {
        raw.Reject("inspection-disabled", "Quest Status is temporarily disabled after a native crash in the shared test1 evaluator. Scale, Open State, and GetStage need a verified replacement adapter.");
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
            // changing for two polls before returning it to the UI. This gives long outputs
            // such as ShowInventory, Help, and SQS more time to finish printing.
            if (!output.empty() && state->stablePolls >= 2) {
                RespondConsoleQuery(state, output);
                return;
            }

            if (++state->polls >= kConsoleQueryMaxPolls) {
                RejectConsoleQuery(state, "query-timeout", "No complete console output was captured. The command may have run without printing text. Try it in Starfield's console; this is not a zero or empty result.");
                return;
            }

            if (!QueueMainTaskAfter(kConsoleQueryPollDelay, [state]() noexcept { PollConsoleQueryOutput(state); })) {
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
            if (g_captureActive) {
                request.Reject("query-busy", "Wait for the current inspection to finish.");
                return;
            }
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
            auto state = std::make_shared<ConsoleQueryCapture>();
            state->lease = std::make_shared<CaptureLease>();
            state->request = raw;
            state->command = *command;
            state->bufferBefore = ReadConsoleBuffer();

            if (!ExecuteConsoleCommand(*command)) {
                request.Reject("query-failed", "Native Starfield console execution failed.");
                return;
            }

            if (!QueueMainTaskAfter(kConsoleQueryPollDelay, [state]() noexcept { PollConsoleQueryOutput(state); })) {
                request.Reject("query-failed", "Could not schedule console output capture.");
            }
        } catch (const std::exception& error) {
            request.Reject("query-failed", error.what());
        } catch (...) {
            request.Reject("query-failed", "Could not start console output capture.");
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
            { "build", "id-browser-6" },
            { "executor", "native" }
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
        g_ui.RegisterRequest("console.command-center.execute", &OnExecute, nullptr);
        g_ui.RegisterRequest("console.command-center.query", &OnQuery, nullptr);
        g_ui.RegisterRequest("console.command-center.questStatus", &OnQuestStatus, nullptr);
        g_ui.RegisterRequest("console.command-center.close", &OnClose, nullptr);
        (void)g_ui.RegisterView(kViewId);
    }
}

SFSE_PLUGIN_LOAD(const SFSE::LoadInterface* sfse)
{
    SFSE::Init(sfse);

    auto* messaging = SFSE::GetMessagingInterface();
    if (!messaging) {
        return false;
    }

    messaging->RegisterListener(OnSFSEMessage);
    return true;
}
