#pragma once
// Read only the description namespace: STRINGS/ILSTRINGS can reuse these IDs.
#include "PreviewGeometry.h"
#include <list>
namespace CCC::Details {
    using Preview::Bytes;
    using Preview::Reader;
    inline std::string Lower(std::string s) { for(auto& c:s)if(c>='A'&&c<='Z')c+=32;return s; }
    inline std::string Text(std::span<const std::uint8_t> data) {
        const auto end=std::find(data.begin(),data.end(),0);
        return std::string(data.begin(),end).substr(0,262144);
    }
    inline std::unordered_map<std::uint32_t,std::string> ParseDescriptions(std::span<const std::uint8_t> bytes) {
        Reader r{bytes};const auto count=r.Read<std::uint32_t>(),size=r.Read<std::uint32_t>();
        if(count>1000000||count>(bytes.size()-8)/8)throw std::runtime_error("Invalid description table.");
        const auto start=8+std::size_t(count)*8;
        if(size>bytes.size()-start)throw std::runtime_error("Truncated description table.");
        std::unordered_map<std::uint32_t,std::string> out;
        for(unsigned i=0;i<count;++i){const auto id=r.Read<std::uint32_t>(),offset=r.Read<std::uint32_t>();
            if(offset>size||size-offset<4)throw std::runtime_error("Invalid description offset.");
            Reader text{bytes.subspan(start+offset,size-offset)};const auto length=text.Read<std::uint32_t>();
            text.Need(length);if(length>262144)continue;out[id]=Text(text.bytes.subspan(4,length));
        }return out;
    }
    class DescriptionStore {
        struct Table{std::string key;std::unordered_map<std::uint32_t,std::string> values;};
        std::filesystem::path data;std::string tableSuffix=".dlstrings";std::list<Table> cache;
        Bytes ReadArchive(const std::filesystem::path& path,const std::string& wanted) {
            std::ifstream f(path,std::ios::binary|std::ios::ate);if(!f)return {};
            const auto size=std::uint64_t(f.tellg());if(size<24)return {};
            const auto h=Preview::ReadRange(path,0,24);Reader r{h};if(r.Text(4)!="BTDX")return {};
            const auto version=r.Read<std::uint32_t>();if(r.Text(4)!="GNRL"||version<1||version>3)return {};
            const auto count=r.Read<std::uint32_t>();const auto names=r.Read<std::uint64_t>();const auto start=version==1?24u:version==2?32u:36u;
            if(count>500000||names>size||start+std::uint64_t(count)*36>size)return {};
            f.seekg(names);
            for(unsigned i=0;i<count;++i){std::uint16_t length=0;if(!f.read(reinterpret_cast<char*>(&length),2)||length>4096)return {};
                std::string name(length,'\0');if(!f.read(name.data(),length))return {};for(auto& c:name)if(c=='\\')c='/';
                if(Lower(name)!=wanted)continue;
                const auto entry=Preview::ReadRange(path,start+std::uint64_t(i)*36,36);Reader e{entry};e.Skip(16);
                const auto offset=e.Read<std::uint64_t>();const auto packed=e.Read<std::uint32_t>()&0x3fffffff,raw=e.Read<std::uint32_t>()&0x3fffffff;
                if(!raw||raw>Preview::MaxAssetBytes||packed>Preview::MaxAssetBytes)return {};
                auto bytes=Preview::ReadRange(path,offset,packed?packed:raw);if(!packed)return bytes;
                Bytes decoded(raw);uLongf n=raw;if(uncompress(decoded.data(),&n,bytes.data(),bytes.size())!=Z_OK||n!=raw)throw std::runtime_error("Invalid compressed descriptions.");return decoded;
            }return {};
        }
        std::unordered_map<std::uint32_t,std::string> Load(const std::string& plugin,const std::string& language) {
            const auto stem=Lower(std::filesystem::path(plugin).stem().string());const auto name=stem+"_"+language+tableSuffix;
            const auto loose=data/"Strings"/name;
            if(std::filesystem::exists(loose))return ParseDescriptions(Preview::ReadRange(loose,0,std::filesystem::file_size(loose)));
            std::vector<std::filesystem::path> archives;
            for(const auto& entry:std::filesystem::directory_iterator(data)){
                const auto filename=Lower(entry.path().filename().string());
                if(Lower(entry.path().extension().string())==".ba2"&&(filename==stem+".ba2"||filename.starts_with(stem+" - ")||filename.starts_with(stem+"-")))archives.push_back(entry.path());
            }
            std::sort(archives.begin(),archives.end());
            // Localization archives first; generic mod Main archives can hold strings too.
            std::stable_sort(archives.begin(),archives.end(),[](const auto& a,const auto& b){return (Lower(a.string()).find("localization")!=std::string::npos)>(Lower(b.string()).find("localization")!=std::string::npos);});
            for(const auto& archive:archives){auto bytes=ReadArchive(archive,"strings/"+name);if(!bytes.empty())return ParseDescriptions(bytes);}return {};
        }
    public:
        explicit DescriptionStore(std::filesystem::path directory,std::string suffix=".dlstrings"):data(std::move(directory)),tableSuffix(std::move(suffix)){if(tableSuffix!=".dlstrings"&&tableSuffix!=".ilstrings")throw std::runtime_error("Invalid description namespace.");}
        std::string Lookup(const std::string& plugin,std::string language,std::uint32_t id) {
            if(!id||plugin.empty()||plugin.find_first_of("/\\:")!=plugin.npos||plugin=="..")return {};
            language=Lower(language);if(language.empty()||language.size()>16||language.find_first_not_of("abcdefghijklmnopqrstuvwxyz_")!=language.npos)language="en";
            for(const auto& lang:language=="en"?std::vector<std::string>{"en"}:std::vector<std::string>{language,"en"}){
                const auto key=Lower(plugin)+":"+lang;auto found=std::find_if(cache.begin(),cache.end(),[&](const auto& t){return t.key==key;});
                if(found==cache.end()){cache.push_front({key,Load(plugin,lang)});while(cache.size()>4)cache.pop_back();found=cache.begin();}
                else cache.splice(cache.begin(),cache,found);
                if(const auto text=cache.front().values.find(id);text!=cache.front().values.end())return text->second;
            }return {};
        }
    };
}
