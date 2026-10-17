#pragma once
#include <algorithm>
#include <array>
#include <chrono>
#include <mutex>
#include "REX/W32/KERNEL32.h"
#include "REX/W32/XINPUT.h"
#include "OSFUI_JSON.h"

namespace CCC::PreviewTriggerInput {
    inline constexpr const char* View="console.command-center/main";
    struct Values { unsigned left=0,right=0;bool operator==(const Values&)const=default; };
    // Lock onto the first connected controller until it disconnects. Do not mix
    // triggers from separate controllers or read engine input objects.
    template<class Read> Values ReadTriggers(Read read,int& selected) {
        REX::W32::XINPUT_STATE state{};
        if(selected>=0&&read(unsigned(selected),&state)==0)return {state.gamepad.leftTrigger,state.gamepad.rightTrigger};
        selected=-1;
        for(unsigned slot=0;slot<4;++slot)if(read(slot,&state)==0){selected=int(slot);return {state.gamepad.leftTrigger,state.gamepad.rightTrigger};}
        return {};
    }
    class Reader {
        using GetState=std::uint32_t(*)(std::uint32_t,REX::W32::XINPUT_STATE*);
        GetState getState=nullptr;int selected=-1;
    public:
        Values Read() noexcept {
            if(!getState)for(const auto* module:{"XINPUT1_4.dll","xinput1_3.dll","xinput9_1_0.dll"})
                if(auto handle=REX::W32::GetModuleHandleA(module))if(auto function=REX::W32::GetProcAddress(handle,"XInputGetState")){getState=reinterpret_cast<GetState>(function);break;}
            return getState?ReadTriggers(getState,selected):Values{};
        }
    };
    inline std::mutex mutex;
    inline bool watching=false;
    inline std::chrono::steady_clock::time_point expires{},lastSent{};
    inline Values previous{};
    inline Reader reader;
    inline OSFUI::API::Client* ui=nullptr;
    inline void Emit(Values value) noexcept {
        if(!ui)return;
        try {const auto json=OSFUI::API::Json{{"kind","triggers"},{"axes",{{"lt",value.left/255.0},{"rt",value.right/255.0}}}}.dump();ui->EmitEvent(View,"console.command-center.previewTriggers",json.c_str());}catch(...){}
    }
    inline void OnWatch(const OSFUI::API::Request& raw,void*) noexcept {
        OSFUI::API::JsonRequest request{raw};if(!request||request.SourceViewId()!=View)return;
        const auto enabled=request.Get<bool>("watch");if(!enabled)return;
        std::scoped_lock lock(mutex);watching=*enabled;expires=std::chrono::steady_clock::now()+std::chrono::seconds(2);
        if(!watching){previous={};Emit({});}else lastSent={};
        request.Reply(OSFUI::API::Json{{"ok",true}});
    }
    inline void OnView(const char*,OSFUI::API::ViewLifecyclePhase phase,void*) noexcept {
        std::scoped_lock lock(mutex);
        if(phase==OSFUI::API::ViewLifecyclePhase::kHidden){watching=false;previous={};Emit({});return;}
        if(phase!=OSFUI::API::ViewLifecyclePhase::kFrame||!watching)return;
        const auto now=std::chrono::steady_clock::now();
        if(now>=expires){watching=false;previous={};Emit({});return;}
        const auto value=reader.Read();
        // Releases arrive immediately; held values refresh so the browser can
        // stop safely if updates stall, the overlay closes or the pad disappears.
        if(value!=previous||now-lastSent>=std::chrono::milliseconds(100)){previous=value;lastSent=now;Emit(value);}
    }
    inline void Install(OSFUI::API::Client& client) noexcept {
        ui=&client;client.RegisterRequest("console.command-center.previewTriggerWatch",OnWatch,nullptr);
        client.RegisterViewLifecycle(View,OnView,nullptr);
    }
}
