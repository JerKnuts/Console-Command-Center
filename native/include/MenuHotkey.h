#pragma once
#include "MenuHotkeyBinding.h"
#include "CommandBatches.h"
#include <Windows.h>
#include <atomic>
#include <chrono>
#include <fstream>
#include <thread>

namespace CCC::MenuHotkey {
    inline std::atomic_bool eligible=false;
    inline std::atomic_bool visible=false;
    inline std::atomic_bool opening=false;
    inline OSFUI::API::Client* client=nullptr;
    inline std::atomic<std::int64_t> lastRequest=0;
    inline bool RequestOpen(OSFUI::API::Client& uiClient) noexcept {
        const auto now=std::chrono::duration_cast<std::chrono::milliseconds>(std::chrono::steady_clock::now().time_since_epoch()).count();
        auto previous=lastRequest.load();
        do { if(now-previous<300)return true; }
        while(!lastRequest.compare_exchange_weak(previous,now));
        return uiClient.RequestMenu("console.command-center/main",true);
    }

    // Read menu state only on the engine's menu-event thread. Never enable this
    // fallback in gameplay or in arbitrary mod dialogs / text-entry screens.
    class MenuEvents final : public RE::BSTEventSink<RE::MenuOpenCloseEvent> {
        RE::BSEventNotifyControl ProcessEvent(const RE::MenuOpenCloseEvent& event,RE::BSTEventSource<RE::MenuOpenCloseEvent>*) override {
            const auto* ui=RE::UI::GetSingleton();
            if(!ui)return RE::BSEventNotifyControl::kContinue;
            auto open=[&](const char* name){
                return event.menuName==RE::BSFixedString(name)?event.opening:ui->IsMenuOpen(RE::BSFixedString(name));
            };
            bool allowed=false,blocked=false;
            for(const auto* name:{"DataMenu","InventoryMenu","ContainerMenu","BarterMenu","FavoritesMenu","GalaxyStarMapMenu","MapMenu","MissionMenu","SkillsMenu","ResearchMenu","ArmorCraftingMenu","WeaponsCraftingMenu","FoodCraftingMenu","DrugsCraftingMenu","IndustrialCraftingMenu","StatusMenu","PowersMenu","ShipCrewMenu","ShipCrewAssignMenu","BookMenu","DataSlateMenu","TransferMenu"})allowed|=open(name);
            for(const auto* name:{"MainMenu","LoadingMenu","FaderMenu","Console","ConsoleNativeUIMenu","OSFSettingsMenu","OSFUI_FocusMenu","PauseMenu","MessageBoxMenu","DialogueMenu","ShipDialogueMenu","TextInputMenu","TextEntryMenu","ChargenMenu","ControlsMenu","CreationsMenu","TerminalMenu"})blocked|=open(name);
            eligible.store(allowed&&!blocked,std::memory_order_release);
            return RE::BSEventNotifyControl::kContinue;
        }
    };
    inline MenuEvents events;

    inline void OnView(OSFUI::API::ViewLifecyclePhase phase) {
        if(phase==OSFUI::API::ViewLifecyclePhase::kShown)visible=true;
        if(phase==OSFUI::API::ViewLifecyclePhase::kHidden){visible=false;opening=false;}
    }

    inline void Install(OSFUI::API::Client& uiClient) {
        static bool installed=false;
        if(installed)return;
        auto* ui=RE::UI::GetSingleton();
        if(!ui){REX::WARN("CCC menu hotkey: UI not ready");return;}
        client=&uiClient;
        ui->RegisterSink<RE::MenuOpenCloseEvent>(&events);
        installed=true;
        // Process lifetime, just like the registered SFSE/OSF callbacks. This
        // worker never calls game objects, changes bindings or writes game files.
        std::thread([] { try {
            const auto path=CommandBatches::UserDirectory().parent_path().parent_path()/L"ControlMap_Custom.txt";
            PressLatch latch;
            unsigned key=0;
            auto nextRead=std::chrono::steady_clock::time_point{};
            auto requested=nextRead;
            for(;;){
                const auto now=std::chrono::steady_clock::now();
                if(now>=nextRead){
                    key=0;
                    std::error_code error;
                    const auto size=std::filesystem::file_size(path,error);
                    if(!error && size<=1024*1024){
                        std::ifstream file(path,std::ios::binary);
                        std::string bytes(static_cast<std::size_t>(size),'\0');
                        if(file.read(bytes.data(),static_cast<std::streamsize>(size)))key=KeyboardBinding(bytes).value_or(0);
                    }
                    nextRead=now+std::chrono::milliseconds(500);
                }
                DWORD process=0;
                GetWindowThreadProcessId(GetForegroundWindow(),&process);
                const bool focused=process==GetCurrentProcessId();
                const bool down=key && (GetAsyncKeyState(static_cast<int>(key))&0x8000);
                const bool allowed=focused && eligible.load(std::memory_order_acquire) && !visible.load() && !opening.load();
                if(latch.Update(key,down,allowed)){
                    opening=true;requested=now;
                    if(!RequestOpen(*client))opening=false;
                    else REX::INFO("CCC menu hotkey requested view (keyboard VK {})",key);
                }
                // Allow retry if OSF could not present the view; never auto-repeat.
                if(opening.load() && !visible.load() && now-requested>std::chrono::seconds(3))opening=false;
                std::this_thread::sleep_for(std::chrono::milliseconds(16));
            }
        } catch(...) {eligible=false;REX::WARN("CCC menu hotkey stopped after a binding read error; normal hotkey remains available");} }).detach();
        REX::INFO("CCC keyboard menu hotkey installed; using saved Controls binding");
    }
}
