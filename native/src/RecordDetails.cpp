#include <SFSE/SFSE.h>
#include <RE/Starfield.h>
#include "RecordDetails.h"
#include "RecordDetailsInput.h"
#include "RecordDescriptions.h"
#include "PreviewRecords.h"
#include "SlateVoiceAssets.h"
#include "ModCatalogs.h"
#include <atomic>
#include <condition_variable>
#include <mutex>
#include <thread>
#include <Windows.h>

namespace CCC::RecordDetails {
namespace {
    using Json=OSFUI::API::Json;
    struct Service {
        std::atomic_bool busy{false};std::mutex mutex;std::condition_variable_any wake;std::function<void()> pending;
        std::unique_ptr<Details::DescriptionStore> descriptions,subtitles;std::unique_ptr<Preview::RecordScenes> records;
        std::string signature,audioKey;std::unique_ptr<Details::SlateVoiceAssets> voices;Preview::Bytes audioBytes;
        std::jthread worker;
        Service():worker([this](std::stop_token stop){while(!stop.stop_requested()){
            std::function<void()> job;{std::unique_lock lock(mutex);if(!wake.wait(lock,stop,[&]{return bool(pending);}))break;job=std::move(pending);pending={};}
            try{job();}catch(...){busy=false;}
        }}){}
        void Queue(std::function<void()> job){{std::lock_guard lock(mutex);pending=std::move(job);}wake.notify_one();}
    };
    Service& State(){static Service service;return service;}
    std::string Name(RE::TESForm* form){if(!form)return {};if(auto* named=starfield_cast<RE::TESFullName*>(form)){std::string text=named->fullName.c_str();if(text.starts_with("<ID=")&&text.size()>=13)text.erase(0,13);return text.substr(0,2048);}return {};}
    void Stat(Json& out,const std::string& label,double value,bool curve=false){if(!label.empty()&&std::isfinite(value)&&std::abs(value)<1e12)out["stats"].push_back({{"label",label},{"value",value},{"curve",curve}});}
    void Effects(Json& out,RE::MagicItem* magic){
        if(!magic||magic->listOfEffects.size()>64)return;
        using Flag=RE::EffectSetting::EffectSettingData::Flag;
        for(const auto* effect:magic->listOfEffects){if(!effect||!effect->effectSetting)continue;const auto* setting=effect->effectSetting;
            if(setting->data.flags.any(Flag::kHideInUI))continue;
            Json row{{"name",Name(effect->effectSetting)},{"description",std::string(setting->magicItemDescription.c_str()).substr(0,16384)},{"conditional",effect->conditions.head!=nullptr||setting->conditions.head!=nullptr}};
            const auto add=[&](const char* key,double number){if(std::isfinite(number)&&std::abs(number)<1e12)row[key]=number;};
            if(!setting->data.flags.any(Flag::kNoMagnitude))add("magnitude",effect->magGlobal?effect->magGlobal->value:effect->data.magnitude);
            if(!setting->data.flags.any(Flag::kNoDuration))add("duration",effect->durationGlobal?effect->durationGlobal->value:effect->data.duration);
            if(!setting->data.flags.any(Flag::kNoArea))add("area",effect->areaGlobal?effect->areaGlobal->value:effect->data.area);
            if(row["description"]!=""||row["name"]!="")out["effects"].push_back(std::move(row));
        }
    }
    Json Snapshot(RE::TESForm* form){
        Json out{{"ok",true},{"formId",std::format("{:08X}",form->GetFormID())},{"description",""},{"stats",Json::array()},{"effects",Json::array()}};
        if(auto* magic=starfield_cast<RE::MagicItem*>(form))Effects(out,magic);
        if(auto* effect=form->As<RE::EffectSetting>())out["description"]=std::string(effect->magicItemDescription.c_str()).substr(0,16384);
        if(auto* enchanted=starfield_cast<RE::TESEnchantableForm*>(form))Effects(out,enchanted->formEnchanting);
        if(auto* weight=starfield_cast<RE::TESWeightForm*>(form))Stat(out,"Mass",weight->weight);
        if(auto* value=starfield_cast<RE::TESValueForm*>(form))Stat(out,"Value",value->value);
        if(auto* armor=form->As<RE::TESObjectARMO>();armor&&armor->instanceData.has_value()){
            const auto& data=armor->instanceData.value();Stat(out,"Mass",data.weight);Stat(out,"Value",data.value);Stat(out,"Physical resistance",data.rating);
            if(data.damageTypes&&data.damageTypes->size()<=64)for(const auto& resistance:*data.damageTypes)Stat(out,Name(resistance.first)+" resistance",resistance.third.i,resistance.second!=nullptr);
            if(data.actorValues&&data.actorValues->size()<=64)for(const auto& av:*data.actorValues)Stat(out,Name(av.first),av.third.f,av.second!=nullptr);
        }
        if(auto* weapon=form->As<RE::TESObjectWEAP>();weapon&&weapon->weaponData){
            const auto& data=*weapon->weaponData;
            if(data.WeapDataGeneral){Stat(out,"Mass",data.WeapDataGeneral->baseWeight);Stat(out,"Value",data.WeapDataGeneral->baseValue);}
            if(data.WeaponDamage){Stat(out,"Physical damage",data.WeaponDamage->attackDamage);if(data.WeaponDamage->damageTypes&&data.WeaponDamage->damageTypes->size()<=64)for(const auto& damage:*data.WeaponDamage->damageTypes)Stat(out,Name(damage.first)+" damage",damage.third.i,damage.second!=nullptr);}
            if(data.WeaponAmmoData){out["ammo"]=Name(data.WeaponAmmoData->ammo);Stat(out,"Magazine",data.WeaponAmmoData->ammoCapacity);}
        }
        return out;
    }
    std::filesystem::path Directory(){std::wstring exe(32768,L'\0');const auto n=GetModuleFileNameW(nullptr,exe.data(),static_cast<DWORD>(exe.size()));if(!n||n>=exe.size())throw std::runtime_error("Game directory is unavailable.");exe.resize(n);return std::filesystem::path(exe).parent_path()/L"Data";}
}
void OnInspect(const OSFUI::API::Request& raw,void*) noexcept {
    OSFUI::API::JsonRequest request{raw};if(!request)return;bool owns=false;
    try{
        if(request.SourceViewId()!="console.command-center/main")throw std::runtime_error("Record inspection must originate in CCC.");
        const auto operation=Operation(request);const bool readBook=operation=="read-book",audioChunk=operation=="read-slate-audio";
        const auto track=request.Payload().value("track",0u),offset=request.Payload().value("offset",0u),count=request.Payload().value("count",32768u);
        if(audioChunk&&(track>=256||count==0||count>32768||offset>8u*1024*1024))throw std::runtime_error("Invalid audio range.");
        const auto text=request.Get<std::string>("formId");std::uint32_t id=0;if(!text||text->size()!=8)throw std::runtime_error("A loaded Form ID is required.");
        const auto parsed=std::from_chars(text->data(),text->data()+8,id,16);if(parsed.ec!=std::errc{}||parsed.ptr!=text->data()+8||!id)throw std::runtime_error("Invalid Form ID.");
        if(State().busy.exchange(true)){raw.Reject("details-busy","Another item is being inspected. Please retry.");return;}owns=true;
        const auto* tasks=SFSE::GetTaskInterface();if(!tasks)throw std::runtime_error("Game task queue is unavailable.");
        tasks->AddTask([id,readBook,audioChunk,track,offset,count,reply=raw]{try{
            // Engine objects are accessed only here, on the game thread. The worker owns copies.
            auto* form=RE::TESForm::LookupByID(id);if(!form)throw std::runtime_error("This record is not loaded.");
            const bool book=form->As<RE::TESObjectBOOK>()!=nullptr;if((readBook||audioChunk)&&!book)throw std::runtime_error("This record is not a book or note.");const bool perk=form->As<RE::BGSPerk>()!=nullptr;auto out=Snapshot(form);std::uint32_t descriptionId=0;std::string owner,language="en";bool localized=false;
            if(auto* description=starfield_cast<RE::TESDescription*>(form)){descriptionId=description->descriptionText.id;if(auto* file=form->GetDescriptionOwnerFile()){owner=file->fileName;localized=file->fileFlags.any(RE::TESFile::Flags::kLocalized);}}
            if(auto* ini=RE::INISettingCollection::GetSingleton())if(auto* setting=ini->GetSetting("sLanguage:General");setting&&setting->GetType()==RE::Setting::Type::kString&&!setting->GetString().empty())language=setting->GetString();
            std::vector<Preview::ScenePlugin> plugins;const auto order=ModCatalogs::PluginLoadOrder();if(order.contains("plugins"))for(const auto& plugin:order["plugins"]){const auto kind=plugin.value("pluginKind",std::string("full"));plugins.push_back({plugin.at("plugin").get<std::string>(),kind=="small"?2u:kind=="medium"?1u:0u,plugin.value("index",0u)});}
            auto directory=Directory();State().Queue([id,perk,book,readBook,audioChunk,track,offset,count,reply,out=std::move(out),owner=std::move(owner),language=std::move(language),descriptionId,localized,directory=std::move(directory),plugins=std::move(plugins)]()mutable{try{
                auto& state=State();std::string signature=directory.string()+":"+language;for(const auto& plugin:plugins)signature+='|'+plugin.name+':'+std::to_string(plugin.kind)+':'+std::to_string(plugin.index);
                if(state.signature!=signature){state.records.reset();state.subtitles.reset();state.voices.reset();state.audioBytes.clear();state.audioKey.clear();state.descriptions=std::make_unique<Details::DescriptionStore>(directory);state.signature=signature;}
                if(audioChunk){
                    if(!state.records)state.records=std::make_unique<Preview::RecordScenes>(directory,plugins);
                    const auto key=std::to_string(id)+":"+std::to_string(track);
                    if(state.audioKey!=key){auto tracks=state.records->AudioTracks(id);if(track>=tracks.size())throw std::runtime_error("Audio line is out of range.");if(!state.voices)state.voices=std::make_unique<Details::SlateVoiceAssets>(directory,plugins,language);auto bytes=state.voices->Read(tracks[track]);if(bytes.size()<12||bytes.size()>8u*1024*1024||std::string(reinterpret_cast<const char*>(bytes.data()),4)!="RIFF"||std::string(reinterpret_cast<const char*>(bytes.data()+8),4)!="WAVE")throw std::runtime_error("Unsupported slate audio format.");state.audioBytes=std::move(bytes);state.audioKey=key;}
                    if(offset>=state.audioBytes.size())throw std::runtime_error("Audio offset is out of range.");const auto length=std::min<std::size_t>(count,state.audioBytes.size()-offset);
                    const auto result=Json{{"ok",true},{"formId",std::format("{:08X}",id)},{"track",track},{"offset",offset},{"totalBytes",state.audioBytes.size()},{"data",Preview::Base64(std::span(state.audioBytes).subspan(offset,length))}}.dump();state.busy=false;reply.Reply(result.c_str());return;
                }
                try{if(book&&!readBook)out["description"]="";else if(localized)out["description"]=state.descriptions->Lookup(owner,language,descriptionId);
                    else if(!owner.empty()){if(!state.records)state.records=std::make_unique<Preview::RecordScenes>(directory,plugins);out["description"]=state.records->InlineDescription(id);}
                }catch(const std::exception& e){REX::WARN("Record description unavailable for {:08X}: {}",id,e.what());}
                if(readBook){
                    if(!state.records)state.records=std::make_unique<Preview::RecordScenes>(directory,plugins);
                    out["slateType"]=state.records->SlateType(id);
                    if(out["slateType"]==3){
                        try{auto tracks=state.records->AudioTracks(id);if(!state.subtitles)state.subtitles=std::make_unique<Details::DescriptionStore>(directory,".ilstrings");out["audioTracks"]=Json::array();std::size_t textBudget=32768;
                            for(unsigned i=0;i<tracks.size();++i){const auto& line=tracks[i];std::string text;if(line.localized&&line.text.size()==4){Preview::Reader r{line.text};text=state.subtitles->Lookup(line.plugin,language,r.Read<std::uint32_t>());}else if(!line.localized)text=Details::Text(line.text);text.resize((std::min)({text.size(),std::size_t(2048),textBudget}));textBudget-=text.size();out["audioTracks"].push_back({{"index",i},{"text",text}});}
                        }catch(const std::exception& e){out["audioError"]=e.what();}
                    }
                    if(out["description"]==""){

                        if(!state.records)state.records=std::make_unique<Preview::RecordScenes>(directory,plugins);
                        const auto record=state.records->ReadDescriptions(id);
                        if(record.localized&&record.summary.size()==4){Preview::Reader r{record.summary};out["description"]=state.descriptions->Lookup(record.plugin,language,r.Read<std::uint32_t>());}
                        else if(!record.localized)out["description"]=Details::Text(record.summary);
                    }
                    out["bookText"]=out["description"];out["description"]="";
                }
                if(perk)try{
                    if(!state.records)state.records=std::make_unique<Preview::RecordScenes>(directory,plugins);
                    const auto record=state.records->ReadDescriptions(id);out["ranks"]=Json::array();unsigned rank=0;
                    for(const auto& bytes:record.ranks){++rank;std::string text;
                        if(record.localized&&bytes.size()==4){Preview::Reader r{bytes};text=state.descriptions->Lookup(record.plugin,language,r.Read<std::uint32_t>());}
                        else if(!record.localized)text=Details::Text(bytes);
                        if(!text.empty())out["ranks"].push_back({{"rank",rank},{"description",text}});
                    }
                }catch(const std::exception& e){REX::WARN("Perk rank descriptions unavailable for {:08X}: {}",id,e.what());}
                const auto json=out.dump(-1,' ',false,Json::error_handler_t::replace);state.busy=false;reply.Reply(json.c_str());
            }catch(const std::exception& e){State().busy=false;REX::WARN("Record inspection failed: {}",e.what());reply.Reject("details-unavailable",e.what());}catch(...){State().busy=false;reply.Reject("details-unavailable","Could not inspect this record.");}});
        }catch(const std::exception& e){State().busy=false;REX::WARN("Record inspection failed: {}",e.what());reply.Reject("details-unavailable",e.what());}catch(...){State().busy=false;reply.Reject("details-unavailable","Record data is unavailable.");}});
    }catch(const std::exception& e){if(owns)State().busy=false;REX::WARN("Record inspection request failed: {}",e.what());raw.Reject("details-unavailable",e.what());}catch(...){if(owns)State().busy=false;raw.Reject("details-unavailable","Could not inspect this record.");}
}
}
