#include <SFSE/SFSE.h>
#include <RE/Starfield.h>
#include <RE/T/TESObjectARMA.h>
#include "ModelPreview.h"
#include "ModCatalogs.h"
#include "PreviewTextures.h"
#include "PreviewRecords.h"
#include <atomic>
#include <condition_variable>
#include <deque>
#include <mutex>
#include <thread>
#include <Windows.h>

namespace CCC::ModelPreview {
namespace {
    struct Service {
        std::atomic_bool busy{false};
        std::mutex mutex;
        std::condition_variable_any wake;
        std::function<void()> pending;
        std::deque<std::pair<std::string, std::shared_ptr<const Preview::Bytes>>> results;
        struct Cached {std::string key;std::shared_ptr<const Preview::Bytes> bytes;std::size_t decoded,pieces,triangles,textured;};
        std::deque<Cached> cache;
        struct Geometry{std::string key;std::vector<Preview::Mesh> meshes;std::size_t bytes;};std::deque<Geometry> geometry;
        std::unique_ptr<Preview::RecordScenes> scenes;
        std::uint64_t sequence = 0;
        std::unique_ptr<Preview::AssetStore> assets;
        std::unique_ptr<Preview::TextureStore> textures;
        std::string assetSignature;
        std::jthread worker;
        Service() : worker([this](std::stop_token stop) {
            while(!stop.stop_requested()) {
                std::function<void()> job;
                { std::unique_lock lock(mutex); if(!wake.wait(lock,stop,[&]{return bool(pending);}))break; job=std::move(pending);pending={}; }
                try { job(); } catch (...) {} busy.store(false);
            }
        }) {}
        void Queue(std::function<void()> job) { {std::lock_guard lock(mutex);pending=std::move(job);}wake.notify_one(); }
    };
    Service& State(){static Service state;return state;}
    std::vector<std::string> ModelPaths(RE::TESForm* form, bool male = false) {
        std::vector<std::string> paths;
        const auto add=[&](const char* path){if(path&&*path){auto key=Preview::AssetKey(path);if(std::find(paths.begin(),paths.end(),key)==paths.end())paths.push_back(std::move(key));}};
        if(auto* armor=form->As<RE::TESObjectARMO>()) {
            for(const auto& addon:armor->modelArray)if(addon.armorAddon){const auto& preferred=addon.armorAddon->bipedModel[male?RE::SEX::kMale:RE::SEX::kFemale].model;const auto& fallback=addon.armorAddon->bipedModel[male?RE::SEX::kFemale:RE::SEX::kMale].model;add(preferred.empty()?fallback.c_str():preferred.c_str());}
        } else if(auto* weapon=form->As<RE::TESObjectWEAP>()) {
            add(weapon->BGSModelMaterialSwap::model.c_str());
        }
        else if(auto* misc=form->As<RE::TESObjectMISC>())add(misc->BGSModelMaterialSwap::model.c_str());
        else if(auto* aid=form->As<RE::AlchemyItem>())add(aid->BGSModelMaterialSwap::model.c_str());
        else if(auto* ammo=form->As<RE::TESAmmo>())add(ammo->BGSModelMaterialSwap::model.c_str());
        else if(auto* object=form->As<RE::TESFurniture>())add(object->BGSModelMaterialSwap::model.c_str());
        else if(auto* object=form->As<RE::TESObjectSTAT>())add(object->BGSModelMaterialSwap::model.c_str());
        else if(auto* object=form->As<RE::BGSMovableStatic>())add(object->BGSModelMaterialSwap::model.c_str());
        else if(auto* object=form->As<RE::TESObjectACTI>())add(object->BGSModelMaterialSwap::model.c_str());
        else if(auto* object=form->As<RE::TESObjectCONT>())add(object->BGSModelMaterialSwap::model.c_str());
        else if(auto* object=form->As<RE::TESObjectDOOR>())add(object->BGSModelMaterialSwap::model.c_str());
        if(paths.empty()&&!form->As<RE::TESObjectWEAP>())throw std::runtime_error("This item does not expose a supported standalone model.");
        if(paths.size()>16)throw std::runtime_error("This outfit has too many model parts for the experimental viewer.");return paths;
    }
    std::filesystem::path DataDirectory(){std::wstring exe(32768,L'\0');const auto count=GetModuleFileNameW(nullptr,exe.data(),static_cast<DWORD>(exe.size()));if(!count||count>=exe.size())throw std::runtime_error("Game directory is unavailable.");exe.resize(count);return std::filesystem::path(exe).parent_path()/L"Data";}
}
void OnModel(const OSFUI::API::Request& raw,void*) noexcept {
    OSFUI::API::JsonRequest request{raw};if(!request)return;
    bool ownsBusy = false;
    try {
        const auto text=request.Get<std::string>("formId");std::uint32_t id=0;const bool showMannequin=request.Get<unsigned>("mannequin").value_or(0)==1;
        const auto requestedQuality=request.Get<std::string>("quality").value_or("high");const unsigned quality=requestedQuality=="low"?1:requestedQuality=="medium"?2:requestedQuality=="ultra"?4:3;
        const bool male=request.Get<std::string>("sex").value_or("female")=="male";const bool geometryOnly=request.Get<std::string>("stage").value_or("complete")=="geometry";
        if(!text||text->size()!=8){request.Reject("invalid-form","A valid loaded Form ID is required.");return;}
        const auto parsed=std::from_chars(text->data(),text->data()+text->size(),id,16);
        if(parsed.ec!=std::errc{}||parsed.ptr!=text->data()+text->size()||!id){request.Reject("invalid-form","A valid loaded Form ID is required.");return;}
        if(request.SourceViewId()!="console.command-center/main"){request.Reject("invalid-view","Preview requests must originate in CCC.");return;}
        auto& state=State();if(state.busy.exchange(true)){request.Reject("preview-busy","A model is still loading. Please retry shortly.");return;}
        ownsBusy = true;
        const auto* tasks=SFSE::GetTaskInterface();if(!tasks){state.busy=false;request.Reject("preview-unavailable","The game task queue is unavailable.");return;}
        // Only resolve engine-owned forms on the game thread. Archive IO and
        // decoding run independently, and never execute inventory commands.
        tasks->AddTask([id,showMannequin,quality,male,geometryOnly,reply=raw]() {
            try {
                auto* form=RE::TESForm::LookupByID(id);if(!form)throw std::runtime_error("This Form ID is not loaded.");
                if(auto* recipe=form->As<RE::BGSConstructibleObject>()){form=recipe->createdObject;if(!form)throw std::runtime_error("This recipe has no previewable created object.");}
                const bool weapon=form->As<RE::TESObjectWEAP>()!=nullptr;const bool assembly=form->Is(RE::FormType::kGBFM,RE::FormType::kPKIN);const auto modelId=form->GetFormID();
                auto paths=assembly?std::vector<std::string>{}:ModelPaths(form,male);auto directory=DataDirectory();std::vector<std::string> plugins;std::vector<Preview::ScenePlugin> scenePlugins;
                const auto order=CCC::ModCatalogs::PluginLoadOrder();
                if(order.contains("plugins"))for(const auto& plugin:order["plugins"]){plugins.push_back(plugin.at("plugin").get<std::string>());const auto kind=plugin.value("pluginKind",std::string("full"));scenePlugins.push_back({plugins.back(),kind=="small"?2u:kind=="medium"?1u:0u,plugin.value("index",0u)});}
                const bool mannequin=showMannequin&&form->As<RE::TESObjectARMO>();
                State().Queue([paths=std::move(paths),directory=std::move(directory),plugins=std::move(plugins),reply,id,modelId,assembly,weapon,scenePlugins=std::move(scenePlugins),mannequin,quality,male,geometryOnly]() {
                    try {
                        auto& state=State();std::string signature=directory.string();for(const auto& p:plugins)signature+='|'+p;
                        if(!state.assets||state.assetSignature!=signature){state.cache.clear();state.geometry.clear();state.scenes.reset();state.textures.reset();state.assets=std::make_unique<Preview::AssetStore>(directory,plugins);state.textures=std::make_unique<Preview::TextureStore>(*state.assets);state.assetSignature=std::move(signature);}
                        const auto key=std::to_string(id)+":"+std::to_string(quality)+":"+std::to_string(mannequin)+":"+std::to_string(male)+(geometryOnly?":geometry":":complete");
                        const auto publish=[&](const Service::Cached& item,bool cached){std::string ticket;{std::lock_guard lock(state.mutex);ticket=std::to_string(++state.sequence);state.results.emplace_back(ticket,item.bytes);while(state.results.size()>2)state.results.pop_front();}const auto json=OSFUI::API::Json{{"ok",true},{"ticket",ticket},{"bytes",item.bytes->size()},{"decodedBytes",item.decoded},{"compression","deflate"},{"meshes",item.pieces},{"triangles",item.triangles},{"formId",id},{"mode","color"},{"textured",item.textured},{"cached",cached}}.dump();reply.Reply(json.c_str());};
                        for(auto it=state.cache.begin();it!=state.cache.end();++it)if(it->key==key){auto hit=*it;state.cache.erase(it);state.cache.push_back(hit);publish(hit,true);return;}
                        const auto geometryKey=std::to_string(modelId)+":"+std::to_string(mannequin)+":"+std::to_string(male);
                        std::vector<Preview::Mesh> meshes;for(auto it=state.geometry.begin();it!=state.geometry.end();++it)if(it->key==geometryKey){auto hit=std::move(*it);state.geometry.erase(it);meshes=hit.meshes;state.geometry.push_back(std::move(hit));break;}
                        if(meshes.empty()){
                            meshes=(assembly||weapon)?Preview::EnsureRecordScenes(state.scenes,directory,scenePlugins).LoadModels(*state.assets,modelId):Preview::Load(*state.assets,paths,quality);
                            if(mannequin){const bool modelMale=std::any_of(paths.begin(),paths.end(),[](const auto& path){return path.ends_with("_m.nif");});const bool modelFemale=std::any_of(paths.begin(),paths.end(),[](const auto& path){return path.ends_with("_f.nif");});Preview::AddMannequin(*state.assets,meshes,modelMale||(!modelFemale&&male),quality);}
                            std::size_t size=0;for(const auto& mesh:meshes)size+=mesh.positions.size()*4+mesh.indices.size()*4+mesh.uv.size()*4;
                            if(size<=24u*1024*1024){std::size_t held=size;for(const auto& prior:state.geometry)held+=prior.bytes;while(!state.geometry.empty()&&(held>24u*1024*1024||state.geometry.size()>=3)){held-=state.geometry.front().bytes;state.geometry.pop_front();}state.geometry.push_back({geometryKey,meshes,size});}
                        }
                        if(!geometryOnly&&!assembly){Preview::EnsureRecordScenes(state.scenes,directory,scenePlugins).ApplyMaterialSwaps(modelId,meshes,male);}
                        if(meshes.size()>Preview::MaxPieces)throw std::runtime_error("Too many model pieces.");
                        if(!geometryOnly)state.textures->Apply(meshes,quality);auto bytes=Preview::Pack(meshes,(quality==4?256u:64u)*1024*1024);const auto decodedBytes=bytes.size();
                        Preview::Bytes compressed(compressBound(bytes.size()));uLongf compressedLength=compressed.size();
                        if(compress2(compressed.data(),&compressedLength,bytes.data(),bytes.size(),Z_BEST_SPEED)!=Z_OK)throw std::runtime_error("Model transfer compression failed.");compressed.resize(compressedLength);bytes=std::move(compressed);
                        std::size_t triangles=0;for(const auto& mesh:meshes)triangles+=mesh.indices.size()/3;
                        const auto textured=std::count_if(meshes.begin(),meshes.end(),[](const auto& mesh){return !mesh.pixels.empty();});
                        if(!geometryOnly)REX::INFO("Preview {:08X}: {} textured / {} pieces; {}",id,textured,meshes.size(),state.textures->Diagnostics());
                        for(const auto& mesh:meshes)if(!geometryOnly&&!mesh.mannequin&&(mesh.incompleteMaterial||(mesh.pixels.empty()&&!mesh.tinted&&!mesh.glass)))REX::INFO("Preview unresolved material: {} / {}",mesh.name,mesh.material);
                        Service::Cached item{key,std::make_shared<const Preview::Bytes>(std::move(bytes)),decodedBytes,meshes.size(),triangles,std::size_t(textured)};
                        if(!geometryOnly&&item.bytes->size()<=64u*1024*1024){std::size_t held=item.bytes->size();for(const auto& prior:state.cache)held+=prior.bytes->size();while(!state.cache.empty()&&(held>64u*1024*1024||state.cache.size()>=4)){held-=state.cache.front().bytes->size();state.cache.pop_front();}state.cache.push_back(item);}publish(item,false);
                    } catch(const std::exception& e){reply.Reject("preview-unavailable",e.what());}catch(...){reply.Reject("preview-unavailable","The item model could not be loaded.");}
                });
            }catch(const std::exception& e){State().busy=false;reply.Reject("preview-unavailable",e.what());}catch(...){State().busy=false;reply.Reject("preview-unavailable","Model metadata is unavailable.");}
        });
    }catch(const std::exception& e){if(ownsBusy)State().busy=false;request.Reject("preview-failed",e.what());}catch(...){if(ownsBusy)State().busy=false;request.Reject("preview-failed","Could not request a model preview.");}
}
void OnChunk(const OSFUI::API::Request& raw,void*) noexcept {
    OSFUI::API::JsonRequest request{raw};if(!request)return;
    try {
        const auto ticket=request.Get<std::string>("ticket");const auto offset=request.Get<std::uint32_t>("offset");
        if(request.SourceViewId()!="console.command-center/main"||!ticket||!offset){request.Reject("invalid-preview-chunk","Invalid preview transfer request.");return;}
        Preview::Bytes chunk;bool expired=false;
        {auto& state=State();std::lock_guard lock(state.mutex);
            const auto found=std::find_if(state.results.begin(),state.results.end(),[&](const auto& result){return result.first==*ticket;});
            if(found==state.results.end()||*offset>=found->second->size())expired=true;
            else {const auto size=std::min<std::size_t>(std::clamp(request.Get<unsigned>("maxBytes").value_or(32768),4096u,65536u),found->second->size()-*offset);chunk.assign(found->second->begin()+*offset,found->second->begin()+*offset+size);}
        }
        if(expired){request.Reject("preview-expired","This model transfer expired; load the preview again.");return;}
        // Reply without the cache lock: the host may dispatch another request.
        request.Reply(OSFUI::API::Json{{"ok",true},{"offset",*offset},{"data",Preview::Base64(chunk)}});
    }catch(const std::exception& e){request.Reject("preview-transfer-failed",e.what());}catch(...){request.Reject("preview-transfer-failed","Could not transfer model geometry.");}
}
}
