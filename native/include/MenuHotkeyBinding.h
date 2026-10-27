#pragma once
#include <cstdint>
#include <optional>
#include <string_view>

namespace CCC::MenuHotkey {
    // ControlMap_Custom stores three device blocks. Each block has a version
    // byte and a big-endian 16-bit total length; record integers are little endian.
    // Only keyboard block zero and CCC's exact gameplay action are relevant.
    inline std::optional<unsigned> KeyboardBinding(std::string_view bytes) {
        if(bytes.size()<3 || static_cast<unsigned char>(bytes[0])!=3)return {};
        const auto end=(static_cast<unsigned char>(bytes[1])<<8)|static_cast<unsigned char>(bytes[2]);
        if(end<3 || end>bytes.size())return {};
        std::size_t pos=3;
        std::optional<unsigned> result;
        auto text=[&]() -> std::optional<std::string_view> {
            const auto stop=bytes.find('\0',pos);
            if(stop==std::string_view::npos || stop>=end)return {};
            const auto value=bytes.substr(pos,stop-pos);pos=stop+1;return value;
        };
        auto number=[&]() {
            unsigned value=0;
            for(unsigned shift=0;shift<32;shift+=8)value|=unsigned(static_cast<unsigned char>(bytes[pos++]))<<shift;
            return value;
        };
        while(pos<end){
            const auto context=text(),action=text();
            if(!context || !action || end-pos<4)return {};
            const auto count=number();
            if(count>(end-pos)/4)return {};
            for(unsigned index=0;index<count;++index){
                const auto key=number();
                if(*context=="MainGameplay" && *action=="console.command-center/openCCC") {
                    // Multiple-key chords are not representable by this fallback.
                    if(count!=1 || result)return {};
                    result=key;
                }
            }
        }
        return result && *result>0 && *result<0xFF ? result : std::nullopt;
    }

    struct PressLatch {
        unsigned key=0;
        bool held=true; // A new binding must be released before it can activate.
        bool Update(unsigned binding,bool down,bool eligible) {
            if(binding!=key){key=binding;held=down;return false;}
            const bool activate=key && down && !held && eligible;
            held=down;
            return activate;
        }
    };
}
