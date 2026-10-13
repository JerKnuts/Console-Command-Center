#pragma once
#include "CommandBatches.h"
#include <Windows.h>
#include <atomic>
#include <iomanip>
#include <sstream>

namespace CCC::DevFeedback
{
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
