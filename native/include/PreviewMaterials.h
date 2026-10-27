#pragma once
#include "PreviewGeometry.h"

namespace CCC::Preview {
    struct MaterialOverlay {std::string mask,texture,normal,roughness;std::array<float,3> tint{1,1,1};std::array<float,2> scale{1,1};bool multiply=true,positionContrast=false,tintMultiply=false,blendColor=true,blendNormal=true,blendRoughness=true,addNormals=true;float tintWeight=0,position=.5f,contrast=1,intensity=1;bool needsVertexColor=false,needsDetailMask=false;};
    struct MaterialAppearance {std::string texture;std::array<float,3> tint{1,1,1};bool tinted=false;std::string opacity,normal,ao,roughness,metal;std::array<float,3> color{1,1,1};bool constantColor=false;float tintWeight=1;std::string emissive;std::vector<MaterialOverlay> overlays;bool glass=false,decal=false;float constantOpacity=-1;bool authored=false,tintMultiply=false;
        // 0: unknown/effect transparency, 1: opaque, 2: authored alpha test.
        bool incomplete=false;unsigned opacityMode=0;float alphaThreshold=.5f,constantRoughness=-1,constantMetal=-1,constantAO=-1;
    };
    inline std::string MaterialKey(std::string name) {
        for(auto& c:name){if(c=='\\')c='/';else if(c>='A'&&c<='Z')c=char(c-'A'+'a');}
        if(name.starts_with("/materials/")||name.starts_with("/data/materials/"))name.erase(0,1);
        return AssetKey(std::move(name));
    }
    inline std::string MaterialName(std::string name) {
        name=MaterialKey(std::move(name));const auto slash=name.find_last_of('/');if(slash!=name.npos)name.erase(0,slash+1);
        if(name.ends_with(".mat"))name.resize(name.size()-4);return name;
    }
}
#include "PreviewMaterialGraph.h"
#include "PreviewJsonMaterials.h"
namespace CCC::Preview {
    // Confirmed preview limitations, scoped to exact authored materials. Do not infer
    // missing color from layer counts: most correctly rendered materials are layered.
    inline bool KnownIncompletePreviewMaterial(const std::string& path) {
        auto key=MaterialKey(path);if(key.starts_with("data/"))key.erase(0,5);
        if(!key.starts_with("materials/"))key="materials/"+key;
        // Backpack_Blender2/3 reference mask_2/3 DDS inputs and shared textile/paint
        // layers. Our base-color pipeline does not reconstruct those masked layers.
        return key=="materials/clothes/spacesuit_ecliptic/spacesuit_ecliptic_backpack.mat";
    }
    class MaterialDatabase {
        std::function<Bytes(const std::string&)> readMaterial;std::unordered_map<std::string,std::optional<MaterialAppearance>> jsonMaterials;
        std::unordered_map<std::string,MaterialAppearance> inheritedRecords;
        std::filesystem::path directory;bool loaded=false;std::unordered_map<std::string,MaterialAppearance> records,scopedRecords;std::string error;
        std::vector<std::filesystem::path> archives;std::unordered_set<std::string> visited,graphVisited;std::size_t databaseBytes=0,graphDatabaseBytes=0;bool graphOnly=false;
        void LoadArchive(const std::filesystem::path& path) {
            if(!(graphOnly?graphVisited:visited).insert(path.string()).second)return;
            try {
                constexpr std::size_t maxDatabase=128*1024*1024;
                std::ifstream f(path,std::ios::binary|std::ios::ate);if(!f)return;const auto size=std::uint64_t(f.tellg());f.seekg(0);
                std::array<std::uint8_t,68> header{};if(!f.read(reinterpret_cast<char*>(header.data()),header.size()))return;
                Reader r{header};if(r.Text(4)!="BTDX")return;const auto version=r.Read<std::uint32_t>();if(version<1||version>3||r.Text(4)!="GNRL")return;const auto count=r.Read<std::uint32_t>();
                const auto names=r.Read<std::uint64_t>();const auto headerSize=version==1?24u:version==2?32u:36u;
                if(!count||count>2000000||names>size||std::uint64_t(count)*36+headerSize>names)return;
                if(version==3){r.Skip(8);if(r.Read<std::uint32_t>()!=0)return;}
                std::vector<std::uint32_t> indices;f.seekg(names);
                for(std::uint32_t i=0;i<count;++i){std::uint16_t length=0;if(!f.read(reinterpret_cast<char*>(&length),2)||length>1024)return;std::string name(length,'\0');if(!f.read(name.data(),length))return;try{name=AssetKey(name);if(name.starts_with("materials/")&&name.ends_with(".cdb")&&indices.size()<16)indices.push_back(i);}catch(...){} }
                for(const auto index:indices){
                f.seekg(headerSize+std::uint64_t(index)*36+16);std::array<std::uint8_t,16> entry{};if(!f.read(reinterpret_cast<char*>(entry.data()),entry.size()))return;Reader record{entry};const auto offset=record.Read<std::uint64_t>();const auto packed=record.Read<std::uint32_t>()&0x3fffffff,raw=record.Read<std::uint32_t>()&0x3fffffff;
                if(!raw||raw>maxDatabase||packed>MaxAssetBytes||offset>names||(packed?packed:raw)>names-offset||names>size)return;
                if((graphOnly?graphDatabaseBytes:databaseBytes)+raw>256u*1024*1024)return;
                f.seekg(offset);Bytes bytes(packed?packed:raw);if(!f.read(reinterpret_cast<char*>(bytes.data()),bytes.size()))return;
                if(packed){Bytes out(raw);uLongf n=raw;if(uncompress(out.data(),&n,bytes.data(),bytes.size())!=Z_OK||n!=raw)return;bytes=std::move(out);}
                (graphOnly?graphDatabaseBytes:databaseBytes)+=bytes.size();Parse(bytes);
                }
            }catch(const std::exception& e){error=e.what();}catch(...){error="Material database is unsupported.";}
        }
        void LoadLoose(const std::filesystem::path& path){if(!(graphOnly?graphVisited:visited).insert(path.string()).second)return;try{if(!std::filesystem::is_regular_file(path))return;const auto size=std::filesystem::file_size(path);if(!size||size>128u*1024*1024||(graphOnly?graphDatabaseBytes:databaseBytes)+size>256u*1024*1024)return;std::ifstream f(path,std::ios::binary);Bytes bytes(size);if(f.read(reinterpret_cast<char*>(bytes.data()),bytes.size())){(graphOnly?graphDatabaseBytes:databaseBytes)+=size;Parse(bytes);}}catch(...){} }
        void Load(){loaded=true;LoadLoose(directory/"materials"/"materialsbeta.cdb");LoadArchive(directory/"Starfield - Materials.ba2");}
        void EnsureInheritance(){
            // Fully resolved previews keep the fast name reader. Build the shared
            // inheritance table once, on the first unresolved surface, and retain
            // only flattened appearances rather than the original CDB/object graph.
            const std::vector<std::string> sources(visited.begin(),visited.end());graphOnly=true;
            LoadLoose(directory/"materials"/"materialsbeta.cdb");LoadArchive(directory/"Starfield - Materials.ba2");
            for(const auto& source:sources){const std::filesystem::path path(source);if(path.extension()==".ba2")LoadArchive(path);else if(path.extension()==".cdb")LoadLoose(path);}
            graphOnly=false;
        }
    public:
        explicit MaterialDatabase(std::filesystem::path data,std::vector<std::filesystem::path> sources={},std::function<Bytes(const std::string&)> reader={}):directory(std::move(data)),archives(std::move(sources)),readMaterial(std::move(reader)){}
        void Parse(std::span<const std::uint8_t> bytes) {
            if(graphOnly){const auto inherited=ReadMaterialInheritance(bytes);for(const auto& [name,appearance]:inherited)inheritedRecords.insert_or_assign(name,appearance);return;}
            std::string active,activeMaterial,activePath,activeRoot;MaterialAppearance textureRecord;
            const auto flush=[&]{if(active.empty())return;auto& record=records[active];if(record.texture.empty())record.texture=textureRecord.texture;if(record.normal.empty())record.normal=textureRecord.normal;if(record.opacity.empty())record.opacity=textureRecord.opacity;if(record.ao.empty())record.ao=textureRecord.ao;if(record.roughness.empty())record.roughness=textureRecord.roughness;if(record.metal.empty())record.metal=textureRecord.metal;if(!record.constantColor&&textureRecord.constantColor){record.color=textureRecord.color;record.constantColor=true;}
                auto scoped=textureRecord;scoped.tint=record.tint;scoped.tinted=record.tinted;
                if(!activePath.empty())scopedRecords.try_emplace(activePath,scoped);
                const auto source=!scoped.texture.empty()?scoped.texture:!scoped.normal.empty()?scoped.normal:scoped.opacity;const auto slash=source.find_last_of('/');if(source.starts_with("textures/")&&slash!=source.npos){const auto key="materials/"+source.substr(9,slash+1-9)+active+".mat";scopedRecords.try_emplace(key,scoped);}
            };
            for(std::size_t at=0;at+16<=bytes.size();) {
                if(std::memcmp(bytes.data()+at,"DIFF",4)){++at;continue;}
                Reader r{bytes.subspan(at)};r.Skip(4);const auto size=r.Read<std::uint32_t>();
                if(size<8||size>65536||size>bytes.size()-at-8){at+=4;continue;}
                Reader field{bytes.subspan(at+8,size)};const auto id=field.Read<std::uint32_t>();const auto kind=field.Read<std::uint16_t>(),count=field.Read<std::uint16_t>();
                try {
                if(id==0x8b4&&kind==1&&count==1&&!activeRoot.empty())for(std::size_t offset=8;offset<=16&&offset+24<=field.bytes.size();++offset){Reader color{field.bytes,offset};std::array<float,4> rgba{};bool valid=true;for(unsigned c=0;c<4;++c){if(color.Read<std::uint16_t>()!=c){valid=false;break;}rgba[c]=color.Read<float>();if(!std::isfinite(rgba[c])||rgba[c]<0||rgba[c]>1){valid=false;break;}}if(valid){auto& record=records[activeRoot];record.color={rgba[0],rgba[1],rgba[2]};record.constantColor=true;break;}}

                if(id==0x3cc&&!active.empty()){auto& record=textureRecord;if(!record.constantColor)for(std::size_t offset=6;offset+24<=size;++offset){Reader color{field.bytes,offset};std::array<float,4> rgba{};bool valid=true;for(unsigned c=0;c<4;++c){if(color.Read<std::uint16_t>()!=c){valid=false;break;}rgba[c]=color.Read<float>();if(!std::isfinite(rgba[c])||rgba[c]<0||rgba[c]>1){valid=false;break;}}if(valid){record.color={rgba[0],rgba[1],rgba[2]};record.constantColor=true;break;}}}
                if(id==0x25a&&kind==0&&count==0&&size>=32&&!activeMaterial.empty()){std::array<float,3> color;bool valid=true;for(auto& c:color){c=field.Read<float>();field.Skip(2);if(!std::isfinite(c)||c<0||c>4)valid=false;}if(valid){for(auto& c:color)c=std::clamp(c,0.f,1.f);auto& record=records[activeMaterial];if(!record.tinted){record.tint=color;record.tinted=true;}}}
                if(id==0x1f4&&kind==0&&count&&count<=size-8){auto name=field.Text(count);name.resize(name.find('\0')==name.npos?name.size():name.find('\0'));
                    try{name=AssetKey(name);}catch(...){name.clear();}
                    flush();textureRecord={};activePath.clear();active.clear();activeMaterial.clear();activeRoot=MaterialName(name);const auto material=name.rfind("_material"),textures=name.rfind("_textureset");
                    if(material!=name.npos&&material>0)activeMaterial=MaterialName(name.substr(0,material));
                    if(textures!=name.npos&&textures>0){auto path=name.substr(0,textures);active=MaterialName(path);if(path.find('/')!=path.npos){if(path.starts_with("data/"))path.erase(0,5);if(!path.starts_with("materials/"))path="materials/"+path;activePath=path;}}
                }else if((id==0x38a||id==0xee8)&&kind==0&&count&&count<=size-8&&!active.empty()) {
                    auto key=field.Text(count);const auto end=key.find('\0');if(end!=key.npos)key.resize(end);
                    try{key=AssetKey(key);if(key.starts_with("data/"))key.erase(0,5);if(key.starts_with("textures/")){auto& record=textureRecord;if(key.ends_with("_normal.dds")){if(record.normal.empty())record.normal=key;}else if(key.ends_with("_rough.dds")){if(record.roughness.empty())record.roughness=key;}else if(key.ends_with("_metal.dds")){if(record.metal.empty())record.metal=key;}else if(key.ends_with("_ao.dds")){if(record.ao.empty())record.ao=key;}else if(key.ends_with("_opacity.dds")){if(record.opacity.empty())record.opacity=key;}else if(key.ends_with("_color.dds")||key.ends_with("_d.dds")||key.ends_with("_diffuse.dds")||key.ends_with("_albedo.dds")){if(record.texture.empty())record.texture=std::move(key);}}}catch(...){}
                }
                }catch(...){active.clear();activeMaterial.clear();}
                at+=8+size;
            }flush();
        }
        MaterialAppearance Find(const std::string& path) {if(!loaded)Load();const auto key=MaterialKey(path);
            if(readMaterial){auto canonical=key;if(canonical.starts_with("data/"))canonical.erase(0,5);auto found=jsonMaterials.find(canonical);if(found==jsonMaterials.end()){std::optional<MaterialAppearance> appearance;try{appearance=ReadJsonPreviewMaterial(readMaterial(canonical));}catch(...){}if(jsonMaterials.size()>=2048)jsonMaterials.clear();found=jsonMaterials.emplace(canonical,std::move(appearance)).first;}if(found->second)return *found->second;}
            for(const auto& archive:archives){auto stem=AssetKey(archive.filename().string());const auto dash=stem.find(" - ");if(dash!=stem.npos)stem.resize(dash);else if(stem.ends_with(".ba2"))stem.resize(stem.size()-4);if(!stem.empty()&&key.find("/"+stem+"/")!=key.npos){LoadLoose(directory/"materials"/"creations"/stem/"materialsbeta.cdb");LoadLoose(directory/"materials"/stem/"materialsbeta.cdb");LoadArchive(archive);}}
            auto scopedKey=key;if(scopedKey.starts_with("data/"))scopedKey.erase(0,5);if(!scopedKey.starts_with("materials/"))scopedKey="materials/"+scopedKey;
            const auto supplement=[&](MaterialAppearance fallback){
                // Resolve component ownership and inheritance for every material.
                // The flattened reader remains a fallback for unsupported databases.
                EnsureInheritance();auto inherited=inheritedRecords.find(scopedKey);
                if(inherited==inheritedRecords.end())inherited=inheritedRecords.find(MaterialName(scopedKey));
                return inherited==inheritedRecords.end()?fallback:inherited->second;
            };
            if(const auto scoped=scopedRecords.find(scopedKey);scoped!=scopedRecords.end())return supplement(scoped->second);
            // Akila's shared gloves use singular BaseGlove3.mat but the authored
            // DDS family is BaseGloves_03, with inherited TextureSet data.
            if(scopedKey=="materials/clothes/basegloves3/baseglove3.mat"){
                auto result=records["baseglove3"];const std::string source="textures/clothes/basegloves3/basegloves_03";
                if(result.texture.empty())result.texture=source+"_color.dds";
                if(result.normal.empty())result.normal=source+"_normal.dds";
                if(result.roughness.empty())result.roughness=source+"_rough.dds";
                if(result.ao.empty())result.ao=source+"_ao.dds";
                return result;
            }
            // Shared weapon materials use the authored AWP material directory and texture directory names.
            if(const auto at=scopedKey.find("/awp_master_shareable/");at!=scopedKey.npos){auto shared=scopedKey;shared.replace(at,22,"/awp_shareable/");if(const auto scoped=scopedRecords.find(shared);scoped!=scopedRecords.end())return scoped->second;}
            const auto name=MaterialName(key);const auto lookupName=name=="spacesuit_powerassistarmor_helmet"&&key.find("/sfbgs029/spacesuit_powerassistarmor/")!=key.npos?std::string("spacesuit_powerassistarmor"):name;auto it=records.find(lookupName);
            if(name=="spacesuit_constellation_helmet02"&&key.find("/clothes/spacesuit_constellation/")!=key.npos){const auto source=records.find("spacesuit_constellation_helmet");if(source!=records.end()&&!source->second.texture.empty())return source->second;}
            // The authored UC Navy torso material and TextureSet differ by an underscore.
            if(name=="outfit_uc_navy_base_torso"&&key.find("/clothes/outfit_uc_navy/")!=key.npos){const auto source=records.find("outfit_ucnavy_base_torso");if(source!=records.end()&&!source->second.texture.empty())return source->second;}
            const auto usable=[](const MaterialAppearance& record){return !record.texture.empty()||!record.normal.empty()||record.constantColor||record.tinted;};
            if((it==records.end()||!usable(it->second))&&key.find("/actors/moonjumper/")!=key.npos&&name.starts_with("mj_")){auto shared="sfbgs004_"+name.substr(3);if(shared=="sfbgs004_tire")shared+="01";const auto source=records.find(shared);if(source!=records.end()&&usable(source->second))return source->second;}
            if(it==records.end()||!usable(it->second)){for(const auto& archive:archives){LoadArchive(archive);it=records.find(lookupName);if(it!=records.end()&&usable(it->second))break;}}
            return supplement(it==records.end()?MaterialAppearance{}:it->second);}
        std::string Diagnostics(){if(!loaded)Load();return std::to_string(records.size())+" materials; "+error;}
    };
}
