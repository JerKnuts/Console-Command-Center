#pragma once

#include <RE/Starfield.h>

#include <algorithm>
#include <array>
#include <cctype>
#include <format>
#include <optional>
#include <stdexcept>
#include <string>
#include <string_view>
#include <utility>
#include <vector>

namespace CCC
{
    struct LoadedFormSearchResult
    {
        std::string label;
        std::string formID;
        std::string type;
        std::string editorID;
        int score{ 0 };
    };

    struct SearchableFormType
    {
        std::string_view code;
        RE::FormType type;
    };

    inline constexpr std::array kSearchableFormTypes{
        SearchableFormType{ "WEAP", RE::FormType::kWEAP },
        SearchableFormType{ "ARMO", RE::FormType::kARMO },
        SearchableFormType{ "AMMO", RE::FormType::kAMMO },
        SearchableFormType{ "ALCH", RE::FormType::kALCH },
        SearchableFormType{ "MISC", RE::FormType::kMISC },
        SearchableFormType{ "PERK", RE::FormType::kPERK },
        SearchableFormType{ "SPEL", RE::FormType::kSPEL },
        SearchableFormType{ "NPC_", RE::FormType::kNPC_ },
        SearchableFormType{ "OMOD", RE::FormType::kOMOD },
        SearchableFormType{ "FACT", RE::FormType::kFACT },
        SearchableFormType{ "QUST", RE::FormType::kQUST },
        SearchableFormType{ "CELL", RE::FormType::kCELL },
        SearchableFormType{ "GBFM", RE::FormType::kGBFM },
        SearchableFormType{ "FURN", RE::FormType::kFURN },
        SearchableFormType{ "WTHR", RE::FormType::kWTHR },
    };

    inline std::string LowerASCII(std::string_view value)
    {
        std::string output{ value };
        std::transform(output.begin(), output.end(), output.begin(), [](unsigned char ch) {
            return static_cast<char>(std::tolower(ch));
        });
        return output;
    }

    inline std::string CleanFormText(const char* value)
    {
        std::string output = value && *value ? value : "";
        std::replace_if(output.begin(), output.end(), [](unsigned char ch) {
            return ch == '\t' || ch == '\r' || ch == '\n' || ch == 0;
        }, ' ');
        return output;
    }

    inline int MatchScore(std::string_view term, std::string_view name, std::string_view editorID)
    {
        const auto namePosition = name.find(term);
        const auto editorPosition = editorID.find(term);
        if (name == term || editorID == term) return 0;
        if (namePosition == 0) return 1;
        if (editorPosition == 0) return 2;
        if (namePosition != std::string_view::npos) return 3;
        if (editorPosition != std::string_view::npos) return 4;
        return -1;
    }

    inline std::optional<SearchableFormType> FindSearchableFormType(std::string_view code)
    {
        const auto normalized = LowerASCII(code);
        const auto found = std::find_if(kSearchableFormTypes.begin(), kSearchableFormTypes.end(), [&](const auto& entry) {
            return LowerASCII(entry.code) == normalized;
        });
        return found == kSearchableFormTypes.end() ? std::nullopt : std::optional{ *found };
    }

    inline std::vector<LoadedFormSearchResult> SearchLoadedForms(
        std::string_view searchText,
        std::string_view requestedType,
        std::size_t limit = 250,
        std::size_t* scannedForms = nullptr)
    {
        std::vector<LoadedFormSearchResult> results;
        if (searchText.empty() || limit == 0) return results;

        const auto term = LowerASCII(searchText);
        const auto selectedType = requestedType.empty() ? std::nullopt : FindSearchableFormType(requestedType);
        if (!requestedType.empty() && !selectedType) {
            throw std::invalid_argument("Unsupported loaded-form record type.");
        }

        using AllFormsMap = RE::BSTHashMap<RE::TESFormID, RE::TESForm*>;
        static REL::Relocation<AllFormsMap**> allForms{ RE::ID::TESForm::AllFormsMap };
        auto* forms = *allForms;
        if (!forms) {
            throw std::runtime_error("Starfield's loaded-form map is unavailable.");
        }

        std::size_t scanned = 0;
        for (const auto& pair : *forms) {
            auto* form = pair.value;
            if (!form || form->IsDeleted()) continue;

            const auto type = std::find_if(kSearchableFormTypes.begin(), kSearchableFormTypes.end(), [&](const auto& entry) {
                return entry.type == form->GetFormType();
            });
            if (type == kSearchableFormTypes.end() || (selectedType && type->type != selectedType->type)) continue;
            ++scanned;

            try {
                const auto* fullName = starfield_cast<RE::TESFullName*>(form);
                auto name = CleanFormText(fullName ? fullName->GetFullName() : nullptr);
                auto editorID = CleanFormText(form->GetFormEditorID());
                const auto score = MatchScore(term, LowerASCII(name), LowerASCII(editorID));
                if (score < 0) continue;
                if (name.empty()) name = editorID.empty() ? "Unnamed record" : editorID;

                LoadedFormSearchResult result{
                    .label = std::move(name),
                    .formID = std::format("{:08X}", form->GetFormID()),
                    .type = std::string{ type->code },
                    .editorID = std::move(editorID),
                    .score = score,
                };

                if (results.size() < limit) {
                    results.push_back(std::move(result));
                } else {
                    const auto worse = [](const auto& left, const auto& right) {
                        if (left.score != right.score) return left.score < right.score;
                        return left.label < right.label;
                    };
                    const auto worst = std::max_element(results.begin(), results.end(), worse);
                    if (worse(result, *worst)) *worst = std::move(result);
                }
            } catch (...) {
                // A malformed or partially loaded record should not abort the search.
            }
        }
        if (scannedForms) *scannedForms = scanned;

        std::sort(results.begin(), results.end(), [](const auto& left, const auto& right) {
            if (left.score != right.score) return left.score < right.score;
            if (left.label != right.label) return left.label < right.label;
            return left.formID < right.formID;
        });
        return results;
    }
}
