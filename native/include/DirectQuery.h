#pragma once

#include <RE/Starfield.h>
#include "InventoryQuery.h"
#include "RandomPercentQuery.h"
#include "NumericQuery.h"
#include "AdditionalReadouts.h"
#include <limits>
#include <array>
#include <cstring>
#include <algorithm>
#include <cctype>
#include <charconv>
#include <cmath>
#include <format>
#include <numbers>
#include <optional>
#include <sstream>
#include <stdexcept>

namespace CCC
{
    // These exact zero-argument execute adapters construct their own engine
    // context. Never use the unresolved CommonLib condition/GetScale adapters.
    inline float ReadActorScalar(const char* name, std::uint64_t id, RE::TESObjectREFR* reference,
        NumericQuery::ResultKind kind)
    {
        auto* function = RE::Script::LocateScriptCommand(name);
        const auto expected = REL::ID(id).address();
        constexpr std::array<unsigned char, 16> prefix{
            0x4C,0x8B,0xDC,0x48,0x81,0xEC,0x98,0,0,0,0x4C,0x8B,0x8C,0x24,0xD0,0
        };
        if (!function || function->numParams != 0
            || reinterpret_cast<std::uintptr_t>(function->executeFunction) != expected
            || std::memcmp(reinterpret_cast<const void*>(expected), prefix.data(), prefix.size()) != 0)
            throw std::runtime_error("This game's readout handler has changed; the direct read is unavailable.");
        float value = std::numeric_limits<float>::quiet_NaN();
        std::uint32_t offset = 0;
        if (!function->executeFunction(function->params, "", reference, nullptr, nullptr, nullptr, &value, &offset)
            || !NumericQuery::ValidResult(kind, value))
            throw std::runtime_error("The game's readout handler did not return a valid value.");
        return value;
    }
    inline const char* InventoryTypeCode(RE::FormType type) noexcept
    {
        switch (type) {
        case RE::FormType::kWEAP: return "WEAP";
        case RE::FormType::kARMO: return "ARMO";
        case RE::FormType::kAMMO: return "AMMO";
        case RE::FormType::kALCH: return "AID";
        case RE::FormType::kBOOK: return "BOOK";
        case RE::FormType::kNOTE: return "NOTE";
        case RE::FormType::kKEYM: return "KEY";
        case RE::FormType::kMISC: return "MISC";
        case RE::FormType::kINGR: return "INGR";
        case RE::FormType::kSPEL: return "SPEL";
        default: return "OTHER";
        }
    }

    // Only recognized inspections bypass the console. Everything else retains
    // the existing console path, including Help's loaded-record search.
    inline std::optional<std::string> ReadDirectQuery(const std::string& command)
    {
        std::istringstream input(command);
        std::string verb, argument, extra;
        input >> verb >> argument >> extra;
        std::transform(verb.begin(), verb.end(), verb.begin(), [](unsigned char c) { return static_cast<char>(std::tolower(c)); });
        const auto dot = verb.find('.');
        const auto parsedOperation = dot == std::string::npos ? verb : verb.substr(dot + 1);
        const auto operation = parsedOperation == "getvalue" ? std::string("getav") : parsedOperation;
        if (operation != "showinventory" && operation != "getpos" && operation != "getangle"
            && operation != "getscale" && operation != "getav" && operation != "getspaceship"
            && operation != "getopenstate" && operation != "getgs" && operation != "getglobalvalue"
            && operation != "getitemcount" && operation != "getgold" && operation != "getdead" && operation != "getdisabled"
            && operation != "getrandompercent" && operation != "getlevel" && operation != "getsleeping"
            && operation != "israining" && operation != "issnowing" && operation != "isincombat"
            && operation != "getdistance" && !FindAdditionalReadout(operation)) {
            return std::nullopt;
        }
        if (operation == "getrandompercent") {
            if (dot != std::string::npos || !argument.empty()) throw std::runtime_error("Get Random Percent takes no target or arguments.");
            auto* function = RE::Script::LocateScriptCommand("GetRandomPercent");
            const auto expected = REL::ID(66067).address(); // 1.16.244 RVA 00C325F0
            // This exact no-argument adapter reads only the seventh (float*)
            // output parameter and delegates to the game's RNG. It requires no
            // compiled script or reference context. Reject replaced handlers.
            constexpr std::array<unsigned char, 15> prefix{
                0x48,0x81,0xEC,0x98,0x00,0x00,0x00,0x4C,0x8B,0x8C,0x24,0xD0,0x00,0x00,0x00
            };
            if (!function || function->numParams != 0 || function->output != 0x104D
                || reinterpret_cast<std::uintptr_t>(function->executeFunction) != expected
                || std::memcmp(reinterpret_cast<const void*>(expected), prefix.data(), prefix.size()) != 0)
                throw std::runtime_error("The game's random-percentage handler has changed; this direct read is unavailable.");
            const auto value = RandomPercentQuery::Read([&](float* result) {
                std::uint32_t offset = 0;
                return function->executeFunction(function->params, "", nullptr, nullptr, nullptr, nullptr, result, &offset);
            });
            return std::format("GetRandomPercent >> {:.6f}", value);
        }
        if (operation == "israining" || operation == "issnowing") {
            if (dot != std::string::npos || !argument.empty()) throw std::runtime_error("This weather query takes no target or arguments.");
            // Both shipped 1.16.244 adapters write a constant zero. Do not
            // misrepresent that stub value as a verified weather observation.
            return "The IsRaining and IsSnowing console commands are weather stubs in Starfield 1.16.244. They return 0 regardless of the weather; no reliable rain/snow result is available.";
        }
        // GetOpenState still has no verified direct replacement.
        if (operation == "getopenstate") {
            throw std::runtime_error("This inspection is disabled because its CommonLibSF adapter is unresolved or unsafe on Starfield 1.16.244.");
        }
        if (operation == "getgs") {
            if (argument.empty() || !extra.empty()) throw std::runtime_error("Enter one exact Game Setting name.");
            auto* collection = RE::GameSettingCollection::GetSingleton();
            auto* setting = collection ? collection->GetSetting(argument.c_str()) : nullptr;
            if (!setting) throw std::runtime_error("Game Setting not found: " + argument);
            switch (setting->GetType()) {
            case RE::Setting::Type::kBool: return std::format("{} >> {}", argument, setting->GetBool() ? "true" : "false");
            case RE::Setting::Type::kChar: return std::format("{} >> {}", argument, static_cast<int>(setting->GetChar()));
            case RE::Setting::Type::kUChar: return std::format("{} >> {}", argument, static_cast<unsigned int>(setting->GetUChar()));
            case RE::Setting::Type::kInt: return std::format("{} >> {}", argument, setting->GetInt());
            case RE::Setting::Type::kUInt: return std::format("{} >> {}", argument, setting->GetUInt());
            case RE::Setting::Type::kFloat: return std::format("{} >> {:.6f}", argument, setting->GetFloat());
            case RE::Setting::Type::kString: return std::format("{} >> {}", argument, setting->GetString());
            default: throw std::runtime_error("This Game Setting type cannot be displayed safely.");
            }
        }
        const auto parseID = [](std::string_view text) {
            std::uint32_t id = 0;
            const auto [end, error] = std::from_chars(text.data(), text.data() + text.size(), id, 16);
            if (text.empty() || text.size() > 8 || error != std::errc{} || end != text.data() + text.size() || id == 0) {
                throw std::runtime_error("Enter a valid 1-8 digit hexadecimal Form/Reference ID.");
            }
            return id;
        };
        if (operation == "getglobalvalue") {
            if (dot != std::string::npos || argument.empty() || !extra.empty()) {
                throw std::runtime_error("Choose one Global Form ID without a target prefix or extra arguments.");
            }
            const auto id = parseID(argument);
            auto* global = RE::TESForm::LookupByID<RE::TESGlobal>(id);
            if (!global) throw std::runtime_error("Global not found. Use a GLOB Form ID, not an item or reference ID.");
            // Read the loaded global's current value, including save changes.
            // No console-log capture, condition evaluator, or disk default.
            const auto value = global->GetValue();
            if (!std::isfinite(value)) throw std::runtime_error("The global does not contain a finite value.");
            return std::format("Global {:08X} >> {:.6f}", id, value);
        }
        const bool needsArgument = operation == "getpos" || operation == "getangle" || operation == "getav" || operation == "getitemcount" || operation == "getdistance";
        if (!extra.empty() || (needsArgument ? argument.empty() : !argument.empty())) {
            throw std::runtime_error("Invalid inspection arguments; run one inspection at a time.");
        }
        if (dot == std::string::npos) throw std::runtime_error("This inspection requires a Reference ID or player prefix.");
        const auto target = verb.substr(0, dot);
        auto* form = RE::TESForm::LookupByID(target == "player" ? 0x14 : parseID(target));
        // As<TESObjectREFR>() compares exact form types and misses Actor
        // subclasses (including the player); use the game's RTTI cast.
        auto* reference = form ? starfield_cast<RE::TESObjectREFR*>(form) : nullptr;
        if (!reference) throw std::runtime_error("Reference not found. Use a placed Reference ID, not a Base ID.");
        if (const auto output = ReadAdditionalScalar(operation,reference)) return output;
        if (operation == "isincombat") {
            auto* actor = starfield_cast<RE::Actor*>(reference);
            if (!actor) throw std::runtime_error("Choose an actor's placed Reference ID to check combat.");
            auto* function = RE::Script::LocateScriptCommand("IsInCombat");
            const auto expected = REL::ID(66244).address();
            constexpr std::array<unsigned char,16> prefix{0x48,0x89,0x5c,0x24,8,0x57,0x48,0x81,0xec,0xc0,0,0,0,0x48,0x8d,0x44};
            if (!function || reinterpret_cast<std::uintptr_t>(function->executeFunction) != expected
                || std::memcmp(reinterpret_cast<const void*>(expected),prefix.data(),prefix.size()) != 0)
                throw std::runtime_error("This game's combat inspection handler has changed.");
            // The engine's IsInCombat body calls actor vtable+0xB58 with just
            // the actor pointer (default optional argument = 0). CommonLib's
            // declared slot differs; do not call its mismatched virtual.
            using CombatCheck = bool (*)(RE::Actor*);
            const auto* table = *reinterpret_cast<const std::uintptr_t* const*>(actor);
            const auto check = reinterpret_cast<CombatCheck>(table[0xB58 / sizeof(std::uintptr_t)]);
            return std::format("IsInCombat >> {}",check(actor) ? 1 : 0);
        }
        if (operation == "getdistance") {
            auto* destinationForm = RE::TESForm::LookupByID(NumericQuery::Lower(argument) == "player" ? 0x14 : parseID(argument));
            auto* destination = destinationForm ? starfield_cast<RE::TESObjectREFR*>(destinationForm) : nullptr;
            if (!destination) throw std::runtime_error("Destination not found. Use a placed Reference ID, not a Base ID.");
            if (reference->IsDeleted() || reference->IsDisabled() || destination->IsDeleted() || destination->IsDisabled())
                throw std::runtime_error("Choose two enabled, non-deleted references for the distance readout.");
            if (!reference->parentCell || reference->parentCell != destination->parentCell)
                throw std::runtime_error("This popup currently supports distance between references in the same cell. Use GetDistance in the game console for other locations.");
            // Parent-relative objects need the engine's transformed coordinate
            // path. Reject them rather than compare incompatible coordinates.
            if (reference->GetFormFlags().any(static_cast<RE::TESForm::FormFlags>(1u << 14))
                || destination->GetFormFlags().any(static_cast<RE::TESForm::FormFlags>(1u << 14)))
                throw std::runtime_error("A reference uses parent-relative coordinates. Use GetDistance in the game console for this pair.");
            const auto a = reference->GetPosition(), b = destination->GetPosition();
            const auto distance = std::hypot(static_cast<double>(a.x)-b.x,static_cast<double>(a.y)-b.y,static_cast<double>(a.z)-b.z);
            if (!std::isfinite(distance)) throw std::runtime_error("The references do not contain finite positions.");
            return std::format("GetDistance {:08X} >> {:.6f} game units",destination->GetFormID(),distance);
        }
        if (operation == "getlevel" || operation == "getsleeping") {
            if (!starfield_cast<RE::Actor*>(reference)) throw std::runtime_error("Choose an actor's Reference ID for this inspection.");
            const auto value = ReadActorScalar(operation == "getlevel" ? "GetLevel" : "GetSleeping",
                operation == "getlevel" ? 66068 : 66010, reference,
                operation == "getlevel" ? NumericQuery::ResultKind::count : NumericQuery::ResultKind::sleep);
            return std::format("{} >> {:.6f}", operation, value);
        }
        if (operation == "getscale") {
            // Verified against the 1.16.244 GetScale engine body: uint16 at
            // reference+D0 multiplied by the game's 0.01f scale constant.
            static_assert(offsetof(RE::TESObjectREFR, scale) == 0xD0);
            return std::format("GetScale >> {:.6f}", reference->scale * 0.01f);
        }
        if (operation == "getitemcount" || operation == "getgold") {
            const auto id = operation == "getgold" ? 0xFu : parseID(argument);
            auto* item = RE::TESForm::LookupByID(id);
            if (!item || !starfield_cast<RE::TESBoundObject*>(item))
                throw std::runtime_error("Item not found. Use an inventory item's Base Form ID.");
            // Same locked inventory and combined stack counts as the working
            // Show Player Inventory popup. Read live state, not console text.
            auto inventory = reference->inventoryList.LockRead();
            if (!*inventory) throw std::runtime_error("The chosen reference's inventory is not available.");
            const auto count = InventoryQuery::ItemCount(inventory->data, id);
            return std::format("{} {:08X} >> {}", operation, id, count);
        }
        if (operation == "getdisabled") return std::format("GetDisabled >> {}", reference->IsDisabled() ? 1 : 0);
        if (operation == "getdead") {
            auto* actor = starfield_cast<RE::Actor*>(reference);
            if (!actor) throw std::runtime_error("Choose an actor's Reference ID to inspect whether it is dead.");
            return std::format("GetDead >> {}", actor->IsDead() ? 1 : 0);
        }
        if (operation == "getpos" || operation == "getangle") {
            if (argument.size() != 1) throw std::runtime_error("Axis must be X, Y, or Z.");
            const auto axis = static_cast<char>(std::tolower(static_cast<unsigned char>(argument[0])));
            if (axis != 'x' && axis != 'y' && axis != 'z') throw std::runtime_error("Axis must be X, Y, or Z.");
            const auto point = operation == "getpos" ? reference->GetPosition() : reference->GetAngle();
            double value = axis == 'x' ? point.x : axis == 'y' ? point.y : point.z;
            if (operation == "getangle") value *= 180.0 / std::numbers::pi;
            return std::format("{} {} >> {:.6f}{}", operation, axis, value, operation == "getangle" ? " degrees" : "");
        }
        if (operation == "getav") {
            auto* info = RE::TESForm::LookupByEditorID<RE::ActorValueInfo>(RE::BSFixedString(argument.c_str()));
            if (!info) throw std::runtime_error("Actor value not found: " + argument);
            return std::format("{} >> {:.6f}", argument, reference->GetActorValue(*info));
        }
        if (operation == "getspaceship") {
            auto* ship = reference->GetSpaceship();
            if (!ship) return "No current spaceship reference is available in this location.";
            return std::format("Current spaceship Reference ID: {:08X}", ship->GetFormID());
        }
        if (operation == "showinventory") {
            std::string output = "CCC_INVENTORY_V1\nTYPE\tFORM_ID\tCOUNT\tNAME\n";
            auto inventory = reference->inventoryList.LockRead();
            if (!*inventory) return output + "SUMMARY\t0 inventory entries.";
            std::size_t rows = 0;
            for (const auto& item : inventory->data) {
                if (!item.object) continue;
                const auto count = InventoryQuery::StackCount(item);
                if (count == 0) continue;
                const auto* fullName = starfield_cast<RE::TESFullName*>(item.object);
                const auto* name = fullName ? fullName->GetFullName() : nullptr;
                std::string displayName = name && *name ? name : "(unnamed item)";
                std::replace_if(displayName.begin(), displayName.end(), [](unsigned char ch) {
                    return ch == '\t' || ch == '\r' || ch == '\n' || ch == 0;
                }, ' ');
                output += std::format("{}\t{:08X}\t{}\t{}{}\n", InventoryTypeCode(item.object->GetFormType()), item.object->GetFormID(), count,
                    displayName, item.IsEquipped() ? " [equipped]" : "");
                ++rows;
                if (output.size() > 512 * 1024) return output + "\n[Output limit reached; inventory snapshot is incomplete.]";
            }
            return output + std::format("SUMMARY\t{} inventory entries. Base Form IDs and combined stack counts; custom instance names/modifications are not expanded.", rows);
        }

        return std::nullopt;
    }
}
