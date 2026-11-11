#pragma once
#include <string>
#include <string_view>

namespace CCC::Diagnostics
{
    inline std::string SafeField(std::string_view input, std::size_t limit)
    {
        std::string result{input.substr(0, limit)};
        for (auto& ch : result) if (static_cast<unsigned char>(ch) < 0x20 || ch == 0x7F) ch = ' ';
        return result;
    }

    template <class Sink>
    void Record(std::string_view event, std::string_view uiVersion, std::string_view nativeVersion,
        std::string_view runtime, std::string_view detail, Sink&& sink)
    {
        sink("CCC diagnostic: event=" + SafeField(event, 64) + "; UI=" + SafeField(uiVersion, 32) +
            "; native=" + SafeField(nativeVersion, 32) + "; runtime=" + SafeField(runtime, 32) + "; " + SafeField(detail, 2048));
    }
}
