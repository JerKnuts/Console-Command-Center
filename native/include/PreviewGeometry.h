#pragma once
// CCC's independent, bounded reader for model geometry. No engine calls or
// third-party preview implementation. File-format observations are documented
// in docs/MODEL_PREVIEWS.md. Game assets remain on the user's machine.
#include <algorithm>
#include <array>
#include <bit>
#include <cmath>
#include <cstdint>
#include <cstring>
#include <filesystem>
#include <fstream>
#include <functional>
#include <limits>
#include <map>
#include <optional>
#include <span>
#include <stdexcept>
#include <string>
#include <unordered_map>
#include <unordered_set>
#include <vector>
#include <zlib.h>

namespace CCC::Preview
{
    using Bytes = std::vector<std::uint8_t>;
    constexpr std::size_t MaxAssetBytes = 32 * 1024 * 1024;
    constexpr std::size_t MaxVertices = 400000;
    constexpr std::size_t MaxPieces = 512;
    constexpr std::size_t MaxIndices = 1800000;
    struct Reader {
        std::span<const std::uint8_t> bytes; std::size_t at = 0;
        void Need(std::size_t n) const { if (at > bytes.size() || n > bytes.size() - at) throw std::runtime_error("Truncated model data."); }
        template<class T> T Read() { Need(sizeof(T)); T out; std::memcpy(&out, bytes.data() + at, sizeof(T)); at += sizeof(T); return out; }
        void Skip(std::size_t n) { Need(n); at += n; }
        std::string Text(std::size_t n) { if (n > 65536) throw std::runtime_error("Model string is too long."); Need(n); std::string s(reinterpret_cast<const char*>(bytes.data() + at), n); at += n; return s; }
        std::string String() { return Text(Read<std::uint32_t>()); }
        float Float() { const float f = Read<float>(); if (!std::isfinite(f)) throw std::runtime_error("Invalid model coordinate."); return f; }
    };
    inline std::string AssetKey(std::string path) {
        if (path.empty() || path.size() > 1024) throw std::runtime_error("Invalid model asset path.");
        for (auto& c : path) { if (c == '\\') c = '/'; else if (c >= 'A' && c <= 'Z') c += 'a' - 'A'; }
        if (path.front() == '/' || path.find(':') != path.npos || path.find('\0') != path.npos) throw std::runtime_error("Absolute model paths are not permitted.");
        for (std::size_t start = 0; start < path.size();) {
            const auto end = path.find('/', start); const auto part = path.substr(start, end - start);
            if (part.empty() || part == "." || part == "..") throw std::runtime_error("Invalid model path segment.");
            if (end == path.npos) break; start = end + 1;
        }
        return path;
    }
    inline Bytes ReadRange(const std::filesystem::path& path, std::uint64_t offset, std::size_t size) {
        if (size > MaxAssetBytes) throw std::runtime_error("Model asset exceeds the preview limit.");
        std::ifstream stream(path, std::ios::binary | std::ios::ate);
        if (!stream) throw std::runtime_error("Model asset could not be opened.");
        const auto length = static_cast<std::uint64_t>(stream.tellg());
        if (offset > length || size > length - offset) throw std::runtime_error("Invalid model asset range.");
        stream.seekg(static_cast<std::streamoff>(offset)); Bytes data(size);
        if (!stream.read(reinterpret_cast<char*>(data.data()), static_cast<std::streamsize>(size))) throw std::runtime_error("Model asset could not be read.");
        return data;
    }
    struct AssetStore {
        struct Entry { std::uint64_t offset; std::uint32_t packed, raw; };
        struct Archive { std::filesystem::path path; bool indexed = false; std::unordered_map<std::string, Entry> files; };
        std::filesystem::path data;
        std::vector<Archive> archives;
        std::vector<std::filesystem::path> textureArchives;
        explicit AssetStore(std::filesystem::path directory, const std::vector<std::string>& loadedPlugins = {}) : data(std::move(directory)) {
            std::map<std::string, int> ranks;
            for (std::size_t i = 0; i < loadedPlugins.size(); ++i) ranks[AssetKey(loadedPlugins[i]).substr(0, loadedPlugins[i].find_last_of('.'))] = static_cast<int>(i + 1);
            std::vector<std::pair<int, std::filesystem::path>> found;
            for (const auto& file : std::filesystem::directory_iterator(data)) {
                if (!file.is_regular_file()) continue;
                const auto name = AssetKey(file.path().filename().string());
                if (!name.ends_with(".ba2")) continue;
                // Dedicated audio archives cannot supply preview meshes or materials.
                // Avoid indexing their large localized name tables on a cold preview.
                if(name.find(" - voices")!=name.npos||name.find(" - sounds")!=name.npos)continue;
                // Only archives associated with the base game or active masters.
                int rank = -1;
                if (name.starts_with("starfield - ")) rank = 0;
                for (const auto& [stem, order] : ranks) if (name == stem + ".ba2" || name.starts_with(stem + " - ")) rank = std::max(rank, order * 2);
                if (rank < 0 && !loadedPlugins.empty()) continue;
                if (name.find("patch") != name.npos) rank++;
                found.emplace_back(rank, file.path());
            }
            std::sort(found.begin(), found.end(), [](const auto& a, const auto& b) { if (a.first != b.first) return a.first > b.first; return a.second.filename() > b.second.filename(); });
            for (auto& [rank, file] : found) {
                const auto name=AssetKey(file.filename().string());const bool base=name.starts_with("starfield - ");
                if(!base||name.find("texture")!=name.npos)textureArchives.push_back(file);
                if(!base||name.find("mesh")!=name.npos)archives.push_back({file});
            }
        }
        void Index(Archive& archive) {
            archive.indexed = true;
            std::ifstream stream(archive.path, std::ios::binary | std::ios::ate); if (!stream) return;
            const auto length = static_cast<std::uint64_t>(stream.tellg()); stream.seekg(0);
            std::array<std::uint8_t, 36> h{}; if (!stream.read(reinterpret_cast<char*>(h.data()), h.size())) return;
            Reader header{h}; if (header.Text(4) != "BTDX") return;
            const auto version = header.Read<std::uint32_t>(); if (header.Text(4) != "GNRL" || version < 1 || version > 3) return;
            const auto count = header.Read<std::uint32_t>(); const auto namesAt = header.Read<std::uint64_t>();
            const std::size_t headerSize = version == 1 ? 24 : version == 2 ? 32 : 36;
            if (version == 3) { header.Skip(8); if (header.Read<std::uint32_t>() != 0) return; }
            if (count > 2000000 || namesAt > length || std::uint64_t(count) * 36 + headerSize > namesAt) return;
            std::vector<Entry> entries; entries.reserve(count); stream.seekg(headerSize);
            for (std::uint32_t i = 0; i < count; ++i) {
                std::array<std::uint8_t, 36> b{}; if (!stream.read(reinterpret_cast<char*>(b.data()), b.size())) return;
                Reader r{b}; r.Skip(16); Entry e{}; e.offset = r.Read<std::uint64_t>(); e.packed = r.Read<std::uint32_t>() & 0x3fffffff; e.raw = r.Read<std::uint32_t>() & 0x3fffffff; entries.push_back(e);
            }
            stream.seekg(static_cast<std::streamoff>(namesAt));
            for (std::uint32_t i = 0; i < count; ++i) {
                std::uint16_t n = 0; if (!stream.read(reinterpret_cast<char*>(&n), 2) || n > 1024) return;
                std::string name(n, '\0'); if (!stream.read(name.data(), n)) return;
                try { name = AssetKey(name); } catch (...) { continue; }
                const auto& e = entries[i]; const auto size = e.packed ? e.packed : e.raw;
                if (!(name.starts_with("meshes/") || name.starts_with("geometries/")) || e.raw > MaxAssetBytes || e.raw == 0 || e.offset > namesAt || size > namesAt - e.offset) continue;
                archive.files.emplace(std::move(name), e);
            }
        }
        Bytes Read(std::string path) {
            const auto key = AssetKey(std::move(path));
            if (!(key.starts_with("meshes/") || key.starts_with("geometries/"))) throw std::runtime_error("Only model assets may be loaded.");
            const auto loose = data / std::filesystem::path(key);
            if (std::filesystem::is_regular_file(loose)) return ReadRange(loose, 0, static_cast<std::size_t>(std::filesystem::file_size(loose)));
            for (auto& archive : archives) {
                if (!archive.indexed) Index(archive);
                const auto it = archive.files.find(key); if (it == archive.files.end()) continue;
                const auto& e = it->second; auto bytes = ReadRange(archive.path, e.offset, e.packed ? e.packed : e.raw);
                if (!e.packed) return bytes;
                Bytes output(e.raw); uLongf size = static_cast<uLongf>(output.size());
                if (uncompress(output.data(), &size, bytes.data(), static_cast<uLong>(bytes.size())) != Z_OK || size != e.raw) throw std::runtime_error("Unsupported compressed model asset.");
                return output;
            }
            throw std::runtime_error("Model asset is unavailable in the installed game files.");
        }
    };
    using Matrix = std::array<float, 16>;
    inline Matrix Identity() { return {1,0,0,0, 0,1,0,0, 0,0,1,0, 0,0,0,1}; }
    inline Matrix Multiply(const Matrix& a, const Matrix& b) {
        Matrix out{}; for (int row = 0; row < 4; ++row) for (int col = 0; col < 4; ++col) for (int k = 0; k < 4; ++k) out[row*4+col] += a[row*4+k]*b[k*4+col]; return out;
    }
    struct Mesh { std::string name; std::vector<float> positions; std::vector<std::uint32_t> indices; std::vector<float> uv; std::string material; std::uint32_t textureWidth=0,textureHeight=0; Bytes pixels; bool mannequin=false; std::array<float,3> tint{1,1,1};bool tinted=false; std::uint32_t normalWidth=0,normalHeight=0; Bytes normalPixels; bool glass=false; bool decal=false; bool incompleteMaterial=false; bool normalOnly=false;std::uint32_t metalWidth=0,metalHeight=0;Bytes metalPixels; };
    struct GeometryRef { std::string name, path; Matrix transform; std::string material; std::string bone; Matrix bind=Identity(); bool rigid=false; Bytes embedded; std::optional<std::array<float,3>> inlineTint; };
    inline Matrix InverseAffine(const Matrix& m) {
        const float a=m[0],b=m[1],c=m[2],d=m[4],e=m[5],f=m[6],g=m[8],h=m[9],i=m[10];const float det=a*(e*i-f*h)-b*(d*i-f*g)+c*(d*h-e*g);
        if(!std::isfinite(det)||std::abs(det)<1e-8f)throw std::runtime_error("Invalid attachment bind matrix.");
        Matrix out{(e*i-f*h)/det,(c*h-b*i)/det,(b*f-c*e)/det,0,(f*g-d*i)/det,(a*i-c*g)/det,(c*d-a*f)/det,0,(d*h-e*g)/det,(b*g-a*h)/det,(a*e-b*d)/det,0,0,0,0,1};
        for(unsigned row=0;row<3;++row)out[row*4+3]=-(out[row*4]*m[3]+out[row*4+1]*m[7]+out[row*4+2]*m[11]);return out;
    }
    inline bool OriginAttachment(const GeometryRef& ref) {
        const auto identity=Identity();for(unsigned i=0;i<16;++i)if(std::abs(ref.transform[i]-identity[i])>1e-3f)return false;
        return !ref.bone.empty();
    }
    inline void ResolveRigidAttachments(std::vector<GeometryRef>& refs,const std::unordered_map<std::string,Matrix>& bones={}) {
        const auto original=refs;
        for(auto& part:refs)if(!part.bone.empty()) {
            bool atOrigin=OriginAttachment(part);if(!atOrigin)continue;
            for(const auto& anchor:original)if(anchor.bone==part.bone&&(std::abs(anchor.transform[3])+std::abs(anchor.transform[7])+std::abs(anchor.transform[11])>.25f)) {
                part.transform=Multiply(Multiply(anchor.transform,InverseAffine(anchor.bind)),part.bind);atOrigin=false;break;
            }
            if(atOrigin)if(const auto bone=bones.find(part.bone);bone!=bones.end())part.transform=Multiply(bone->second,part.bind);
        }
    }
    struct ModelMount {std::string host,slot;Matrix transform;};
    struct ModelScene {std::vector<ModelMount> mounts;std::vector<std::string> slots;std::unordered_map<std::string,Matrix> nodes,bones;Matrix root=Identity();};
    struct GeometryStream { std::string path; Bytes embedded; };
    inline GeometryStream ReadGeometryStream(Reader& reader,std::uint32_t indices,std::uint32_t vertices) {
        // The preceding value is a vertex layout/stride, shared by external
        // and embedded models. Inspect the stream itself, not that value.
        const auto start=reader.at;const auto lengthOrVersion=reader.Read<std::uint32_t>();
        if(lengthOrVersion==2) {
            if(!indices||indices>MaxIndices||!vertices||vertices>MaxVertices)throw std::runtime_error("Invalid embedded model size.");
            Reader check{reader.bytes.subspan(reader.at)};
            if(check.Read<std::uint32_t>()!=indices)throw std::runtime_error("Unsupported embedded model stream.");
            return {"",Bytes(reader.bytes.begin()+start,reader.bytes.end())};
        }
        if(!lengthOrVersion||lengthOrVersion>512)throw std::runtime_error("Invalid external model path length.");
        return {reader.Text(lengthOrVersion),{}};
    }
    inline std::optional<std::array<float,3>> ReadInlineShaderTint(std::span<const std::uint8_t> bytes,unsigned streamVersion) {
        // Niftools' Starfield BSLightingShaderProperty layout: a named material
        // stops after NiObjectNET; an empty name instead carries inline fields.
        // Accept only texture-free, default-type properties with no TextureSet reference.
        if((streamVersion!=172&&streamVersion!=173)||bytes.size()<=12)return {};
        try{Reader r{bytes};r.Skip(4);const auto extras=r.Read<std::uint32_t>();if(extras>64)return {};r.Skip(extras*4+4);if(r.Read<std::uint32_t>()!=0)return {};const auto sf1=r.Read<std::uint32_t>(),sf2=r.Read<std::uint32_t>();if(sf1>128||sf2>128)return {};r.Skip((sf1+sf2)*4+16);if(r.Read<std::int32_t>()!=-1)return {};std::array<float,3> color;for(auto& c:color){c=r.Float();if(c<0||c>4)return {};}const auto scale=r.Float();if(scale<0||scale>10)return {};r.Skip(4);if(color==std::array<float,3>{0,0,0})return std::array<float,3>{1,1,1};for(auto& c:color)c=std::clamp(c*scale,0.f,1.f);return color;}catch(...){return {};}
    }
    inline std::vector<GeometryRef> ReadNif(std::span<const std::uint8_t> bytes,ModelScene* scene=nullptr,unsigned quality=4) {
        Reader r{bytes}; std::size_t newline = 0; while (newline < std::min<std::size_t>(128, bytes.size()) && bytes[newline] != '\n') newline++;
        if (newline == std::min<std::size_t>(128, bytes.size())) throw std::runtime_error("Unsupported NIF header."); r.at = newline + 1;
        if (r.Read<std::uint32_t>() != 0x14020007 || r.Read<std::uint8_t>() != 1) throw std::runtime_error("Unsupported NIF version.");
        r.Skip(4); const auto blocks = r.Read<std::uint32_t>(); const auto streamVersion=r.Read<std::uint32_t>(); if (!blocks || blocks > 50000) throw std::runtime_error("Invalid NIF block count.");
        // Exporter metadata has variable length. Accept a candidate only when
        // its type/tag/size/string tables account for the complete block tail.
        struct Tables {std::vector<std::string> types,strings;std::vector<std::uint16_t> tags;std::vector<std::uint32_t> sizes;std::size_t payload=0;};
        const auto tableStart=r.at;
        const auto parse=[&](std::size_t at)->std::optional<Tables>{try{Reader c{bytes,at};Tables t;const auto n=c.Read<std::uint16_t>();if(!n||n>256)return {};
            for(unsigned i=0;i<n;++i){const auto length=c.Read<std::uint32_t>();if(!length||length>256)return {};auto name=c.Text(length);if(!std::all_of(name.begin(),name.end(),[](char v){return v>=32&&v<=126;}))return {};t.types.push_back(std::move(name));}
            for(unsigned i=0;i<blocks;++i){const auto tag=c.Read<std::uint16_t>();if(tag>=n)return {};t.tags.push_back(tag);}
            std::uint64_t sum=0;for(unsigned i=0;i<blocks;++i){const auto size=c.Read<std::uint32_t>();sum+=size;t.sizes.push_back(size);}
            const auto count=c.Read<std::uint32_t>();c.Skip(4);if(count>100000)return {};for(unsigned i=0;i<count;++i)t.strings.push_back(c.String());if(c.Read<std::uint32_t>()!=0||sum>bytes.size()-c.at||bytes.size()-c.at-sum>64)return {};t.payload=c.at;return t;
        }catch(...){return {};}};
        auto tables=parse(tableStart+16);
        for(std::size_t offset=tableStart;!tables&&offset<std::min(bytes.size(),tableStart+4096);++offset)tables=parse(offset);
        if(!tables)throw std::runtime_error("Unsupported NIF type table.");
        auto& types=tables->types;auto& tags=tables->tags;auto& sizes=tables->sizes;auto& strings=tables->strings;r.at=tables->payload;
        std::vector<std::span<const std::uint8_t>> payloads; for (const auto size : sizes) { r.Need(size); payloads.push_back(bytes.subspan(r.at,size)); r.Skip(size); }
        if(scene)for(unsigned i=0;i<blocks;++i) {
            const auto& type=types[tags[i]];
            if(type=="BSConnectPoint::Parents") {
                Reader p{payloads[i]};p.Skip(4);const auto count=p.Read<std::uint32_t>();if(count>128)throw std::runtime_error("Too many model attachment points.");
                for(unsigned j=0;j<count;++j){ModelMount mount{p.String(),p.String(),Identity()};const float w=p.Float(),x=p.Float(),y=p.Float(),z=p.Float();float t[3];for(auto& v:t)v=p.Float();const float scale=p.Float();const float norm=w*w+x*x+y*y+z*z;if(std::abs(norm-1)>0.1f||std::abs(scale)>10000)throw std::runtime_error("Invalid attachment transform.");
                    mount.transform={1-2*(y*y+z*z),2*(x*y-z*w),2*(x*z+y*w),t[0],2*(x*y+z*w),1-2*(x*x+z*z),2*(y*z-x*w),t[1],2*(x*z-y*w),2*(y*z+x*w),1-2*(x*x+y*y),t[2],0,0,0,1};
                    for(unsigned row=0;row<3;++row)for(unsigned col=0;col<3;++col)mount.transform[row*4+col]*=scale;scene->mounts.push_back(std::move(mount));
                }
            }else if(type=="BSConnectPoint::Children"){Reader p{payloads[i]};p.Skip(9);while(p.at+4<=p.bytes.size()&&scene->slots.size()<128){auto slot=p.String();if(slot.starts_with("C-"))scene->slots.push_back(slot.substr(2));}}
        }
        struct Node { Matrix local = Identity(),bind=Identity(); std::vector<std::uint32_t> children; std::string name, geometry, material,bone; std::vector<std::string> boneNames; std::vector<Matrix> binds; bool valid = false,rigid=false; Bytes embedded;std::optional<std::array<float,3>> inlineTint; };
        std::vector<Node> nodes(blocks); std::vector<bool> child(blocks, false);
        for (unsigned i=0;i<blocks;++i) {
            const auto& type=types[tags[i]]; if (type!="NiNode" && type!="BSGeometry" && type!="BSFadeNode") continue;
            Reader b{payloads[i]}; auto& node=nodes[i]; auto name=b.Read<std::uint32_t>(); if (name<strings.size()) node.name=strings[name];
            const auto extras=b.Read<std::uint32_t>(); if (extras>4096) throw std::runtime_error("Invalid NIF node extras.");
            for(unsigned j=0;j<extras;++j){const auto extra=b.Read<std::uint32_t>();if(extra<blocks&&types[tags[extra]]=="SkinAttach"){Reader attach{payloads[extra]};attach.Skip(4);const auto count=attach.Read<std::uint32_t>();if(count&&count<=256){for(unsigned k=0;k<count;++k)node.boneNames.push_back(attach.String());node.bone=node.boneNames.front();node.rigid=count==1;}}}b.Skip(8);
            std::array<float,3> translation; for (auto& v:translation) v=b.Float();
            for (int y=0;y<3;++y) for(int x=0;x<3;++x) node.local[y*4+x]=b.Float();
            const float scale=b.Float(); if (std::abs(scale)>100000) throw std::runtime_error("Invalid NIF scale.");
            for (int y=0;y<3;++y) { for(int x=0;x<3;++x) node.local[y*4+x]*=scale; node.local[y*4+3]=translation[y]; } b.Skip(4); node.valid=true;
            if(type=="BSGeometry") {
                b.Skip(40);const auto skin=b.Read<std::int32_t>(); const auto shader=b.Read<std::int32_t>();b.Skip(4);
                if(skin>=0&&unsigned(skin)<blocks&&types[tags[skin]]=="BSSkin::Instance"){
                    Reader instance{payloads[skin]};instance.Skip(4);const auto data=instance.Read<std::uint32_t>();
                    if(data<blocks&&types[tags[data]]=="BSSkin::BoneData"){Reader bind{payloads[data]};const auto count=bind.Read<std::uint32_t>();if(count&&count<=256&&bind.bytes.size()-bind.at>=std::size_t(count)*68){for(unsigned k=0;k<count;++k){auto matrix=Identity();bind.Skip(16);for(unsigned y=0;y<3;++y)for(unsigned x=0;x<3;++x)matrix[y*4+x]=bind.Float();for(unsigned y=0;y<3;++y)matrix[y*4+3]=bind.Float();const auto scale=bind.Float();if(std::abs(scale)>10000)throw std::runtime_error("Invalid skin bind scale.");for(unsigned y=0;y<3;++y)for(unsigned x=0;x<3;++x)matrix[y*4+x]*=scale;node.binds.push_back(matrix);}node.bind=node.binds.front();}}
                }
                if(shader>=0&&unsigned(shader)<blocks&&types[tags[shader]]=="BSLightingShaderProperty") {
                    Reader sr{payloads[shader]};const auto material=sr.Read<std::uint32_t>();if(material<strings.size())node.material=strings[material];if(node.material.empty())node.inlineTint=ReadInlineShaderTint(payloads[shader],streamVersion);
                }
                std::vector<std::string> lods;
                for(unsigned level=0;level<4&&b.bytes.size()-b.at>=17;++level){if(!b.Read<std::uint8_t>())break;const auto indices=b.Read<std::uint32_t>(),vertices=b.Read<std::uint32_t>();b.Skip(4); // Vertex layout/stride; not an embedded-geometry flag.
                    auto stream=ReadGeometryStream(b,indices,vertices);
                    if(!stream.embedded.empty()){node.embedded=std::move(stream.embedded);break;}
                    if(indices&&vertices)lods.push_back(std::move(stream.path));}
                if(!lods.empty())node.geometry=lods.front();
            } else {
                const auto children=b.Read<std::uint32_t>(); if (children>blocks) throw std::runtime_error("Invalid NIF child count.");
                for (unsigned j=0;j<children;++j) { const auto index=b.Read<std::int32_t>(); if(index>=0 && unsigned(index)<blocks) { node.children.push_back(index); child[index]=true; } }
            }
        }
        std::vector<GeometryRef> out; std::vector<std::pair<unsigned,Matrix>> queue;
        for (unsigned i=0;i<blocks;++i) if(nodes[i].valid&&!child[i]) queue.emplace_back(i,Identity());
        std::vector<bool> seen(blocks,false);
        while(!queue.empty()) {
            auto [i,parent]=queue.back(); queue.pop_back(); if(seen[i]) throw std::runtime_error("Cyclic NIF scene."); seen[i]=true;
            const auto& node=nodes[i]; if(!node.valid) continue; const auto world=Multiply(parent,node.local);
            if(scene){scene->nodes[node.name]=world;if(!child[i])scene->root=world; if(std::abs(world[3])+std::abs(world[7])+std::abs(world[11])>.25f)for(std::size_t k=0;k<std::min(node.boneNames.size(),node.binds.size());++k)scene->bones.try_emplace(node.boneNames[k],Multiply(world,InverseAffine(node.binds[k])));}
            if(!node.geometry.empty()||!node.embedded.empty()) {
                std::string key;if(!node.geometry.empty()){key=AssetKey(node.geometry); if(!key.starts_with("geometries/")) key="geometries/"+key; if(!key.ends_with(".mesh")) key+=".mesh";}
                out.push_back({node.name,std::move(key),world,node.material,node.bone,node.bind,node.rigid,node.embedded,node.inlineTint}); if(out.size()>MaxPieces) throw std::runtime_error("Too many model pieces.");
            }
            for(const auto c:node.children) queue.emplace_back(c,world);
        }
        ResolveRigidAttachments(out);
        if(out.empty()&&!scene) throw std::runtime_error("This item has no supported standalone model geometry."); return out;
    }
    inline Mesh ReadMesh(std::span<const std::uint8_t> bytes, const GeometryRef& geometry) {
        Reader r{bytes}; r.Skip(4); const auto indices=r.Read<std::uint32_t>();
        if(!indices || indices%3 || indices>MaxIndices) throw std::runtime_error("Unsupported model index count.");
        Mesh out; out.name=geometry.name; out.indices.reserve(indices);
        for(unsigned i=0;i<indices;++i) out.indices.push_back(r.Read<std::uint16_t>());
        const float extent=r.Float(); r.Skip(4); const auto vertices=r.Read<std::uint32_t>();
        if(!vertices||vertices>MaxVertices||extent<=0||extent>1000000) throw std::runtime_error("Invalid model vertices.");
        for(const auto i:out.indices) if(i>=vertices) throw std::runtime_error("Model index exceeds vertex count.");
        r.Need(std::size_t(vertices)*6); out.positions.reserve(vertices*3);
        for(unsigned i=0;i<vertices;++i) {
            float xyz[3]; for(auto& v:xyz) v=r.Read<std::int16_t>()*(extent/32767.f);
            for(unsigned row=0;row<3;++row) { const auto& m=geometry.transform; float v=m[row*4+3]; for(unsigned k=0;k<3;++k)v+=m[row*4+k]*xyz[k]; if(!std::isfinite(v)||std::abs(v)>1e8f)throw std::runtime_error("Model transform is invalid."); out.positions.push_back(v); }
        }
        out.material=geometry.material;if(geometry.inlineTint){out.tint=*geometry.inlineTint;out.tinted=true;}
        // The first UV stream follows positions as f16 pairs. Invalid/missing
        // UV data leaves the model shaded instead of rejecting its geometry.
        if(r.bytes.size()-r.at>=4) {
            const auto count=r.Read<std::uint32_t>();
            if(count==vertices&&r.bytes.size()-r.at>=std::size_t(vertices)*4) {
                const auto half=[](std::uint16_t h){const float sign=(h&0x8000)?-1.f:1.f;const auto exponent=(h>>10)&31;const auto fraction=h&1023;return exponent==0?sign*std::ldexp(float(fraction),-24):exponent==31?std::numeric_limits<float>::quiet_NaN():sign*std::ldexp(1.f+fraction/1024.f,int(exponent)-15);};
                out.uv.reserve(vertices*2);bool valid=true;
                for(unsigned i=0;i<vertices*2;++i){const auto value=half(r.Read<std::uint16_t>());if(!std::isfinite(value)||std::abs(value)>10000)valid=false;out.uv.push_back(value);}
                if(!valid)out.uv.clear();
            }
        }
        return out;
    }
    inline bool AttachmentSlotEqual(const std::string& a,const std::string& b){return a.size()==b.size()&&std::equal(a.begin(),a.end(),b.begin(),[](char x,char y){return (x>='A'&&x<='Z'?char(x+32):x)==(y>='A'&&y<='Z'?char(y+32):y);});}
    inline bool AttachmentMountMatches(const std::string& path,const std::string& child,const std::string& parent){
        if(AttachmentSlotEqual(child,parent))return true;
        // XM-2311's authored scope mount says ScopeMount, while its receiver
        // exposes Scope. Use that actual parent transform for this asset only.
        return AssetKey(path)=="meshes/weapons/m1919/m1919_scope_mount.nif"&&AttachmentSlotEqual(child,"ScopeMount")&&AttachmentSlotEqual(parent,"Scope");
    }
    inline std::vector<Mesh> Load(AssetStore& store, const std::vector<std::string>& models,unsigned quality=4) {
        std::vector<Mesh> out; std::size_t totalVertices=0,totalIndices=0;
        struct Part{std::string path;ModelScene scene;std::vector<GeometryRef> geometry;Matrix placement=Identity();bool placed=false;};std::vector<Part> parts;
        for(auto path:models) {
            path=AssetKey(path); if(!path.starts_with("meshes/"))path="meshes/"+path;
            Part part;part.path=path;part.geometry=ReadNif(store.Read(path),&part.scene,quality);part.placed=models.size()==1||part.scene.slots.empty();parts.push_back(std::move(part));
        }
        // Origin-authored wearable pieces need the installed body's bind pose even
        // when the mannequin is hidden. Already positioned pieces remain untouched.
        const bool needsPose=std::any_of(parts.begin(),parts.end(),[](const Part& part){return std::any_of(part.geometry.begin(),part.geometry.end(),[](const GeometryRef& ref){return OriginAttachment(ref);});});
        if(needsPose){std::unordered_map<std::string,Matrix> bones;const bool female=std::any_of(models.begin(),models.end(),[](std::string path){path=AssetKey(path);return path.ends_with("_f.nif");});
            for(const auto* body:{"body","head","hands","neck"})try{ModelScene scene;ReadNif(store.Read("meshes/actors/mannequin/mesh/outpost_mannequin_01/outpost_mannequin_"+std::string(body)+"_01_"+(female?"f":"m")+".nif"),&scene);for(const auto& [name,matrix]:scene.bones)bones.try_emplace(name,matrix);}catch(...){}
            for(auto& part:parts)ResolveRigidAttachments(part.geometry,bones);
        }
        for(std::size_t pass=0;pass<parts.size();++pass)for(auto& part:parts)if(!part.placed) {
            for(const auto& parent:parts)if(parent.placed&&!part.placed)for(const auto& mount:parent.scene.mounts)if(mount.slot.starts_with("P-")&&std::any_of(part.scene.slots.begin(),part.scene.slots.end(),[&](const auto& slot){return AttachmentMountMatches(part.path,slot,mount.slot.substr(2));})) {
                const auto host=parent.scene.nodes.find(mount.host);if(!mount.host.empty()&&host==parent.scene.nodes.end())continue;
                part.placement=Multiply(parent.placement,Multiply(host==parent.scene.nodes.end()?parent.scene.root:host->second,mount.transform));part.placed=true;break;
            }
        }
        for(const auto& part:parts){if(!part.placed)throw std::runtime_error("This modular model has an unresolved attachment point.");
            for(auto ref:part.geometry) {
                ref.transform=Multiply(part.placement,ref.transform);
                // Keep instancing when the same mesh appears at different transforms.
                auto mesh=ReadMesh(ref.embedded.empty()?store.Read(ref.path):ref.embedded,ref); totalVertices+=mesh.positions.size()/3; totalIndices+=mesh.indices.size();
                if(totalVertices>MaxVertices||totalIndices>MaxIndices)throw std::runtime_error("This model exceeds the experimental preview size limit.");
                out.push_back(std::move(mesh));
                if(out.size()>MaxPieces)throw std::runtime_error("Too many model pieces.");
            }
        }
        if(out.empty())throw std::runtime_error("No preview geometry was found."); return out;
    }
    inline void InsetMannequin(Mesh& mesh,float distance=.004f){
        using Key=std::array<long long,3>;std::map<Key,std::array<float,3>> normals;
        const auto key=[&](std::size_t at){return Key{std::llround(mesh.positions[at]*100000),std::llround(mesh.positions[at+1]*100000),std::llround(mesh.positions[at+2]*100000)};};
        for(std::size_t i=0;i<mesh.indices.size();i+=3){const auto a=mesh.indices[i]*3,b=mesh.indices[i+1]*3,c=mesh.indices[i+2]*3;const auto& p=mesh.positions;const float ux=p[b]-p[a],uy=p[b+1]-p[a+1],uz=p[b+2]-p[a+2],vx=p[c]-p[a],vy=p[c+1]-p[a+1],vz=p[c+2]-p[a+2];const std::array<float,3> n{uy*vz-uz*vy,uz*vx-ux*vz,ux*vy-uy*vx};for(auto at:{a,b,c})for(unsigned k=0;k<3;++k)normals[key(at)][k]+=n[k];}
        double orientation=0;for(std::size_t i=0;i<mesh.positions.size();i+=3)for(unsigned k=0;k<3;++k)orientation+=mesh.positions[i+k]*normals[key(i)][k];
        const float sign=orientation<0?-1.f:1.f;
        for(std::size_t i=0;i<mesh.positions.size();i+=3){const auto n=normals[key(i)];const float length=std::hypot(n[0],n[1],n[2]);if(length>1e-12f)for(unsigned k=0;k<3;++k)mesh.positions[i+k]-=distance*sign*n[k]/length;}
    }
    inline void AddMannequin(AssetStore& store,std::vector<Mesh>& meshes,bool male=false,unsigned quality=4) {
        const std::string folder="meshes/actors/mannequin/mesh/outpost_mannequin_01/";
        for(const auto* part:{"body","head","hands","neck"})try {
            auto pieces=Load(store,{folder+"outpost_mannequin_"+part+"_01_"+(male?"m":"f")+".nif"},quality);
            for(auto& piece:pieces){InsetMannequin(piece,std::string(part)=="body"?.008f:.002f);piece.mannequin=true;meshes.push_back(std::move(piece));}
        }catch(...){}
    }
    template<class T> inline void Append(Bytes& output, const T& value) { const auto* p=reinterpret_cast<const std::uint8_t*>(&value); output.insert(output.end(),p,p+sizeof(T)); }
    inline Bytes Pack(const std::vector<Mesh>& meshes,std::size_t maxBytes=64*1024*1024) {
        std::size_t vertices=0,indices=0;for(const auto& mesh:meshes){vertices+=mesh.positions.size()/3;indices+=mesh.indices.size();}
        if(meshes.empty()||meshes.size()>MaxPieces||vertices>MaxVertices||indices>MaxIndices)throw std::runtime_error("This combined model exceeds the preview limits.");
        const bool hasMetal=std::any_of(meshes.begin(),meshes.end(),[](const Mesh& mesh){return !mesh.metalPixels.empty();});
        Bytes out; Append(out,std::uint32_t(0x50504343)); Append(out,std::uint32_t(std::any_of(meshes.begin(),meshes.end(),[](const Mesh& mesh){return !mesh.metalPixels.empty();})?9:std::any_of(meshes.begin(),meshes.end(),[](const Mesh& mesh){return mesh.normalOnly;})?8:7)); Append(out,std::uint32_t(meshes.size()));
        struct PackedTexture{std::uint32_t width,height;const Bytes* pixels;};std::vector<PackedTexture> textures;
        const auto textureId=[&](std::uint32_t width,std::uint32_t height,const Bytes& pixels)->std::uint32_t{
            if(pixels.empty())return 0;if(!width||!height||width>4096||height>4096||pixels.size()!=std::size_t(width)*height*4)throw std::runtime_error("Invalid model texture.");
            for(std::size_t i=0;i<textures.size();++i)if(textures[i].width==width&&textures[i].height==height&&*textures[i].pixels==pixels)return i+1;
            textures.push_back({width,height,&pixels});return textures.size();
        };
        for(const auto& mesh:meshes){Append(out,std::uint32_t(mesh.positions.size()/3));Append(out,std::uint32_t(mesh.indices.size()));for(auto v:mesh.positions)Append(out,v);for(auto i:mesh.indices)Append(out,i);
            const auto color=textureId(mesh.textureWidth,mesh.textureHeight,mesh.pixels),normal=textureId(mesh.normalWidth,mesh.normalHeight,mesh.normalPixels);
            Append(out,std::uint32_t(mesh.mannequin?1:0)|(mesh.tinted?2u:0u)|(mesh.glass?4u:0u)|((mesh.decal||[&]{auto name=mesh.material;for(auto& c:name)if(c>='A'&&c<='Z')c+=32;return name;}().find("decal")!=std::string::npos)?8u:0u)|(mesh.incompleteMaterial?16u:0u)|(mesh.normalOnly?32u:0u));Append(out,color);for(auto c:mesh.tint)Append(out,c);Append(out,normal);if(hasMetal)Append(out,textureId(mesh.metalWidth,mesh.metalHeight,mesh.metalPixels));
            for(std::size_t i=0;i<mesh.positions.size()/3*2;++i)Append(out,mesh.uv.size()>i?mesh.uv[i]:0.f);
        }
        Append(out,std::uint32_t(textures.size()));for(const auto& texture:textures){Append(out,texture.width);Append(out,texture.height);out.insert(out.end(),texture.pixels->begin(),texture.pixels->end());}
        if(out.size()>maxBytes)throw std::runtime_error("Preview data exceeds the transfer limit."); return out;
    }
    inline std::string Base64(std::span<const std::uint8_t> data) {
        constexpr char alphabet[]="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/"; std::string s; s.reserve((data.size()+2)/3*4);
        for(std::size_t i=0;i<data.size();i+=3) { const unsigned a=data[i], b=i+1<data.size()?data[i+1]:0,c=i+2<data.size()?data[i+2]:0; const auto n=(a<<16)|(b<<8)|c;
            s+=alphabet[n>>18]; s+=alphabet[(n>>12)&63]; s+=i+1<data.size()?alphabet[(n>>6)&63]:'='; s+=i+2<data.size()?alphabet[n&63]:'='; }
        return s;
    }
}

