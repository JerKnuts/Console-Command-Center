#pragma once

#include <RE/Starfield.h>
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
        const auto operation = dot == std::string::npos ? verb : verb.substr(dot + 1);
        if (operation != "showinventory" && operation != "getpos" && operation != "getangle"
            && operation != "getscale" && operation != "getav" && operation != "getspaceship"
            && operation != "getopenstate" && operation != "getgs"
            && operation != "getplayergrabbedref") {
            return std::nullopt;
        }
        // test1 crashed inside the condition evaluator on Starfield 1.16.244.
        // Do not call ANY evaluator through the unverified shared ABI. Return
        // a normal error until a verified adapter replaces that entire path.
        if (operation == "getscale" || operation == "getopenstate" || operation == "getplayergrabbedref") {
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
        const bool needsArgument = operation == "getpos" || operation == "getangle" || operation == "getav";
        if (!extra.empty() || (needsArgument ? argument.empty() : !argument.empty())) {
            throw std::runtime_error("Invalid inspection arguments; run one inspection at a time.");
        }
        const auto parseID = [](std::string_view text) {
            std::uint32_t id = 0;
            const auto [end, error] = std::from_chars(text.data(), text.data() + text.size(), id, 16);
            if (text.empty() || text.size() > 8 || error != std::errc{} || end != text.data() + text.size() || id == 0) {
                throw std::runtime_error("Enter a valid 1-8 digit hexadecimal Form/Reference ID.");
            }
            return id;
        };
        if (dot == std::string::npos) throw std::runtime_error("This inspection requires a Reference ID or player prefix.");
        const auto target = verb.substr(0, dot);
        auto* form = RE::TESForm::LookupByID(target == "player" ? 0x14 : parseID(target));
        // As<TESObjectREFR>() compares exact form types and misses Actor
        // subclasses (including the player); use the game's RTTI cast.
        auto* reference = form ? starfield_cast<RE::TESObjectREFR*>(form) : nullptr;
        if (!reference) throw std::runtime_error("Reference not found. Use a placed Reference ID, not a Base ID.");
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
                std::uint64_t count = 0;
                for (const auto& stack : item.stacks) count += stack.count;
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
