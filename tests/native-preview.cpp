#include "PreviewTextures.h"
#include "PreviewRecords.h"
#include "PreviewTransfer.h"
#include "SlateVoiceAssets.h"
#include "RecordDescriptions.h"
#include <iostream>
#include "native-material-graph.h"
using namespace CCC::Preview;
int main(int argc,char** argv) {
    try {
        if(argc==4&&std::string(argv[2])=="--slate-audit"){
            const std::vector<ScenePlugin> plugins{{"Starfield.esm",0,0},{"ShatteredSpace.esm",0,1},{"SFBGS00D.esm",0,2},{"SFBGS050.esm",0,3}};RecordScenes scenes(argv[1],plugins);CCC::Details::SlateVoiceAssets assets(argv[1],plugins);std::ifstream input(argv[3]);std::string line;unsigned count=0,failed=0,voices=0;
            while(std::getline(input,line)){try{auto tracks=scenes.AudioTracks(std::stoul(line,nullptr,16));if(tracks.empty())throw std::runtime_error("No recording lines");for(const auto& track:tracks){auto bytes=assets.Read(track);if(bytes.size()<12||std::memcmp(bytes.data(),"RIFF",4))throw std::runtime_error("Invalid voice data");++voices;}++count;}catch(const std::exception& e){++failed;std::cout<<line<<": "<<e.what()<<"\n";}}
            std::cout<<count<<" audio slates resolved, "<<voices<<" voice lines read, "<<failed<<" failures\n";return failed?1:0;
        }
        if(argc==5&&std::string(argv[2])=="--slate-audio"){
            const std::vector<ScenePlugin> plugins{{"Starfield.esm",0,0},{"ShatteredSpace.esm",0,1},{"SFBGS00D.esm",0,2},{"SFBGS050.esm",0,3}};RecordScenes scenes(argv[1],plugins);auto tracks=scenes.AudioTracks(std::stoul(argv[3],nullptr,16));CCC::Details::SlateVoiceAssets assets(argv[1],plugins);CCC::Details::DescriptionStore descriptions(argv[1],".ilstrings");std::filesystem::create_directories(argv[4]);nlohmann::json report=nlohmann::json::array();
            for(unsigned i=0;i<tracks.size();++i){const auto& track=tracks[i];auto bytes=assets.Read(track);const auto path=std::filesystem::path(argv[4])/(std::to_string(i)+".wem");std::ofstream out(path,std::ios::binary);out.write(reinterpret_cast<const char*>(bytes.data()),bytes.size());std::string text;if(track.localized&&track.text.size()==4){Reader r{track.text};text=descriptions.Lookup(track.plugin,"en",r.Read<std::uint32_t>());}else text=CCC::Details::Text(track.text);report.push_back({{"index",i},{"text",text},{"wem",std::format("{:08x}",track.wem)},{"bytes",bytes.size()}});}
            std::ofstream out(std::filesystem::path(argv[4])/"tracks.json");out<<report.dump(2);std::cout<<tracks.size()<<" installed voice lines exported for isolated playback validation\n";return 0;
        }
        if(argc==4&&std::string(argv[2])=="--slate-tracks"){
            RecordScenes scenes(argv[1],{{"Starfield.esm",0,0},{"ShatteredSpace.esm",0,1},{"SFBGS00D.esm",0,2},{"SFBGS050.esm",0,3}});const auto id=std::stoul(argv[3],nullptr,16);auto tracks=scenes.AudioTracks(id);std::cout<<tracks.size()<<" audio lines\n";for(const auto& line:tracks)std::cout<<line.plugin<<"|"<<std::format("{:08x}",line.wem)<<"|"<<line.voice<<"\n";return 0;
        }
        if(argc==5&&std::string(argv[2])=="--extract-asset"){
            AssetStore source(argv[1]);const auto bytes=source.Read(argv[3]);std::ofstream out(argv[4],std::ios::binary);if(!out.write(reinterpret_cast<const char*>(bytes.data()),bytes.size()))throw std::runtime_error("Diagnostic asset write failed.");return 0;
        }
        if(argc>=4&&std::string(argv[2])=="--inspect-attachment"){
            AssetStore assets(argv[1],{"Starfield.esm","ShatteredSpace.esm"});
            for(int i=3;i<argc;++i){ModelScene scene;auto refs=ReadNif(assets.Read(argv[i]),&scene);std::cout<<argv[i]<<"\n";
                for(const auto& ref:refs){std::cout<<ref.name<<" mesh="<<ref.path<<" bone="<<ref.bone<<" rigid="<<ref.rigid<<" origin="<<OriginAttachment(ref)<<" world=";for(const auto v:ref.transform)std::cout<<v<<',';std::cout<<" bind=";for(const auto v:ref.bind)std::cout<<v<<',';std::cout<<"\n";}
                for(const auto& [name,matrix]:scene.bones){std::cout<<"BONE "<<name<<' ';for(const auto v:matrix)std::cout<<v<<',';std::cout<<"\n";}
            }return 0;
        }
        if(argc>=5&&std::string(argv[2])=="--audit-variants"){
            std::vector<ScenePlugin> plugins;for(int i=4;i<argc;++i)plugins.push_back({argv[i],0,unsigned(i-4)});RecordScenes scenes(argv[1],plugins);std::ifstream input(argv[3]);std::string line;unsigned checked=0,failed=0;
            while(std::getline(input,line)){const auto a=line.find('|'),b=line.find('|',a+1);if(a==line.npos||b==line.npos)throw std::runtime_error("Invalid variant audit row.");const auto id=std::stoul(line.substr(0,a),nullptr,16);std::vector<Mesh> pieces{Mesh{}};pieces[0].material=line.substr(a+1,b-a-1);scenes.ApplyMaterialSwaps(id,pieces);const auto expected=line.substr(b+1);++checked;if(pieces[0].material!=expected){++failed;std::cout<<line.substr(0,a)<<" expected "<<expected<<" got "<<pieces[0].material<<"\n";}}
            std::cout<<checked<<" authored material rules checked, "<<failed<<" mismatches\n";return failed||!checked?1:0;
        }
        if(argc>=5&&std::string(argv[2])=="--compare-materials"){
            AssetStore source(argv[1]);MaterialDatabase fast(source.data);const auto databaseSize=std::filesystem::file_size(argv[3]);if(databaseSize>128u*1024*1024)throw std::runtime_error("Material database too large.");Bytes database(databaseSize);std::ifstream db(argv[3],std::ios::binary);if(!db.read(reinterpret_cast<char*>(database.data()),database.size()))throw std::runtime_error("Material database read failed.");const auto graph=ReadMaterialInheritance(database);
            const auto print=[](const char* label,const MaterialAppearance& a){std::cout<<label<<" color="<<a.texture<<" opacity="<<a.opacity<<" normal="<<a.normal<<" tint="<<a.tinted<<":"<<a.tint[0]<<","<<a.tint[1]<<","<<a.tint[2]<<" constant="<<a.constantColor<<":"<<a.color[0]<<","<<a.color[1]<<","<<a.color[2]<<"\n";};
            for(int i=4;i<argc;++i){std::cout<<argv[i]<<"\n";print("fast",fast.Find(argv[i]));auto key=MaterialKey(argv[i]);auto found=graph.find(key);if(found==graph.end())found=graph.find(MaterialName(key));if(found!=graph.end())print("graph",found->second);else std::cout<<"graph not resolved\n";}
            return 0;
        }
        if(argc>=4&&std::string(argv[2])=="--inspect-materials"){
            AssetStore source(argv[1]);std::vector<std::filesystem::path> archives;for(const auto& a:source.archives)archives.push_back(a.path);MaterialDatabase database(source.data,archives);
            for(int i=3;i<argc;++i){const auto a=database.Find(argv[i]);std::cout<<argv[i]<<"\n color="<<a.texture<<" opacity="<<a.opacity<<" normal="<<a.normal<<" rough="<<a.roughness<<" metal="<<a.metal<<" ao="<<a.ao<<" constantColor="<<a.constantColor<<" rgb="<<a.color[0]<<","<<a.color[1]<<","<<a.color[2]<<" tint="<<a.tinted<<":"<<a.tint[0]<<","<<a.tint[1]<<","<<a.tint[2]<<" weight="<<a.tintWeight<<" multiply="<<a.tintMultiply<<" glass="<<a.glass<<" decal="<<a.decal<<"\n";}return 0;
        }
        if(argc>=4&&std::string(argv[2])=="--check-materials"){
            AssetStore source(argv[1]);TextureStore store(source);std::vector<Mesh> pieces;for(int i=3;i<argc;++i){Mesh piece{"material",{0,0,0,1,0,0,0,1,0},{0,1,2}};piece.uv={0,0,1,0,0,1};piece.material=argv[i];pieces.push_back(std::move(piece));}store.Apply(pieces,1);bool complete=true;for(const auto& piece:pieces){const bool resolved=!piece.incompleteMaterial&&(!piece.pixels.empty()||piece.tinted||piece.glass);std::cout<<piece.material<<" resolved="<<resolved<<" normalOnly="<<piece.normalOnly<<" normal="<<(!piece.normalPixels.empty())<<"\n";complete=complete&&resolved;}Pack(pieces);return complete?0:1;
        }
        if((argc==6||argc==7)&&std::string(argv[2])=="--mannequin-preview"){
            std::vector<ScenePlugin> plugins{{"Starfield.esm",0,0}};std::vector<std::string> names{"Starfield.esm"};if(const auto* extra=std::getenv("CCC_PREVIEW_PLUGINS")){std::istringstream list(extra);std::string name;while(std::getline(list,name,';'))if(!name.empty()){names.push_back(name);plugins.push_back({name,0,unsigned(plugins.size())});}}AssetStore assets(argv[1],names);RecordScenes scenes(argv[1],plugins);const auto id=std::stoul(argv[3],nullptr,16);const auto paths=scenes.ArmorModels(id,std::string(argv[5])!="female");for(const auto& path:paths)std::cout<<path<<"\n";auto meshes=Load(assets,paths,1);const auto before=meshes.size();if(std::string(argv[5])!="none")AddMannequin(assets,meshes,std::string(argv[5])=="male",1,argc<7||std::string(argv[6])=="outfit",argc==7&&std::string(argv[6])=="suit");if(std::string(argv[5])!="none"&&meshes.size()==before)throw std::runtime_error("Requested mannequin is unavailable.");scenes.ApplyMaterialSwaps(id,meshes,true);TextureStore textures(assets);textures.Apply(meshes,1);const auto bytes=Pack(meshes);std::ofstream out(argv[4],std::ios::binary);out.write(reinterpret_cast<const char*>(bytes.data()),bytes.size());std::cout<<argv[5]<<" mannequin: "<<meshes.size()-before<<" parts, "<<bytes.size()<<" bytes\n";return 0;
        }
        if(argc==5&&std::string(argv[2])=="--thumbnail-batch"){

            std::vector<ScenePlugin> plugins{{"Starfield.esm",0,0}};std::vector<std::string> names{"Starfield.esm"};if(const auto* extra=std::getenv("CCC_PREVIEW_PLUGINS")){std::istringstream list(extra);std::string name;while(std::getline(list,name,';'))if(!name.empty()){names.push_back(name);plugins.push_back({name,0,unsigned(plugins.size())});}}
            AssetStore assets(argv[1],names);TextureStore textures(assets);RecordScenes scenes(argv[1],plugins);std::ifstream input(argv[3]);std::string id;
            while(std::getline(input,id)){if(id.empty())continue;try{const auto form=std::stoul(id,nullptr,16);const auto output=std::filesystem::path(argv[4])/(id+".bin");if(std::filesystem::exists(output)){std::cout<<id<<" OK cached"<<std::endl;continue;}
                const auto armor=scenes.ArmorModels(form,true);auto meshes=armor.empty()?scenes.LoadModels(assets,form):Load(assets,armor,1);scenes.ApplyMaterialSwaps(form,meshes,true);textures.Apply(meshes,0);auto bytes=Pack(meshes);std::ofstream out(output,std::ios::binary);if(!out.write(reinterpret_cast<const char*>(bytes.data()),bytes.size()))throw std::runtime_error("Thumbnail packet write failed.");out.close();std::cout<<id<<" OK "<<bytes.size()<<std::endl;
            }catch(const std::exception& e){std::cout<<id<<" ERROR "<<e.what()<<std::endl;}}
            return 0;
        }
        if(argc>=5&&std::string(argv[2])=="--batch"){

            AssetStore assets(argv[1]);TextureStore textures(assets);std::ifstream input(argv[3]);std::string line;
            std::vector<ScenePlugin> plugins{{"Starfield.esm",0,0}};
            if(const auto* extra=std::getenv("CCC_PREVIEW_PLUGINS")){std::istringstream list(extra);std::string name;while(std::getline(list,name,';'))if(!name.empty())plugins.push_back({name,0,unsigned(plugins.size())});}
            RecordScenes scenes(argv[1],plugins);
            while(std::getline(input,line)){const auto split=line.find('|');if(split==line.npos)continue;const auto id=line.substr(0,split),path=line.substr(split+1);try{
                if(path.starts_with("form:"))for(const auto& model:scenes.Models(std::stoul(path.substr(5),nullptr,16)))std::cout<<id<<" MODEL "<<model.path<<"\n";
                auto meshes=path.starts_with("form:")?scenes.LoadModels(assets,std::stoul(path.substr(5),nullptr,16)):Load(assets,{path});if(path.starts_with("form:"))scenes.ApplyMaterialSwaps(std::stoul(path.substr(5),nullptr,16),meshes);textures.Apply(meshes,1);auto packet=Pack(meshes);std::ofstream out(std::filesystem::path(argv[4])/(std::string(argc>=6?argv[5]:"preview-1280-")+id+"-final.bin"),std::ios::binary);out.write(reinterpret_cast<const char*>(packet.data()),packet.size());std::cout<<id<<" "<<meshes.size()<<" pieces";for(const auto& mesh:meshes)std::cout<<"\n  "<<mesh.name<<" color="<<(!mesh.pixels.empty())<<" normal="<<(!mesh.normalPixels.empty())<<" incomplete="<<mesh.incompleteMaterial<<" "<<mesh.material;std::cout<<"\n"<<std::flush;
            }catch(const std::exception& e){std::cout<<id<<" ERROR "<<e.what()<<"\n"<<std::flush;}}
            return 0;
        }
        if(argc>=3) {
            std::vector<ScenePlugin> testPlugins{{"Starfield.esm",0,0}};
            if(const auto* extra=std::getenv("CCC_PREVIEW_PLUGINS")){std::istringstream list(extra);std::string name;while(std::getline(list,name,';'))if(!name.empty())testPlugins.push_back({name,0,unsigned(testPlugins.size())});}
            const auto* setting=std::getenv("CCC_PREVIEW_QUALITY");const unsigned quality=setting&&std::string(setting)=="color"?0:setting&&std::string(setting)=="ultra"?4:setting&&std::string(setting)=="medium"?2:setting&&std::string(setting)=="low"?1:3;AssetStore store(argv[1]);std::vector<std::string> models{argv[2]};for(int i=5;i<argc;++i)models.push_back(argv[i]);if(std::getenv("CCC_PREVIEW_REFS"))for(const auto& path:models){ModelScene scene;auto refs=ReadNif(store.Read(path),&scene);for(const auto& ref:refs){std::cout<<ref.name<<" bone "<<ref.bone<<" transform ";for(auto v:ref.transform)std::cout<<v<<",";std::cout<<" bind ";for(auto v:ref.bind)std::cout<<v<<",";std::cout<<"\n";}}auto mesh=std::string(argv[2]).starts_with("form:")?[&]{std::unique_ptr<RecordScenes> coldCache;auto& scene=EnsureRecordScenes(coldCache,argv[1],testPlugins);const auto id=std::stoul(std::string(argv[2]).substr(5),nullptr,16);if(std::getenv("CCC_PREVIEW_MOUNTS"))for(const auto& model:scene.Models(id)){ModelScene part;ReadNif(store.Read(model.path.starts_with("meshes/")?model.path:"meshes/"+model.path),&part);std::cout<<model.path<<" slots ";for(const auto& slot:part.slots)std::cout<<slot<<",";for(const auto& mount:part.mounts)std::cout<<" mount "<<mount.slot<<" host="<<mount.host<<" found="<<part.nodes.contains(mount.host);std::cout<<"\n";}if(std::getenv("CCC_PREVIEW_DIAG"))for(const auto& model:scene.Models(id))std::cout<<model.path<<" placement "<<model.transform[3]<<","<<model.transform[7]<<","<<model.transform[11]<<"\n";return scene.LoadModels(store,id);}():Load(store,models,quality);if(argc>=5&&(std::string(argv[4])=="mannequin"||std::string(argv[4])=="male"))AddMannequin(store,mesh,std::string(argv[4])=="male",quality);if(const auto* form=std::getenv("CCC_PREVIEW_FORM"))RecordScenes(argv[1],testPlugins).ApplyMaterialSwaps(std::stoul(form,nullptr,16),mesh,(std::string(argc>=5?argv[4]:"")!="mannequin"&&std::string(argc>=5?argv[4]:"")!="female"));TextureStore textures(store);if(!std::getenv("CCC_PREVIEW_GEOMETRY_ONLY"))textures.Apply(mesh,quality);auto packed=Pack(mesh,(quality==4?256u:64u)*1024*1024);
            std::size_t textured=0;for(const auto& piece:mesh)if(!piece.pixels.empty())++textured;std::cout<<textured<<" textured pieces; ";
            if(std::getenv("CCC_PREVIEW_DIAG")&&!std::getenv("CCC_PREVIEW_GEOMETRY_ONLY")){MaterialDatabase db(store.data,[&]{std::vector<std::filesystem::path> paths;for(const auto& archive:store.archives)paths.push_back(archive.path);return paths;}());std::cout<<db.Diagnostics()<<"\n";for(const auto& piece:mesh){auto appearance=piece.material.empty()?MaterialAppearance{}:db.Find(piece.material);float low=1e9f,high=-1e9f;for(std::size_t i=2;i<piece.positions.size();i+=3){low=std::min(low,piece.positions[i]);high=std::max(high,piece.positions[i]);}std::cout<<piece.name<<" Z "<<low<<".."<<high<<" "<<piece.material<<" -> "<<appearance.texture<<" normal "<<appearance.normal<<" rough "<<appearance.roughness<<" ao "<<appearance.ao<<" opacity "<<appearance.opacity<<" tint "<<appearance.tinted<<"\n";}}
            std::size_t vertices=0,triangles=0; for(const auto& m:mesh){vertices+=m.positions.size()/3;triangles+=m.indices.size()/3;}
            if(argc>=4){std::ofstream out(argv[3],std::ios::binary);out.write(reinterpret_cast<const char*>(packed.data()),packed.size());}
            std::cout<<mesh.size()<<" pieces, "<<vertices<<" vertices, "<<triangles<<" triangles, "<<packed.size()<<" bytes\n";return 0;
        }
        {
            const std::string source=R"json({"Objects":[{"Components":[{"Type":"BSMaterial::LayerID","Index":0,"Data":{"ID":"layer"}}]},{"ID":"layer","Components":[{"Type":"BSMaterial::MaterialID","Data":{"ID":"material"}}]},{"ID":"material","Components":[{"Type":"BSMaterial::TextureSetID","Data":{"ID":"child"}}]},{"ID":"child","Parent":"parent","Components":[{"Type":"BSMaterial::MRTextureFile","Index":4,"Data":{"FileName":"Data\\Textures\\Mod\\unusual_metallic_name.dds"}}]},{"ID":"parent","Components":[{"Type":"BSMaterial::MRTextureFile","Index":0,"Data":{"FileName":"textures/mod/albedo_variant.dds"}},{"Type":"BSMaterial::MRTextureFile","Index":1,"Data":{"FileName":"textures/mod/detail.dds"}},{"Type":"BSMaterial::MRTextureFile","Index":3,"Data":{"FileName":"textures/mod/smooth.dds"}}]}]})json";
            const auto read=[](const std::string& text){return ReadJsonPreviewMaterial(std::span(reinterpret_cast<const std::uint8_t*>(text.data()),text.size()));};
            const auto a=read(source);if(!a||a->texture!="textures/mod/albedo_variant.dds"||a->normal!="textures/mod/detail.dds"||a->metal!="textures/mod/unusual_metallic_name.dds"||a->roughness!="textures/mod/smooth.dds"||a->incomplete)throw std::runtime_error("Standalone JSON material slots/inheritance failed");
            if(read("{broken")||read(std::string(2u*1024*1024+1,' '))||read(R"({"Objects":[]})"))throw std::runtime_error("Malformed/oversized JSON material accepted");
            auto unsafe=source;unsafe.replace(unsafe.find("textures/mod/albedo_variant.dds"),30,"../../outside.dds");if(read(unsafe))throw std::runtime_error("Unsafe JSON material path accepted");
        }
        {if(PreviewMannequinMale({"clothes/gloves_m.nif","clothes/outfit_f.nif"},true)||!PreviewMannequinMale({"clothes/outfit_m.nif","clothes/boots_f.nif"},false)||PreviewMannequinMale({"clothes/gloves_m.nif"},false)||PreviewMannequinMale({"clothes/outfit_m.nif"},true,"female")||!PreviewMannequinMale({"clothes/outfit_f.nif"},false,"male"))throw std::runtime_error("Mannequin body selection mixed accessories/outfit/explicit override");}
        {TextureCache cache(192);const auto image=[](){return TexturePixels{4,4,Bytes(64,255)};};
            cache.emplace("color",image());cache.emplace("normal",image());cache.emplace("metal",image());cache.find("color");cache.emplace("next",image());
            if(cache.find("normal")!=cache.end()||cache.find("color")==cache.end()||cache.find("metal")==cache.end()||cache.BytesHeld()!=192||cache.evictions!=1)throw std::runtime_error("Texture cache discarded shared maps or exceeded its budget");
            cache.SetBudget(64);if(cache.BytesHeld()>64||cache.evictions!=3)throw std::runtime_error("Texture cache failed to shrink");}
        {Mesh metal{"metal",{0,0,0,1,0,0,0,1,0},{0,1,2}};metal.metalWidth=metal.metalHeight=1;metal.metalPixels={231,231,231,255};
            const auto packet=Pack({metal});Reader r{packet};r.Skip(4);if(r.Read<std::uint32_t>()!=9)throw std::runtime_error("Metal packet version failed");r.Skip(4);const auto nv=r.Read<std::uint32_t>(),ni=r.Read<std::uint32_t>();r.Skip(nv*12+ni*4);r.Skip(4+4+12+4);if(r.Read<std::uint32_t>()!=1)throw std::runtime_error("Metal packet texture reference failed");
            metal.metalWidth=0;bool rejected=false;try{Pack({metal});}catch(...){rejected=true;}if(!rejected)throw std::runtime_error("Malformed metal texture accepted");}
        {TexturePixels opaque{1,1,{80,90,100,0}};RestoreOpaqueWeaponAlpha(opaque,"materials/weapons/dlc001/particlemachinegun/particlemachinegun_receiver.mat");if(opaque.pixels[3]!=255)throw std::runtime_error("Opaque weapon body discarded");
            TexturePixels mask{2,1,{80,90,100,0,80,90,100,255}};RestoreOpaqueWeaponAlpha(mask,"materials/weapons/dlc001/particlemachinegun/particlemachinegun_receiver.mat");if(mask.pixels[3]!=0)throw std::runtime_error("Partial mask overridden");
            TexturePixels other{1,1,{80,90,100,0}};RestoreOpaqueWeaponAlpha(other,"materials/other/body.mat");if(other.pixels[3]!=0)throw std::runtime_error("Unrelated alpha overridden");}
        {TexturePixels grip{1,1,{80,90,100,0}};RestoreOpaqueWeaponAlpha(grip,"materials/weapons/dlc001/particlemachinegun/particlemachinegun_standardgrip.mat");if(grip.pixels[3]!=255)throw std::runtime_error("Standard PMG grip discarded");}
        if(!AttachmentMountMatches("meshes/weapons/m1919/m1919_scope_mount.nif","ScopeMount","Scope")||AttachmentMountMatches("meshes/weapons/other/scope_mount.nif","ScopeMount","Scope"))throw std::runtime_error("XM attachment alias escaped its asset scope");
        {
            Mesh mesh{"mask",{0,0,0,1,0,0,0,1,0},{0,1,2}};mesh.textureWidth=mesh.normalWidth=2;mesh.textureHeight=mesh.normalHeight=1;mesh.pixels={100,140,180,80,100,140,180,200};mesh.normalPixels={128,128,255,150,128,128,255,150};
            const TexturePixels mask{2,1,{0,0,0,255,255,255,255,255}},black{1,1,{0,0,0,255}},normal{1,1,{200,128,230,255}},rough{1,1,{51,51,51,255}};MaterialOverlay layer;layer.blendNormal=false;
            const auto untouchedNormal=mesh.normalPixels;CompositePreviewLayer(mesh,layer,mask,black,normal,rough);
            if(mesh.pixels!=Bytes{100,140,180,80,0,0,0,200}||mesh.normalPixels[0]!=untouchedNormal[0]||mesh.normalPixels[4]!=untouchedNormal[4]||mesh.normalPixels[7]!=60)throw std::runtime_error("Masked compositing lost opacity, unmasked pixels, or blend-channel flags");
            layer.positionContrast=true;layer.multiply=false;layer.position=.66f;layer.intensity=0;if(PreviewLayerWeight(1,layer)!=0)throw std::runtime_error("Disabled authored dirt mask still affected the surface");
            layer.intensity=1;if(PreviewLayerWeight(.2f,layer)!=0||PreviewLayerWeight(1,layer)<=0||PreviewLayerWeight(1,layer)>=1)throw std::runtime_error("Position/contrast mask bounds failed");
            Mesh liquid=mesh;liquid.flowingLiquid=true;const auto packet=Pack({liquid});Reader reader{packet};reader.Skip(4);if(reader.Read<std::uint32_t>()!=11)throw std::runtime_error("Flowing liquid transport version missing");
        }
        if(PreviewChunkSize(262144,1000000)!=262144||PreviewChunkSize(9999999,1000000)!=262144||PreviewChunkSize(65536,1000000)!=65536||PreviewChunkSize(0,1000000)!=4096||PreviewChunkSize(262144,17)!=17)throw std::runtime_error("Model transfer capability bounds failed");
        TestMaterialInheritance();
        {Bytes inlineShader;Append(inlineShader,std::uint32_t(0));Append(inlineShader,std::uint32_t(0));Append(inlineShader,std::uint32_t(0xffffffff));for(unsigned i=0;i<3;++i)Append(inlineShader,std::uint32_t(0));for(float v:{0.f,0.f,1.f,1.f})Append(inlineShader,v);Append(inlineShader,std::uint32_t(0xffffffff));for(float v:{1.f,.5f,.25f,1.f})Append(inlineShader,v);Append(inlineShader,std::uint32_t(0xffffffff));if(ReadInlineShaderTint(inlineShader,172)!=std::optional<std::array<float,3>>({1,.5f,.25f})||ReadInlineShaderTint(inlineShader,155)||ReadInlineShaderTint(Bytes(12),172))throw std::runtime_error("Inline texture-free shader color bounds failed");inlineShader[40]=0;if(ReadInlineShaderTint(inlineShader,172))throw std::runtime_error("Textured inline shader treated as texture-free");}

        for(const auto* path:{"Materials\\Clothes\\SpaceSuit_Ecliptic\\Spacesuit_Ecliptic_Backpack.mat","data/materials/clothes/spacesuit_ecliptic/spacesuit_ecliptic_backpack.mat","clothes/spacesuit_ecliptic/spacesuit_ecliptic_backpack.mat"})
            if(!KnownIncompletePreviewMaterial(path))throw std::runtime_error("Known Ecliptic masked-layer limitation not detected");
        for(const auto* path:{"materials/clothes/spacesuit_bountyhunter/spacesuit_bountyhunter_helmet.mat","materials/clothes/spacesuit_bountyhunter_02/spacesuit_bountyhunter_helmet_02.mat","materials/clothes/spacesuit_ecliptic/spacesuit_ecliptic_helmet.mat","materials/mod/spacesuit_ecliptic_backpack.mat"})
            if(KnownIncompletePreviewMaterial(path))throw std::runtime_error("Known material diagnostic escaped its exact scope");
        if(Base64(Bytes{0,1,2,255})!="AAEC/w==")throw std::runtime_error("Base64 mismatch");
        {auto pose=Identity();pose[11]=1.63f;auto bind=Identity();bind[3]=.1f;
        std::vector<GeometryRef> refs{{"helmet","",pose,"","C_Head",bind,false},{"visor","",Identity(),"","C_Head",bind,true},{"loose prop","",Identity(),"","",Identity(),false}};
        refs.push_back({"multi-bone visor","",Identity(),"","C_Head",bind,false});
        ResolveRigidAttachments(refs);if(std::abs(refs[3].transform[11]-1.63f)>.0001f)throw std::runtime_error("Multi-bone attachment pose mismatch");if(std::abs(refs[1].transform[11]-1.63f)>.0001f||refs[2].transform!=Identity()||refs[0].transform!=pose)throw std::runtime_error("Rigid attachment pose mismatch");
        std::vector<GeometryRef> origin{{"hat","",Identity(),"","C_Head",bind,true},{"shirt","",Identity(),"","R_Biceps",bind,false},{"placed","",pose,"","C_Head",bind,false},{"prop","",Identity(),"","",Identity(),false}};
        ResolveRigidAttachments(origin,{{"C_Head",pose},{"R_Biceps",pose}});
        if(std::abs(origin[0].transform[11]-1.63f)>.0001f||std::abs(origin[1].transform[11]-1.63f)>.0001f||origin[2].transform!=pose||origin[3].transform!=Identity())throw std::runtime_error("Body bind-pose attachment mismatch");
        auto restored=Multiply(pose,InverseAffine(pose));for(unsigned i=0;i<16;++i)if(std::abs(restored[i]-Identity()[i])>.0001f)throw std::runtime_error("Affine inverse mismatch");}
        if(ExpandLz4(Bytes{0x40,1,2,3,4},4)!=Bytes{1,2,3,4})throw std::runtime_error("LZ4 literals mismatch");
        if(ExpandLz4(Bytes{0x10,7,1,0},5)!=Bytes{7,7,7,7,7})throw std::runtime_error("LZ4 match mismatch");
        bool badTexture=false;try{ExpandLz4(Bytes{0,0,0},4);}catch(...){badTexture=true;}if(!badTexture)throw std::runtime_error("Invalid LZ4 offset accepted");
        const auto neutral=DecodeTexture(Bytes(16,0),4,4,84);if(neutral.pixels[0]!=127||neutral.pixels[1]!=127||neutral.pixels[2]!=255)throw std::runtime_error("Signed BC5 normal decode mismatch");
        Bytes red{0,248,0,248,0,0,0,0};const auto color=DecodeTexture(red,4,4,71);if(color.pixels[0]!=255||color.pixels[1]!=0)throw std::runtime_error("BC1 color mismatch");
        const auto gray=DecodeTexture(Bytes{128,128,0,0,0,0,0,0},4,4,80);if(gray.pixels[0]!=128||gray.pixels[3]!=255)throw std::runtime_error("BC4 opacity decode mismatch");
        auto rgba=DecodeTexture(Bytes{255,0,0,255,0,255,0,128},2,1,28);ApplyOpacity(rgba,DecodeTexture(Bytes{64},1,1,61));if(rgba.pixels[3]!=64||rgba.pixels[7]!=32||rgba.pixels[0]!=255)throw std::runtime_error("Opacity composition mismatch");
        {Bytes blocks(4096*4096/2);for(std::size_t i=0;i<blocks.size();i+=8)std::copy(red.begin(),red.end(),blocks.begin()+i);const auto image=DecodeTexture(blocks,4096,4096,71);if(image.width!=4096||image.pixels.size()!=4096*4096*4||image.pixels[image.pixels.size()-4]!=255)throw std::runtime_error("Ultra 4K texture decode failed");}
        for(const auto* path:{"../outside.mesh","C:/outside.mesh","meshes/../x.nif","/absolute.nif"}){
            bool rejected=false;try{AssetKey(path);}catch(...){rejected=true;}if(!rejected)throw std::runtime_error("Unsafe path accepted");
        }
        ModelScene renamedReceiver;auto renamedBody=Identity();renamedBody[3]=.12f;renamedReceiver.nodes["M82Bub_Body:1"]=renamedBody;
        const auto receiverHost=AttachmentHostTransform(renamedReceiver,"meshes/m82bubproject/m82bub/m82bub.nif","HardTarget_Body");
        if(!receiverHost||(*receiverHost)[3]!=.12f||AttachmentHostTransform(renamedReceiver,"meshes/weapons/other.nif","HardTarget_Body")||AttachmentHostTransform(renamedReceiver,"meshes/m82bubproject/m82bub/m82bub.nif","OtherMissingHost"))throw std::runtime_error("Renamed receiver mount resolution mismatch");
        Mesh forearmTube{"open-forearm",{.3f,-.02f,-.02f,.3f,.02f,-.02f,.3f,.02f,.02f,.3f,-.02f,.02f,.5f,-.02f,-.02f,.5f,.02f,-.02f,.5f,.02f,.02f,.5f,-.02f,.02f},{0,1,4,1,5,4,1,2,5,2,6,5,2,3,6,3,7,6,3,0,7,0,4,7}};
        auto reverseForearm=forearmTube;for(std::size_t i=0;i<reverseForearm.indices.size();i+=3)std::swap(reverseForearm.indices[i],reverseForearm.indices[i+1]);
        InsetMannequin(forearmTube,.004f,true);InsetMannequin(reverseForearm,.004f,true);
        for(unsigned i=0;i<12;++i)if(i%3&& (std::abs(forearmTube.positions[i])>.0101f||std::abs(reverseForearm.positions[i])>.0101f))throw std::runtime_error("Open forearm fit expanded with winding");
        Mesh cube{"cube",{-1,-1,-1,1,-1,-1,1,1,-1,-1,1,-1,-1,-1,1,1,-1,1,1,1,1,-1,1,1},{0,2,1,0,3,2,4,5,6,4,6,7,0,1,5,0,5,4,2,3,7,2,7,6,1,2,6,1,6,5,3,0,4,3,4,7}};const auto cubeIndices=cube.indices;InsetMannequin(cube);if(cube.indices!=cubeIndices||std::any_of(cube.positions.begin(),cube.positions.end(),[](float value){return !std::isfinite(value)||std::abs(value)>=1;}))throw std::runtime_error("Mannequin inset mismatch");
        const auto header=Pack({Mesh{"triangle",{0,0,0,1,0,0,0,1,0},{0,1,2}}});
        if(header.size()!=120)throw std::runtime_error("Packed geometry size mismatch");
        {
            Mesh mesh{"budget",{0,0,0,1,0,0,0,1,0},{0,1,2}};
            mesh.textureWidth=mesh.textureHeight=mesh.normalWidth=mesh.normalHeight=mesh.metalWidth=mesh.metalHeight=8;
            mesh.pixels.resize(256);mesh.normalPixels.resize(256);mesh.metalPixels.resize(256);
            for(unsigned i=0;i<256;i+=4){
                for(unsigned c=0;c<4;++c){mesh.pixels[i+c]=c==3?64:100;mesh.normalPixels[i+c]=c==2?255:128;mesh.metalPixels[i+c]=200;}
            }
            const auto original=mesh.pixels;const auto full=Pack({mesh});const auto budget=full.size()-1;
            const auto fitted=Pack({mesh},budget);
            if(fitted.size()>budget||fitted.size()>=full.size()||mesh.pixels!=original||Pack({mesh})!=full)throw std::runtime_error("Packet fitting changed original textures or failed to fit");
            Reader r{fitted};r.Skip(12);const auto nv=r.Read<std::uint32_t>(),ni=r.Read<std::uint32_t>();
            if(nv!=3||ni!=3)throw std::runtime_error("Texture budget changed geometry");
            r.Skip(nv*12+ni*4+4+4+12+4+4+nv*8);
            if(r.Read<std::uint32_t>()!=3)throw std::runtime_error("Packet fitting dropped a material map");
            for(unsigned texture=0;texture<3;++texture){const auto w=r.Read<std::uint32_t>(),h=r.Read<std::uint32_t>();
                if(!w||!h)throw std::runtime_error("Fitted map has invalid dimensions");
                if(texture==0)for(unsigned pixel=0;pixel<w*h;++pixel){if(r.Read<std::uint8_t>()!=100||r.Read<std::uint8_t>()!=100||r.Read<std::uint8_t>()!=100||r.Read<std::uint8_t>()!=64)throw std::runtime_error("Fitted color or transparency changed");}
                else r.Skip(std::size_t(w)*h*4);
            }
            if(r.at!=fitted.size())throw std::runtime_error("Fitted packet has trailing data");
            bool rejected=false;try{Pack({mesh},1);}catch(...){rejected=true;}if(!rejected)throw std::runtime_error("Impossible geometry budget accepted");
            mesh.normalPixels=mesh.pixels;mesh.metalPixels=mesh.pixels;
            const auto shared=Pack({mesh},200);Reader sharedReader{shared};sharedReader.Skip(12+8+36+12+4+4+12+4+4+24);
            if(sharedReader.Read<std::uint32_t>()!=1)throw std::runtime_error("Fitted shared maps lost deduplication");
        }
        if(!AttachmentSlotEqual("Receiver","receiver")||AttachmentSlotEqual("Barrel","Grip"))throw std::runtime_error("Case-insensitive attachment slot matching failed");
        {
            auto anchor=Identity();anchor[11]=1.63f;auto tiny=Identity();tiny[2]=-.000139f;tiny[3]=-.00000016f;
            std::vector<GeometryRef> refs{{"helmet","",anchor,"","C_Head",Identity()},{"flashlight","",tiny,"","C_Head",Identity()}};
            if(!OriginAttachment(refs[1]))throw std::runtime_error("Rounded origin attachment was missed");ResolveRigidAttachments(refs);if(std::abs(refs[1].transform[11]-1.63f)>.001f)throw std::runtime_error("Rounded helmet flashlight was not attached");
            auto posed=refs[1];ResolveRigidAttachments(refs);if(refs[1].transform!=posed.transform)throw std::runtime_error("Posed attachment moved twice");
        }
        Bytes materialData;
        const auto field=[&](unsigned id,unsigned count,const Bytes& data){for(char c:std::string("DIFF"))materialData.push_back(c);Append(materialData,std::uint32_t(8+data.size()));Append(materialData,std::uint32_t(id));Append(materialData,std::uint16_t(0));Append(materialData,std::uint16_t(count));materialData.insert(materialData.end(),data.begin(),data.end());};
        const auto textField=[&](unsigned id,std::string text){Bytes bytes(text.begin(),text.end());bytes.push_back(0);field(id,bytes.size(),bytes);};
        Bytes tint;for(float value:{.8f,.2f,.1f,1.f}){Append(tint,value);Append(tint,std::uint16_t(0));}textField(0x1f4,"Example_Material1");field(0x25a,0,tint);textField(0x1f4,"Example_TextureSet1");textField(0x38a,"Data\\Textures\\DifferentFolder\\Shared_color.dds");
        MaterialDatabase database("missing-test-folder");database.Parse(materialData);const auto appearance=database.Find("Materials/Example.mat");if(!appearance.tinted||appearance.tint[0]!=.8f||appearance.texture!="textures/differentfolder/shared_color.dds")throw std::runtime_error("Material texture/tint lookup mismatch");
        materialData.clear();textField(0x1f4,"Outfit_UCNavy_Base_Torso_TextureSet1");textField(0x38a,"textures/clothes/outfit_ucnavy/navy_base_torso_mat_color.dds");textField(0x38a,"textures/clothes/outfit_ucnavy/navy_base_torso_mat_rough.dds");database.Parse(materialData);const auto torso=database.Find("Materials/Clothes/Outfit_UC_Navy/Outfit_UC_Navy_Base_Torso.mat");if(torso.texture!="textures/clothes/outfit_ucnavy/navy_base_torso_mat_color.dds"||torso.roughness!="textures/clothes/outfit_ucnavy/navy_base_torso_mat_rough.dds")throw std::runtime_error("UC Navy authored material alias or roughness lookup failed");
        materialData.clear();textField(0x1f4,"Spacesuit_Constellation_Helmet_TextureSet1");textField(0x38a,"textures/clothes/spacesuit_constellation/spacesuit_constellation_helmet_color.dds");database.Parse(materialData);if(database.Find("Materials/Clothes/Spacesuit_Constellation/Spacesuit_Constellation_Helmet02.mat").texture.empty())throw std::runtime_error("Constellation helmet material alias failed");
        materialData.clear();textField(0x1f4,"PirateSuitLight");Bytes emissive;Append(emissive,std::uint16_t(0));for(unsigned c=0;c<4;++c){Append(emissive,std::uint16_t(c));Append(emissive,c==0?1.f:c==1?.4f:c==2?.1f:1.f);}field(0x8b4,1,emissive);materialData[materialData.size()-emissive.size()-4]=1;database.Parse(materialData);if(!database.Find("materials/clothes/pirateset_spacesuit/helmets/PirateSuitLight.mat").constantColor)throw std::runtime_error("Authored constant light color not resolved");
        {Mesh incomplete{"incomplete",{0,0,0,1,0,0,0,1,0},{0,1,2}};incomplete.incompleteMaterial=true;const auto packet=Pack({incomplete});Reader r{packet};r.Skip(4);if(r.Read<std::uint32_t>()!=7)throw std::runtime_error("Incomplete material packet version mismatch");r.at=68;if(!(r.Read<std::uint32_t>()&16))throw std::runtime_error("Incomplete material packet flag missing");}
        materialData.clear();textField(0x1f4,"DlcPack_TextureSet1");textField(0xee8,"textures/dlcpack_color.dds");database.Parse(materialData);
        if(database.Find("\\materials\\DlcPack.mat").texture!="textures/dlcpack_color.dds")throw std::runtime_error("DLC material path/field mismatch");
        for(const auto* unsafe:{"/materials/../bad.mat","//server/materials/bad.mat"}){bool rejected=false;try{MaterialKey(unsafe);}catch(...){rejected=true;}if(!rejected)throw std::runtime_error("Unsafe material path accepted");}
        materialData.clear();textField(0x1f4,"Constant_TextureSet1");Bytes rgbaConstant;for(unsigned i=0;i<4;++i){Append(rgbaConstant,std::uint16_t(i));Append(rgbaConstant,i==0?.2f:i==1?.3f:i==2?.4f:1.f);}field(0x3cc,0,rgbaConstant);database.Parse(materialData);const auto constant=database.Find("Constant.mat");if(!constant.constantColor||constant.color!=std::array<float,3>{.2f,.3f,.4f})throw std::runtime_error("Constant material color mismatch");
        materialData.clear();textField(0x1f4,"First_Material1");field(0x25a,0,tint);textField(0x1f4,"Second_Material1");textField(0x1f4,"First_TextureSet1");textField(0x38a,"textures/first_color.dds");textField(0x38a,"textures/first_opacity.dds");textField(0x38a,"textures/first_normal.dds");textField(0x38a,"textures/first_ao.dds");
        database.Parse(materialData);if(!database.Find("First.mat").tinted||database.Find("Second.mat").tinted||database.Find("First.mat").opacity!="textures/first_opacity.dds"||database.Find("First.mat").normal!="textures/first_normal.dds"||database.Find("First.mat").ao!="textures/first_ao.dds")throw std::runtime_error("Material tint ownership/opacity mismatch");
        materialData.clear();textField(0x1f4,"Decals_TextureSet1");textField(0x38a,"textures/weapons/first/decals_color.dds");textField(0x1f4,"Decals_TextureSet1");textField(0x38a,"textures/weapons/second/decals_color.dds");database.Parse(materialData);if(database.Find("materials/weapons/first/decals.mat").texture!="textures/weapons/first/decals_color.dds"||database.Find("materials/weapons/second/decals.mat").texture!="textures/weapons/second/decals_color.dds")throw std::runtime_error("Same-name material folders were mixed");
        materialData.clear();textField(0x1f4,"Example_Material1");field(0x25a,0,tint);textField(0x1f4,"Example_TextureSet1");textField(0x38a,"textures/differentfolder/shared_color.dds");
        textField(0x1f4,"Example");Bytes layerLink;Append(layerLink,std::uint32_t(1));field(0x4f8,0,layerLink);field(0x4f8,0,layerLink);
        {const auto gloves=database.Find("Materials\\Clothes\\BaseGloves3\\BaseGlove3.mat");
        if(gloves.texture!="textures/clothes/basegloves3/basegloves_03_color.dds"||gloves.normal!="textures/clothes/basegloves3/basegloves_03_normal.dds"||gloves.roughness!="textures/clothes/basegloves3/basegloves_03_rough.dds")throw std::runtime_error("Shared glove texture family mismatch");
        if(!database.Find("materials/mod/baseglove3.mat").texture.empty())throw std::runtime_error("Shared glove alias escaped its folder");}
        // Real archive layouts, including older mod archives and a broken loose
        // material color override that must not suppress the valid fallback.
        const auto fixture=std::filesystem::temp_directory_path()/("ccc-texture-test-"+std::to_string(std::chrono::steady_clock::now().time_since_epoch().count()));
        struct RemoveFixture {std::filesystem::path path;~RemoveFixture(){std::error_code ec;std::filesystem::remove_all(path,ec);}} removeFixture{fixture};
        std::filesystem::create_directories(fixture/"materials");std::filesystem::create_directories(fixture/"textures/differentfolder");
        {std::ofstream out(fixture/"materials/materialsbeta.cdb",std::ios::binary);out.write(reinterpret_cast<const char*>(materialData.data()),materialData.size());}
        {std::ofstream out(fixture/"textures/differentfolder/shared_color.dds",std::ios::binary);out<<"broken";}
        for(unsigned version:{1u,2u,3u}){
            Bytes archive;for(char c:std::string("BTDX"))archive.push_back(c);Append(archive,std::uint32_t(version));for(char c:std::string("DX10"))archive.push_back(c);Append(archive,std::uint32_t(1));const auto headerSize=version==1?24u:version==2?32u:36u;Append(archive,std::uint64_t(headerSize+24+24+8));archive.resize(headerSize);
            const auto record=archive.size();archive.resize(record+24);archive[record+13]=1;archive[record+16]=4;archive[record+18]=4;archive[record+20]=1;archive[record+21]=71;
            Append(archive,std::uint64_t(headerSize+48));Append(archive,std::uint32_t(0));Append(archive,std::uint32_t(8));Append(archive,std::uint16_t(0));Append(archive,std::uint16_t(0));Append(archive,std::uint32_t(0));archive.insert(archive.end(),red.begin(),red.end());
            const std::string name="textures/example_color.dds";Append(archive,std::uint16_t(name.size()));archive.insert(archive.end(),name.begin(),name.end());
            {std::ofstream out(fixture/"Starfield - Textures.ba2",std::ios::binary);out.write(reinterpret_cast<const char*>(archive.data()),archive.size());}
            AssetStore source(fixture);TextureStore store(source);Mesh piece{"texture",{0,0,0,1,0,0,0,1,0},{0,1,2}};piece.material="materials/example.mat";piece.uv={0,0,1,0,0,1};std::vector<Mesh> pieces{piece};store.Apply(pieces,1);
            if(pieces[0].pixels.empty()||pieces[0].pixels[0]!=255||pieces[0].incompleteMaterial)throw std::runtime_error("Archive version/fallback color lookup failed");
            pieces={piece};store.Apply(pieces,0);if(pieces[0].pixels.empty()||pieces[0].pixels[0]!=255||!pieces[0].normalPixels.empty()||!pieces[0].metalPixels.empty())throw std::runtime_error("Color-first preview must retain color without detail maps");
        }
        {
            materialData.clear();textField(0x1f4,"Missing_TextureSet1");textField(0x38a,"textures/missing_color.dds");field(0x3cc,0,rgbaConstant);
            {std::ofstream out(fixture/"materials/materialsbeta.cdb",std::ios::binary);out.write(reinterpret_cast<const char*>(materialData.data()),materialData.size());}
            AssetStore source(fixture);TextureStore store(source);Mesh missing{"missing",{0,0,0,1,0,0,0,1,0},{0,1,2}};missing.material="materials/missing.mat";missing.uv={0,0,1,0,0,1};std::vector<Mesh> pieces{missing};store.Apply(pieces,1);
            if(!pieces[0].incompleteMaterial||pieces[0].pixels.empty())throw std::runtime_error("Failed declared color must remain flagged through constant-color fallback");
        }
        {
            materialData.clear();
            textField(0x1f4,"Overlay_Color_TextureSet1");textField(0x38a,"textures/overlay_color.dds");
            textField(0x1f4,"Overlay_TextureSet1");textField(0x38a,"textures/overlay_normal.dds");textField(0x38a,"textures/overlay_opacity.dds");field(0x3cc,0,rgbaConstant);
            {std::ofstream out(fixture/"materials/materialsbeta.cdb",std::ios::binary);out.write(reinterpret_cast<const char*>(materialData.data()),materialData.size());}
            const auto dds=[&](const char* name,const Bytes& pixels){Bytes bytes(148);const auto put=[&](std::size_t at,std::uint32_t value){std::memcpy(bytes.data()+at,&value,4);};put(0,0x20534444);put(4,124);put(12,1);put(16,2);put(28,1);put(84,0x30315844);put(128,28);bytes.insert(bytes.end(),pixels.begin(),pixels.end());std::ofstream out(fixture/name,std::ios::binary);out.write(reinterpret_cast<const char*>(bytes.data()),bytes.size());};
            dds("textures/overlay_color.dds",{100,140,180,255,200,210,220,255});dds("textures/overlay_normal.dds",{127,127,255,255,127,127,255,255});dds("textures/overlay_opacity.dds",{0,0,0,255,255,255,255,255});
            AssetStore source(fixture);TextureStore store(source);Mesh color{"color",{0,0,0,1,0,0,0,1,0},{0,1,2}};color.uv={0,0,1,0,0,1};color.material="materials/overlay_color.mat";auto normal=color;normal.material="materials/overlay.mat";
            std::vector<Mesh> pieces{color,normal};store.Apply(pieces,3);
            if(pieces[0].pixels.size()!=8||pieces[0].pixels[3]!=0||pieces[0].pixels[7]!=255||pieces[0].normalPixels.size()!=8||!pieces[0].decal||pieces[1].pixels!=Bytes{0,0,0,0})throw std::runtime_error("Coincident color/normal decal composition mismatch");
            std::vector<Mesh> constant{normal,Mesh{}};store.Apply(constant,1);if(constant[0].pixels.size()!=8||constant[0].pixels[3]!=0||constant[0].pixels[7]!=255)throw std::runtime_error("Constant-color decal opacity mismatch");
            std::filesystem::create_directories(fixture/"textures/clothes/basegloves3");
            dds("textures/clothes/basegloves3/basegloves_03_color.dds",{80,65,50,255,90,75,60,255});
            dds("textures/clothes/basegloves3/basegloves_03_normal.dds",{127,127,255,255,127,127,255,255});
            dds("textures/clothes/basegloves3/basegloves_03_rough.dds",{100,100,100,255,160,160,160,255});
            for(unsigned quality:{1u,2u,3u}){AssetStore gloveSource(fixture);TextureStore gloveStore(gloveSource);auto glove=color;glove.material="materials/clothes/basegloves3/baseglove3.mat";std::vector<Mesh> preview{glove};gloveStore.Apply(preview,quality);
                if(preview[0].pixels.empty()||preview[0].normalPixels.size()!=8||preview[0].normalPixels[3]!=100||preview[0].normalPixels[7]!=160||preview[0].incompleteMaterial)throw std::runtime_error("Glove color/normal/roughness missing on a supported preset");}
            for(const auto& name:std::array<std::string,2>{"textures/clothes/outfit_baseball_cap_01/outfit_baseball_cap_01_color.dds","textures/clothes/outfit_barrett/outfit_barrett_m/barrett_lodgeoutfit_upperbody_m_color.dds"}){
                materialData.clear();textField(0x1f4,"Original_TextureSet1");textField(0x38a,name);{std::ofstream out(fixture/"materials/materialsbeta.cdb",std::ios::binary);out.write(reinterpret_cast<const char*>(materialData.data()),materialData.size());}
                std::filesystem::create_directories((fixture/name).parent_path());dds(name.c_str(),{0,0,255,255,0,0,255,255});
                Bytes archive{'B','T','D','X'};Append(archive,std::uint32_t(1));archive.insert(archive.end(),{'D','X','1','0'});Append(archive,std::uint32_t(1));Append(archive,std::uint64_t(80));const auto at=archive.size();archive.resize(at+24);archive[at+13]=1;archive[at+16]=1;archive[at+18]=2;archive[at+20]=1;archive[at+21]=28;
                Append(archive,std::uint64_t(72));Append(archive,std::uint32_t(0));Append(archive,std::uint32_t(8));Append(archive,std::uint16_t(0));Append(archive,std::uint16_t(0));Append(archive,std::uint32_t(0));archive.insert(archive.end(),{255,0,0,255,255,0,0,255});Append(archive,std::uint16_t(name.size()));archive.insert(archive.end(),name.begin(),name.end());
                {std::ofstream out(fixture/"Starfield - TexturesOriginal.ba2",std::ios::binary);out.write(reinterpret_cast<const char*>(archive.data()),archive.size());}
                AssetStore originalSource(fixture);TextureStore originalStore(originalSource);auto piece=color;piece.material="materials/original.mat";std::vector<Mesh> preview{piece};originalStore.Apply(preview,1);if(preview[0].pixels!=Bytes{255,0,0,255,255,0,0,255})throw std::runtime_error("Original archive texture lost to loose replacement");
            }
        }
        {
            materialData.clear();
            textField(0x1f4,"Label_Material1");field(0x25a,0,tint);textField(0x1f4,"Label_TextureSet1");textField(0x38a,"textures/test_mask_opacity.dds");
            for(const auto* name:{"AlienJerky_TextureSet1","AlienJerkyPackage_TextureSet1","WaterCaustic01_IdleAnimLoop_TextureSet1"}){textField(0x1f4,name);textField(0x38a,"textures/test_food_color.dds");textField(0x38a,"textures/test_mask_opacity.dds");}
            {std::ofstream out(fixture/"materials/materialsbeta.cdb",std::ios::binary);out.write(reinterpret_cast<const char*>(materialData.data()),materialData.size());}
            const auto dds=[&](const char* name,const Bytes& pixels){Bytes bytes(148);const auto put=[&](std::size_t at,std::uint32_t value){std::memcpy(bytes.data()+at,&value,4);};put(0,0x20534444);put(4,124);put(12,1);put(16,2);put(28,1);put(84,0x30315844);put(128,28);bytes.insert(bytes.end(),pixels.begin(),pixels.end());std::ofstream out(fixture/name,std::ios::binary);out.write(reinterpret_cast<const char*>(bytes.data()),bytes.size());};
            dds("textures/test_mask_opacity.dds",{0,0,0,255,128,128,128,255});dds("textures/test_food_color.dds",{120,60,20,255,160,90,30,255});
            Mesh label{"label",{0,0,0,1,0,0,0,1,0},{0,1,2}};label.uv={0,0,1,0,0,1};label.material="materials/label.mat";
            auto food=label;food.material="materials/items/fooddrink_singleitems/all_crafted_consumables/alienjerky.mat";
            auto wrapper=label;wrapper.material="materials/items/fooddrink_singleitems/all_crafted_consumables/alienjerkypackage.mat";
            auto effect=label;effect.material="materials/setdressing/animated/watercaustic01_idleanimloop.mat";
            auto other=label;other.material="materials/mod/watercaustic01_idleanimloop.mat";
            // Reversing order also exercises both directions of shared-atlas cache reuse.
            for(const bool reverse:{false,true}){
                AssetStore source(fixture);TextureStore store(source);std::vector<Mesh> pieces{label,reverse?wrapper:food,reverse?food:wrapper,effect,other};store.Apply(pieces,1);
                if(pieces[0].pixels.size()!=8||pieces[0].pixels[3]!=0||pieces[0].pixels[7]!=128||!pieces[0].tinted||pieces[0].normalOnly)throw std::runtime_error("Tint-only label lost its authored mask");
                const auto& meat=pieces[reverse?2:1];const auto& plastic=pieces[reverse?1:2];
                if(meat.pixels.size()!=8||meat.pixels[3]!=255||meat.pixels[7]!=255||plastic.pixels.size()!=8||plastic.pixels[3]!=0||plastic.pixels[7]!=128)throw std::runtime_error("Food depth correction contaminated the shared wrapper atlas");
                if(!pieces[3].causticEffect||pieces[3].pixels.size()!=8||pieces[4].causticEffect)throw std::runtime_error("Animated caustics escaped their exact material or lost authored textures");
                const auto packet=Pack(pieces);Reader reader{packet};reader.Skip(4);if(reader.Read<std::uint32_t>()!=10)throw std::runtime_error("Animated preview version missing");
            }
        }
        {for(const auto* name:{"Addon - Voices_en.ba2","Addon - Sounds.ba2","Addon - Main.ba2"}){std::ofstream out(fixture/name,std::ios::binary);out<<"test";}AssetStore filtered(fixture,{"Addon.esm"});if(std::any_of(filtered.archives.begin(),filtered.archives.end(),[](const auto& archive){const auto name=archive.path.filename().string();return name.find("Voices")!=name.npos||name.find("Sounds")!=name.npos;}))throw std::runtime_error("Audio archive entered preview index");}
        if(!OriginalPreviewTexture("textures/clothes/outfit_baseball_cap_01/outfit_baseball_cap_01_color.dds")||!OriginalPreviewTexture("textures/clothes/outfit_barrett/outfit_barrett_m/barrett_lodgeoutfit_upperbody_m_color.dds")||OriginalPreviewTexture("textures/other_color.dds"))throw std::runtime_error("Original preview texture scope mismatch");
        Mesh textured{"test",{0,0,0,1,0,0,0,1,0},{0,1,2}};textured.textureWidth=textured.textureHeight=1;textured.pixels={120,60,20,255};
        const auto shared=Pack({textured,textured});Reader transport{shared};transport.Skip(220);if(transport.Read<std::uint32_t>()!=1||shared.size()!=236)throw std::runtime_error("Shared texture pool mismatch");
        {
            const auto field=[](std::string tag,const Bytes& data){Bytes out(tag.begin(),tag.end());Append(out,std::uint16_t(data.size()));out.insert(out.end(),data.begin(),data.end());return out;};
            const auto number=[](std::uint32_t n){Bytes b;Append(b,n);return b;};
            const auto record=[](std::string tag,std::uint32_t id,const Bytes& data){Bytes out(tag.begin(),tag.end());Append(out,std::uint32_t(data.size()));Append(out,std::uint32_t(0));Append(out,id);out.resize(24);out.insert(out.end(),data.begin(),data.end());return out;};
            const auto append=[](Bytes& a,const Bytes& b){a.insert(a.end(),b.begin(),b.end());};
            Bytes file=record("TES4",0,{});Bytes swapData{'f','u','r','n','i','t','u','r','e','/','t','e','s','t','.','m','a','t',0};const std::string variant="furniture/variant.mat";swapData.insert(swapData.end(),variant.begin(),variant.end());swapData.push_back(0);append(file,record("LMSW",0x600,field("REFL",swapData)));Bytes swapId;Append(swapId,std::uint16_t(1));Append(swapId,std::uint32_t(0x600));append(file,record("ARMO",0x700,field("MLM2",swapId)));append(file,record("MISC",0x702,field("MOLM",swapId)));append(file,record("GBFM",0x100,field("FLFM",number(0x200))));append(file,record("GBFM",0x110,field("FLFM",number(0x110))));append(file,record("PKIN",0x200,field("CNAM",number(0x300))));
            const std::string model="furniture/test.nif";Bytes path(model.begin(),model.end());path.push_back(0);append(file,record("STAT",0x400,field("MODL",path)));
            Bytes ref=field("NAME",number(0x400)),placement;for(float n:{1.f,2.f,3.f,0.f,0.f,0.f})Append(placement,n);append(ref,field("DATA",placement));Bytes scale;Append(scale,2.f);append(ref,field("XSCL",scale));auto child=record("REFR",0x500,ref);
            Bytes group{'G','R','U','P'};Append(group,std::uint32_t(24+child.size()));Append(group,std::uint32_t(0x300));Append(group,std::uint32_t(6));group.resize(24);append(group,child);append(file,group);
            Bytes femaleData{'f','u','r','n','i','t','u','r','e','/','t','e','s','t','.','m','a','t',0};const std::string femaleMaterial="furniture/female.mat";femaleData.insert(femaleData.end(),femaleMaterial.begin(),femaleMaterial.end());femaleData.push_back(0);append(file,record("LMSW",0x601,field("REFL",femaleData)));
            Bytes femaleSwap;Append(femaleSwap,std::uint16_t(1));Append(femaleSwap,std::uint32_t(0x601));Bytes addonFields=field("MLM1",swapId);append(addonFields,field("MLM2",femaleSwap));append(file,record("ARMA",0x701,addonFields));
            const auto pathField=[&](const std::string& path){Bytes data(path.begin(),path.end());data.push_back(0);return field("MODL",data);};
            const auto obts=[&](std::uint32_t child){Bytes data;Append(data,std::uint32_t(1));data.resize(18);Append(data,child);data.insert(data.end(),{0,0,1});return field("OBTS",data);};
            const auto include=[&](std::uint32_t child){Bytes data;Append(data,std::uint32_t(1));data.resize(10);const std::string type="TESObjectWEAP_InstanceData";Append(data,std::uint32_t(type.size()+1));data.insert(data.end(),type.begin(),type.end());data.push_back(0);data.resize(data.size()+6);Append(data,std::uint32_t(2));Append(data,std::uint32_t(0x123));Append(data,std::uint32_t(0x456));Append(data,std::uint32_t(0));Append(data,child);data.insert(data.end(),{0,0,1});return field("DATA",data);};
            Bytes receiver=pathField("weapons/test/receiver.nif");append(receiver,include(0x811));append(file,record("OMOD",0x810,receiver));append(file,record("OMOD",0x811,pathField("weapons/test/grip.nif")));append(file,record("OMOD",0x812,include(0x812)));
            Bytes weapon=pathField("weapons/test/dummy.nif");append(weapon,obts(0x810));append(weapon,obts(0xbad));append(file,record("WEAP",0x900,weapon));Bytes cyclic=pathField("weapons/test/dummy.nif");append(cyclic,obts(0x812));append(file,record("WEAP",0x901,cyclic));
            {const auto chunk=[](std::string tag,const Bytes& data){Bytes out(tag.begin(),tag.end());Append(out,std::uint32_t(data.size()));out.insert(out.end(),data.begin(),data.end());return out;};
             const auto shortText=[](const std::string& text){Bytes out;Append(out,std::uint16_t(text.size()+1));out.insert(out.end(),text.begin(),text.end());out.push_back(0);return out;};
             Bytes form=chunk("BETH",Bytes(8)),value;Append(value,std::uint32_t(0));append(value,shortText("furniture/test.mat"));append(form,chunk("OBJT",value));append(file,record("MTPT",0x704,field("REFL",form)));
             Bytes reflected=chunk("BETH",Bytes(8));const std::string name="BGSLayeredMaterialSwap::Entry";Bytes strings(name.begin(),name.end());strings.push_back(0);append(reflected,chunk("STRT",strings));Bytes entries;Append(entries,std::uint32_t(0));Append(entries,std::uint32_t(1));append(entries,shortText(""));Append(entries,std::uint32_t(0xffffff0d));Append(entries,std::uint32_t(0x704));append(entries,shortText("furniture/blue.mat"));append(reflected,chunk("LIST",entries));append(file,record("LMSW",0x703,field("REFL",reflected)));
             Bytes swap;Append(swap,std::uint16_t(1));Append(swap,std::uint32_t(0x703));const auto misc=record("MISC",0x705,field("MOLM",swap));Bytes group{'G','R','U','P'};Append(group,std::uint32_t(24+misc.size()));group.insert(group.end(),{'M','I','S','C'});Append(group,std::uint32_t(0));group.resize(24);append(group,misc);append(file,group);}
            const auto appearanceTemplate=[&](unsigned type,unsigned operation,unsigned target){Bytes data;Append(data,std::uint32_t(0));Append(data,std::uint32_t(1));data.resize(18);for(unsigned n:{type,operation,14u,target,0u,0u})Append(data,std::uint32_t(n));return data;};
            auto defaultAppearance=appearanceTemplate(4,0,0x600);auto templateFields=field("OBTS",defaultAppearance);append(templateFields,field("OBTS",appearanceTemplate(4,0,0x601)));append(file,record("ARMO",0x710,templateFields));
            append(file,record("ARMO",0x711,field("OBTS",appearanceTemplate(1,0,0x600))));append(file,record("ARMO",0x712,field("OBTS",appearanceTemplate(4,1,0x600))));
            defaultAppearance.pop_back();append(file,record("ARMO",0x713,field("OBTS",defaultAppearance)));
            auto data=include(0x811);data.erase(data.begin(),data.begin()+6);data[4]=1;append(data,Bytes{});for(unsigned n:{4u,0u,85u,0x600u,0u,0u})Append(data,std::uint32_t(n));append(file,record("OMOD",0x814,field("DATA",data)));append(file,record("WEAP",0x714,obts(0x814)));
            auto templateOverride=field("MODL",number(0x701));append(templateOverride,field("OBTS",appearanceTemplate(4,0,0x601)));append(file,record("ARMO",0x717,templateOverride));
            auto inherited=appearanceTemplate(4,0,0x601);inherited[4]=0;inherited.resize(18);inherited[15]=1;Append(inherited,std::uint32_t(0x710));append(file,record("ARMO",0x715,field("OBTS",inherited)));
            append(file,record("ARMO",0x716,obts(0x812))); // Self-including OMOD terminates safely.
            {std::ofstream out(fixture/"Starfield.esm",std::ios::binary);out.write(reinterpret_cast<const char*>(file.data()),file.size());}
            RecordScenes scenes(fixture,{{"Starfield.esm",0,0}});std::vector<Mesh> swapped{Mesh{"cap",{0,0,0,1,0,0,0,1,0},{0,1,2}}};swapped[0].material="\\materials\\furniture\\test.mat";scenes.ApplyMaterialSwaps(0x700,swapped);if(swapped[0].material!="materials/furniture/variant.mat")throw std::runtime_error("Per-record material swap mismatch");auto models=scenes.Models(0x100);if(models.size()!=1||models[0].path!=model||models[0].transform[3]!=1||models[0].transform[7]!=2||models[0].transform[11]!=3||models[0].transform[0]!=2)throw std::runtime_error("Ship assembly placement mismatch");
            for(unsigned id:{0x710u,0x714u,0x715u})for(bool male:{true,false}){auto pieces=swapped;pieces[0].material="materials/furniture/test.mat";scenes.ApplyMaterialSwaps(id,pieces,male);if(pieces[0].material!="materials/furniture/variant.mat")throw std::runtime_error("Default template/OMOD/parent appearance was omitted or later random template applied");}
            {auto pieces=swapped;pieces[0].material="materials/furniture/test.mat";scenes.ApplyMaterialSwaps(0x717,pieces);if(pieces[0].material!="materials/furniture/female.mat")throw std::runtime_error("Item template did not override addon appearance");}
            for(unsigned id:{0x711u,0x712u,0x713u,0x716u}){auto pieces=swapped;pieces[0].material="materials/furniture/test.mat";scenes.ApplyMaterialSwaps(id,pieces);if(pieces[0].material!="materials/furniture/test.mat")throw std::runtime_error("Invalid/untyped default appearance accepted");}
            {auto misc=swapped;misc[0].material="materials/furniture/test.mat";scenes.ApplyMaterialSwaps(0x702,misc);if(misc[0].material!="materials/furniture/variant.mat")throw std::runtime_error("Misc MOLM material swap was omitted");}
            {auto misc=swapped;misc[0].material="materials/furniture/test.mat";scenes.ApplyMaterialSwaps(0x705,misc);if(misc[0].material!="materials/furniture/blue.mat")throw std::runtime_error("Form-linked MOLM/MTPT swap mismatch");}
            for(const bool male:{true,false}){auto variant=swapped;variant[0].material="materials/furniture/test.mat";scenes.ApplyMaterialSwaps(0x701,variant,male);if(variant[0].material!=(male?"materials/furniture/variant.mat":"materials/furniture/female.mat"))throw std::runtime_error("Armor-addon sex-specific material swap mismatch");}
            {
                std::unique_ptr<RecordScenes> coldCache;
                auto* first=&EnsureRecordScenes(coldCache,fixture,{{"Starfield.esm",0,0}});
                if(first->WeaponModels(0x900)!=std::vector<std::string>{"weapons/test/dummy.nif","weapons/test/receiver.nif","weapons/test/grip.nif"})throw std::runtime_error("Cold weapon preview reader initialization failed");
                if(&EnsureRecordScenes(coldCache,fixture,{})!=first)throw std::runtime_error("Warm preview reader was replaced");
                bool failed=false;try{first->WeaponModels(0xbad);}catch(...){failed=true;}if(!failed)throw std::runtime_error("Missing weapon record did not fail safely");
                if(EnsureRecordScenes(coldCache,fixture,{}).WeaponModels(0x900).size()!=3)throw std::runtime_error("Reader did not recover after missing weapon");
                coldCache.reset();if(EnsureRecordScenes(coldCache,fixture,{{"Starfield.esm",0,0}}).WeaponModels(0x900).size()!=3)throw std::runtime_error("Reader did not initialize after cache invalidation");
            }
            if(scenes.WeaponModels(0x900)!=std::vector<std::string>{"weapons/test/dummy.nif","weapons/test/receiver.nif","weapons/test/grip.nif"})throw std::runtime_error("Default weapon model/include resolution failed");bool weaponCycle=false;try{scenes.WeaponModels(0x901);}catch(...){weaponCycle=true;}if(!weaponCycle)throw std::runtime_error("Cyclic weapon attachment accepted");
            bool cycle=false;try{scenes.Models(0x110);}catch(...){cycle=true;}if(!cycle)throw std::runtime_error("Cyclic assembly accepted");
            Bytes master{'S','t','a','r','f','i','e','l','d','.','e','s','m',0};Bytes addon=record("TES4",0,field("MAST",master));append(addon,record("GBFM",0x01000100,field("FLFM",number(0x200))));const std::string overrideModel="furniture/override.nif";Bytes overridePath(overrideModel.begin(),overrideModel.end());overridePath.push_back(0);append(addon,record("STAT",0x400,field("MODL",overridePath)));
            {std::ofstream out(fixture/"Addon.esm",std::ios::binary);out.write(reinterpret_cast<const char*>(addon.data()),addon.size());}
            RecordScenes overrides(fixture,{{"Starfield.esm",0,0},{"Addon.esm",0,1}});auto overridden=overrides.Models(0x01000100);if(overridden.size()!=1||overridden[0].path!=overrideModel)throw std::runtime_error("Assembly master/override remapping mismatch");
        }
        if(!SceneDistortionOnly("Materials\\Effects\\Fires\\HeatDistortion.mat"))throw std::runtime_error("Weapon scene-distortion shell was not omitted");
        for(const auto* material:{"", "materials/weapons/CrimX_Cutter/CrimX_Cutter.mat", "materials/weapons/CrimX_Cutter/CrimX_Visor.mat", "materials/effects/liquids/LavaBubbleMesh.mat", "materials/effects/fires/HeatDistortionOther.mat"})
            if(SceneDistortionOnly(material))throw std::runtime_error("Physical or supported effect material was omitted");
        bool rejected=false;try{ReadNif(Bytes{0,1,2});}catch(...){rejected=true;}if(!rejected)throw std::runtime_error("Truncated model accepted");
        {
            // Both layouts use stride 64: only the following stream identifies
            // a path versus an inline version-2 mesh.
            Bytes external;Append(external,std::uint32_t(64));const std::string path="0123456789abcdef0123456789abcdef";Append(external,std::uint32_t(path.size()));external.insert(external.end(),path.begin(),path.end());
            Reader reader{external};reader.Skip(4);const auto stream=ReadGeometryStream(reader,3,3);if(stream.path!=path||!stream.embedded.empty())throw std::runtime_error("External stride-64 geometry misclassified as embedded");
            Bytes embedded;Append(embedded,std::uint32_t(64));Append(embedded,std::uint32_t(2));Append(embedded,std::uint32_t(3));Reader inlineReader{embedded};inlineReader.Skip(4);const auto inlineStream=ReadGeometryStream(inlineReader,3,3);if(!inlineStream.path.empty()||inlineStream.embedded.size()!=8)throw std::runtime_error("Embedded version-2 stream not recognized");
            bool bad=false;Reader mismatch{embedded};mismatch.Skip(4);try{ReadGeometryStream(mismatch,6,3);}catch(...){bad=true;}if(!bad)throw std::runtime_error("Mismatched embedded index count accepted");
            bad=false;Reader truncated{std::span<const std::uint8_t>(embedded).first(8)};truncated.Skip(4);try{ReadGeometryStream(truncated,3,3);}catch(...){bad=true;}if(!bad)throw std::runtime_error("Truncated embedded stream accepted");
        }
        Bytes raw;Append(raw,std::uint32_t(1));Append(raw,std::uint32_t(3));for(auto i:{0,1,2})Append(raw,std::uint16_t(i));Append(raw,1.f);Append(raw,std::uint32_t(0));Append(raw,std::uint32_t(3));
        for(auto i:{0,0,0,32767,0,0,0,32767,0})Append(raw,std::int16_t(i));
        const auto parsed=ReadMesh(raw,{"triangle","geometries/test.mesh",Identity()});
        if(parsed.positions[3]!=1.f||parsed.indices[2]!=2)throw std::runtime_error("Mesh decode mismatch");
        raw[12]=3;rejected=false;try{ReadMesh(raw,{"bad","",Identity()});}catch(...){rejected=true;}if(!rejected)throw std::runtime_error("Out-of-range index accepted");
        {std::vector<Mesh> many(185,Mesh{"part",{0,0,0,1,0,0,0,1,0},{0,1,2}});Pack(many);many.resize(MaxPieces+1);bool failed=false;try{Pack(many);}catch(...){failed=true;}if(!failed)throw std::runtime_error("Piece budget was not enforced");}
        std::cout<<"Preview tests passed: paths, bounds, geometry decoding, and binary transport.\n";return 0;
    }catch(const std::exception& e){std::cerr<<e.what()<<'\n';return 1;}
}

