#pragma once
#include "PreviewRecords.h"
namespace CCC::Details {
class SlateVoiceAssets {
    struct Entry {std::uint64_t offset=0;std::uint32_t packed=0,raw=0;};
    struct Archive {std::filesystem::path path;bool indexed=false;std::unordered_map<std::string,Entry> files;};
    std::filesystem::path data;std::vector<Archive> archives;
    static std::string Lower(std::string value){for(auto& c:value)if(c>='A'&&c<='Z')c+=32;return value;}
    void Index(Archive& archive){
        archive.indexed=true;std::ifstream f(archive.path,std::ios::binary|std::ios::ate);if(!f)return;const auto length=std::uint64_t(f.tellg());f.seekg(0);std::array<std::uint8_t,36> h{};if(!f.read(reinterpret_cast<char*>(h.data()),h.size()))return;
        Preview::Reader r{h};if(r.Text(4)!="BTDX")return;const auto version=r.Read<std::uint32_t>();if(r.Text(4)!="GNRL"||version<1||version>3)return;const auto count=r.Read<std::uint32_t>();const auto names=r.Read<std::uint64_t>();const unsigned header=version==1?24:version==2?32:36;
        if(count>600000||names>length||std::uint64_t(count)*36+header>names)return;if(version==3){r.Skip(8);if(r.Read<std::uint32_t>()!=0)return;}
        std::vector<Entry> entries;entries.reserve(count);f.seekg(header);for(unsigned i=0;i<count;++i){std::array<std::uint8_t,36> b{};if(!f.read(reinterpret_cast<char*>(b.data()),36))return;Preview::Reader e{b};e.Skip(16);Entry x;x.offset=e.Read<std::uint64_t>();x.packed=e.Read<std::uint32_t>()&0x3fffffffu;x.raw=e.Read<std::uint32_t>()&0x3fffffffu;entries.push_back(x);}
        f.seekg(names);for(unsigned i=0;i<count;++i){std::uint16_t n=0;if(!f.read(reinterpret_cast<char*>(&n),2)||n>1024)return;std::string path(n,'\0');if(!f.read(path.data(),n))return;try{path=Preview::AssetKey(path);}catch(...){continue;}const auto& e=entries[i];if(path.starts_with("sound/voice/")&&path.ends_with(".wem")&&e.raw&&e.raw<=8u*1024*1024&&e.offset<=names&&(e.packed?e.packed:e.raw)<=names-e.offset)archive.files.emplace(std::move(path),e);}
    }
public:
    SlateVoiceAssets(std::filesystem::path directory,const std::vector<Preview::ScenePlugin>& plugins,std::string language="en"):data(std::move(directory)){
        language=Lower(language);if(language.empty()||language.find_first_not_of("abcdefghijklmnopqrstuvwxyz_")!=language.npos)language="en";
        std::vector<std::pair<int,std::filesystem::path>> files;
        for(const auto& item:std::filesystem::directory_iterator(data)){
            const auto name=Lower(item.path().filename().string());if(!name.ends_with(".ba2"))continue;int priority=-1;
            for(unsigned i=0;i<plugins.size();++i){const auto stem=Lower(std::filesystem::path(plugins[i].name).stem().string());if(name==stem+".ba2"||name.starts_with(stem+" - ")||name.starts_with(stem+"-"))priority=int(i);}
            if(priority<0)continue;const bool voice=name.find("voices")!=name.npos;
            if(name.starts_with("starfield - ")&&!voice)continue;
            if(voice){const auto dash=name.rfind('_');if(dash!=name.npos){const auto lang=name.substr(dash+1,name.size()-dash-5);if(lang!=language&&lang!="en")continue;if(lang==language)priority+=10000;}}
            files.emplace_back(priority,item.path());
        }
        std::sort(files.begin(),files.end(),[](const auto& a,const auto& b){return a.first!=b.first?a.first>b.first:a.second.filename().string()>b.second.filename().string();});for(auto& [priority,path]:files)archives.push_back({std::move(path)});
    }
    Preview::Bytes Read(const Preview::RecordScenes::SlateTrack& track){
        const auto plugin=Lower(track.plugin),voice=Lower(track.voice);if(!track.wem||plugin.empty()||plugin.find_first_of("/\\:")!=plugin.npos||voice.find_first_of("/\\:")!=voice.npos)throw std::runtime_error("Invalid slate voice identity.");
        const auto prefix="sound/voice/"+plugin+"/",suffix="/"+std::format("{:08x}",track.wem)+".wem",exact=prefix+voice+suffix;
        if(!voice.empty()){const auto loose=data/std::filesystem::path(exact);if(std::filesystem::is_regular_file(loose)){const auto n=std::filesystem::file_size(loose);if(n>8u*1024*1024)throw std::runtime_error("Slate audio is too large.");return Preview::ReadRange(loose,0,n);}}
        for(auto& archive:archives){if(!archive.indexed)Index(archive);const Entry* selected=nullptr;
            if(!voice.empty()){if(const auto found=archive.files.find(exact);found!=archive.files.end())selected=&found->second;}
            else for(const auto& [path,e]:archive.files)if(path.starts_with(prefix)&&path.ends_with(suffix)){if(selected)throw std::runtime_error("This slate line has multiple voice variants.");selected=&e;}
            if(!selected)continue;const auto& e=*selected;auto bytes=Preview::ReadRange(archive.path,e.offset,e.packed?e.packed:e.raw);if(!e.packed)return bytes;
            Preview::Bytes decoded(e.raw);uLongf n=e.raw;if(uncompress(decoded.data(),&n,bytes.data(),bytes.size())!=Z_OK||n!=e.raw)throw std::runtime_error("Slate audio could not be decompressed.");return decoded;
        }throw std::runtime_error("The recorded voice file is unavailable in the installed game assets.");
    }
};
}
