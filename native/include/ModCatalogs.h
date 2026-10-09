#pragma once

#include <RE/Starfield.h>

#include <algorithm>
#include <array>
#include <chrono>
#include <charconv>
#include <cctype>
#include <cstdint>
#include <cstdlib>
#include <cstring>
#include <filesystem>
#include <fstream>
#include <format>
#include <optional>
#include <set>
#include <string>
#include <string_view>
#include <unordered_map>
#include <unordered_set>
#include <vector>

#include "OSFUI_JSON.h"

namespace CCC::ModCatalogs
{
    constexpr std::size_t kMaxRecordsTotal = 100'000;

    enum class PluginKind { full, medium, small };

    struct LoadedPlugin
    {
        RE::TESFile* file{ nullptr };
        PluginKind kind{ PluginKind::full };
        std::uint32_t index{ 0 };
    };

    struct RecordType
    {
        RE::FormType formType;
        std::string_view signature;
        std::string_view category;
    };

    inline constexpr std::array kRecordTypes{
        RecordType{ RE::FormType::kWEAP, "WEAP", "Weapons" },
        RecordType{ RE::FormType::kARMO, "ARMO", "Armor" },
        RecordType{ RE::FormType::kAMMO, "AMMO", "Ammo" },
        RecordType{ RE::FormType::kALCH, "ALCH", "Aid" },
        RecordType{ RE::FormType::kMISC, "MISC", "Resources & Miscellaneous" },
        RecordType{ RE::FormType::kBOOK, "BOOK", "Books & Notes" },
        RecordType{ RE::FormType::kPERK, "PERK", "Perks" },
        RecordType{ RE::FormType::kSPEL, "SPEL", "Powers" },
        RecordType{ RE::FormType::kNPC_, "NPC_", "NPCs" },
        RecordType{ RE::FormType::kOMOD, "OMOD", "Mods" },
        RecordType{ RE::FormType::kFACT, "FACT", "Factions" },
        RecordType{ RE::FormType::kQUST, "QUST", "Quests" },
        RecordType{ RE::FormType::kCELL, "CELL", "Cells" },
        RecordType{ RE::FormType::kLCTN, "LCTN", "Locations" },
        RecordType{ RE::FormType::kGBFM, "GBFM", "Ship Parts & Other Forms" },
        RecordType{ RE::FormType::kFURN, "FURN", "Furniture" },
        RecordType{ RE::FormType::kWTHR, "WTHR", "Weather" }
    };

    inline std::string LowerASCII(std::string value)
    {
        std::transform(value.begin(), value.end(), value.begin(), [](unsigned char ch) {
            return static_cast<char>(std::tolower(ch));
        });
        return value;
    }

    inline const char* KindName(PluginKind kind) noexcept
    {
        switch (kind) {
        case PluginKind::medium: return "medium";
        case PluginKind::small: return "small";
        default: return "full";
        }
    }

    inline bool IsBuiltInPlugin(std::string name)
    {
        name = LowerASCII(std::move(name));
        return name == "starfield.esm" || name == "blueprintships-starfield.esm" ||
            name == "oldmars.esm" || name == "constellation.esm" || name == "shatteredspace.esm";
    }

    inline bool IsOfficialCreationPlugin(std::string name)
    {
        name = LowerASCII(std::move(name));
        return name.starts_with("sfbgs");
    }

    inline std::string CatalogName(std::string pluginName)
    {
        const auto dot = pluginName.find_last_of('.');
        if (dot != std::string::npos) pluginName.resize(dot);
        std::replace(pluginName.begin(), pluginName.end(), '_', ' ');
        return pluginName;
    }

    inline std::optional<std::string> ReadSafeText(const char* text, std::size_t maximum)
    {
        if (!text || !*text) return std::nullopt;
        std::string value{ text };
        if (value.size() > maximum) value.resize(maximum);
        std::replace_if(value.begin(), value.end(), [](unsigned char ch) {
            return ch == '\t' || ch == '\r' || ch == '\n' || ch == 0;
        }, ' ');
        while (!value.empty() && std::isspace(static_cast<unsigned char>(value.front()))) value.erase(value.begin());
        while (!value.empty() && std::isspace(static_cast<unsigned char>(value.back()))) value.pop_back();
        return value.empty() ? std::nullopt : std::optional<std::string>{ std::move(value) };
    }

    inline std::uint32_t PluginIndex(const LoadedPlugin& plugin) noexcept
    {
        return plugin.index;
    }

    inline std::uint32_t LocalFormID(std::uint32_t formID, PluginKind kind) noexcept
    {
        switch (kind) {
        case PluginKind::small: return formID & 0xFFF;
        case PluginKind::medium: return formID & 0xFFFF;
        default: return formID & 0xFFFFFF;
        }
    }

    struct CatalogBuilder
    {
        LoadedPlugin plugin;
        std::string pluginName;
        OSFUI::API::Json records{ OSFUI::API::Json::array() };
        std::size_t skipped{ 0 };
    };

    struct OwnerIndexes
    {
        std::unordered_map<std::uint32_t, std::size_t> full;
        std::unordered_map<std::uint32_t, std::size_t> medium;
        std::unordered_map<std::uint32_t, std::size_t> small;
    };

    inline void AddPlugin(std::vector<CatalogBuilder>& catalogs, OwnerIndexes& owners, RE::TESFile* file, PluginKind kind)
    {
        if (!file || file->fileName[0] == '\0' || IsBuiltInPlugin(file->fileName)) return;
        const auto index = catalogs.size();
        std::uint32_t pluginIndex = file->fileIndex.fullIndex;
        if (kind == PluginKind::medium) pluginIndex = file->fileIndex.mediumIndex;
        if (kind == PluginKind::small) pluginIndex = file->fileIndex.smallIndex;
        catalogs.push_back(CatalogBuilder{ LoadedPlugin{ file, kind, pluginIndex }, file->fileName });
        switch (kind) {
        case PluginKind::small: owners.small.insert_or_assign(PluginIndex(catalogs.back().plugin), index); break;
        case PluginKind::medium: owners.medium.insert_or_assign(PluginIndex(catalogs.back().plugin), index); break;
        default: owners.full.insert_or_assign(PluginIndex(catalogs.back().plugin), index); break;
        }
    }

    inline PluginKind KindForFile(const RE::TESFile& file) noexcept
    {
        if (file.fileFlags.all(RE::TESFile::Flags::kSmall)) return PluginKind::small;
        if (file.fileFlags.all(RE::TESFile::Flags::kMedium)) return PluginKind::medium;
        return PluginKind::full;
    }

    inline std::optional<std::size_t> OwnerForFormID(const OwnerIndexes& owners, std::uint32_t formID)
    {
        const std::unordered_map<std::uint32_t, std::size_t>* index = &owners.full;
        std::uint32_t key = formID >> 24;
        if ((formID & 0xFF000000u) == 0xFE000000u) {
            index = &owners.small;
            key = (formID >> 12) & 0xFFF;
        } else if ((formID & 0xFF000000u) == 0xFD000000u) {
            index = &owners.medium;
            key = (formID >> 16) & 0xFF;
        }
        const auto found = index->find(key);
        return found == index->end() ? std::nullopt : std::optional<std::size_t>{ found->second };
    }

    inline std::uint32_t ReadU32(const std::byte* bytes) noexcept
    {
        std::uint32_t value = 0;
        std::memcpy(&value, bytes, sizeof(value));
        return value;
    }

    inline std::uint16_t ReadU16(const std::byte* bytes) noexcept
    {
        std::uint16_t value = 0;
        std::memcpy(&value, bytes, sizeof(value));
        return value;
    }

    inline std::string TrimLine(std::string line)
    {
        if (line.starts_with("\xEF\xBB\xBF")) line.erase(0, 3);
        while (!line.empty() && std::isspace(static_cast<unsigned char>(line.front()))) line.erase(line.begin());
        while (!line.empty() && std::isspace(static_cast<unsigned char>(line.back()))) line.pop_back();
        return line;
    }

    inline std::vector<std::string> ReadPluginList(const std::filesystem::path& path, bool starredOnly)
    {
        std::vector<std::string> result;
        std::ifstream input{ path };
        for (std::string line; std::getline(input, line);) {
            line = TrimLine(std::move(line));
            if (line.empty() || line.front() == '#') continue;
            const bool starred = line.front() == '*';
            if (starred) line.erase(line.begin());
            line = TrimLine(std::move(line));
            if (line.empty() || (starredOnly && !starred && !IsBuiltInPlugin(line) && !IsOfficialCreationPlugin(line))) continue;
            const auto lower = LowerASCII(line);
            if (!lower.ends_with(".esm") && !lower.ends_with(".esp") && !lower.ends_with(".esl")) continue;
            result.push_back(std::move(line));
        }
        return result;
    }

    inline std::vector<std::string> ActiveLoadOrder()
    {
        const auto* localAppData = std::getenv("LOCALAPPDATA");
        if (!localAppData || !*localAppData) return {};
        const auto directory = std::filesystem::path{ localAppData } / "Starfield";
        auto result = ReadPluginList(directory / "loadorder.txt", false);
        if (result.empty()) result = ReadPluginList(directory / "plugins.txt", true);
        return result;
    }

    struct PluginMetadata
    {
        std::string name;
        std::filesystem::path path;
        PluginKind kind{ PluginKind::full };
        std::uint32_t index{ 0 };
        std::uint32_t headerSize{ 0 };
        std::vector<std::string> masters;
    };

    inline std::optional<PluginMetadata> ReadPluginMetadata(
        const std::filesystem::path& dataDirectory, std::string name)
    {
        PluginMetadata plugin;
        plugin.name = std::move(name);
        plugin.path = dataDirectory / plugin.name;
        std::ifstream input{ plugin.path, std::ios::binary };
        std::array<std::byte, 24> header{};
        if (!input.read(reinterpret_cast<char*>(header.data()), header.size()) ||
            std::memcmp(header.data(), "TES4", 4) != 0) return std::nullopt;

        plugin.headerSize = ReadU32(header.data() + 4);
        const auto flags = ReadU32(header.data() + 8);
        plugin.kind = (flags & (1u << 8)) != 0 ? PluginKind::small :
            (flags & (1u << 10)) != 0 ? PluginKind::medium : PluginKind::full;
        if (plugin.headerSize > 16u * 1024u * 1024u) return std::nullopt;

        std::vector<std::byte> data(plugin.headerSize);
        if (!input.read(reinterpret_cast<char*>(data.data()), data.size())) return std::nullopt;
        for (std::size_t offset = 0; offset + 6 <= data.size();) {
            std::array<char, 5> signature{};
            std::memcpy(signature.data(), data.data() + offset, 4);
            auto size = static_cast<std::uint32_t>(ReadU16(data.data() + offset + 4));
            offset += 6;
            if (std::string_view{ signature.data(), 4 } == "XXXX") {
                if (offset + 10 > data.size()) break;
                size = ReadU32(data.data() + offset);
                offset += 4;
                std::memcpy(signature.data(), data.data() + offset, 4);
                offset += 6;
            }
            if (offset + size > data.size()) break;
            if (std::string_view{ signature.data(), 4 } == "MAST" && size > 0) {
                std::string master{ reinterpret_cast<const char*>(data.data() + offset), size };
                while (!master.empty() && master.back() == '\0') master.pop_back();
                if (!master.empty()) plugin.masters.push_back(std::move(master));
            }
            offset += size;
        }
        return plugin;
    }

    inline const RecordType* FindRecordType(std::string_view signature) noexcept
    {
        const auto found = std::find_if(kRecordTypes.begin(), kRecordTypes.end(), [signature](const auto& type) {
            return type.signature == signature;
        });
        return found == kRecordTypes.end() ? nullptr : &*found;
    }

    inline std::uint32_t RuntimeFormID(const PluginMetadata& plugin, std::uint32_t rawFormID) noexcept
    {
        switch (plugin.kind) {
        case PluginKind::small: return 0xFE000000u | ((plugin.index & 0xFFFu) << 12) | (rawFormID & 0xFFFu);
        case PluginKind::medium: return 0xFD000000u | ((plugin.index & 0xFFu) << 16) | (rawFormID & 0xFFFFu);
        default: return ((plugin.index & 0xFFu) << 24) | (rawFormID & 0xFFFFFFu);
        }
    }

    struct PluginSet
    {
        std::size_t loadOrderEntries{ 0 };
        std::size_t missingFiles{ 0 };
        std::vector<PluginMetadata> plugins;
        std::unordered_map<std::string, PluginKind> kinds;
    };

    inline PluginSet LoadPluginSet()
    {
        PluginSet result;
        const auto loadOrder = ActiveLoadOrder();
        result.loadOrderEntries = loadOrder.size();
        const auto dataDirectory = std::filesystem::current_path() / "Data";
        std::uint32_t fullIndex = 0, mediumIndex = 0, smallIndex = 0;
        for (const auto& name : loadOrder) {
            auto plugin = ReadPluginMetadata(dataDirectory, name);
            if (!plugin) {
                ++result.missingFiles;
                continue;
            }
            switch (plugin->kind) {
            case PluginKind::small: plugin->index = smallIndex++; break;
            case PluginKind::medium: plugin->index = mediumIndex++; break;
            default: plugin->index = fullIndex++; break;
            }
            result.kinds.insert_or_assign(LowerASCII(plugin->name), plugin->kind);
            result.plugins.push_back(std::move(*plugin));
        }
        return result;
    }

    inline const PluginSet& CurrentPluginSet(bool refresh = false)
    {
        static PluginSet cached;
        static bool ready = false;
        if (refresh || !ready) {
            cached = LoadPluginSet();
            ready = true;
        }
        return cached;
    }

    inline std::filesystem::path CacheDirectory()
    {
        return std::filesystem::current_path() / "Data" / "SFSE" / "Plugins" /
            "ConsoleCommandCenter" / "cache" / "mod-catalogs";
    }

    inline std::filesystem::path CachePath(std::string_view pluginName)
    {
        std::uint64_t hash = 1469598103934665603ull;
        for (const auto character : LowerASCII(std::string(pluginName))) {
            hash ^= static_cast<unsigned char>(character);
            hash *= 1099511628211ull;
        }
        return CacheDirectory() / std::format("{:016X}.json", hash);
    }

    inline std::uintmax_t PluginFileSize(const PluginMetadata& plugin) noexcept
    {
        std::error_code error;
        const auto value = std::filesystem::file_size(plugin.path, error);
        return error ? 0 : value;
    }

    inline std::int64_t PluginWriteTime(const PluginMetadata& plugin) noexcept
    {
        std::error_code error;
        const auto value = std::filesystem::last_write_time(plugin.path, error);
        return error ? 0 : static_cast<std::int64_t>(value.time_since_epoch().count());
    }

    inline std::optional<OSFUI::API::Json> ReadCachedRecords(const PluginMetadata& plugin)
    {
        std::ifstream input{ CachePath(plugin.name), std::ios::binary };
        if (!input) return std::nullopt;
        auto cache = OSFUI::API::Json::parse(input, nullptr, false);
        if (cache.is_discarded() || !cache.is_object() || cache.value("version", 0) != 1 ||
            LowerASCII(cache.value("plugin", std::string{})) != LowerASCII(plugin.name) ||
            !cache.contains("records") || !cache["records"].is_array()) return std::nullopt;

        // MO2 can expose a loaded plugin to Starfield before ordinary filesystem metadata is
        // visible at Data/<plugin>. Treat unavailable metadata as unknown instead of deleting a
        // valid cache. When both sides are available, changed plugins still invalidate normally.
        const auto cachedSize = cache.value("fileSize", std::uintmax_t{ 0 });
        const auto currentSize = PluginFileSize(plugin);
        const auto cachedWriteTime = cache.value("writeTime", std::int64_t{ 0 });
        const auto currentWriteTime = PluginWriteTime(plugin);
        if ((cachedSize != 0 && currentSize != 0 && cachedSize != currentSize) ||
            (cachedWriteTime != 0 && currentWriteTime != 0 && cachedWriteTime != currentWriteTime)) {
            return std::nullopt;
        }

        auto records = std::move(cache["records"]);
        for (auto& record : records) {
            const auto localText = record.value("localFormId", std::string{});
            std::uint32_t localID = 0;
            const auto [end, error] = std::from_chars(localText.data(), localText.data() + localText.size(), localID, 16);
            if (error != std::errc{} || end != localText.data() + localText.size()) continue;
            record["value"] = std::format("{:08X}", RuntimeFormID(plugin, localID));
        }
        return records;
    }

    inline void WriteCachedRecords(const PluginMetadata& plugin, const OSFUI::API::Json& records) noexcept
    {
        try {
            std::error_code error;
            std::filesystem::create_directories(CacheDirectory(), error);
            if (error) return;
            const OSFUI::API::Json cache{
                { "version", 1 }, { "plugin", plugin.name }, { "pluginKind", KindName(plugin.kind) },
                { "fileSize", PluginFileSize(plugin) }, { "writeTime", PluginWriteTime(plugin) },
                { "records", records }
            };
            std::ofstream output{ CachePath(plugin.name), std::ios::binary | std::ios::trunc };
            if (!output) return;
            output << cache.dump(-1, ' ', false, OSFUI::API::Json::error_handler_t::replace);
        } catch (...) {}
    }

    inline PluginMetadata RuntimePluginMetadata(RE::TESFile& file)
    {
        PluginMetadata plugin;
        plugin.name = file.fileName;
        plugin.path = std::filesystem::current_path() / "Data" / plugin.name;
        plugin.kind = KindForFile(file);
        plugin.index = file.fileIndex.fullIndex;
        if (plugin.kind == PluginKind::medium) plugin.index = file.fileIndex.mediumIndex;
        if (plugin.kind == PluginKind::small) plugin.index = file.fileIndex.smallIndex;
        return plugin;
    }

    inline std::optional<PluginMetadata> FindRuntimePluginMetadata(std::string_view pluginName)
    {
        auto* handler = RE::TESDataHandler::GetSingleton();
        if (!handler) return std::nullopt;
        const auto wanted = LowerASCII(std::string(pluginName));
        for (auto* file : handler->files) {
            if (!file || file->fileName[0] == '\0' || IsBuiltInPlugin(file->fileName)) continue;
            if (LowerASCII(file->fileName) == wanted) return RuntimePluginMetadata(*file);
        }
        return std::nullopt;
    }

    inline OSFUI::API::Json RestoreCachedLoadedMods()
    {
        const auto started = std::chrono::steady_clock::now();
        OSFUI::API::Json response{
            { "ok", true }, { "source", "runtime-cache" }, { "directory", "" },
            { "directoryExists", false }, { "catalogs", OSFUI::API::Json::array() }, { "totalRecords", 0 }
        };
        std::size_t loadedFilesSeen = 0;
        std::size_t cachedPlugins = 0;
        std::size_t totalRecords = 0;
        std::unordered_set<std::string> restoredPlugins;
        const auto appendCachedPlugin = [&](const PluginMetadata& plugin, std::string_view source) {
            if (IsBuiltInPlugin(plugin.name) || !restoredPlugins.insert(LowerASCII(plugin.name)).second) return;
            auto records = ReadCachedRecords(plugin);
            if (!records) return;
            const auto count = records->size();
            response["catalogs"].push_back(OSFUI::API::Json{
                { "file", source }, { "loaded", true }, { "recordsLoaded", false },
                { "cached", true }, { "name", CatalogName(plugin.name) }, { "plugin", plugin.name },
                { "pluginKind", KindName(plugin.kind) }, { "count", count }, { "skipped", 0 },
                { "errors", OSFUI::API::Json::array() }, { "records", OSFUI::API::Json::array() }
            });
            ++cachedPlugins;
            totalRecords += count;
        };

        if (auto* handler = RE::TESDataHandler::GetSingleton()) {
            for (auto* file : handler->files) {
                if (!file || file->fileName[0] == '\0') continue;
                ++loadedFilesSeen;
                if (IsBuiltInPlugin(file->fileName)) continue;
                appendCachedPlugin(RuntimePluginMetadata(*file), "runtime-cache");
            }
        }

        // Some Starfield/MO2 setups expose no entries through TESDataHandler even though the
        // virtual load order and cache files are available. Use the same active-load-order
        // fallback as a manual scan so a restart never makes a valid catalog appear empty.
        const auto& pluginSet = CurrentPluginSet(true);
        for (const auto& plugin : pluginSet.plugins) {
            appendCachedPlugin(plugin, "load-order-cache");
        }
        response["loadedFilesSeen"] = loadedFilesSeen;
        response["loadOrderEntries"] = pluginSet.loadOrderEntries;
        response["pluginFilesOpened"] = pluginSet.plugins.size();
        response["pluginFilesMissing"] = pluginSet.missingFiles;
        response["scannedPlugins"] = cachedPlugins;
        response["totalRecords"] = totalRecords;
        response["fromCache"] = true;
        response["durationMs"] = std::chrono::duration_cast<std::chrono::milliseconds>(
            std::chrono::steady_clock::now() - started).count();
        return response;
    }

    inline OSFUI::API::Json ScanPluginFiles()
    {
        const auto started = std::chrono::steady_clock::now();
        OSFUI::API::Json response{
            { "ok", true }, { "source", "load-order-scan" }, { "directory", "Data" },
            { "directoryExists", true }, { "catalogs", OSFUI::API::Json::array() }, { "totalRecords", 0 }
        };
        const auto& pluginSet = CurrentPluginSet(true);
        response["loadOrderEntries"] = pluginSet.loadOrderEntries;
        response["pluginFilesOpened"] = pluginSet.plugins.size();
        response["pluginFilesMissing"] = pluginSet.missingFiles;
        response["summaryOnly"] = true;
        std::size_t catalogCount = 0;
        for (const auto& plugin : pluginSet.plugins) {
            if (IsBuiltInPlugin(plugin.name)) continue;
            ++catalogCount;
            response["catalogs"].push_back(OSFUI::API::Json{
                { "file", plugin.path.filename().string() }, { "loaded", true },
                { "recordsLoaded", false }, { "name", CatalogName(plugin.name) },
                { "plugin", plugin.name }, { "pluginKind", KindName(plugin.kind) },
                { "cached", false },
                { "count", 0 }, { "skipped", 0 }, { "errors", OSFUI::API::Json::array() },
                { "records", OSFUI::API::Json::array() }
            });
        }
        response["scannedPlugins"] = catalogCount;
        response["durationMs"] = std::chrono::duration_cast<std::chrono::milliseconds>(
            std::chrono::steady_clock::now() - started).count();
        return response;
    }

    inline OSFUI::API::Json ScanPluginRecords(std::string pluginName)
    {
        const auto started = std::chrono::steady_clock::now();
        OSFUI::API::Json response{
            { "ok", true }, { "source", "plugin-record-scan" }, { "directory", "Data" },
            { "directoryExists", true }, { "catalogs", OSFUI::API::Json::array() }, { "totalRecords", 0 }
        };
        const auto& pluginSet = CurrentPluginSet();
        response["loadOrderEntries"] = pluginSet.loadOrderEntries;
        response["pluginFilesOpened"] = pluginSet.plugins.size();
        response["pluginFilesMissing"] = pluginSet.missingFiles;
        const auto wanted = LowerASCII(std::move(pluginName));
        const auto target = std::find_if(pluginSet.plugins.begin(), pluginSet.plugins.end(), [&wanted](const auto& plugin) {
            return LowerASCII(plugin.name) == wanted;
        });
        if (target == pluginSet.plugins.end() || IsBuiltInPlugin(target->name)) {
            response["error"] = "The selected mod is no longer active in the current load order.";
            return response;
        }

        const auto& plugin = *target;
            std::uint32_t ownPrefix = 0;
            for (const auto& master : plugin.masters) {
            const auto found = pluginSet.kinds.find(LowerASCII(master));
            if (found == pluginSet.kinds.end() || found->second == PluginKind::full) ++ownPrefix;
            }

            std::ifstream input{ plugin.path, std::ios::binary };
            input.seekg(static_cast<std::streamoff>(24u + plugin.headerSize));
            OSFUI::API::Json records = OSFUI::API::Json::array();
            std::unordered_set<std::uint32_t> seen;
            std::size_t skipped = 0;
        std::size_t totalRecords = 0;
        while (input && totalRecords < kMaxRecordsTotal) {
                std::array<std::byte, 24> header{};
                if (!input.read(reinterpret_cast<char*>(header.data()), header.size())) break;
                const std::string_view signature{ reinterpret_cast<const char*>(header.data()), 4 };
                const auto size = ReadU32(header.data() + 4);
                if (signature == "GRUP") {
                    if (size < header.size()) break;
                    continue;
                }
                const auto* recordType = FindRecordType(signature);
                const auto rawFormID = ReadU32(header.data() + 12);
                const auto flags = ReadU32(header.data() + 8);
                if (recordType && (flags & 0x20u) == 0 && (rawFormID >> 24) == ownPrefix) {
                    const auto runtimeFormID = RuntimeFormID(plugin, rawFormID);
                    if (seen.insert(runtimeFormID).second) {
                        auto* form = RE::TESForm::LookupByID(runtimeFormID);
                        if (form && form->GetFormType() == recordType->formType && !form->IsDeleted()) {
                            const auto editorID = ReadSafeText(form->GetFormEditorID(), 128);
                            const auto* fullName = starfield_cast<RE::TESFullName*>(form);
                            auto label = ReadSafeText(fullName ? fullName->GetFullName() : nullptr, 96);
                            if (!label) label = editorID;
                            if (!label) label = std::format("{} {:08X}", recordType->signature, runtimeFormID);
                            OSFUI::API::Json record{
                                { "label", *label }, { "value", std::format("{:08X}", runtimeFormID) },
                                { "localFormId", std::format("{:X}", LocalFormID(runtimeFormID, plugin.kind)) },
                                { "type", recordType->signature }, { "category", recordType->category }
                            };
                            if (editorID) record["editorId"] = *editorID;
                            records.push_back(std::move(record));
                            ++totalRecords;
                        } else {
                            ++skipped;
                        }
                    }
                }
                input.seekg(static_cast<std::streamoff>(size), std::ios::cur);
            }
        response["catalogs"].push_back(OSFUI::API::Json{
            { "file", plugin.path.filename().string() }, { "loaded", true },
            { "recordsLoaded", true }, { "cached", false }, { "name", CatalogName(plugin.name) },
            { "plugin", plugin.name }, { "pluginKind", KindName(plugin.kind) },
            { "count", records.size() }, { "skipped", skipped },
            { "errors", OSFUI::API::Json::array() }, { "records", std::move(records) }
        });
        response["totalRecords"] = totalRecords;
        response["scannedPlugins"] = 1;
        response["durationMs"] = std::chrono::duration_cast<std::chrono::milliseconds>(
            std::chrono::steady_clock::now() - started).count();
        return response;
    }

    inline OSFUI::API::Json ScanLoadedMods()
    {
        const auto started = std::chrono::steady_clock::now();
        OSFUI::API::Json response{
            { "ok", true }, { "source", "runtime-scan" }, { "directory", "" },
            { "directoryExists", false }, { "catalogs", OSFUI::API::Json::array() }, { "totalRecords", 0 }
        };

        auto* handler = RE::TESDataHandler::GetSingleton();
        if (!handler) return response;

        std::vector<CatalogBuilder> catalogs;
        OwnerIndexes owners;
        std::size_t loadedFilesSeen = 0;
        for (auto* file : handler->files) {
            if (!file) continue;
            ++loadedFilesSeen;
            AddPlugin(catalogs, owners, file, KindForFile(*file));
        }
        if (loadedFilesSeen == 0) return ScanPluginFiles();

        std::size_t totalRecords = 0;
        for (const auto& recordType : kRecordTypes) {
            auto& source = handler->formArrays[std::to_underlying(recordType.formType)];
            std::vector<RE::TESForm*> forms;
            {
                RE::BSAutoReadLock lock{ source.lock };
                forms.reserve(source.formArray.size());
                for (const auto& pointer : source.formArray) {
                    if (pointer) forms.push_back(pointer.get());
                }
            }

            for (auto* form : forms) {
                if (!form || form->IsDeleted() || totalRecords >= kMaxRecordsTotal) continue;
                const auto owner = OwnerForFormID(owners, form->GetFormID());
                if (!owner || *owner >= catalogs.size()) continue;

                auto& catalog = catalogs[*owner];
                const auto editorID = ReadSafeText(form->GetFormEditorID(), 128);
                const auto* fullName = starfield_cast<RE::TESFullName*>(form);
                auto label = ReadSafeText(fullName ? fullName->GetFullName() : nullptr, 96);
                if (!label) label = editorID;
                if (!label) {
                    ++catalog.skipped;
                    continue;
                }

                OSFUI::API::Json record{
                    { "label", *label }, { "value", std::format("{:08X}", form->GetFormID()) },
                    { "localFormId", std::format("{:X}", LocalFormID(form->GetFormID(), catalog.plugin.kind)) },
                    { "type", recordType.signature }, { "category", recordType.category }
                };
                if (editorID) record["editorId"] = *editorID;
                catalog.records.push_back(std::move(record));
                ++totalRecords;
            }
        }

        for (auto& catalog : catalogs) {
            if (catalog.records.empty()) continue;
            response["catalogs"].push_back(OSFUI::API::Json{
                { "file", "runtime" }, { "loaded", true }, { "name", CatalogName(catalog.pluginName) },
                { "plugin", catalog.pluginName }, { "pluginKind", KindName(catalog.plugin.kind) },
                { "recordsLoaded", true }, { "cached", false },
                { "count", catalog.records.size() }, { "skipped", catalog.skipped },
                { "errors", OSFUI::API::Json::array() }, { "records", std::move(catalog.records) }
            });
        }

        response["totalRecords"] = totalRecords;
        response["loadedFilesSeen"] = loadedFilesSeen;
        response["scannedPlugins"] = catalogs.size();
        response["durationMs"] = std::chrono::duration_cast<std::chrono::milliseconds>(
            std::chrono::steady_clock::now() - started).count();
        return response;
    }
}
