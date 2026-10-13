#include "DevFeedback.h"
#include <iostream>

int main()
{
    try {
        const auto directory = std::filesystem::temp_directory_path() / (L"ccc-feedback-test-" + std::to_wstring(GetCurrentProcessId()) + L"-" + std::to_wstring(GetTickCount64()));
        const std::string first = "Report 1\r\nWorking\r\nUnicode: \xE2\x80\x94\r\n";
        auto result = CCC::DevFeedback::ExportAt(directory, first);
        const auto file = std::filesystem::u8path(result["path"].get<std::string>());
        if (!result["ok"].get<bool>()) throw std::runtime_error("Export did not succeed.");
        auto read = [&]() { std::ifstream stream(file, std::ios::binary); return std::string(std::istreambuf_iterator<char>(stream), {}); };
        if (read() != first) throw std::runtime_error("Export corrupted text.");
        const auto combined = first + "Report 2\r\nNot working\r\n";
        auto second = CCC::DevFeedback::ExportAt(directory, combined);
        const auto secondFile = std::filesystem::u8path(second["path"].get<std::string>());
        std::ifstream secondStream(secondFile, std::ios::binary);
        const std::string secondText(std::istreambuf_iterator<char>(secondStream), {});
        secondStream.close();
        if (file == secondFile || read() != first || secondText != combined) throw std::runtime_error("Repeated export must preserve both files.");
        if (!file.filename().wstring().starts_with(L"CCC-Dev-Feedback-")) throw std::runtime_error("Missing timestamped report name.");
        bool rejected = false;
        try { CCC::DevFeedback::ExportAt(directory, ""); } catch (const std::exception&) { rejected = true; }
        if (!rejected || read() != first) throw std::runtime_error("Invalid export damaged existing file.");
        for (const auto& entry : std::filesystem::directory_iterator(directory)) {
            if (entry.path().extension() == L".tmp") throw std::runtime_error("Temporary file left after successful export.");
        }
        std::filesystem::remove(file);
        std::filesystem::remove(secondFile);
        std::filesystem::remove(directory);
        std::cout << "Dev feedback export tests passed.\n";
        return 0;
    } catch (const std::exception& error) {
        std::cerr << error.what() << '\n';
        return 1;
    }
}
