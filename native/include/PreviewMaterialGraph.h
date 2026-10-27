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
        const auto blender=classId("BSMaterial::BlenderID"),uvStream=classId("BSMaterial::UVStreamID"),scale=classId("BSMaterial::Scale"),shaderModel=classId("BSMaterial::ShaderModelComponent"),blendMode=classId("BSMaterial::BlendModeComponent"),tintMode=classId("BSMaterial::MaterialOverrideColorTypeComponent"),floatParam=classId("BSMaterial::MaterialParamFloat"),boolParam=classId("BSMaterial::ParamBool");
        const auto alphaSettings=classId("BSMaterial::AlphaSettingsComponent");
        Reader list{components};std::size_t at=dataStart;
        while(list.at<components.size()){const auto id=list.Read<std::uint32_t>();const auto index=list.Read<std::uint16_t>(),type=list.Read<std::uint16_t>();const auto t=types.find(type);const auto node=nodes.find(id);if(t==types.end()||node==nodes.end())return {};
            // Composite components own following nested chunks. Their child class
            // IDs differ from the next indexed component; stay on chunk boundaries.
            while(at<chunks.size()){const auto& c=chunks[at];if(c.data.size()>=4){Reader r{c.data};if(r.Read<std::uint32_t>()==t->second)break;}++at;}
            if(at==chunks.size())return {};const auto& c=chunks[at++];
            if(t->second==ctName||t->second==layer||t->second==material||t->second==textureSet||t->second==file||t->second==replacement||t->second==color||t->second==blender||t->second==uvStream||t->second==scale||t->second==shaderModel||t->second==blendMode||t->second==tintMode||t->second==floatParam||t->second==boolParam||t->second==alphaSettings)node->second.fields.push_back({t->second,index,c});}
        if(at!=chunks.size())return {};
        const auto field=[&](std::uint32_t id,std::uint32_t type,unsigned index)->const Field*{for(unsigned depth=0;id&&depth<32;++depth){const auto n=nodes.find(id);if(n==nodes.end())return nullptr;for(const auto& f:n->second.fields)if(f.type==type&&f.index==index)return &f;id=n->second.parent;}return nullptr;};
        const auto link=[&](std::uint32_t id,std::uint32_t type,unsigned index=0){const auto f=field(id,type,index);if(!f)return 0u;Reader r{f->chunk.data};r.Skip(f->chunk.tag=="DIFF"?8:4);return r.Read<std::uint32_t>();};
        const auto text=[&](const Field* f){if(!f)return std::string{};Reader r{f->chunk.data};r.Skip(f->chunk.tag=="DIFF"?6:4);const auto n=r.Read<std::uint16_t>();auto value=r.Text(n);if(auto end=value.find('\0');end!=value.npos)value.resize(end);return value;};
        const auto rgba=[](const Field* f)->std::optional<std::array<float,4>>{if(!f)return {};for(std::size_t at=4;at<20&&at+24<=f->chunk.data.size();++at){Reader r{f->chunk.data,at};std::array<float,4> color{};bool valid=true;for(unsigned i=0;i<4;++i){if(r.Read<std::uint16_t>()!=i){valid=false;break;}color[i]=r.Read<float>();if(!std::isfinite(color[i])||color[i]<0||color[i]>1){valid=false;break;}}if(valid)return color;}return {};};
        for(const auto& [id,node]:nodes){const auto rootName=std::find_if(node.fields.begin(),node.fields.end(),[&](const Field& f){return f.type==ctName;});if(rootName==node.fields.end())continue;auto l=link(id,layer);if(!l)continue;auto m=link(l,material),t=link(m,textureSet);if(!m||!t)continue;
            // Effect templates can leave layer zero empty and author their only
            // visible surface in another layer. Resolve that sole surface.
            const auto hasSurface=[&](std::uint32_t mat,std::uint32_t set){if(field(mat,color,0))return true;for(unsigned slot=0;slot<8;++slot)if(field(set,replacement,slot)||!text(field(set,file,slot)).empty())return true;return false;};
            if(!hasSurface(m,t)){unsigned candidates=0;std::uint32_t nextL=0,nextM=0,nextT=0;for(unsigned index=1;index<4;++index){const auto cl=link(id,layer,index),cm=link(cl,material),ct=link(cm,textureSet);if(cm&&ct&&hasSurface(cm,ct)){++candidates;nextL=cl;nextM=cm;nextT=ct;}}if(candidates==1){l=nextL;m=nextM;t=nextT;}}
            auto key=text(&*rootName);try{key=MaterialKey(key);if(key.starts_with("data/"))key.erase(0,5);}catch(...){continue;}MaterialAppearance appearance;appearance.authored=true;appearance.tintMultiply=text(field(m,tintMode,0))=="Multiply";
            const auto shader=text(field(id,shaderModel,0));appearance.glass=shader.find("Glass")!=std::string::npos;appearance.decal=shader.find("Decal")!=std::string::npos;
            // AlphaSettings DIFF fields are ordered: HasOpacity(bool), threshold
            // (float), source layer(byte), Blender(struct), dither(bool). Resolve
            // each leading property independently through component inheritance.
            std::optional<bool> hasOpacity;std::optional<float> threshold;
            for(std::uint32_t current=id,depth=0;current&&depth<32;++depth){const auto n=nodes.find(current);if(n==nodes.end())break;
                for(const auto& f:n->second.fields)if(f.type==alphaSettings&&f.index==0&&f.chunk.tag=="DIFF")try{Reader r{f.chunk.data};r.Skip(4);while(r.at+2<=r.bytes.size()){const auto property=r.Read<std::uint16_t>();if(property==0){const auto v=r.Read<std::uint8_t>();if(v>1)break;if(!hasOpacity)hasOpacity=v!=0;}else if(property==1){const auto v=r.Float();if(!threshold&&std::isfinite(v)&&v>=0&&v<=1)threshold=v;}else break;}}catch(...){}
                if(hasOpacity&&threshold)break;current=n->second.parent;
            }
            if(!shader.empty()&&shader.find("Effect")==std::string::npos&&!appearance.glass){appearance.opacityMode=hasOpacity.value_or(false)?2:1;appearance.alphaThreshold=threshold.value_or(.5f);}
            if(auto tint=rgba(field(m,color,0))){appearance.tint={(*tint)[0],(*tint)[1],(*tint)[2]};appearance.tintWeight=(*tint)[3];appearance.tinted=true;}
            for(unsigned slot=0;slot<8;++slot){std::optional<bool> constant;std::optional<std::array<float,4>> replacementColor;
                // DIFF can override only the replacement color and inherit its
                // enabled flag. Resolve those two fields independently.
                for(std::uint32_t current=t,depth=0;current&&depth<32;++depth){const auto node=nodes.find(current);if(node==nodes.end())break;const auto replace=std::find_if(node->second.fields.begin(),node->second.fields.end(),[&](const Field& f){return f.type==replacement&&f.index==slot;});
                    if(replace!=node->second.fields.end()){if(!replacementColor)replacementColor=rgba(&*replace);if(!constant&&replace->chunk.tag=="DIFF"&&replace->chunk.data.size()>=7){Reader r{replace->chunk.data};r.Skip(4);if(r.Read<std::uint16_t>()==0)constant=r.Read<std::uint8_t>()==1;}}
                    if(constant&&replacementColor)break;current=node->second.parent;}
                if(constant.value_or(false)){if(slot==0&&replacementColor){appearance.color={(*replacementColor)[0],(*replacementColor)[1],(*replacementColor)[2]};appearance.constantColor=true;}if(slot==2&&replacementColor)appearance.constantOpacity=(*replacementColor)[0];if(slot==3&&replacementColor)appearance.constantRoughness=(*replacementColor)[0];if(slot==4)appearance.constantMetal=replacementColor?(*replacementColor)[0]:0.f;if(slot==5)appearance.constantAO=replacementColor?(*replacementColor)[0]:1.f;continue;}
                auto path=text(field(t,file,slot));try{path=MaterialKey(path);if(path.starts_with("data/"))path.erase(0,5);if(!path.starts_with("textures/")||!path.ends_with(".dds"))continue;}catch(...){continue;}
                if(slot==7)appearance.emissive=path;else if(path.ends_with("_metal.dds"))appearance.metal=path;else if(path.ends_with("_ao.dds"))appearance.ao=path;else if(slot==0)appearance.texture=path;else if(slot==1)appearance.normal=path;else if(slot==2)appearance.opacity=path;else if(slot==3)appearance.roughness=path;else if(slot==4)appearance.metal=path;else if(slot==5)appearance.ao=path;}
            if(appearance.opacityMode==1){appearance.opacity.clear();appearance.constantOpacity=1;}
            if(appearance.glass){
                // Glass templates can carry a constant replacement color while a
                // distant parent still lists a metal albedo. Preserve that color.
                for(std::uint32_t current=t,depth=0;current&&depth<32;++depth){const auto n=nodes.find(current);if(n==nodes.end())break;const auto f=std::find_if(n->second.fields.begin(),n->second.fields.end(),[&](const Field& f){return f.type==replacement&&f.index==0;});
                    if(f!=n->second.fields.end())if(auto c=rgba(&*f)){for(unsigned channel=0;channel<3;++channel)appearance.color[channel]=(*c)[channel]*(1-appearance.tintWeight)+appearance.tint[channel]*appearance.tintWeight;appearance.texture.clear();appearance.constantColor=true;appearance.tinted=false;break;}current=n->second.parent;}
            }
            const auto mode=text(field(link(id,blender),blendMode,0));
            const bool character=mode=="CharacterCombine",dirt=mode=="PositionContrast";
            if(character||dirt||mode=="Linear")for(unsigned index=1;index<4;++index){
                const auto layerId=link(id,layer,index),materialId=link(layerId,material),setId=link(materialId,textureSet),blendId=link(id,blender,index-1);if(!layerId||!materialId||!setId||!blendId)continue;
                const auto safePath=[&](const Field* f){auto path=text(f);try{path=MaterialKey(path);if(path.starts_with("data/"))path.erase(0,5);if(path.starts_with("textures/")&&path.ends_with(".dds"))return path;}catch(...){}return std::string{};};
                const auto layerMode=text(field(blendId,blendMode,0));if(layerMode!="CharacterCombine"&&layerMode!="PositionContrast"&&layerMode!="Linear")continue;
                MaterialOverlay overlay;overlay.mask=safePath(field(blendId,file,0));overlay.texture=safePath(field(setId,file,0));overlay.normal=safePath(field(setId,file,1));overlay.roughness=safePath(field(setId,file,3));overlay.multiply=layerMode=="CharacterCombine";overlay.positionContrast=layerMode=="PositionContrast";
                if(auto tint=rgba(field(materialId,color,0))){for(unsigned c=0;c<3;++c)overlay.tint[c]=(*tint)[c];overlay.tintWeight=(*tint)[3];}
                overlay.tintMultiply=text(field(materialId,tintMode,0))=="Multiply";
                const auto number=[&](unsigned index,float fallback){const auto f=field(blendId,floatParam,index);if(!f)return fallback;try{Reader r{f->chunk.data};r.Skip(f->chunk.tag=="DIFF"?6:4);const auto v=r.Float();return std::isfinite(v)&&v>=0&&v<=1?v:fallback;}catch(...){return fallback;}};
                const auto boolean=[&](unsigned index,bool fallback){const auto f=field(blendId,boolParam,index);if(!f)return fallback;try{Reader r{f->chunk.data};r.Skip(f->chunk.tag=="DIFF"?6:4);return r.Read<std::uint8_t>()!=0;}catch(...){return fallback;}};
                overlay.position=number(2,.5f);overlay.contrast=1-number(3,0);overlay.intensity=number(4,1);overlay.blendColor=boolean(0,true);overlay.blendRoughness=boolean(2,true);overlay.blendNormal=boolean(3,true);overlay.addNormals=boolean(4,true);overlay.needsVertexColor=boolean(5,false);overlay.needsDetailMask=boolean(7,false);
                const auto uv=link(layerId,uvStream);if(const auto f=field(uv,scale,0))try{Reader r{f->chunk.data};r.Skip(f->chunk.tag=="DIFF"?6:4);for(unsigned c=0;c<2;++c){if(r.Read<std::uint16_t>()!=c)break;const auto v=r.Float();if(v>0&&v<=128)overlay.scale[c]=v;}}catch(...){}
                if(!overlay.mask.empty()&&(!overlay.texture.empty()||!overlay.normal.empty()))appearance.overlays.push_back(std::move(overlay));
            }
            if((!appearance.texture.empty()||appearance.constantColor||appearance.tinted||!appearance.normal.empty()||!appearance.opacity.empty())&&!ambiguous.contains(key)){
                const auto old=result.find(key);if(old!=result.end()&&(old->second.texture!=appearance.texture||old->second.normal!=appearance.normal||old->second.constantColor!=appearance.constantColor||old->second.color!=appearance.color||old->second.tint!=appearance.tint)){result.erase(old);ambiguous.insert(key);}else result.try_emplace(key,std::move(appearance));}}
    }catch(...){return {};}
    return result;
}
}
