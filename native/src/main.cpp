#include <SFSE/SFSE.h>
#include <RE/Starfield.h>

#include <algorithm>
#include <cctype>
#include <string>
#include <string_view>

#include "OSFUI_JSON.h"

namespace
{
    OSFUI::API::Client g_ui;

    constexpr const char* kViewId = "console.command-center/main";
    constexpr std::size_t kMaxCommandLength = 1024;

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
        if (!ExecuteConsoleCommand(*command)) {
            request.Reject("execution-failed", "Native Starfield console execution failed.");
            return;
        }

        (void)request.Respond("console.command-center.executeResult", OSFUI::API::Json{
            { "ok", true },
            { "command", *command }
        });
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
