#pragma once
#include "PreviewGeometry.h"
#include "PreviewMaterials.h"
#define BCDEC_BC4BC5_PRECISE
#define BCDEC_STATIC
#define BCDEC_IMPLEMENTATION
#include "../third_party/bcdec.h"

namespace CCC::Preview {
    // Bounded raw LZ4 block decoder for BA2 v3 texture chunks.
    inline Bytes ExpandLz4(std::span<const std::uint8_t> source,std::size_t size) {
        if(size>MaxAssetBytes)throw std::runtime_error("Texture chunk exceeds the preview limit.");
        Reader r{source};Bytes out;out.reserve(size);
        const auto length=[&](std::size_t n){if(n==15){std::uint8_t more;do{more=r.Read<std::uint8_t>();n+=more;if(n>size)throw std::runtime_error("Invalid texture run.");}while(more==255);}return n;};
        while(r.at<source.size()) {
            const auto token=r.Read<std::uint8_t>();const auto literals=length(token>>4);r.Need(literals);
            if(literals>size-out.size())throw std::runtime_error("Texture literal exceeds output.");
            out.insert(out.end(),source.begin()+r.at,source.begin()+r.at+literals);r.Skip(literals);
            if(r.at==source.size())break;
            const auto offset=r.Read<std::uint16_t>();const auto match=length(token&15)+4;
            if(!offset||offset>out.size()||match>size-out.size())throw std::runtime_error("Invalid texture match.");
            for(std::size_t i=0;i<match;++i)out.push_back(out[out.size()-offset]);
        }
        if(out.size()!=size)throw std::runtime_error("Texture chunk size mismatch.");return out;
    }
    struct TexturePixels {std::uint32_t width=0,height=0;Bytes pixels;};
    inline std::size_t TextureMipSize(unsigned width,unsigned height,unsigned format) {
        if(format==28||format==29)return std::size_t(width)*height*4;
        if(format==61)return std::size_t(width)*height;
        if(format!=71&&format!=72&&format!=74&&format!=75&&format!=77&&format!=78&&format!=80&&format!=83&&format!=84&&format!=98&&format!=99)throw std::runtime_error("Unsupported preview texture format.");
        return std::size_t((width+3)/4)*((height+3)/4)*((format==71||format==72||format==80)?8:16);
    }
    inline TexturePixels DecodeTexture(std::span<const std::uint8_t> source,unsigned width,unsigned height,unsigned format) {
        if(!width||!height||width>4096||height>4096||source.size()<TextureMipSize(width,height,format))throw std::runtime_error("Invalid preview texture dimensions.");
        TexturePixels out{width,height,Bytes(std::size_t(width)*height*4)};
        if(format==28||format==29){std::copy_n(source.begin(),out.pixels.size(),out.pixels.begin());return out;}
        if(format==61){for(std::size_t i=0;i<std::size_t(width)*height;++i){out.pixels[i*4]=out.pixels[i*4+1]=out.pixels[i*4+2]=source[i];out.pixels[i*4+3]=255;}return out;}
        const unsigned blockSize=(format==71||format==72||format==80)?8:16;std::size_t at=0;
        for(unsigned y=0;y<height;y+=4)for(unsigned x=0;x<width;x+=4) {
            alignas(8) std::array<std::uint8_t,16> compressed{};std::memcpy(compressed.data(),source.data()+at,blockSize);at+=blockSize;
            alignas(8) std::array<std::uint8_t,64> block{};
            if(format==71||format==72)bcdec_bc1(compressed.data(),block.data(),16);
            else if(format==74||format==75)bcdec_bc2(compressed.data(),block.data(),16);
            else if(format==77||format==78)bcdec_bc3(compressed.data(),block.data(),16);
            else if(format==80){std::array<std::uint8_t,16> values{};bcdec_bc4(compressed.data(),values.data(),4,0);for(unsigned i=0;i<16;++i){block[i*4]=block[i*4+1]=block[i*4+2]=values[i];block[i*4+3]=255;}}
            else if(format==83||format==84){std::array<std::uint8_t,32> values{};bcdec_bc5(compressed.data(),values.data(),8,format==84);for(unsigned i=0;i<16;++i){const float nx=format==84?std::max(-1.f,std::int8_t(values[i*2])/127.f):values[i*2]/127.5f-1,ny=format==84?std::max(-1.f,std::int8_t(values[i*2+1])/127.f):values[i*2+1]/127.5f-1;block[i*4]=std::uint8_t((nx*.5f+.5f)*255);block[i*4+1]=std::uint8_t((ny*.5f+.5f)*255);block[i*4+2]=std::uint8_t((std::sqrt(std::max(0.f,1-nx*nx-ny*ny))*.5f+.5f)*255);block[i*4+3]=255;}}
            else bcdec_bc7(compressed.data(),block.data(),16);
            for(unsigned j=0;j<4&&y+j<height;++j)for(unsigned i=0;i<4&&x+i<width;++i)std::copy_n(block.data()+(j*4+i)*4,4,out.pixels.data()+((y+j)*width+x+i)*4);
        }
        return out;
    }
    inline void ApplyOpacity(TexturePixels& image,const TexturePixels& opacity) {
        if(opacity.pixels.empty())return;
        for(unsigned y=0;y<image.height;++y)for(unsigned x=0;x<image.width;++x){const auto source=(std::size_t(y)*opacity.height/image.height*opacity.width+std::size_t(x)*opacity.width/image.width)*4;auto& alpha=image.pixels[(std::size_t(y)*image.width+x)*4+3];alpha=std::uint8_t(unsigned(alpha)*opacity.pixels[source]/255);}
    }
    inline bool OriginalPreviewTexture(const std::string& key) {
        // These replacements were explicitly excluded from CCC previews by the user.
        return key.starts_with("textures/clothes/outfit_baseball_cap_01/")||key=="textures/clothes/outfit_barrett/outfit_barrett_m/barrett_lodgeoutfit_upperbody_m_color.dds"||key=="textures/clothes/outfit_barrett/outfit_barrett_f/outfit_barrett_sleeves_lod0_f_color.dds"||key=="textures/clothes/outfit_barrett/outfit_barrett_f/outfit_barrett_pants_f_color.dds";
    }
    class TextureStore {
        struct Chunk {std::uint64_t offset;std::uint32_t packed,raw;std::uint16_t first,last;};
        struct Entry {std::filesystem::path archive;unsigned width,height,format,compression;std::vector<Chunk> chunks;};
        AssetStore& assets;MaterialDatabase materials;bool indexed=false;std::unordered_map<std::string,Entry> entries,originalEntries;std::unordered_map<std::string,TexturePixels> cache;
        void Index() {
            indexed=true;
            for(const auto& path:assets.textureArchives)try {
                std::ifstream f(path,std::ios::binary|std::ios::ate);if(!f)continue;const auto size=std::uint64_t(f.tellg());f.seekg(0);
                std::array<std::uint8_t,36> header{};if(!f.read(reinterpret_cast<char*>(header.data()),36))continue;
                Reader h{header};if(h.Text(4)!="BTDX")continue;const auto version=h.Read<std::uint32_t>();if(version<1||version>3||h.Text(4)!="DX10")continue;
                const auto count=h.Read<std::uint32_t>();const auto names=h.Read<std::uint64_t>();unsigned compression=0;if(version==3){h.Skip(8);compression=h.Read<std::uint32_t>();}f.seekg(version==1?24:version==2?32:36);
                if(count>200000||names>size||(compression!=0&&compression!=3))continue;
                std::vector<Entry> files;files.reserve(count);
                for(unsigned i=0;i<count;++i) {
                    std::array<std::uint8_t,24> raw{};if(!f.read(reinterpret_cast<char*>(raw.data()),24))throw std::runtime_error("Truncated texture table.");
                    Reader r{raw};r.Skip(13);const auto chunks=r.Read<std::uint8_t>();r.Skip(2);const auto height=r.Read<std::uint16_t>(),width=r.Read<std::uint16_t>();r.Skip(1);const auto format=r.Read<std::uint8_t>();
                    if(!chunks||chunks>32||width>16384||height>16384)throw std::runtime_error("Unsupported texture table.");
                    Entry e{path,width,height,format,compression,{}};
                    for(unsigned j=0;j<chunks;++j){if(!f.read(reinterpret_cast<char*>(raw.data()),24))throw std::runtime_error("Truncated texture chunks.");Reader c{raw};Chunk chunk{c.Read<std::uint64_t>(),c.Read<std::uint32_t>(),c.Read<std::uint32_t>(),c.Read<std::uint16_t>(),c.Read<std::uint16_t>()};e.chunks.push_back(chunk);}
                    files.push_back(std::move(e));
                }
                if(std::uint64_t(f.tellg())>names)continue;f.seekg(names);
                for(unsigned i=0;i<count;++i){std::uint16_t n=0;if(!f.read(reinterpret_cast<char*>(&n),2)||n>1024)break;std::string name(n,'\0');if(!f.read(name.data(),n))break;
                    try{name=AssetKey(name);}catch(...){continue;}
                    if(name.starts_with("textures/")&&name.ends_with(".dds")){if(OriginalPreviewTexture(name)&&AssetKey(path.filename().string()).starts_with("starfield - "))originalEntries.try_emplace(name,files[i]);entries.try_emplace(std::move(name),std::move(files[i]));}
                }
            }catch(...){} // One unsupported archive does not disable other textures.
        }
        TexturePixels Load(const std::string& key,unsigned limit) {
            const auto loose=assets.data/std::filesystem::path(key);bool original=false;if(OriginalPreviewTexture(key)){if(!indexed)Index();original=originalEntries.contains(key);}
            if(!original&&std::filesystem::is_regular_file(loose)) {
                const auto bytes=ReadRange(loose,0,std::filesystem::file_size(loose));Reader r{bytes};
                if(r.Read<std::uint32_t>()!=0x20534444||r.Read<std::uint32_t>()!=124)throw std::runtime_error("Unsupported DDS header.");
                r.Skip(4);unsigned height=r.Read<std::uint32_t>(),width=r.Read<std::uint32_t>();r.Skip(8);const auto mips=r.Read<std::uint32_t>();r.at=84;const auto fourcc=r.Read<std::uint32_t>();unsigned format=0;r.at=128;
                if(fourcc==0x30315844){format=r.Read<std::uint32_t>();r.Skip(16);}else if(fourcc==0x31545844)format=71;else if(fourcc==0x33545844)format=74;else if(fourcc==0x35545844)format=77;else throw std::runtime_error("Unsupported DDS format.");
                unsigned level=0;while((width>limit||height>limit)&&level+1<mips){r.Skip(TextureMipSize(width,height,format));width=std::max(1u,width/2);height=std::max(1u,height/2);++level;}
                return DecodeTexture(std::span(bytes).subspan(r.at),width,height,format);
            }
            if(!indexed)Index();const auto& selected=original?originalEntries:entries;const auto it=selected.find(key);if(it==selected.end())return {};
            const auto& e=it->second;unsigned wanted=0;while(std::max(e.width>>wanted,e.height>>wanted)>limit&&wanted<14)++wanted;
            for(const auto& c:e.chunks)if(c.first<=wanted&&c.last>=wanted&&c.last<16&&c.raw<=MaxAssetBytes) {
                auto bytes=ReadRange(e.archive,c.offset,c.packed?c.packed:c.raw);
                if(c.packed){if(e.compression==3)bytes=ExpandLz4(bytes,c.raw);else{Bytes decoded(c.raw);uLongf n=c.raw;if(uncompress(decoded.data(),&n,bytes.data(),bytes.size())!=Z_OK||n!=c.raw)throw std::runtime_error("Texture decompression failed.");bytes=std::move(decoded);}}
                std::size_t at=0;for(unsigned level=c.first;level<wanted;++level)at+=TextureMipSize(std::max(1u,e.width>>level),std::max(1u,e.height>>level),e.format);
                if(at>bytes.size())throw std::runtime_error("Truncated texture mip.");
                return DecodeTexture(std::span(bytes).subspan(at),std::max(1u,e.width>>wanted),std::max(1u,e.height>>wanted),e.format);
            }
            return {};
        }
    public:
        explicit TextureStore(AssetStore& source):assets(source),materials(source.data,[&]{std::vector<std::filesystem::path> paths;for(const auto& archive:source.archives)if(!AssetKey(archive.path.filename().string()).starts_with("starfield - "))paths.push_back(archive.path);return paths;}()){}
        std::string Diagnostics(){return materials.Diagnostics()+"; "+std::to_string(entries.size())+" color textures indexed";}
        void Apply(std::vector<Mesh>& meshes,unsigned quality=3) {
            std::unordered_set<std::string> materials;for(const auto& mesh:meshes)if(!mesh.mannequin&&!mesh.material.empty())materials.insert(mesh.material);unsigned limit=quality==1?512:quality==2?(materials.size()<=3?1024:512):quality==4?4096:(materials.size()<=2?2048:1024);
            unsigned normalLimit=std::min(limit,quality==1?256u:quality==2?512u:quality==4?4096u:1024u);
            const auto textureBudget=std::size_t(quality==4?192:quality==3?48:12)*1024*1024;
            // Reserve coverage for every material before choosing sharper mip levels.
            // Otherwise early normal maps starve later clothing pieces of color.
            while(limit>64&&materials.size()*4ull*(std::uint64_t(limit)*limit+std::uint64_t(normalLimit)*normalLimit)>textureBudget){limit/=2;if(normalLimit)normalLimit=std::min(normalLimit,limit);}

            std::size_t budget=0;std::unordered_set<std::string> used;
            for(auto& mesh:meshes)if(!mesh.mannequin&&!mesh.material.empty())try {
                if(MaterialName(mesh.material)=="decal_blank_off01"||MaterialName(mesh.material)=="glowbright_helmet01"){mesh.textureWidth=mesh.textureHeight=1;mesh.pixels={0,0,0,0};continue;}
                auto appearance=this->materials.Find(mesh.material);
                // NIFs can carry a color pass plus a coincident normal-only decal pass.
                // Merge the latter's mask/normal into the color pass rather than painting opaque cards.
                const auto materialKey=MaterialKey(mesh.material);
                const auto companion=materialKey.ends_with("_color.mat")?materialKey.substr(0,materialKey.size()-10)+".mat":materialKey.substr(0,materialKey.size()-4)+"_color.mat";
                const auto paired=std::find_if(meshes.begin(),meshes.end(),[&](const Mesh& other){return &other!=&mesh&&!other.material.empty()&&MaterialKey(other.material)==companion&&other.positions==mesh.positions&&other.indices==mesh.indices&&other.uv==mesh.uv;});
                if(paired!=meshes.end()){mesh.decal=true;
                    if(materialKey.ends_with("_color.mat")){const auto surface=this->materials.Find(paired->material);if(appearance.opacity.empty())appearance.opacity=surface.opacity;if(appearance.normal.empty())appearance.normal=surface.normal;}
                    else if(appearance.texture.empty()&&!appearance.normal.empty()&&!this->materials.Find(paired->material).texture.empty()){mesh.textureWidth=mesh.textureHeight=1;mesh.pixels={0,0,0,0};continue;}
                }
                mesh.glass=MaterialName(mesh.material).find("_visor")!=std::string::npos||MaterialName(mesh.material).find("glass")!=std::string::npos;mesh.tint=appearance.tint;mesh.tinted=appearance.tinted;
                if(mesh.uv.size()!=mesh.positions.size()/3*2){if(appearance.constantColor){mesh.tint=appearance.color;mesh.tinted=true;}continue;}
                auto key=MaterialKey(mesh.material);if(key.starts_with("data/"))key.erase(0,5);if(!key.starts_with("materials/")||!key.ends_with(".mat"))continue;
                key="textures/"+key.substr(10,key.size()-14)+"_color.dds";
                std::vector<std::string> candidates{key};const auto base=key.rfind("_base_color.dds");if(base!=key.npos)candidates.push_back(key.substr(0,base)+"_color.dds");
                if(!appearance.texture.empty())candidates.insert(candidates.begin(),appearance.texture);
                candidates.push_back(key.substr(0,key.size()-10)+"_1001_color.dds");
                for(const auto& candidate:candidates)try{const auto cacheKey=std::to_string(limit)+":"+candidate+":"+appearance.opacity+":"+appearance.ao;auto it=cache.find(cacheKey);if(it==cache.end()){std::size_t held=0;for(const auto& item:cache)held+=item.second.pixels.size();if(cache.size()>128||held>60*1024*1024)cache.clear();auto decoded=Load(candidate,limit);if(!decoded.pixels.empty()&&!appearance.opacity.empty())try{ApplyOpacity(decoded,Load(appearance.opacity,limit));}catch(...){}if(!decoded.pixels.empty()&&!appearance.ao.empty())try{const auto ao=Load(appearance.ao,limit);if(!ao.pixels.empty())for(unsigned y=0;y<decoded.height;++y)for(unsigned x=0;x<decoded.width;++x){const float shade=.35f+.65f*ao.pixels[(std::size_t(y)*ao.height/decoded.height*ao.width+std::size_t(x)*ao.width/decoded.width)*4]/255.f;for(unsigned c=0;c<3;++c)decoded.pixels[(std::size_t(y)*decoded.width+x)*4+c]=std::uint8_t(decoded.pixels[(std::size_t(y)*decoded.width+x)*4+c]*shade);}}catch(...){}it=cache.emplace(cacheKey,std::move(decoded)).first;}
                    const auto& image=it->second;if(image.pixels.empty())continue;
                    if(!used.contains(candidate)){if(budget+image.pixels.size()>(quality==4?192u:quality==3?48u:12u)*1024*1024)continue;budget+=image.pixels.size();used.insert(candidate);}
                    mesh.textureWidth=image.width;mesh.textureHeight=image.height;mesh.pixels=image.pixels;break;
                }catch(...){} // An unsupported override must not prevent trying other color sources.
                if(mesh.pixels.empty()&&!appearance.constantColor&&!appearance.normal.empty()&&!appearance.opacity.empty()&&MaterialName(mesh.material).find("decal")!=std::string::npos){
                    // This authored overlay changes surface normals, not albedo.
                    // Carry its opacity mask; the renderer preserves the base color.
                    const auto mask=Load(appearance.opacity,limit);if(!mask.pixels.empty()){mesh.normalOnly=true;mesh.decal=true;mesh.textureWidth=mask.width;mesh.textureHeight=mask.height;mesh.pixels.resize(mask.pixels.size());for(std::size_t i=0;i<mesh.pixels.size();i+=4){mesh.pixels[i]=mesh.pixels[i+1]=mesh.pixels[i+2]=255;mesh.pixels[i+3]=mask.pixels[i];}}
                }
                // Only confirmed material limitations or declared color failures override a loaded base texture.
                mesh.incompleteMaterial=KnownIncompletePreviewMaterial(mesh.material)||(!appearance.texture.empty()&&mesh.pixels.empty());
                if(mesh.pixels.empty()&&appearance.constantColor){TexturePixels mask;if(!appearance.opacity.empty())try{mask=Load(appearance.opacity,limit);}catch(...){}mesh.textureWidth=mask.width?mask.width:1;mesh.textureHeight=mask.height?mask.height:1;mesh.pixels.resize(std::size_t(mesh.textureWidth)*mesh.textureHeight*4);for(std::size_t i=0;i<mesh.pixels.size();i+=4){for(unsigned c=0;c<3;++c)mesh.pixels[i+c]=std::uint8_t(appearance.color[c]*255);mesh.pixels[i+3]=mask.pixels.empty()?255:mask.pixels[i];}}
                // Zero is an unused/default tint in these textured materials, not black dye.
                if(!mesh.pixels.empty()&&mesh.tint==std::array<float,3>{0,0,0})mesh.tinted=false;
                if(mesh.glass){if(mesh.pixels.empty()){mesh.textureWidth=mesh.textureHeight=1;mesh.pixels={100,125,140,90};}else for(std::size_t i=3;i<mesh.pixels.size();i+=4)mesh.pixels[i]=std::min<std::uint8_t>(mesh.pixels[i],90);}
                if(!appearance.normal.empty())try{std::size_t held=0;for(const auto& item:cache)held+=item.second.pixels.size();if(held>60u*1024*1024)cache.clear();const auto normalKey="normal:"+std::to_string(quality)+":"+std::to_string(normalLimit)+":"+appearance.normal;auto normal=cache.find(normalKey);if(normal==cache.end()){auto decoded=Load(appearance.normal,normalLimit);{TexturePixels rough;if(!appearance.roughness.empty())try{rough=Load(appearance.roughness,normalLimit);}catch(...){}for(unsigned y=0;y<decoded.height;++y)for(unsigned x=0;x<decoded.width;++x)decoded.pixels[(std::size_t(y)*decoded.width+x)*4+3]=rough.pixels.empty()?166:rough.pixels[(std::size_t(y)*rough.height/decoded.height*rough.width+std::size_t(x)*rough.width/decoded.width)*4];}normal=cache.emplace(normalKey,std::move(decoded)).first;}const auto& image=normal->second;if(!image.pixels.empty()&&(used.contains(normalKey)||budget+image.pixels.size()<(quality==4?192u:48u)*1024*1024)){if(used.insert(normalKey).second)budget+=image.pixels.size();mesh.normalWidth=image.width;mesh.normalHeight=image.height;mesh.normalPixels=image.pixels;}}catch(...){}
                if(mesh.normalOnly&&mesh.normalPixels.empty())mesh.incompleteMaterial=true;
            }catch(...){} // Shaded geometry remains available if its texture is unsupported.
        }
    };
}
