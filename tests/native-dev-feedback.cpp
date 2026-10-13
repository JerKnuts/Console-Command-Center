#include "DevFeedback.h"
#include <iostream>

int main()
{
    try {
        const auto directory = std::filesystem::temp_directory_path() / (L"ccc-feedback-test-" + std::to_wstring(GetCurrentProcessId()) + L"-" + std::to_wstring(GetTickCount64()));
        const auto file = directory / L"CCC-Dev-Feedback.txt";
        const std::string first = "Report 1\r\nWorking\r\nUnicode: \xE2\x80\x94\r\n";
        auto result = CCC::DevFeedback::ExportAt(directory, first);
        if (!result["ok"].get<bool>()) throw std::runtime_error("Export did not succeed.");
        auto read = [&]() { std::ifstream stream(file, std::ios::binary); return std::string(std::istreambuf_iterator<char>(stream), {}); };
        if (read() != first) throw std::runtime_error("Export corrupted text.");
        const auto combined = first + "Report 2\r\nNot working\r\n";
        CCC::DevFeedback::ExportAt(directory, combined);
        if (read() != combined) throw std::runtime_error("Repeated export did not replace with complete collection.");
        bool rejected = false;
        try { CCC::DevFeedback::ExportAt(directory, ""); } catch (const std::exception&) { rejected = true; }
        if (!rejected || read() != combined) throw std::runtime_error("Invalid export damaged existing file.");
        if (std::filesystem::exists(directory / L"CCC-Dev-Feedback.txt.tmp")) throw std::runtime_error("Temporary file left after successful export.");
        std::filesystem::remove(file);
        std::filesystem::remove(directory);
        std::cout << "Dev feedback export tests passed.\n";
        return 0;
    } catch (const std::exception& error) {
        std::cerr << error.what() << '\n';
        return 1;
    }
}
