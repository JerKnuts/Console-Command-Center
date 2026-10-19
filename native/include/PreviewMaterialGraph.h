#pragma once
#include <optional>
namespace CCC::Preview {
// CDB objects reference parents, layers and TextureSets by database ID. Display
// names alone cannot recover inherited surfaces such as Structural_Frame.
inline std::unordered_map<std::string,MaterialAppearance> ReadMaterialInheritance(std::span<const std::uint8_t> bytes) {
    struct Chunk {std::string tag;std::span<const std::uint8_t> data;};
    struct Field {std::uint32_t type;std::uint16_t index;Chunk chunk;};
    struct Node {std::uint32_t parent=0;std::vector<Field> fields;};
    std::unordered_map<std::string,MaterialAppearance> result;std::unordered_set<std::string> ambiguous;
    try {
        std::vector<Chunk> chunks;Reader input{bytes};
        while(input.at<bytes.size()){const auto tag=input.Text(4);const auto size=input.Read<std::uint32_t>();input.Need(size);chunks.push_back({tag,bytes.subspan(input.at,size)});input.Skip(size);if(chunks.size()>2000000)return {};}
        if(chunks.empty()||chunks[0].tag!="BETH")return {};
        const auto strings=std::find_if(chunks.begin(),chunks.end(),[](const Chunk& c){return c.tag=="STRT";});if(strings==chunks.end())return {};
        const auto name=[&](std::uint32_t at){if(at>=strings->data.size())return std::string{};auto text=strings->data.subspan(at);const auto end=std::find(text.begin(),text.end(),0);if(end==text.end())return std::string{};return std::string(text.begin(),end);};
        std::unordered_map<std::string,std::uint32_t> classes;
        for(const auto& chunk:chunks)if(chunk.tag=="CLAS"){Reader r{chunk.data};const auto id=r.Read<std::uint32_t>();classes.emplace(name(id),id);}
        const auto classId=[&](const char* n){const auto i=classes.find(n);return i==classes.end()?0xffffffffu:i->second;};
        std::unordered_map<unsigned,std::uint32_t> types;
        for(std::size_t i=0;i<chunks.size();++i)if(chunks[i].tag=="MAPC"&&chunks[i].data.size()>=12){Reader r{chunks[i].data};if(r.Read<std::uint32_t>()!=0xffffff0bu)continue;r.Skip(4);const auto n=r.Read<std::uint32_t>();if(!n||n>256||r.bytes.size()!=12+n*5||i+n>=chunks.size())continue;
            std::unordered_map<unsigned,std::uint32_t> candidate;
            for(unsigned j=0;j<n;++j){const auto key=r.Read<std::uint16_t>();r.Skip(3);const auto& user=chunks[i+j+1];if(user.tag!="USER"||user.data.size()<10){candidate.clear();break;}Reader u{user.data};u.Skip(8);const auto length=u.Read<std::uint16_t>();auto text=u.Text(length);if(auto end=text.find('\0');end!=text.npos)text.resize(end);const auto found=classes.find(text);candidate.emplace(key,found==classes.end()?0xffffffffu:found->second);}
            if(candidate.size()==n){types=std::move(candidate);break;}}
        if(types.empty())return {};
        std::unordered_map<std::uint32_t,Node> nodes;std::span<const std::uint8_t> components;std::size_t dataStart=0;
        for(std::size_t i=0;i<chunks.size();++i){const auto& c=chunks[i];if(c.tag!="LIST"||c.data.size()<8)continue;Reader r{c.data};const auto type=r.Read<std::uint32_t>(),n=r.Read<std::uint32_t>();
            if(type==classId("BSComponentDB2::DBFileIndex::ObjectInfo")){if(n>750000||c.data.size()!=8ull+n*33)return {};nodes.reserve(n);for(unsigned j=0;j<n;++j){r.Skip(12);const auto id=r.Read<std::uint32_t>(),parent=r.Read<std::uint32_t>();r.Skip(13);if(!nodes.emplace(id,Node{parent,{}}).second)return {};}}
            else if(type==classId("BSComponentDB2::DBFileIndex::ComponentInfo")){if(n>2000000||c.data.size()!=8ull+n*8)return {};components=c.data.subspan(8);}
            else if(type==classId("BSComponentDB2::DBFileIndex::EdgeInfo")){if(n>1000000||c.data.size()!=8ull+n*12)return {};dataStart=i+1;}}
        if(nodes.empty()||components.empty()||!dataStart)return {};
        const auto ctName=classId("BSComponentDB::CTName"),layer=classId("BSMaterial::LayerID"),material=classId("BSMaterial::MaterialID"),textureSet=classId("BSMaterial::TextureSetID"),file=classId("BSMaterial::MRTextureFile"),replacement=classId("BSMaterial::TextureReplacement"),color=classId("BSMaterial::Color");
        Reader list{components};std::size_t at=dataStart;
        while(list.at<components.size()){const auto id=list.Read<std::uint32_t>();const auto index=list.Read<std::uint16_t>(),type=list.Read<std::uint16_t>();const auto t=types.find(type);const auto node=nodes.find(id);if(t==types.end()||node==nodes.end())return {};
            // Composite components own following nested chunks. Their child class
            // IDs differ from the next indexed component; stay on chunk boundaries.
            while(at<chunks.size()){const auto& c=chunks[at];if(c.data.size()>=4){Reader r{c.data};if(r.Read<std::uint32_t>()==t->second)break;}++at;}
            if(at==chunks.size())return {};const auto& c=chunks[at++];
            if(t->second==ctName||t->second==layer||t->second==material||t->second==textureSet||t->second==file||t->second==replacement||t->second==color)node->second.fields.push_back({t->second,index,c});}
        if(at!=chunks.size())return {};
        const auto field=[&](std::uint32_t id,std::uint32_t type,unsigned index)->const Field*{for(unsigned depth=0;id&&depth<32;++depth){const auto n=nodes.find(id);if(n==nodes.end())return nullptr;for(const auto& f:n->second.fields)if(f.type==type&&f.index==index)return &f;id=n->second.parent;}return nullptr;};
        const auto link=[&](std::uint32_t id,std::uint32_t type){const auto f=field(id,type,0);if(!f)return 0u;Reader r{f->chunk.data};r.Skip(f->chunk.tag=="DIFF"?8:4);return r.Read<std::uint32_t>();};
        const auto text=[&](const Field* f){if(!f)return std::string{};Reader r{f->chunk.data};r.Skip(f->chunk.tag=="DIFF"?6:4);const auto n=r.Read<std::uint16_t>();auto value=r.Text(n);if(auto end=value.find('\0');end!=value.npos)value.resize(end);return value;};
        const auto rgba=[](const Field* f)->std::optional<std::array<float,3>>{if(!f)return {};for(std::size_t at=4;at<20&&at+24<=f->chunk.data.size();++at){Reader r{f->chunk.data,at};std::array<float,4> color{};bool valid=true;for(unsigned i=0;i<4;++i){if(r.Read<std::uint16_t>()!=i){valid=false;break;}color[i]=r.Read<float>();if(!std::isfinite(color[i])||color[i]<0||color[i]>1){valid=false;break;}}if(valid)return std::array<float,3>{color[0],color[1],color[2]};}return {};};
        for(const auto& [id,node]:nodes){const auto rootName=std::find_if(node.fields.begin(),node.fields.end(),[&](const Field& f){return f.type==ctName;});if(rootName==node.fields.end())continue;const auto l=link(id,layer);if(!l)continue;const auto m=link(l,material),t=link(m,textureSet);if(!m||!t)continue;auto key=text(&*rootName);try{key=MaterialKey(key);if(key.starts_with("data/"))key.erase(0,5);}catch(...){continue;}MaterialAppearance appearance;
            if(auto tint=rgba(field(m,color,0))){appearance.tint=*tint;appearance.tinted=true;}
            for(unsigned slot=0;slot<6;++slot){std::optional<bool> constant;std::optional<std::array<float,3>> replacementColor;
                // DIFF can override only the replacement color and inherit its
                // enabled flag. Resolve those two fields independently.
                for(std::uint32_t current=t,depth=0;current&&depth<32;++depth){const auto node=nodes.find(current);if(node==nodes.end())break;const auto replace=std::find_if(node->second.fields.begin(),node->second.fields.end(),[&](const Field& f){return f.type==replacement&&f.index==slot;});
                    if(replace!=node->second.fields.end()){if(!replacementColor)replacementColor=rgba(&*replace);if(!constant&&replace->chunk.tag=="DIFF"&&replace->chunk.data.size()>=7){Reader r{replace->chunk.data};r.Skip(4);if(r.Read<std::uint16_t>()==0)constant=r.Read<std::uint8_t>()==1;}}
                    if(constant&&replacementColor)break;current=node->second.parent;}
                if(constant.value_or(false)){if(slot==0&&replacementColor){appearance.color=*replacementColor;appearance.constantColor=true;}continue;}
                auto path=text(field(t,file,slot));try{path=MaterialKey(path);if(path.starts_with("data/"))path.erase(0,5);if(!path.starts_with("textures/")||!path.ends_with(".dds"))continue;}catch(...){continue;}
                if(path.ends_with("_metal.dds"))appearance.metal=path;else if(path.ends_with("_ao.dds"))appearance.ao=path;else if(slot==0)appearance.texture=path;else if(slot==1)appearance.normal=path;else if(slot==2)appearance.opacity=path;else if(slot==3)appearance.roughness=path;else if(slot==4)appearance.ao=path;}
            if((!appearance.texture.empty()||appearance.constantColor||appearance.tinted||!appearance.normal.empty()||!appearance.opacity.empty())&&!ambiguous.contains(key)){
                const auto old=result.find(key);if(old!=result.end()&&(old->second.texture!=appearance.texture||old->second.normal!=appearance.normal||old->second.constantColor!=appearance.constantColor||old->second.color!=appearance.color||old->second.tint!=appearance.tint)){result.erase(old);ambiguous.insert(key);}else result.try_emplace(key,std::move(appearance));}}
    }catch(...){return {};}
    return result;
}
}
