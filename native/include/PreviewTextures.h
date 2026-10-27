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
    // Keep recently used shared atlases instead of clearing every decoded map
    // when one 4K RGBA image exceeds the old 60 MiB cache threshold.
    class TextureCache {
        using Map=std::unordered_map<std::string,TexturePixels>;
        Map images;std::unordered_map<std::string,std::uint64_t> ages;
        std::size_t held=0,budget;std::uint64_t clock=0;
        void Evict(){
            const auto oldest=std::min_element(ages.begin(),ages.end(),[](const auto& a,const auto& b){return a.second<b.second;});
            if(oldest==ages.end())return;
            const auto image=images.find(oldest->first);held-=image->second.pixels.size();images.erase(image);ages.erase(oldest);++evictions;
        }
    public:
        std::uint64_t hits=0,misses=0,evictions=0;
        explicit TextureCache(std::size_t limit=64u*1024*1024):budget(limit){}
        void SetBudget(std::size_t limit){budget=limit;while(held>budget&&!images.empty())Evict();}
        auto find(const std::string& key){auto it=images.find(key);if(it!=images.end()){ages[key]=++clock;++hits;}else ++misses;return it;}
        auto end(){return images.end();}
        std::size_t BytesHeld()const{return held;}
        auto emplace(const std::string& key,TexturePixels image){
            if(const auto found=images.find(key);found!=images.end()){ages[key]=++clock;return std::pair{found,false};}
            const auto size=image.pixels.size();if(size>budget)throw std::runtime_error("Decoded preview texture exceeds the cache budget.");
            while(!images.empty()&&(held+size>budget||images.size()>=128))Evict();
            auto result=images.emplace(key,std::move(image));held+=size;ages[key]=++clock;return result;
        }
    };
    inline void ApplyAuthoredOpacity(Bytes& pixels,const MaterialAppearance& appearance){
        if(!appearance.authored)return;
        for(std::size_t i=3;i<pixels.size();i+=4){
            if(appearance.opacityMode==1)pixels[i]=255;
            else if(appearance.opacityMode==2){const auto alpha=appearance.constantOpacity>=0?appearance.constantOpacity:pixels[i]/255.f;pixels[i]=alpha>0&&alpha>=appearance.alphaThreshold?255:0;}
        }
    }
    inline void ApplyAuthoredTint(Mesh& mesh,const MaterialAppearance& appearance){
        if(!appearance.authored||!mesh.tinted||mesh.causticEffect||mesh.flowingLiquid)return;
        const auto weight=std::clamp(appearance.tintWeight,0.f,1.f);
        // Preserve the existing base-color modulation convention. A tint's
        // weight controls its contribution; it must not replace textured detail.
        if(!mesh.pixels.empty())for(std::size_t i=0;i<mesh.pixels.size();i+=4)for(unsigned c=0;c<3;++c){const auto base=mesh.pixels[i+c]/255.f;const auto tinted=base*appearance.tint[c];mesh.pixels[i+c]=std::uint8_t(std::clamp(base*(1-weight)+tinted*weight,0.f,1.f)*255+.5f);}
        else for(unsigned c=0;c<3;++c)mesh.tint[c]=(appearance.constantColor?appearance.color[c]:1.f)*(1-weight)+appearance.tint[c]*weight;
        if(!mesh.pixels.empty())mesh.tinted=false;
    }
    inline bool OpaqueFoodSurface(const std::string& material){
        // The jerky and clear wrapper share an atlas; only the meat writes opaque depth.
        return MaterialKey(material)=="materials/items/fooddrink_singleitems/all_crafted_consumables/alienjerky.mat";
    }
    inline void RestoreOpaqueFoodAlpha(TexturePixels& image,const std::string& material){
        if(OpaqueFoodSurface(material))for(std::size_t i=3;i<image.pixels.size();i+=4)image.pixels[i]=255;
    }
    inline float PreviewLayerWeight(float mask,const MaterialOverlay& layer){
        float value=mask*layer.intensity;
        if(layer.positionContrast){const float x=(layer.position-.5f)*3.17f,center=.5f+x*(1+x*x),width=std::max(.001f,layer.contrast*std::min(layer.position,1-layer.position));value=(value-center+width)/(2*width);}
        return std::clamp(value,0.f,1.f);
    }
    inline void CompositePreviewLayer(Mesh& mesh,const MaterialOverlay& layer,const TexturePixels& mask,const TexturePixels& color,const TexturePixels& normal,const TexturePixels& rough){
        if(mesh.pixels.empty()||mask.pixels.empty())return;
        const auto sample=[](const TexturePixels& image,float u,float v,unsigned channel){u-=std::floor(u);v-=std::floor(v);return image.pixels[(std::size_t(std::min(unsigned(v*image.height),image.height-1))*image.width+std::min(unsigned(u*image.width),image.width-1))*4+channel]/255.f;};
        for(unsigned y=0;y<mesh.textureHeight;++y)for(unsigned x=0;x<mesh.textureWidth;++x){const float u=(x+.5f)/mesh.textureWidth,v=(y+.5f)/mesh.textureHeight,w=PreviewLayerWeight(sample(mask,u,v,0),layer);if(w<=0)continue;const auto at=(std::size_t(y)*mesh.textureWidth+x)*4;
            if(layer.blendColor&&!color.pixels.empty())for(unsigned c=0;c<3;++c){const float base=mesh.pixels[at+c]/255.f,source=sample(color,u*layer.scale[0],v*layer.scale[1],c);const float detail=layer.tintMultiply?source*layer.tint[c]:source*(1-layer.tintWeight)+layer.tint[c]*layer.tintWeight;const float mixed=base*(1-w)+(layer.multiply?2*base*detail:detail)*w;mesh.pixels[at+c]=std::uint8_t(std::clamp(mixed,0.f,1.f)*255+.5f);}
        }
        // Normal-map alpha carries roughness. Color opacity remains untouched.
        for(unsigned y=0;y<mesh.normalHeight;++y)for(unsigned x=0;x<mesh.normalWidth;++x){const float u=(x+.5f)/mesh.normalWidth,v=(y+.5f)/mesh.normalHeight,w=PreviewLayerWeight(sample(mask,u,v,0),layer);const auto at=(std::size_t(y)*mesh.normalWidth+x)*4;
            if(layer.blendNormal&&!normal.pixels.empty()){float xy[2];for(unsigned c=0;c<2;++c){const float base=mesh.normalPixels[at+c]/127.5f-1,detail=sample(normal,u*layer.scale[0],v*layer.scale[1],c)*2-1;xy[c]=layer.addNormals?base+detail*w:base*(1-w)+detail*w;}const float length=std::hypot(xy[0],xy[1]);if(length>.999f)for(auto& c:xy)c*=.999f/length;for(unsigned c=0;c<2;++c)mesh.normalPixels[at+c]=std::uint8_t((xy[c]+1)*127.5f);mesh.normalPixels[at+2]=std::uint8_t(std::sqrt(std::max(0.f,1-xy[0]*xy[0]-xy[1]*xy[1]))*255);}
            if(layer.blendRoughness&&!rough.pixels.empty()){const float base=mesh.normalPixels[at+3]/255.f,detail=sample(rough,u*layer.scale[0],v*layer.scale[1],0);mesh.normalPixels[at+3]=std::uint8_t(std::clamp(base*(1-w)+(layer.multiply?2*base*detail:detail)*w,0.f,1.f)*255+.5f);}
        }
    }
    inline void RestoreOpaqueWeaponAlpha(TexturePixels& image,const std::string& material){
        const auto key=MaterialKey(material);
        const std::string family="materials/weapons/dlc001/particlemachinegun/";
        if((key!=family+"particlemachinegun_parts.mat"&&key!=family+"particlemachinegun_barrelframe.mat"&&key!=family+"particlemachinegun_receiver.mat"&&key!=family+"particlemachinegun_receiverframe.mat"&&key!=family+"particlemachinegun_standardgrip.mat")||image.pixels.empty())return;
        // These five reported opaque weapon surfaces list wholly clear opacity maps.
        // Restore only an entirely clear result; partial masks and other assets remain unchanged.
        for(std::size_t i=3;i<image.pixels.size();i+=4)if(image.pixels[i]!=0)return;
        for(std::size_t i=3;i<image.pixels.size();i+=4)image.pixels[i]=255;
    }

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
        AssetStore& assets;MaterialDatabase materials;bool indexed=false;std::unordered_map<std::string,Entry> entries,originalEntries;TextureCache cache;
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
        explicit TextureStore(AssetStore& source):assets(source),materials(source.data,[&]{std::vector<std::filesystem::path> paths;for(const auto& archive:source.archives)if(!AssetKey(archive.path.filename().string()).starts_with("starfield - "))paths.push_back(archive.path);return paths;}(),[&source](const std::string& path){return source.Read(path);}){}
        std::string Diagnostics(){return materials.Diagnostics()+"; "+std::to_string(entries.size())+" color textures indexed; cache hits="+std::to_string(cache.hits)+" misses="+std::to_string(cache.misses)+" evictions="+std::to_string(cache.evictions);}
        void Apply(std::vector<Mesh>& meshes,unsigned quality=3) {
            const bool colorOnly=quality==0;cache.SetBudget(std::size_t(quality==4?256:64)*1024*1024);
            std::unordered_set<std::string> materials;for(const auto& mesh:meshes)if(!mesh.mannequin&&!mesh.material.empty())materials.insert(mesh.material);unsigned limit=colorOnly?128:quality==1?512:quality==2?(materials.size()<=3?1024:512):quality==4?4096:(materials.size()<=2?2048:1024);
            unsigned normalLimit=std::min(limit,quality==1?256u:quality==2?512u:quality==4?(materials.size()<=1?4096u:2048u):1024u);
            const auto textureBudget=std::size_t(colorOnly?2:quality==4?192:quality==3?48:12)*1024*1024;
            // Reserve coverage for every material before choosing sharper mip levels.
            // Otherwise early normal maps starve later clothing pieces of color.
            while(limit>64&&materials.size()*4ull*(std::uint64_t(limit)*limit+std::uint64_t(normalLimit)*normalLimit)>textureBudget){limit/=2;if(normalLimit)normalLimit=std::min(normalLimit,limit);}

            std::size_t budget=0;std::unordered_set<std::string> used;
            for(auto& mesh:meshes)if(!mesh.mannequin&&!mesh.material.empty())try {
                if(MaterialName(mesh.material)=="decal_blank_off01"||MaterialName(mesh.material)=="glowbright_helmet01"){mesh.textureWidth=mesh.textureHeight=1;mesh.pixels={0,0,0,0};continue;}
                auto appearance=this->materials.Find(mesh.material);
                // First supported animated effect: authored soft-additive caustics.
                // The viewer approximates idle motion; it does not run the game's bind graph.
                mesh.causticEffect=MaterialKey(mesh.material)=="materials/setdressing/animated/watercaustic01_idleanimloop.mat";
                if(mesh.causticEffect){mesh.tint={.031693f,.443748f,.290669f};mesh.tinted=true;}
                // The shared inhaler family uses emissive-only liquid surfaces.
                mesh.flowingLiquid=MaterialKey(mesh.material).find("/inhailers/")!=std::string::npos&&appearance.texture.empty()&&!appearance.emissive.empty()&&appearance.tinted&&!appearance.glass;
                if(mesh.flowingLiquid){appearance.texture=appearance.emissive;appearance.opacity.clear();appearance.normal.clear();}
                if(colorOnly&&appearance.texture.empty()&&!appearance.constantColor&&!appearance.normal.empty()&&appearance.decal){mesh.textureWidth=mesh.textureHeight=1;mesh.pixels={0,0,0,0};continue;}
                // NIFs can carry a color pass plus a coincident normal-only decal pass.
                // Merge the latter's mask/normal into the color pass rather than painting opaque cards.
                const auto materialKey=MaterialKey(mesh.material);
                const auto companion=materialKey.ends_with("_color.mat")?materialKey.substr(0,materialKey.size()-10)+".mat":materialKey.substr(0,materialKey.size()-4)+"_color.mat";
                const auto paired=std::find_if(meshes.begin(),meshes.end(),[&](const Mesh& other){return &other!=&mesh&&!other.material.empty()&&MaterialKey(other.material)==companion&&other.positions==mesh.positions&&other.indices==mesh.indices&&other.uv==mesh.uv;});
                if(paired!=meshes.end()){mesh.decal=true;
                    if(materialKey.ends_with("_color.mat")){const auto surface=this->materials.Find(paired->material);if(appearance.opacity.empty())appearance.opacity=surface.opacity;if(appearance.normal.empty())appearance.normal=surface.normal;}
                    else if(appearance.texture.empty()&&!appearance.normal.empty()&&!this->materials.Find(paired->material).texture.empty()){mesh.textureWidth=mesh.textureHeight=1;mesh.pixels={0,0,0,0};continue;}
                }
                mesh.decal=mesh.decal||appearance.decal;mesh.glass=appearance.glass||MaterialName(mesh.material).find("_visor")!=std::string::npos||MaterialName(mesh.material).find("glass")!=std::string::npos;if(!mesh.causticEffect){mesh.tint=appearance.tint;mesh.tinted=appearance.tinted;}
                if(mesh.uv.size()!=mesh.positions.size()/3*2){if(appearance.constantColor){mesh.tint=appearance.color;mesh.tinted=true;}continue;}
                auto key=MaterialKey(mesh.material);if(key.starts_with("data/"))key.erase(0,5);if(!key.starts_with("materials/")||!key.ends_with(".mat"))continue;
                key="textures/"+key.substr(10,key.size()-14)+"_color.dds";
                std::vector<std::string> candidates{key};const auto base=key.rfind("_base_color.dds");if(base!=key.npos)candidates.push_back(key.substr(0,base)+"_color.dds");
                if(!appearance.texture.empty())candidates.insert(candidates.begin(),appearance.texture);
                candidates.push_back(key.substr(0,key.size()-10)+"_1001_color.dds");
                for(const auto& candidate:candidates)try{const auto cacheKey=std::string(colorOnly?"color:":"full:")+std::to_string(limit)+":"+candidate+":"+appearance.opacity+":"+appearance.ao+":"+(OpaqueFoodSurface(mesh.material)?"opaque-food":MaterialKey(mesh.material).starts_with("materials/weapons/dlc001/particlemachinegun/")?"opaque-weapon":"default");auto it=cache.find(cacheKey);if(it==cache.end()){auto decoded=Load(candidate,limit);if(!decoded.pixels.empty()&&!appearance.opacity.empty())try{ApplyOpacity(decoded,Load(appearance.opacity,limit));}catch(...){}if(!colorOnly&&!decoded.pixels.empty()&&!appearance.ao.empty())try{const auto ao=Load(appearance.ao,limit);if(!ao.pixels.empty())for(unsigned y=0;y<decoded.height;++y)for(unsigned x=0;x<decoded.width;++x){const float shade=.35f+.65f*ao.pixels[(std::size_t(y)*ao.height/decoded.height*ao.width+std::size_t(x)*ao.width/decoded.width)*4]/255.f;for(unsigned c=0;c<3;++c)decoded.pixels[(std::size_t(y)*decoded.width+x)*4+c]=std::uint8_t(decoded.pixels[(std::size_t(y)*decoded.width+x)*4+c]*shade);}}catch(...){}RestoreOpaqueWeaponAlpha(decoded,mesh.material);RestoreOpaqueFoodAlpha(decoded,mesh.material);it=cache.emplace(cacheKey,std::move(decoded)).first;}
                    const auto& image=it->second;if(image.pixels.empty())continue;
                    if(!used.contains(candidate)){if(budget+image.pixels.size()>(quality==4?192u:quality==3?48u:12u)*1024*1024)continue;budget+=image.pixels.size();used.insert(candidate);}
                    mesh.textureWidth=image.width;mesh.textureHeight=image.height;mesh.pixels=image.pixels;break;
                }catch(...){} // An unsupported override must not prevent trying other color sources.
                if(mesh.pixels.empty()&&appearance.texture.empty()&&!appearance.constantColor&&!appearance.normal.empty()&&(appearance.decal||MaterialName(mesh.material).find("decal")!=std::string::npos)){
                    // This authored overlay changes surface normals, not albedo.
                    // Carry its opacity mask; the renderer preserves the base color.
                    const auto mask=appearance.opacity.empty()?TexturePixels{1,1,{255,255,255,255}}:Load(appearance.opacity,limit);if(!mask.pixels.empty()){mesh.normalOnly=true;mesh.decal=true;mesh.textureWidth=mask.width;mesh.textureHeight=mask.height;mesh.pixels.resize(mask.pixels.size());for(std::size_t i=0;i<mesh.pixels.size();i+=4){mesh.pixels[i]=mesh.pixels[i+1]=mesh.pixels[i+2]=255;mesh.pixels[i+3]=mask.pixels[i];}}
                }
                // Only confirmed material limitations or declared color failures override a loaded base texture.
                mesh.incompleteMaterial=appearance.incomplete||KnownIncompletePreviewMaterial(mesh.material)||(!appearance.texture.empty()&&mesh.pixels.empty());
                // Authored tinted labels can supply only an opacity map, with no albedo.
                if(mesh.pixels.empty()&&appearance.texture.empty()&&appearance.tinted&&!appearance.opacity.empty()&&!appearance.constantColor){appearance.constantColor=true;appearance.color=appearance.authored?std::array<float,3>{0,0,0}:std::array<float,3>{1,1,1};}
                if(mesh.pixels.empty()&&appearance.constantColor){TexturePixels mask;if(!appearance.opacity.empty())try{mask=Load(appearance.opacity,limit);}catch(...){}mesh.textureWidth=mask.width?mask.width:1;mesh.textureHeight=mask.height?mask.height:1;mesh.pixels.resize(std::size_t(mesh.textureWidth)*mesh.textureHeight*4);for(std::size_t i=0;i<mesh.pixels.size();i+=4){for(unsigned c=0;c<3;++c)mesh.pixels[i+c]=std::uint8_t(appearance.color[c]*255);mesh.pixels[i+3]=mask.pixels.empty()?255:mask.pixels[i];}}
                if(appearance.authored&&appearance.decal&&appearance.tinted&&appearance.texture.empty()&&!mesh.pixels.empty()&&!mesh.normalOnly){
                    // Mask-only printing starts from the authored default black.
                    // Preserve existing textured-material shading; apply the missing
                    // tint weight only to this structurally identified decal case.
                    const float weight=std::pow(appearance.tintWeight,1.f/2.2f);for(std::size_t i=0;i<mesh.pixels.size();i+=4)for(unsigned c=0;c<3;++c)mesh.pixels[i+c]=std::uint8_t(appearance.tint[c]*weight*255);mesh.tinted=false;
                }
                ApplyAuthoredOpacity(mesh.pixels,appearance);
                ApplyAuthoredTint(mesh,appearance);
                if(appearance.constantAO>=0&&!mesh.pixels.empty())for(std::size_t i=0;i<mesh.pixels.size();i+=4)for(unsigned c=0;c<3;++c)mesh.pixels[i+c]=std::uint8_t(mesh.pixels[i+c]*(.35f+.65f*appearance.constantAO));
                // Legacy unowned records can still carry an unused zero tint.
                if(!appearance.authored&&!mesh.pixels.empty()&&mesh.tint==std::array<float,3>{0,0,0})mesh.tinted=false;
                if(mesh.glass){if(mesh.pixels.empty()){mesh.textureWidth=mesh.textureHeight=1;mesh.pixels={100,125,140,90};}else for(std::size_t i=3;i<mesh.pixels.size();i+=4)mesh.pixels[i]=std::min<std::uint8_t>(mesh.pixels[i],appearance.constantOpacity>=0?std::uint8_t(appearance.constantOpacity*255):90);}
                if(!colorOnly&&(!appearance.normal.empty()||!appearance.roughness.empty()||appearance.constantRoughness>=0))try{

                    const auto normalKey="normal:"+std::to_string(quality)+":"+std::to_string(normalLimit)+":"+appearance.normal+":"+appearance.roughness+":"+std::to_string(appearance.constantRoughness);
                    auto normal=cache.find(normalKey);if(normal==cache.end()){
                        TexturePixels rough;if(!appearance.roughness.empty())try{rough=Load(appearance.roughness,normalLimit);}catch(...){}
                        auto decoded=appearance.normal.empty()?TexturePixels{}:Load(appearance.normal,normalLimit);
                        if(decoded.pixels.empty()){decoded.width=rough.width?rough.width:1;decoded.height=rough.height?rough.height:1;decoded.pixels.resize(std::size_t(decoded.width)*decoded.height*4);for(std::size_t i=0;i<decoded.pixels.size();i+=4){decoded.pixels[i]=decoded.pixels[i+1]=128;decoded.pixels[i+2]=255;}}
                        for(unsigned y=0;y<decoded.height;++y)for(unsigned x=0;x<decoded.width;++x)decoded.pixels[(std::size_t(y)*decoded.width+x)*4+3]=appearance.constantRoughness>=0?std::uint8_t(appearance.constantRoughness*255):rough.pixels.empty()?166:rough.pixels[(std::size_t(y)*rough.height/decoded.height*rough.width+std::size_t(x)*rough.width/decoded.width)*4];
                        normal=cache.emplace(normalKey,std::move(decoded)).first;
                    }
                    const auto& image=normal->second;if(!image.pixels.empty()&&(used.contains(normalKey)||budget+image.pixels.size()<=(quality==4?192u:48u)*1024*1024)){if(used.insert(normalKey).second)budget+=image.pixels.size();mesh.normalWidth=image.width;mesh.normalHeight=image.height;mesh.normalPixels=image.pixels;}
                }catch(...){}
                if(!colorOnly&&appearance.constantMetal>0&&!mesh.glass&&!mesh.normalOnly){const auto value=std::uint8_t(appearance.constantMetal*255);mesh.metalWidth=mesh.metalHeight=1;mesh.metalPixels={value,value,value,255};}
                if(!colorOnly&&!appearance.metal.empty()&&!mesh.glass&&!mesh.normalOnly)try{
                    const unsigned metalLimit=std::min(normalLimit,quality==1?128u:quality==2?256u:quality==4?4096u:512u);
                    const auto metalKey="metal:"+std::to_string(metalLimit)+":"+appearance.metal;
                    auto image=cache.find(metalKey);if(image==cache.end())image=cache.emplace(metalKey,Load(appearance.metal,metalLimit)).first;
                    if(!image->second.pixels.empty()&&(used.contains(metalKey)||budget+image->second.pixels.size()<=(quality==4?192u:48u)*1024*1024)){
                        if(used.insert(metalKey).second)budget+=image->second.pixels.size();mesh.metalWidth=image->second.width;mesh.metalHeight=image->second.height;mesh.metalPixels=image->second.pixels;
                    }
                }catch(...){} // Unsupported metal maps retain the dielectric fallback.
                if(!colorOnly&&!appearance.overlays.empty()&&!mesh.pixels.empty()){
                    if(mesh.tinted){for(std::size_t i=0;i<mesh.pixels.size();i+=4)for(unsigned c=0;c<3;++c)mesh.pixels[i+c]=std::uint8_t(mesh.pixels[i+c]*mesh.tint[c]);mesh.tinted=false;}
                    bool complete=true;for(const auto& layer:appearance.overlays)try{
                        if(layer.intensity==0)continue;
                        if(layer.needsVertexColor||layer.needsDetailMask)throw std::runtime_error("This layer requires additional authored blend inputs.");
                        const auto mask=Load(layer.mask,std::min(limit,1024u));if(mask.pixels.empty())throw std::runtime_error("Missing layer mask.");
                        const float tiling=std::max({1.f,layer.scale[0],layer.scale[1]});const unsigned colorLimit=std::max(4u,unsigned(std::min(limit,1024u)/tiling)),detailLimit=std::max(4u,unsigned(std::min(normalLimit,512u)/tiling));
                        const auto color=layer.texture.empty()?TexturePixels{}:Load(layer.texture,colorLimit);const auto normal=layer.normal.empty()?TexturePixels{}:Load(layer.normal,detailLimit);const auto rough=layer.roughness.empty()?TexturePixels{}:Load(layer.roughness,detailLimit);
                        if((!layer.texture.empty()&&color.pixels.empty())||(!layer.normal.empty()&&normal.pixels.empty())||(!layer.roughness.empty()&&rough.pixels.empty()))throw std::runtime_error("Missing material detail map.");CompositePreviewLayer(mesh,layer,mask,color,normal,rough);
                    }catch(...){complete=false;}
                    if(!complete)mesh.incompleteMaterial=true;
                    else if(KnownIncompletePreviewMaterial(mesh.material)&&appearance.overlays.size()==3)mesh.incompleteMaterial=false;
                }
                if(mesh.flowingLiquid&&mesh.pixels.empty()){mesh.flowingLiquid=false;mesh.incompleteMaterial=true;}
                if(mesh.normalOnly&&mesh.normalPixels.empty())mesh.incompleteMaterial=true;
            }catch(...){} // Shaded geometry remains available if its texture is unsupported.
        }
    };
}
