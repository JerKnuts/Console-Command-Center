#pragma once
#include "OSFUI_JSON.h"
#include <filesystem>
#include <fstream>
#include <stdexcept>
#include <string>

namespace CCC::Translations {
    inline OSFUI::API::Json Read(const std::filesystem::path& path) {
        namespace fs=std::filesystem;
        if(!fs::exists(path))return {{"ok",true},{"pack",nullptr}};
        constexpr std::uintmax_t limit=16*1024*1024;
        if(!fs::is_regular_file(path)||fs::file_size(path)>limit)throw std::runtime_error("Translation file exceeds the 16 MB limit.");
        std::ifstream input(path,std::ios::binary);
        if(!input)throw std::runtime_error("Could not open translation file.");
        std::string content;content.resize(static_cast<std::size_t>(fs::file_size(path)));input.read(content.data(),static_cast<std::streamsize>(content.size()));
        if(!input&& !input.eof())throw std::runtime_error("Could not read translation file.");
        auto pack=OSFUI::API::Json::parse(content);
        if(!pack.is_object()||pack.value("schemaVersion",0)!=1||!pack.contains("messages")||!pack.at("messages").is_object())throw std::runtime_error("Invalid translation pack.");
        return {{"ok",true},{"pack",std::move(pack)}};
    }
    inline OSFUI::API::Json Discover(const std::filesystem::path& directory) {
        namespace fs=std::filesystem;
        auto packs=OSFUI::API::Json::array();auto errors=OSFUI::API::Json::array();
        if(!fs::exists(directory))return {{"ok",true},{"packs",packs},{"errors",errors}};
        std::uintmax_t bytes=0;std::size_t files=0;
        for(const auto& entry:fs::directory_iterator(directory)) {
            if(!entry.is_regular_file()||entry.path().extension()!=".json")continue;
            if(++files>64)break;
            const auto utf8=entry.path().filename().u8string();const std::string filename(utf8.begin(),utf8.end());
            try {
                const auto size=entry.file_size();if(size>16*1024*1024||bytes+size>64*1024*1024)throw std::runtime_error("Translation size limit.");bytes+=size;
                packs.push_back({{"file",filename},{"pack",Read(entry.path()).at("pack")}});
            } catch(...) {errors.push_back(filename);}
        }
        return {{"ok",true},{"packs",packs},{"errors",errors}};
    }
    inline void OnRead(const OSFUI::API::Request& raw,void*) noexcept {
        OSFUI::API::JsonRequest request{raw};if(!request)return;
        try { request.Reply(Discover(std::filesystem::current_path()/"Data/SFSE/Plugins/OSF/UI/views/console.command-center/main/translations")); }
        catch(...) { request.Reject("translation-read-failed","Could not load the CCC translation file."); }
    }
}
