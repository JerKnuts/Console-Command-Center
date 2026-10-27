#pragma once
#include <array>
#include <algorithm>
#include <charconv>
#include <cctype>
#include <cmath>
#include <cstdint>
#include <optional>
#include <sstream>
#include <stdexcept>
#include <string>
#include <string_view>

namespace CCC::NumericQuery
{
    enum class ResultKind { number, count, boolean, percent, sleep };
    struct Spec { const char* name; bool target; bool actor; unsigned params; ResultKind kind; };
    inline constexpr std::array<Spec, 11> specs{{
        { "GetRandomPercent", false, false, 0, ResultKind::percent },
        { "GetGold", true, false, 0, ResultKind::count },
        { "GetItemCount", true, false, 1, ResultKind::count },
        { "GetLevel", true, true, 0, ResultKind::count },
        { "GetDead", true, true, 0, ResultKind::boolean },
        { "GetScale", true, false, 0, ResultKind::number },
        { "GetDisabled", true, false, 0, ResultKind::boolean },
        { "GetSleeping", true, true, 0, ResultKind::sleep },
        { "GetStartingPos", true, false, 1, ResultKind::number },
        { "IsRaining", false, false, 0, ResultKind::boolean },
        { "IsSnowing", false, false, 0, ResultKind::boolean },
    }};
    inline std::string Lower(std::string text) {
        std::transform(text.begin(), text.end(), text.begin(), [](unsigned char ch){ return static_cast<char>(std::tolower(ch)); });
        return text;
    }
    inline std::uint32_t FormID(std::string_view text) {
        std::uint32_t id = 0;
        const auto [end, error] = std::from_chars(text.data(), text.data() + text.size(), id, 16);
        if (text.empty() || text.size() > 8 || error != std::errc{} || end != text.data() + text.size() || !id)
            throw std::runtime_error("Enter a valid 1-8 digit hexadecimal Form/Reference ID.");
        return id;
    }
    struct Plan { std::size_t slot; std::uint32_t targetID; std::string argument; };
    inline std::optional<Plan> Parse(const std::string& command) {
        std::istringstream input(command);
        std::string verb, argument, extra;
        input >> verb >> argument >> extra;
        verb = Lower(verb);
        const auto dot = verb.find('.');
        const auto operation = dot == std::string::npos ? verb : verb.substr(dot + 1);
        for (std::size_t slot = 0; slot < specs.size(); ++slot) {
            const auto& spec = specs[slot];
            if (operation != Lower(spec.name)) continue;
            if (!extra.empty() || (spec.params == 0 ? !argument.empty() : argument.empty()))
                throw std::runtime_error("Run one inspection with only its required arguments.");
            std::uint32_t target = 0;
            if (spec.target) {
                if (dot == std::string::npos) throw std::runtime_error("Choose Player or a placed Reference ID for this inspection.");
                const auto prefix = verb.substr(0, dot);
                target = prefix == "player" ? 0x14 : FormID(prefix);
            } else if (dot != std::string::npos) {
                throw std::runtime_error("This inspection does not take a target prefix.");
            }
            if (operation == "getitemcount") (void)FormID(argument);
            if (operation == "getstartingpos" && (argument.size() != 1 || Lower(argument).find_first_not_of("xyz") != std::string::npos))
                throw std::runtime_error("Choose X, Y, or Z for the starting-position axis.");
            return Plan{slot, target, argument};
        }
        return std::nullopt;
    }
    inline bool ValidResult(ResultKind kind, float value) {
        if (!std::isfinite(value)) return false;
        switch (kind) {
        case ResultKind::boolean: return value == 0 || value == 1;
        case ResultKind::percent: return value >= 0 && value <= 100;
        case ResultKind::count: return value >= 0 && std::trunc(value) == value;
        case ResultKind::sleep: return value >= 0 && std::trunc(value) == value;
        default: return true;
        }
    }
}
