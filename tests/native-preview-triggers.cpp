#include "PreviewTriggerInput.h"
#include <iostream>
#include <stdexcept>

int main() {
    try {
        std::array<bool,4> connected{};std::array<CCC::PreviewTriggerInput::Values,4> values{};
        const auto read=[&](unsigned slot,REX::W32::XINPUT_STATE* state){if(!connected.at(slot))return 1167u;state->gamepad.leftTrigger=std::uint8_t(values[slot].left);state->gamepad.rightTrigger=std::uint8_t(values[slot].right);return 0u;};
        int selected=-1;
        using CCC::PreviewTriggerInput::ReadTriggers;using CCC::PreviewTriggerInput::Values;
        if(ReadTriggers(read,selected)!=Values{}||selected!=-1)throw std::runtime_error("Disconnected controller must release triggers");
        connected[2]=true;values[2]={64,255};
        if(ReadTriggers(read,selected)!=Values{64,255}||selected!=2)throw std::runtime_error("Trigger pressure or nonzero controller slot lost");
        connected[0]=true;values[0]={255,0};
        if(ReadTriggers(read,selected)!=Values{64,255}||selected!=2)throw std::runtime_error("Triggers from different controllers were mixed");
        values[2]={};if(ReadTriggers(read,selected)!=Values{})throw std::runtime_error("Trigger release not forwarded");
        connected[2]=false;if(ReadTriggers(read,selected)!=Values{255,0}||selected!=0)throw std::runtime_error("Controller disconnect recovery failed");
        connected[0]=false;if(ReadTriggers(read,selected)!=Values{}||selected!=-1)throw std::runtime_error("Disconnect left a held trigger");
        std::cout<<"Preview trigger tests passed: pressure, release, selection and disconnection.\n";return 0;
    } catch(const std::exception& e){std::cerr<<e.what()<<'\n';return 1;}
}
