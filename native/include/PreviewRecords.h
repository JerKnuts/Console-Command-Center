#pragma once
#include "PreviewGeometry.h"
#include <memory>
namespace CCC::Preview {
    struct ScenePlugin {std::string name;unsigned kind=0,index=0;std::vector<std::string> masters;};
    struct PlacedModel {std::string path;Matrix transform=Identity();};
    class RecordScenes {
        struct Entry{std::size_t plugin;std::uint64_t offset;std::uint32_t size,flags;std::string type;};
        struct Range{std::size_t plugin;std::uint64_t start,end;};
        std::filesystem::path directory;std::vector<ScenePlugin> plugins;std::unordered_map<std::string,std::size_t> names;
        std::unordered_map<std::uint32_t,Entry> records;std::unordered_map<std::uint32_t,std::vector<Range>> cells;bool indexed=false;
        static std::string Lower(std::string s){for(auto& c:s)if(c>='A'&&c<='Z')c+=32;return s;}
        std::uint32_t Remap(std::size_t owner,std::uint32_t raw)const{const auto& source=plugins[owner];const auto ordinal=raw>>24;std::size_t target=owner;if(ordinal<source.masters.size()){const auto found=names.find(Lower(source.masters[ordinal]));if(found==names.end())return 0;target=found->second;}else if(ordinal!=source.masters.size())return 0;const auto& p=plugins[target];return p.kind==2?0xfe000000u|((p.index&0xfff)<<12)|(raw&0xfff):p.kind==1?0xfd000000u|((p.index&0xff)<<16)|(raw&0xffff):((p.index&0xff)<<24)|(raw&0xffffff);}
        template<class F> static void Fields(std::span<const std::uint8_t> bytes,F visit){Reader r{bytes};while(r.at+6<=bytes.size()){const auto tag=r.Text(4);std::uint32_t n=r.Read<std::uint16_t>();if(tag=="XXXX"){if(n!=4||r.at+10>bytes.size())throw std::runtime_error("Invalid extended model record.");n=r.Read<std::uint32_t>();const auto next=r.Text(4);r.Skip(2);r.Need(n);visit(next,bytes.subspan(r.at,n));}else{r.Need(n);visit(tag,bytes.subspan(r.at,n));}r.Skip(n);}}
        Bytes Read(const Entry& entry)const{auto bytes=ReadRange(directory/plugins[entry.plugin].name,entry.offset,entry.size);if(entry.flags&0x40000){Reader r{bytes};const auto n=r.Read<std::uint32_t>();if(!n||n>8u*1024*1024)throw std::runtime_error("Assembly record exceeds the preview limit.");Bytes out(n);uLongf length=n;if(uncompress(out.data(),&length,bytes.data()+4,bytes.size()-4)!=Z_OK||length!=n)throw std::runtime_error("Unsupported assembly record compression.");return out;}return bytes;}
        void Index(){records.clear();cells.clear();for(auto& plugin:plugins)plugin.masters.clear();for(std::size_t p=0;p<plugins.size();++p){std::ifstream f(directory/plugins[p].name,std::ios::binary|std::ios::ate);if(!f)continue;const auto size=std::uint64_t(f.tellg());f.seekg(0);std::uint64_t at=0;
            while(at+24<=size){f.seekg(at);std::array<std::uint8_t,24> h{};if(!f.read(reinterpret_cast<char*>(h.data()),24))break;Reader r{h};const auto type=r.Text(4);const auto length=r.Read<std::uint32_t>();const auto flags=r.Read<std::uint32_t>(),raw=r.Read<std::uint32_t>();
                if(type=="GRUP"){if(length<24||length>size-at)throw std::runtime_error("Invalid assembly group bounds.");const auto label=flags,group=raw;if(group==6){const auto cell=Remap(p,label);if(cell)cells[cell].push_back({p,at+24,at+length});at+=length;continue;}
                    if(group==0&&std::string("|TES4|ARMO|ARMA|LMSW|WEAP|OMOD|ARMO|ARMA|LMSW|GBFM|PKIN|STAT|MSTT|FURN|ACTI|CONT|DOOR|COBJ|MTPT|MISC|ALCH|AMMO|BOOK|KEYM|CELL|").find("|"+std::string(reinterpret_cast<const char*>(&label),4)+"|")==std::string::npos){at+=length;continue;}at+=24;continue;}
                if(length>size-at-24||length>8u*1024*1024)throw std::runtime_error("Invalid assembly record bounds.");
                if(type=="TES4"){const auto bytes=ReadRange(directory/plugins[p].name,at+24,length);Fields(bytes,[&](const std::string& tag,std::span<const std::uint8_t> value){if(tag=="MAST"){std::string name(reinterpret_cast<const char*>(value.data()),value.size());if(auto end=name.find('\0');end!=name.npos)name.resize(end);plugins[p].masters.push_back(std::move(name));}});}
                else if(std::string("|ARMO|ARMA|LMSW|WEAP|OMOD|GBFM|PKIN|STAT|MSTT|FURN|ACTI|CONT|DOOR|COBJ|MTPT|MISC|ALCH|AMMO|BOOK|KEYM|").find("|"+type+"|")!=std::string::npos){const auto id=Remap(p,raw);if(id){if(flags&0x20)records.erase(id);else records[id]={p,at+24,length,flags,type};if(records.size()>500000)throw std::runtime_error("Assembly record index exceeds the preview limit.");}}
                at+=24+length;
            }
        }indexed=true;}
        static Matrix Placement(const std::array<float,6>& data,float scale){for(auto value:data)if(!std::isfinite(value)||std::abs(value)>1e7f)throw std::runtime_error("Invalid assembly placement.");if(!std::isfinite(scale)||scale<=0||scale>1000)throw std::runtime_error("Invalid assembly scale.");
            const float x=-data[3],y=-data[4],z=-data[5],cx=std::cos(x),sx=std::sin(x),cy=std::cos(y),sy=std::sin(y),cz=std::cos(z),sz=std::sin(z);
            Matrix m{cz*cy,cz*sy*sx-sz*cx,cz*sy*cx+sz*sx,data[0],sz*cy,sz*sy*sx+cz*cx,sz*sy*cx-cz*sx,data[1],-sy,cy*sx,cy*cx,data[2],0,0,0,1};for(unsigned row=0;row<3;++row)for(unsigned col=0;col<3;++col)m[row*4+col]*=scale;return m;
        }
        void Resolve(std::uint32_t id,const Matrix& world,std::vector<PlacedModel>& out,std::unordered_set<std::uint32_t>& visiting,unsigned depth){if(depth>8||!visiting.insert(id).second)throw std::runtime_error("Cyclic or too deeply nested assembly.");struct Remove{std::unordered_set<std::uint32_t>& set;std::uint32_t id;~Remove(){set.erase(id);}}remove{visiting,id};const auto found=records.find(id);if(found==records.end())return;const auto entry=found->second;std::uint32_t link=0,cell=0;std::string model;
            const auto bytes=Read(entry);Fields(bytes,[&](const std::string& tag,std::span<const std::uint8_t> value){if((tag=="MODL"||tag=="MOD2")&&value.size()>4&&value.size()<1024){std::string path(reinterpret_cast<const char*>(value.data()),value.size());if(auto end=path.find('\0');end!=path.npos)path.resize(end);try{path=AssetKey(path);if(path.ends_with(".nif")&&model.empty())model=std::move(path);}catch(...){}}if(value.size()==4){Reader r{value};if(tag=="FLFM"&&entry.type=="GBFM"&&!link)link=Remap(entry.plugin,r.Read<std::uint32_t>());else if(tag=="CNAM"&&entry.type=="PKIN")cell=Remap(entry.plugin,r.Read<std::uint32_t>());else if(tag=="CNAM"&&entry.type=="COBJ")link=Remap(entry.plugin,r.Read<std::uint32_t>());}});
            if(!model.empty()){auto key=model;if(key.starts_with("data/"))key.erase(0,5);if(key.starts_with("meshes/"))key.erase(0,7);if(key=="markerx.nif"||key.starts_with("markers/")||key.find("/markers/")!=key.npos)return;out.push_back({std::move(model),world});if(out.size()>64)throw std::runtime_error("This assembly has too many model parts.");return;}if(link){Resolve(link,world,out,visiting,depth+1);return;}if(!cell)return;
            struct Ref{std::uint32_t base;Matrix transform;};std::unordered_map<std::uint32_t,Ref> refs;
            for(const auto& range:cells[cell]){std::uint64_t at=range.start;while(at+24<=range.end){const auto header=ReadRange(directory/plugins[range.plugin].name,at,24);Reader r{header};const auto type=r.Text(4);const auto length=r.Read<std::uint32_t>(),flags=r.Read<std::uint32_t>(),raw=r.Read<std::uint32_t>();if(type=="GRUP"){if(length<24||length>range.end-at)throw std::runtime_error("Invalid assembly child group.");at+=24;continue;}if(length>range.end-at-24||length>8u*1024*1024)throw std::runtime_error("Invalid placed model bounds.");const auto refId=Remap(range.plugin,raw);if(type=="REFR"&&refId){if(flags&0x820){refs.erase(refId);at+=24+length;continue;}std::uint32_t base=0;std::array<float,6> data{};float scale=1;const auto bytes=Read({range.plugin,at+24,length,flags,type});Fields(bytes,[&](const std::string& tag,std::span<const std::uint8_t> value){Reader v{value};if(tag=="NAME"&&value.size()==4)base=Remap(range.plugin,v.Read<std::uint32_t>());else if(tag=="DATA"&&value.size()==24)for(auto& n:data)n=v.Float();else if(tag=="XSCL"&&value.size()==4)scale=v.Float();});if(base)refs[refId]={base,Placement(data,scale)};if(refs.size()>256)throw std::runtime_error("Assembly has too many placed references.");}at+=24+length;}}
            std::vector<std::uint32_t> ordered;for(const auto& [id,ref]:refs)ordered.push_back(id);std::sort(ordered.begin(),ordered.end());for(const auto refId:ordered){const auto& ref=refs.at(refId);Resolve(ref.base,Multiply(world,ref.transform),out,visiting,depth+1);}
        }
    public:
        RecordScenes(std::filesystem::path data,std::vector<ScenePlugin> sources):directory(std::move(data)),plugins(std::move(sources)){for(std::size_t i=0;i<plugins.size();++i){if(plugins[i].name!=std::filesystem::path(plugins[i].name).filename().string())throw std::runtime_error("Invalid model plugin name.");names[Lower(plugins[i].name)]=i;}}
        bool IsWeapon(std::uint32_t id){if(!indexed)Index();const auto it=records.find(id);return it!=records.end()&&it->second.type=="WEAP";}
        std::vector<std::string> WeaponModels(std::uint32_t id){if(!indexed)Index();std::vector<std::string> paths;std::unordered_set<std::uint32_t> visiting,done;
            const auto add=[&](std::string path){if(auto end=path.find('\0');end!=path.npos)path.resize(end);path=AssetKey(path);if(!path.ends_with(".nif"))throw std::runtime_error("Unsupported weapon model path.");if(std::find(paths.begin(),paths.end(),path)==paths.end())paths.push_back(std::move(path));if(paths.size()>32)throw std::runtime_error("Too many default weapon attachments.");};
            const auto visit=[&](auto&& self,std::uint32_t current,unsigned depth)->void{
                if(done.contains(current))return;if(depth>8||!visiting.insert(current).second)throw std::runtime_error("Cyclic default weapon attachments.");
                const auto found=records.find(current);if(found==records.end())throw std::runtime_error("A default weapon attachment record is not loaded.");const auto entry=found->second;if(entry.type!="WEAP"&&entry.type!="OMOD"){visiting.erase(current);done.insert(current);return;}
                const auto bytes=Read(entry);std::vector<std::uint32_t> children;bool first=true;std::string model;
                Fields(bytes,[&](const std::string& tag,std::span<const std::uint8_t> value){
                    if(tag=="MODL"&&value.size()>4&&value.size()<1024)model.assign(reinterpret_cast<const char*>(value.data()),value.size());
                    if(entry.type=="WEAP"&&tag=="OBTS"&&first){first=false;Reader r{value};if(value.size()<18)throw std::runtime_error("Unsupported default weapon template.");const auto count=r.Read<std::uint32_t>();r.Skip(11);const auto parent=r.Read<std::uint8_t>();if(parent>1||count>128)throw std::runtime_error("Invalid default weapon template.");if(parent){const auto base=Remap(entry.plugin,r.Read<std::uint32_t>());if(!count&&base)children.push_back(base);}r.Skip(2);r.Need(std::size_t(count)*7);for(unsigned i=0;i<count;++i){children.push_back(Remap(entry.plugin,r.Read<std::uint32_t>()));r.Skip(3);}}
                    if(entry.type=="OMOD"&&tag=="DATA"){Reader r{value};if(value.size()<14)throw std::runtime_error("Unsupported weapon attachment data.");const auto count=r.Read<std::uint32_t>();r.Skip(6);auto type=r.String();if(auto end=type.find('\0');end!=type.npos)type.resize(end);if(type!="TESObjectWEAP_InstanceData")return;if(count>128)throw std::runtime_error("Too many included weapon attachments.");r.Skip(6);const auto slots=r.Read<std::uint32_t>();if(slots>128)throw std::runtime_error("Too many weapon parent slots.");r.Skip(std::size_t(slots)*4+4);r.Need(std::size_t(count)*7);for(unsigned i=0;i<count;++i){children.push_back(Remap(entry.plugin,r.Read<std::uint32_t>()));r.Skip(3);}}
                });
                if(!model.empty()){add(model);if(entry.type=="WEAP"&&AssetKey(model.substr(0,model.find('\0'))).find("dummy")==std::string::npos)children.clear();}
                for(const auto child:children)if(child)self(self,child,depth+1);visiting.erase(current);done.insert(current);
            };visit(visit,id,0);if(paths.empty())throw std::runtime_error("This weapon has no supported default model.");return paths;
        }
        std::vector<PlacedModel> Models(std::uint32_t id){if(!indexed)Index();if(IsWeapon(id)){std::vector<PlacedModel> out;for(auto path:WeaponModels(id))out.push_back({path,Identity()});return out;}std::vector<PlacedModel> out;std::unordered_set<std::uint32_t> visiting;Resolve(id,Identity(),out,visiting,0);if(out.empty())throw std::runtime_error("This object has no supported model or assembly geometry.");return out;}
        void ApplyMaterialSwaps(std::uint32_t id,std::vector<Mesh>& meshes,bool male=true){if(!indexed)Index();std::vector<std::uint32_t> swaps;std::unordered_set<std::uint32_t> seen;
            const auto gather=[&](auto&& self,std::uint32_t id,unsigned depth)->void{
                if(depth>8||!seen.insert(id).second)return;const auto found=records.find(id);if(found==records.end())return;const auto entry=found->second;
                std::vector<std::uint32_t> addons,children,own;bool firstTemplate=true;const auto bytes=Read(entry);
                // Default object templates carry typed 24-byte properties, including
                // material swaps. A loaded base DDS is not the item's final variant.
                const auto properties=[&](Reader& r,unsigned count,std::vector<std::uint32_t>& output){
                    if(count>512)throw std::runtime_error("Too many default appearance properties.");r.Need(std::size_t(count)*24);
                    for(unsigned i=0;i<count;++i){const auto type=r.Read<std::uint32_t>(),operation=r.Read<std::uint32_t>();r.Skip(4);const auto target=Remap(entry.plugin,r.Read<std::uint32_t>());r.Skip(8);
                        const auto swap=records.find(target);if(type==4&&operation==0&&swap!=records.end()&&swap->second.type=="LMSW")output.push_back(target);}
                };
                Fields(bytes,[&](const std::string& tag,std::span<const std::uint8_t> value){Reader r{value};
                    if(entry.type=="ARMO"&&tag=="MODL"&&value.size()==4)addons.push_back(Remap(entry.plugin,r.Read<std::uint32_t>()));
                    if((tag=="MLM1"||tag=="MLM2"||tag=="MLM3"||tag=="MSWP"||tag=="MOLM")&&value.size()>=4&&(entry.type!="ARMA"||tag==(male?"MLM1":"MLM2"))){if(tag=="MSWP"&&value.size()==4)own.push_back(Remap(entry.plugin,r.Read<std::uint32_t>()));else if(value.size()>=6){const auto count=r.Read<std::uint16_t>();if(count<=64&&value.size()==2+count*4)for(unsigned i=0;i<count;++i)own.push_back(Remap(entry.plugin,r.Read<std::uint32_t>()));}}
                    if((entry.type=="ARMO"||entry.type=="WEAP")&&tag=="OBTS"&&firstTemplate){firstTemplate=false;
                        try{const auto count=r.Read<std::uint32_t>(),propertyCount=r.Read<std::uint32_t>();r.Skip(7);const auto hasParent=r.Read<std::uint8_t>();r.Skip(2);
                            if(count>128||hasParent>1)throw std::runtime_error("Invalid default appearance template.");std::vector<std::uint32_t> links,swaps;
                            if(hasParent){const auto parent=Remap(entry.plugin,r.Read<std::uint32_t>());if(!count&&parent)links.push_back(parent);}r.Need(std::size_t(count)*7);
                            for(unsigned i=0;i<count;++i){links.push_back(Remap(entry.plugin,r.Read<std::uint32_t>()));r.Skip(3);}properties(r,propertyCount,swaps);
                            children.insert(children.end(),links.begin(),links.end());own.insert(own.end(),swaps.begin(),swaps.end());
                        }catch(...){} // An unsupported template must not disable base geometry.
                    }
                    if(entry.type=="OMOD"&&tag=="DATA")try{
                        const auto count=r.Read<std::uint32_t>(),propertyCount=r.Read<std::uint32_t>();r.Skip(2);auto type=r.String();if(auto end=type.find('\0');end!=type.npos)type.resize(end);
                        if(type!="TESObjectWEAP_InstanceData"&&type!="TESObjectARMOR_InstanceData")return;r.Skip(6);const auto slots=r.Read<std::uint32_t>();if(count>128||slots>128)throw std::runtime_error("Invalid included appearance attachments.");r.Skip(std::size_t(slots)*4+4);r.Need(std::size_t(count)*7);
                        std::vector<std::uint32_t> links,swaps;for(unsigned i=0;i<count;++i){links.push_back(Remap(entry.plugin,r.Read<std::uint32_t>()));r.Skip(3);}properties(r,propertyCount,swaps);
                        children.insert(children.end(),links.begin(),links.end());own.insert(own.end(),swaps.begin(),swaps.end());
                    }catch(...){}
                });
                for(auto addon:addons)self(self,addon,depth+1);for(auto child:children)self(self,child,depth+1);swaps.insert(swaps.end(),own.begin(),own.end());
            };gather(gather,id,0);
            const auto material=[](std::string path){for(auto& c:path){if(c=='\\')c='/';else if(c>='A'&&c<='Z')c+=32;}
                // Some shipped swaps retain the developer's export directory.
                // Normalize the metadata; never use that absolute path for file IO.
                if(path.size()>2&&path[1]==':'&&path[2]=='/'){const auto at=path.find("/data/materials/");if(at!=path.npos)path.erase(0,at+6);}
                if(path.starts_with("/materials/")||path.starts_with("/data/materials/"))path.erase(0,1);
                path=AssetKey(std::move(path));if(path.starts_with("data/"))path.erase(0,5);if(!path.starts_with("materials/"))path="materials/"+path;return path;};
            const auto pathForm=[&](std::uint32_t raw,std::size_t owner){std::string path;const auto found=records.find(Remap(owner,raw));if(found==records.end()||found->second.type!="MTPT")return path;const auto bytes=Read(found->second);Fields(bytes,[&](const std::string& tag,std::span<const std::uint8_t> data){if(tag!="REFL")return;Reader r{data};while(r.at+8<=data.size()){const auto type=r.Text(4);const auto n=r.Read<std::uint32_t>();r.Need(n);if(type=="OBJT"&&n>=6){Reader value{data.subspan(r.at,n)};value.Skip(4);auto text=value.Text(value.Read<std::uint16_t>());if(auto end=text.find('\0');end!=text.npos)text.resize(end);try{auto key=material(text);if(key.ends_with(".mat"))path=key;}catch(...){}}r.Skip(n);}});return path;};
            const auto formPairs=[&](std::span<const std::uint8_t> data,std::size_t owner){std::vector<std::string> out;std::span<const std::uint8_t> strings;std::vector<std::span<const std::uint8_t>> lists;Reader input{data};try{while(input.at+8<=data.size()){const auto tag=input.Text(4);const auto n=input.Read<std::uint32_t>();input.Need(n);if(tag=="STRT")strings=data.subspan(input.at,n);else if(tag=="LIST")lists.push_back(data.subspan(input.at,n));input.Skip(n);}for(auto bytes:lists){Reader r{bytes};if(bytes.size()<8)continue;const auto type=r.Read<std::uint32_t>(),count=r.Read<std::uint32_t>();if(type>=strings.size()||count>64)continue;const auto nameBytes=strings.subspan(type);const auto end=std::find(nameBytes.begin(),nameBytes.end(),0);if(end==nameBytes.end()||std::string(nameBytes.begin(),end)!="BGSLayeredMaterialSwap::Entry")continue;
                    for(unsigned i=0;i<count;++i){auto key=r.Text(r.Read<std::uint16_t>());if(auto end=key.find('\0');end!=key.npos)key.resize(end);if(r.Read<std::uint32_t>()!=0xffffff0du)return std::vector<std::string>{};const auto raw=r.Read<std::uint32_t>();auto replacement=r.Text(r.Read<std::uint16_t>());if(auto end=replacement.find('\0');end!=replacement.npos)replacement.resize(end);if(raw)key=pathForm(raw,owner);try{key=material(key);replacement=material(replacement);if(key.ends_with(".mat")&&replacement.ends_with(".mat")){out.push_back(key);out.push_back(replacement);}}catch(...){}}
                }}catch(...){out.clear();}return out;};
            std::vector<std::string> original;for(const auto& mesh:meshes)try{original.push_back(material(mesh.material));}catch(...){original.emplace_back();}
            for(auto id:swaps){const auto found=records.find(id);if(found==records.end()||found->second.type!="LMSW")continue;const auto bytes=Read(found->second);std::vector<std::string> paths;Fields(bytes,[&](const std::string& tag,std::span<const std::uint8_t> value){if(tag!="REFL")return;const auto linked=formPairs(value,found->second.plugin);if(!linked.empty()){paths.insert(paths.end(),linked.begin(),linked.end());return;}for(std::size_t at=0;at<value.size();){while(at<value.size()&&(value[at]<32||value[at]>126))++at;const auto start=at;while(at<value.size()&&value[at]>=32&&value[at]<=126)++at;if(at-start<5||at-start>1024)continue;std::string path(reinterpret_cast<const char*>(value.data()+start),at-start);try{path=material(path);if(path.ends_with(".mat")&&path.find('/')!=path.npos)paths.push_back(std::move(path));}catch(...){}}});if(paths.size()%2)continue;
                // Item templates override addon defaults by their authored source
                // material, even after an earlier swap replaced that source.
                for(std::size_t m=0;m<meshes.size();++m)try{const auto current=material(meshes[m].material);for(std::size_t i=0;i+1<paths.size();i+=2)if(current==paths[i]||original[m]==paths[i]){meshes[m].material=paths[i+1];break;}}catch(...){}

            }
        }
        std::vector<Mesh> LoadModels(AssetStore& assets,std::uint32_t id){if(IsWeapon(id))return Load(assets,WeaponModels(id));std::vector<Mesh> out;std::size_t vertices=0,indices=0;for(const auto& model:Models(id)){auto pieces=Load(assets,{model.path});for(auto& mesh:pieces){for(std::size_t at=0;at<mesh.positions.size();at+=3){const std::array<float,3> p{mesh.positions[at],mesh.positions[at+1],mesh.positions[at+2]};for(unsigned row=0;row<3;++row)mesh.positions[at+row]=model.transform[row*4+3]+model.transform[row*4]*p[0]+model.transform[row*4+1]*p[1]+model.transform[row*4+2]*p[2];}vertices+=mesh.positions.size()/3;indices+=mesh.indices.size();if(out.size()>=MaxPieces||vertices>MaxVertices||indices>MaxIndices)throw std::runtime_error("This assembly exceeds the preview geometry limit.");out.push_back(std::move(mesh));}}return out;}
    };
    // Every record-backed preview obtains the reader through this accessor.
    // A cold weapon preview must not depend on another item initializing it.
    inline RecordScenes& EnsureRecordScenes(std::unique_ptr<RecordScenes>& cache,const std::filesystem::path& directory,const std::vector<ScenePlugin>& plugins) {
        if(!cache)cache=std::make_unique<RecordScenes>(directory,plugins);
        return *cache;
    }

}
