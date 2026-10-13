#pragma once
#include "CommandBatches.h"
#include <Windows.h>

namespace CCC::DevFeedback
{
    inline OSFUI::API::Json ExportAt(const std::filesystem::path& directory, std::string_view content)
    {
        if (content.empty() || content.size() > 4 * 1024 * 1024) throw std::runtime_error("Test report export must be between 1 byte and 4 MB.");
        std::filesystem::create_directories(directory);
        const auto destination = directory / L"CCC-Dev-Feedback.txt";
        const auto temporary = directory / L"CCC-Dev-Feedback.txt.tmp";
        {
            std::ofstream output(temporary, std::ios::binary | std::ios::trunc);
            if (!output) throw std::runtime_error("Could not open the test report file.");
            output.write(content.data(), static_cast<std::streamsize>(content.size()));
            output.flush();
            if (!output) throw std::runtime_error("Could not write the test report file.");
        }
        if (!MoveFileExW(temporary.c_str(), destination.c_str(), MOVEFILE_REPLACE_EXISTING | MOVEFILE_WRITE_THROUGH)) {
            std::error_code ignored;
            std::filesystem::remove(temporary, ignored);
            throw std::runtime_error("Could not replace the test report export.");
        }
        return OSFUI::API::Json{ { "ok", true }, { "path", CommandBatches::ToUtf8(destination) } };
    }
    inline OSFUI::API::Json Export(std::string_view content)
    {
        return ExportAt(CommandBatches::UserDirectory().parent_path(), content);
    }
}
