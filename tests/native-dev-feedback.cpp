#include "DevFeedback.h"
#include "DiagnosticLog.h"
#include <iostream>

int main()
{
    try {
        std::string diagnostic;
        CCC::Diagnostics::Record("item-resolution\nforged", "1.4.3", "1.4.3", "1.16.244",
            "plugin=Starfield.esm; local=1DEDB1; form=001DEDB1; plugins=0; error=timeout\nsecond\tline",
            [&](const std::string& line) { diagnostic = line; });
        if (diagnostic.find('\n') != std::string::npos || diagnostic.find('\t') != std::string::npos ||
            diagnostic.find("UI=1.4.3; native=1.4.3; runtime=1.16.244") == std::string::npos ||
            diagnostic.find("form=001DEDB1") == std::string::npos)
            throw std::runtime_error("Diagnostic line lost context or allowed control characters.");
        if (CCC::Diagnostics::SafeField(std::string(9000, 'x'), 2048).size() != 2048)
            throw std::runtime_error("Diagnostic detail was not bounded.");
        CCC::DevFeedback::Uploads uploads;
        const std::string large=std::string(180000,'x')+"\r\nChinese: \xE8\xAE\xBE\xE7\xBD\xAE\r\n";
        const auto token=uploads.Accept({{"action","begin"},{"bytes",large.size()}}).at("upload").get<std::string>();
        auto mustReject=[&](const OSFUI::API::Json& payload){bool failed=false;try{uploads.Accept(payload);}catch(...){failed=true;}if(!failed)throw std::runtime_error("Invalid report upload accepted.");};
        mustReject({{"action","finish"},{"upload",token}});
        mustReject({{"action","append"},{"upload",token},{"index",1},{"content","wrong order"}});
        std::size_t index=0;
        for(std::size_t offset=0;offset<large.size();offset+=8192){
            const auto reply=uploads.Accept({{"action","append"},{"upload",token},{"index",index},{"content",large.substr(offset,8192)}});
            if(reply.at("next").get<std::size_t>()!=++index)throw std::runtime_error("Report chunk acknowledgement mismatch.");
        }
        const auto assembled=uploads.Accept({{"action","finish"},{"upload",token}}).at("content").get<std::string>();
        if(assembled!=large)throw std::runtime_error("Chunked report corrupted text.");
        mustReject({{"action","finish"},{"upload",token}});
        mustReject({{"action","begin"},{"bytes",4194305}});
        const auto cancelled=uploads.Accept({{"action","begin"},{"bytes",10}}).at("upload");
        uploads.Accept({{"action","cancel"},{"upload",cancelled}});
        mustReject({{"action","append"},{"upload",cancelled},{"index",0},{"content","test"}});
        const auto directory = std::filesystem::temp_directory_path() / (L"ccc-feedback-test-" + std::to_wstring(GetCurrentProcessId()) + L"-" + std::to_wstring(GetTickCount64()));
        std::filesystem::create_directories(directory);
        const auto diagnosticFile = directory / L"diagnostic.log";
        { std::ofstream stream(diagnosticFile); stream << diagnostic << '\n'; }
        { std::ifstream stream(diagnosticFile); std::string line; std::getline(stream, line);
          if (line != diagnostic) throw std::runtime_error("Diagnostic file round trip lost context."); }
        std::filesystem::remove(diagnosticFile);
        const std::string first = "Report 1\r\nWorking\r\nUnicode: \xE2\x80\x94\r\n";
        auto result = CCC::DevFeedback::ExportAt(directory, first);
        const auto largeResult=CCC::DevFeedback::ExportAt(directory,assembled);
        const auto largeFile=std::filesystem::u8path(largeResult.at("path").get<std::string>());
        {std::ifstream stream(largeFile,std::ios::binary);const std::string saved(std::istreambuf_iterator<char>(stream),{});if(saved!=large)throw std::runtime_error("Large report file differs from upload.");}
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
        std::filesystem::remove(largeFile);
        std::filesystem::remove(directory);
        std::cout << "Dev feedback export tests passed.\n";
        return 0;
    } catch (const std::exception& error) {
        std::cerr << error.what() << '\n';
        return 1;
    }
}
