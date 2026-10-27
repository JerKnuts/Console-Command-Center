#pragma once
#include <RE/Starfield.h>
#include "NumericQuery.h"
#include <array>
#include <cstring>
#include <format>
#include <limits>
#include <optional>

namespace CCC
{
    struct AdditionalReadout {
        const char* operation;
        const char* name;
        std::uint64_t addressID;
        bool actor;
        NumericQuery::ResultKind kind;
        std::array<unsigned char,16> prefix;
    };
    // Exact 1.16.244 execute adapters inspected for use without compiled data.
    // IsInCombat is deliberately excluded: it parses an optional compiled arg.
    inline constexpr std::array<AdditionalReadout,8> kAdditionalReadouts{{
        {"isweaponout","IsWeaponOut",66576,true,NumericQuery::ResultKind::count,{0x4c,0x8b,0xdc,0x48,0x81,0xec,0x98,0,0,0,0x4c,0x8b,0x8c,0x24,0xd0,0}},
        {"isweaponmagicout","IsWeaponMagicOut",66119,true,NumericQuery::ResultKind::boolean,{0x4c,0x8b,0xdc,0x48,0x81,0xec,0x98,0,0,0,0x4d,0x85,0xc0,0x74,0x58,0x4c}},
        {"issneaking","IsSneaking",66238,true,NumericQuery::ResultKind::boolean,{0x48,0x89,0x5c,0x24,8,0x48,0x89,0x74,0x24,0x10,0x57,0x48,0x83,0xec,0x20,0x48}},
        {"isrunning","IsRunning",66239,true,NumericQuery::ResultKind::boolean,{0x48,0x89,0x5c,0x24,8,0x48,0x89,0x74,0x24,0x10,0x57,0x48,0x83,0xec,0x20,0x48}},
        {"getcombatstate","GetCombatState",66554,true,NumericQuery::ResultKind::count,{0x48,0x89,0x5c,0x24,8,0x57,0x48,0x83,0xec,0x20,0x48,0x8b,0x7c,0x24,0x60,0x33}},
        {"isessential","IsEssential",66277,true,NumericQuery::ResultKind::boolean,{0x4c,0x8b,0xdc,0x49,0x89,0x5b,8,0x57,0x48,0x81,0xec,0x90,0,0,0,0x48}},
        {"getlocked","GetLocked",65976,false,NumericQuery::ResultKind::count,{0x48,0x89,0x5c,0x24,8,0x57,0x48,0x83,0xec,0x20,0x48,0x8b,0x5c,0x24,0x60,0xc7}},
        {"getlocklevel","GetLockLevel",65977,false,NumericQuery::ResultKind::count,{0x4c,0x8b,0xdc,0x48,0x81,0xec,0x98,0,0,0,0x4c,0x8b,0x8c,0x24,0xd0,0}},
    }};

    inline const AdditionalReadout* FindAdditionalReadout(std::string_view operation) {
        for (const auto& spec : kAdditionalReadouts) if (operation == spec.operation) return &spec;
        return nullptr;
    }

    inline std::optional<std::string> ReadAdditionalScalar(std::string_view operation, RE::TESObjectREFR* reference) {
        const auto* spec = FindAdditionalReadout(operation);
        if (!spec) return std::nullopt;
        if (spec->actor && !starfield_cast<RE::Actor*>(reference))
            throw std::runtime_error("Choose an actor's placed Reference ID for this inspection.");
        auto* function = RE::Script::LocateScriptCommand(spec->name);
        const auto expected = REL::ID(spec->addressID).address();
        if (!function || function->numParams != 0
            || reinterpret_cast<std::uintptr_t>(function->executeFunction) != expected
            || std::memcmp(reinterpret_cast<const void*>(expected),spec->prefix.data(),spec->prefix.size()) != 0)
            throw std::runtime_error("This game's inspection handler has changed; the direct read is unavailable.");
        float value = std::numeric_limits<float>::quiet_NaN();
        std::uint32_t offset = 0;
        if (!function->executeFunction(function->params,"",reference,nullptr,nullptr,nullptr,&value,&offset)
            || !NumericQuery::ValidResult(spec->kind,value))
            throw std::runtime_error("The game did not return a valid inspection value.");
        return std::format("{} >> {:.6f}",spec->name,value);
    }
}
