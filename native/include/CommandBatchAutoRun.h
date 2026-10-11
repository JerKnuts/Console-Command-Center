#pragma once

#include "CommandBatches.h"

#include <Windows.h>

#include <algorithm>
#include <cstdint>
#include <filesystem>
#include <fstream>
#include <functional>
#include <mutex>
#include <string>
#include <string_view>
#include <vector>

namespace CCC::CommandBatchAutoRun
{
    namespace fs = std::filesystem;

    constexpr std::uint32_t kDelaySeconds = 3;

    struct Settings
    {
        bool enabled{ false };
        std::vector<std::string> batches;
    };

    inline std::mutex g_settingsMutex;
    inline std::mutex g_reportMutex;
    inline std::uint64_t g_nextReportId{ 1 };
    inline std::vector<OSFUI::API::Json> g_reports;

    inline fs::path SettingsPath()
    {
        return CommandBatches::UserDirectory().parent_path() / L"Auto Run.json";
    }

    inline bool SameName(std::string_view left, std::string_view right)
    {
        return CommandBatches::LowerAscii(std::string{ left }) == CommandBatches::LowerAscii(std::string{ right });
    }

    inline Settings LoadUnlocked()
    {
        Settings result;
        const auto path = SettingsPath();
        std::error_code error;
        if (!fs::exists(path, error) || error) return result;

        std::ifstream stream(path, std::ios::binary);
        if (!stream) return result;
        const auto json = OSFUI::API::Json::parse(stream, nullptr, false);
        if (json.is_discarded() || !json.is_object()) return result;

        result.enabled = json.value("enabled", false);
        if (const auto it = json.find("batches"); it != json.end() && it->is_array()) {
            for (const auto& item : *it) {
                if (!item.is_string()) continue;
                const auto name = CommandBatches::Trim(item.get<std::string>());
                if (CommandBatches::ValidateName(name)) continue;
                if (std::none_of(result.batches.begin(), result.batches.end(), [&](const auto& existing) {
                    return SameName(existing, name);
                })) result.batches.push_back(name);
            }
        }
        std::sort(result.batches.begin(), result.batches.end(), [](const auto& left, const auto& right) {
            return CommandBatches::LowerAscii(left) < CommandBatches::LowerAscii(right);
        });
        return result;
    }

    inline void SaveUnlocked(const Settings& settings)
    {
        const auto path = SettingsPath();
        std::error_code error;
        fs::create_directories(path.parent_path(), error);
        if (error) throw std::runtime_error("CCC could not create its user settings folder.");

        const auto temporary = path.wstring() + L".ccc-tmp";
        {
            std::ofstream stream(temporary, std::ios::binary | std::ios::trunc);
            if (!stream) throw std::runtime_error("CCC could not create the Auto Run settings file.");
            stream << OSFUI::API::Json{
                { "enabled", settings.enabled },
                { "batches", settings.batches }
            }.dump(2);
            stream.flush();
            if (!stream) {
                fs::remove(temporary, error);
                throw std::runtime_error("CCC could not finish writing the Auto Run settings file.");
            }
        }
        if (!MoveFileExW(temporary.c_str(), path.c_str(), MOVEFILE_REPLACE_EXISTING | MOVEFILE_WRITE_THROUGH)) {
            fs::remove(temporary, error);
            throw std::runtime_error("Windows could not replace the Auto Run settings file.");
        }
    }

    inline OSFUI::API::Json ToJson(const Settings& settings)
    {
        return {
            { "ok", true },
            { "enabled", settings.enabled },
            { "batches", settings.batches },
            { "delaySeconds", kDelaySeconds }
        };
    }

    inline OSFUI::API::Json Get()
    {
        std::scoped_lock lock{ g_settingsMutex };
        return ToJson(LoadUnlocked());
    }

    inline OSFUI::API::Json SetEnabled(bool enabled)
    {
        std::scoped_lock lock{ g_settingsMutex };
        auto settings = LoadUnlocked();
        settings.enabled = enabled;
        SaveUnlocked(settings);
        return ToJson(settings);
    }

    inline OSFUI::API::Json SetBatch(std::string_view rawName, bool enabled)
    {
        const auto name = CommandBatches::Trim(rawName);
        if (const auto problem = CommandBatches::ValidateName(name)) throw std::runtime_error(*problem);

        std::scoped_lock lock{ g_settingsMutex };
        auto settings = LoadUnlocked();
        const auto found = std::find_if(settings.batches.begin(), settings.batches.end(), [&](const auto& existing) {
            return SameName(existing, name);
        });
        if (enabled && found == settings.batches.end()) settings.batches.push_back(name);
        if (!enabled && found != settings.batches.end()) settings.batches.erase(found);
        std::sort(settings.batches.begin(), settings.batches.end(), [](const auto& left, const auto& right) {
            return CommandBatches::LowerAscii(left) < CommandBatches::LowerAscii(right);
        });
        SaveUnlocked(settings);
        return ToJson(settings);
    }

    inline void RemoveBatch(std::string_view name) noexcept
    {
        try { (void)SetBatch(name, false); } catch (...) {}
    }

    inline void ClearBatches() noexcept
    {
        try {
            std::scoped_lock lock{ g_settingsMutex };
            auto settings = LoadUnlocked();
            settings.batches.clear();
            SaveUnlocked(settings);
        } catch (...) {}
    }

    inline void AddReport(bool success, std::size_t batchCount, std::size_t commandCount, std::string message)
    {
        std::scoped_lock lock{ g_reportMutex };
        g_reports.push_back({
            { "id", g_nextReportId++ },
            { "success", success },
            { "batchCount", batchCount },
            { "commandCount", commandCount },
            { "message", std::move(message) }
        });
        if (g_reports.size() > 20) g_reports.erase(g_reports.begin(), g_reports.begin() + (g_reports.size() - 20));
    }

    inline OSFUI::API::Json ConsumeReports()
    {
        std::scoped_lock lock{ g_reportMutex };
        auto reports = OSFUI::API::Json(g_reports);
        g_reports.clear();
        return { { "ok", true }, { "reports", std::move(reports) } };
    }

    inline void Run(const std::function<bool(std::string_view)>& execute) noexcept
    {
        Settings settings;
        try {
            std::scoped_lock lock{ g_settingsMutex };
            settings = LoadUnlocked();
        } catch (...) {
            AddReport(false, 0, 0, "Auto Run could not read its settings.");
            return;
        }
        if (!settings.enabled || settings.batches.empty()) return;

        std::size_t batchesRun = 0;
        std::size_t commandsRun = 0;
        std::vector<std::string> batchSummaries;
        std::vector<std::string> problems;
        for (const auto& name : settings.batches) {
            try {
                const auto path = CommandBatches::PathForName(CommandBatches::UserDirectory(), name);
                const auto content = CommandBatches::ReadFile(path);
                if (const auto problem = CommandBatches::ValidateContent(content)) {
                    problems.push_back(name + ": " + *problem);
                    continue;
                }
                ++batchesRun;
                std::size_t batchCommandsRun = 0;
                for (const auto& command : CommandBatches::Commands(content)) {
                    if (!execute(command)) {
                        problems.push_back(name + ": native execution failed at command " + std::to_string(batchCommandsRun + 1) + ".");
                        break;
                    }
                    ++batchCommandsRun;
                    ++commandsRun;
                }
                batchSummaries.push_back(name + " (" + std::to_string(batchCommandsRun) + ")");
            } catch (const std::exception& error) {
                problems.push_back(name + ": " + error.what());
            } catch (...) {
                problems.push_back(name + ": could not read or execute the batch.");
            }
        }

        std::string message = "Ran " + std::to_string(commandsRun) + " command" + (commandsRun == 1 ? "" : "s") +
            " from " + std::to_string(batchesRun) + " batch file" + (batchesRun == 1 ? "" : "s") + ".";
        if (!batchSummaries.empty()) {
            message += "\nBatches: ";
            for (std::size_t index = 0; index < batchSummaries.size(); ++index) {
                if (index) message += ", ";
                message += batchSummaries[index];
            }
        }
        for (const auto& problem : problems) message += "\n" + problem;
        AddReport(problems.empty(), batchesRun, commandsRun, std::move(message));
    }
}
