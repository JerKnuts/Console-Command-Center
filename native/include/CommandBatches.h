#pragma once

#include "OSFUI_JSON.h"

#include <ShlObj.h>

#include <algorithm>
#include <cctype>
#include <filesystem>
#include <fstream>
#include <optional>
#include <stdexcept>
#include <string>
#include <string_view>
#include <system_error>
#include <vector>

namespace CCC::CommandBatches
{
    namespace fs = std::filesystem;

    constexpr std::size_t kMaxFiles = 100;
    constexpr std::size_t kMaxCommandLength = 1024;
    constexpr std::uintmax_t kMaxFileBytes = 1024 * 1024;

    inline std::string ToUtf8(const fs::path& value)
    {
        const auto text = value.u8string();
        return { reinterpret_cast<const char*>(text.data()), text.size() };
    }

    inline fs::path FromUtf8(std::string_view value)
    {
        return fs::u8path(value.begin(), value.end());
    }

    inline fs::path UserDirectory()
    {
        PWSTR documents = nullptr;
        if (SUCCEEDED(SHGetKnownFolderPath(FOLDERID_Documents, KF_FLAG_DEFAULT, nullptr, &documents)) && documents) {
            fs::path result{ documents };
            CoTaskMemFree(documents);
            return result / L"My Games" / L"Starfield" / L"Console Command Center" / L"Command Batches";
        }
        if (documents) CoTaskMemFree(documents);
        if (const auto* profile = _wgetenv(L"USERPROFILE"); profile && *profile) {
            return fs::path{ profile } / L"Documents" / L"My Games" / L"Starfield" / L"Console Command Center" / L"Command Batches";
        }
        throw std::runtime_error("Windows did not provide a user Documents folder.");
    }

    inline std::string LowerAscii(std::string value)
    {
        std::transform(value.begin(), value.end(), value.begin(), [](unsigned char ch) {
            return static_cast<char>(std::tolower(ch));
        });
        return value;
    }

    inline std::string Trim(std::string_view value)
    {
        const auto first = value.find_first_not_of(" \t\r\n");
        if (first == std::string_view::npos) return {};
        const auto last = value.find_last_not_of(" \t\r\n");
        return std::string{ value.substr(first, last - first + 1) };
    }

    inline bool IsReservedWindowsName(std::string value)
    {
        value = LowerAscii(value);
        if (const auto dot = value.find('.'); dot != std::string::npos) value.resize(dot);
        static constexpr std::string_view reserved[] = {
            "con", "prn", "aux", "nul", "com1", "com2", "com3", "com4", "com5", "com6", "com7", "com8", "com9",
            "lpt1", "lpt2", "lpt3", "lpt4", "lpt5", "lpt6", "lpt7", "lpt8", "lpt9"
        };
        return std::find(std::begin(reserved), std::end(reserved), value) != std::end(reserved);
    }

    inline std::optional<std::string> ValidateName(std::string_view rawName)
    {
        const auto name = Trim(rawName);
        if (name.empty()) return "The batch name is empty.";
        if (name.size() > 120) return "The batch name is longer than 120 characters.";
        if (name == "." || name == "..") return "That batch name is reserved.";
        if (name.back() == '.' || name.back() == ' ') return "Batch names cannot end with a period or space.";
        if (IsReservedWindowsName(name)) return "That batch name is reserved by Windows.";
        for (const unsigned char ch : name) {
            if (ch < 32 || std::string_view{ "<>:\"/\\|?*" }.find(static_cast<char>(ch)) != std::string_view::npos) {
                return "Batch names cannot contain Windows filename characters such as < > : \" / \\ | ? *.";
            }
        }
        return std::nullopt;
    }

    inline std::vector<std::string> Commands(std::string_view content)
    {
        std::vector<std::string> commands;
        for (std::size_t start = 0; start <= content.size();) {
            const auto end = content.find('\n', start);
            auto line = Trim(content.substr(start, end == std::string_view::npos ? content.size() - start : end - start));
            if (!line.empty() && !line.starts_with('#')) commands.push_back(std::move(line));
            if (end == std::string_view::npos) break;
            start = end + 1;
        }
        return commands;
    }

    inline std::optional<std::string> ValidateContent(std::string_view content)
    {
        if (content.size() > kMaxFileBytes) return "The batch file is larger than 1 MB.";
        const auto commands = Commands(content);
        if (commands.empty()) return "The batch does not contain any commands.";
        const auto tooLong = std::find_if(commands.begin(), commands.end(), [](const auto& command) {
            return command.size() > kMaxCommandLength;
        });
        if (tooLong != commands.end()) return "A command is longer than 1024 characters.";
        return std::nullopt;
    }

    inline std::string ReadFile(const fs::path& path)
    {
        std::error_code error;
        const auto size = fs::file_size(path, error);
        if (error) throw std::runtime_error("The file size could not be read.");
        if (size > kMaxFileBytes) throw std::runtime_error("The file is larger than 1 MB.");
        std::ifstream stream(path, std::ios::binary);
        if (!stream) throw std::runtime_error("The file could not be opened.");
        std::string content((std::istreambuf_iterator<char>(stream)), std::istreambuf_iterator<char>());
        if (!stream.eof() && stream.fail()) throw std::runtime_error("The file could not be read completely.");
        if (content.starts_with("\xEF\xBB\xBF")) content.erase(0, 3);
        return content;
    }

    inline void WriteFile(const fs::path& path, std::string_view content)
    {
        const auto temporary = path.wstring() + L".ccc-tmp";
        {
            std::ofstream stream(temporary, std::ios::binary | std::ios::trunc);
            if (!stream) throw std::runtime_error("CCC could not create the temporary batch file.");
            stream.write(content.data(), static_cast<std::streamsize>(content.size()));
            stream.flush();
            if (!stream) {
                std::error_code ignored;
                fs::remove(temporary, ignored);
                throw std::runtime_error("CCC could not finish writing the batch file.");
            }
        }
        if (!MoveFileExW(temporary.c_str(), path.c_str(), MOVEFILE_REPLACE_EXISTING | MOVEFILE_WRITE_THROUGH)) {
            std::error_code ignored;
            fs::remove(temporary, ignored);
            throw std::runtime_error("Windows could not replace the batch file.");
        }
    }

    inline fs::path PathForName(const fs::path& directory, std::string_view name)
    {
        return directory / (FromUtf8(Trim(name)).wstring() + L".txt");
    }

    inline OSFUI::API::Json Entry(const fs::path& path)
    {
        const auto name = ToUtf8(path.stem());
        const auto content = ReadFile(path);
        const auto commands = Commands(content);
        OSFUI::API::Json entry{
            { "id", LowerAscii(name) }, { "name", name }, { "file", ToUtf8(path.filename()) },
            { "commands", content }, { "commandCount", commands.size() }, { "valid", true }
        };
        if (const auto problem = ValidateName(name)) {
            entry["valid"] = false;
            entry["error"] = *problem;
        } else if (const auto problem = ValidateContent(content)) {
            entry["valid"] = false;
            entry["error"] = *problem;
        }
        return entry;
    }

    inline std::string SafeMigratedName(std::string_view rawName)
    {
        auto name = Trim(rawName);
        for (auto& ch : name) {
            if (static_cast<unsigned char>(ch) < 32 || std::string_view{ "<>:\"/\\|?*" }.find(ch) != std::string_view::npos) ch = '_';
        }
        while (!name.empty() && (name.back() == '.' || name.back() == ' ')) name.pop_back();
        if (name.empty() || IsReservedWindowsName(name)) name = "Migrated batch";
        if (name.size() > 120) name.resize(120);
        return name;
    }

    inline OSFUI::API::Json List(const OSFUI::API::Json& legacy)
    {
        const auto directory = UserDirectory();
        std::error_code error;
        fs::create_directories(directory, error);
        if (error) throw std::runtime_error("CCC could not create the user Command Batches folder.");

        std::size_t migrated = 0;
        bool migrationFailed = false;
        std::vector<std::string> warnings;
        if (legacy.is_array()) {
            for (const auto& item : legacy) {
                if (!item.is_object() || !item.contains("name") || !item.contains("commands")) continue;
                const auto originalName = item.value("name", std::string{});
                const auto content = item.value("commands", std::string{});
                if (content.empty()) continue;
                auto name = SafeMigratedName(originalName);
                auto target = PathForName(directory, name);
                if (fs::exists(target, error) && !error) {
                    try {
                        if (ReadFile(target) == content) { ++migrated; continue; }
                    } catch (...) {}
                    for (std::size_t suffix = 2; suffix < 1000; ++suffix) {
                        auto candidate = name + " (migrated " + std::to_string(suffix) + ")";
                        if (candidate.size() > 120) candidate.resize(120);
                        target = PathForName(directory, candidate);
                        if (!fs::exists(target, error)) break;
                    }
                }
                try {
                    WriteFile(target, content);
                    ++migrated;
                } catch (const std::exception& exception) {
                    migrationFailed = true;
                    warnings.push_back("Could not migrate " + originalName + ": " + exception.what());
                }
            }
        }

        std::vector<fs::path> files;
        for (fs::directory_iterator iterator(directory, fs::directory_options::skip_permission_denied, error), end; iterator != end; iterator.increment(error)) {
            if (error) { warnings.push_back("Some files in the folder could not be inspected."); error.clear(); continue; }
            if (!iterator->is_regular_file(error) || error || LowerAscii(ToUtf8(iterator->path().extension())) != ".txt") { error.clear(); continue; }
            files.push_back(iterator->path());
        }
        std::sort(files.begin(), files.end(), [](const auto& left, const auto& right) {
            return LowerAscii(ToUtf8(left.filename())) < LowerAscii(ToUtf8(right.filename()));
        });
        if (files.size() > kMaxFiles) {
            warnings.push_back("Only the first 100 .txt batch files are shown.");
            files.resize(kMaxFiles);
        }

        OSFUI::API::Json entries = OSFUI::API::Json::array();
        for (const auto& file : files) {
            try { entries.push_back(Entry(file)); }
            catch (const std::exception& exception) { warnings.push_back(ToUtf8(file.filename()) + ": " + exception.what()); }
        }
        return {
            { "ok", true }, { "directory", ToUtf8(directory) }, { "entries", entries }, { "warnings", warnings },
            { "migrated", migrated }, { "migrationComplete", !migrationFailed }
        };
    }

    inline OSFUI::API::Json Save(std::string_view name, std::string_view content)
    {
        if (const auto problem = ValidateName(name)) throw std::runtime_error(*problem);
        if (const auto problem = ValidateContent(content)) throw std::runtime_error(*problem);
        const auto directory = UserDirectory();
        std::error_code error;
        fs::create_directories(directory, error);
        if (error) throw std::runtime_error("CCC could not create the user Command Batches folder.");
        WriteFile(PathForName(directory, name), content);
        return { { "ok", true }, { "entry", Entry(PathForName(directory, name)) }, { "directory", ToUtf8(directory) } };
    }

    inline OSFUI::API::Json Delete(std::string_view name)
    {
        if (const auto problem = ValidateName(name)) throw std::runtime_error(*problem);
        std::error_code error;
        const bool removed = fs::remove(PathForName(UserDirectory(), name), error);
        if (error) throw std::runtime_error("Windows could not delete the batch file.");
        return { { "ok", true }, { "removed", removed } };
    }

    inline OSFUI::API::Json DeleteAll()
    {
        const auto directory = UserDirectory();
        std::error_code error;
        std::size_t removed = 0;
        if (!fs::exists(directory, error)) return { { "ok", true }, { "removed", 0 } };
        for (fs::directory_iterator iterator(directory, fs::directory_options::skip_permission_denied, error), end; iterator != end; iterator.increment(error)) {
            if (error) throw std::runtime_error("The batch folder could not be read completely.");
            if (iterator->is_regular_file(error) && !error && LowerAscii(ToUtf8(iterator->path().extension())) == ".txt") {
                if (fs::remove(iterator->path(), error)) ++removed;
                if (error) throw std::runtime_error("One or more batch files could not be deleted.");
            }
            error.clear();
        }
        return { { "ok", true }, { "removed", removed } };
    }
}
