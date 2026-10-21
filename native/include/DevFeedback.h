#pragma once
#include "CommandBatches.h"
#include <Windows.h>
#include <atomic>
#include <iomanip>
#include <sstream>
#include <map>
#include <mutex>

namespace CCC::DevFeedback
{
    class Uploads {
        struct Pending {std::string content;std::size_t expected=0,next=0;ULONGLONG touched=0;};
        std::map<std::string,Pending> pending;
        std::mutex mutex;
        unsigned long long sequence=0;
    public:
        OSFUI::API::Json Accept(const OSFUI::API::Json& payload) {
            const std::lock_guard lock(mutex);const auto now=GetTickCount64();
            std::erase_if(pending,[now](const auto& entry){return now-entry.second.touched>120000;});
            const auto action=payload.value("action",std::string{});
            if(action=="begin"){
                const auto bytes=payload.at("bytes").get<std::int64_t>();
                if(bytes<1||bytes>4*1024*1024)throw std::runtime_error("Report export must be between 1 byte and 4 MB.");
                if(pending.size()>=4)throw std::runtime_error("Too many report uploads. Wait and retry.");
                const auto token=std::to_string(now)+"-"+std::to_string(sequence++);
                Pending item;item.expected=static_cast<std::size_t>(bytes);item.touched=now;pending.emplace(token,std::move(item));
                return {{"ok",true},{"upload",token}};
            }
            const auto token=payload.at("upload").get<std::string>();
            if(action=="cancel"){pending.erase(token);return {{"ok",true}};}
            const auto found=pending.find(token);if(found==pending.end())throw std::runtime_error("Report upload expired. Retry Export Reports.");
            auto& item=found->second;item.touched=now;
            if(action=="append"){
                const auto index=payload.at("index").get<std::int64_t>();const auto chunk=payload.at("content").get<std::string>();
                if(index<0||static_cast<std::size_t>(index)!=item.next||chunk.empty()||chunk.size()>49152||item.content.size()+chunk.size()>item.expected)throw std::runtime_error("Invalid report upload chunk.");
                item.content+=chunk;return {{"ok",true},{"next",++item.next}};
            }
            if(action=="finish"){
                if(item.content.size()!=item.expected)throw std::runtime_error("Report upload is incomplete. Retry Export Reports.");
                auto content=std::move(item.content);pending.erase(found);return {{"ok",true},{"content",std::move(content)}};
            }
            throw std::runtime_error("Unknown report export action.");
        }
    };
    inline OSFUI::API::Json ExportAt(const std::filesystem::path& directory, std::string_view content)
    {
        if (content.empty() || content.size() > 4 * 1024 * 1024) throw std::runtime_error("Test report export must be between 1 byte and 4 MB.");
        std::filesystem::create_directories(directory);
        SYSTEMTIME time{};
        GetLocalTime(&time);
        static std::atomic<unsigned long long> sequence{0};
        std::wostringstream name;
        name << L"CCC-Dev-Feedback-" << std::setfill(L'0') << std::setw(4) << time.wYear
             << L"-" << std::setw(2) << time.wMonth << L"-" << std::setw(2) << time.wDay
             << L"_" << std::setw(2) << time.wHour << L"-" << std::setw(2) << time.wMinute
             << L"-" << std::setw(2) << time.wSecond << L"-" << std::setw(3) << time.wMilliseconds
             << L"_" << GetCurrentProcessId() << L"-" << GetTickCount64() << L"-" << sequence++ << L".txt";
        const auto destination = directory / name.str();
        const auto temporary = directory / (name.str() + L".tmp");
        {
            std::ofstream output(temporary, std::ios::binary | std::ios::trunc);
            if (!output) throw std::runtime_error("Could not open the test report file.");
            output.write(content.data(), static_cast<std::streamsize>(content.size()));
            output.flush();
            if (!output) throw std::runtime_error("Could not write the test report file.");
        }
        if (!MoveFileExW(temporary.c_str(), destination.c_str(), MOVEFILE_WRITE_THROUGH)) {
            std::error_code ignored;
            std::filesystem::remove(temporary, ignored);
            throw std::runtime_error("Could not save the new test report export.");
        }
        return OSFUI::API::Json{ { "ok", true }, { "path", CommandBatches::ToUtf8(destination) } };
    }
    inline OSFUI::API::Json Export(std::string_view content)
    {
        return ExportAt(CommandBatches::UserDirectory().parent_path(), content);
    }
}
