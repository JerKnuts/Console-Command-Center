#pragma once
#include <nlohmann/json.hpp>
namespace CCC::Preview {
// Standalone .mat JSON is used by mods alongside the compiled CDB format.
// Resolve authored component slots, not guesses based on DDS filenames.
inline std::optional<MaterialAppearance> ReadJsonPreviewMaterial(std::span<const std::uint8_t> bytes){
 using Json=nlohmann::json;
 if(bytes.empty()||bytes.size()>2u*1024*1024)return {};
 try{const auto doc=Json::parse(bytes.begin(),bytes.end());if(!doc.contains("Objects")||!doc["Objects"].is_array()||doc["Objects"].empty()||doc["Objects"].size()>4096)return {};
 const auto& objects=doc["Objects"];std::unordered_map<std::string,const Json*> nodes;unsigned total=0;
 for(const auto& object:objects){if(!object.is_object())return {};if(object.contains("Components")){if(!object["Components"].is_array()||object["Components"].size()>4096||(total+=unsigned(object["Components"].size()))>16384)return {};}const auto id=object.value("ID",std::string{});if(!id.empty())nodes[id]=&object;}
 const auto field=[&](const Json* node,const std::string& type,unsigned index)->const Json*{std::unordered_set<std::string> seen;for(unsigned depth=0;node&&depth<32;++depth){if(node->contains("Components"))for(const auto& c:(*node)["Components"])if(c.is_object()&&c.value("Type",std::string{})==type&&c.value("Index",0u)==index&&c.contains("Data")&&c["Data"].is_object())return &c["Data"];const auto parent=node->value("Parent",std::string{});if(!seen.insert(parent).second)return nullptr;const auto it=nodes.find(parent);node=it==nodes.end()?nullptr:it->second;}return nullptr;};
 const auto linked=[&](const Json* node,const std::string& type,unsigned index=0)->const Json*{const auto data=field(node,type,index);if(!data)return nullptr;const auto it=nodes.find(data->value("ID",std::string{}));return it==nodes.end()?nullptr:it->second;};
 const auto numeric=[](const Json& value,float fallback){try{const float v=value.is_string()?std::stof(value.get<std::string>()):value.get<float>();return std::isfinite(v)?v:fallback;}catch(...){return fallback;}};
 const auto rgba=[&](const Json& data)->std::optional<std::array<float,4>>{const Json* value=&data;for(unsigned depth=0;depth<8;++depth){if(value->contains("x")&&value->contains("y")&&value->contains("z")){std::array<float,4> result{};unsigned i=0;for(const auto* k:{"x","y","z","w"})result[i++]=value->contains(k)?numeric((*value)[k],-1):1;for(const auto v:result)if(v<0||v>1)return {};return result;}if(value->contains("Data"))value=&(*value)["Data"];else if(value->contains("Value"))value=&(*value)["Value"];else if(value->contains("Color"))value=&(*value)["Color"];else return {};}return {};};
 const Json* root=&objects.front();const auto layer=linked(root,"BSMaterial::LayerID"),material=linked(layer,"BSMaterial::MaterialID"),set=linked(material,"BSMaterial::TextureSetID");if(!set)return {};
 MaterialAppearance a;a.authored=true;const auto parent=root->value("Parent",std::string{});a.glass=parent.find("Glass")!=parent.npos;a.decal=parent.find("Decal")!=parent.npos;
 if(const auto alpha=field(root,"BSMaterial::AlphaSettingsComponent",0)){if(alpha->contains("AlphaTestThreshold"))a.alphaThreshold=std::clamp(numeric((*alpha)["AlphaTestThreshold"],.5f),0.f,1.f);if(alpha->contains("HasOpacity")){const auto& value=(*alpha)["HasOpacity"];const bool enabled=value==true||value=="true";a.opacityMode=enabled?2:1;}}
 if(const auto tint=field(material,"BSMaterial::TintColor",0))if(const auto color=rgba(*tint)){a.tint={(*color)[0],(*color)[1],(*color)[2]};a.tintWeight=(*color)[3];a.tinted=true;}
 for(unsigned slot=0;slot<8;++slot){const auto replacement=field(set,"BSMaterial::TextureReplacement",slot);if(replacement&&(replacement->value("Enabled",Json(false))==true||replacement->value("Enabled",Json(false))=="true")){if(const auto color=rgba(*replacement)){if(slot==0){a.constantColor=true;a.color={(*color)[0],(*color)[1],(*color)[2]};}else if(slot==2)a.constantOpacity=(*color)[0];else if(slot==3)a.constantRoughness=(*color)[0];else if(slot==4)a.constantMetal=(*color)[0];else if(slot==5)a.constantAO=(*color)[0];}continue;}
 const auto file=field(set,"BSMaterial::MRTextureFile",slot);if(!file)continue;auto path=MaterialKey(file->value("FileName",std::string{}));if(path.starts_with("data/"))path.erase(0,5);if(!path.starts_with("textures/")||!path.ends_with(".dds"))continue;
 if(slot==0)a.texture=path;else if(slot==1)a.normal=path;else if(slot==2)a.opacity=path;else if(slot==3)a.roughness=path;else if(slot==4)a.metal=path;else if(slot==5)a.ao=path;else if(slot==7)a.emissive=path;}
 // Extra layers with unresolved imported components remain a known approximation.
 a.incomplete=linked(root,"BSMaterial::LayerID",1)!=nullptr;
 if(a.texture.empty()&&!a.constantColor&&!a.tinted&&a.normal.empty()&&a.opacity.empty())return {};return a;
 }catch(...){return {};}
}
}
