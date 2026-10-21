#pragma once
inline void TestMaterialInheritance() {
    using namespace CCC::Preview;
    Bytes strings;std::unordered_map<std::string,std::uint32_t> ids;
    for(const auto* name:{"BSComponentDB2::DBFileIndex::ObjectInfo","BSComponentDB2::DBFileIndex::ComponentInfo","BSComponentDB2::DBFileIndex::EdgeInfo","BSComponentDB::CTName","BSMaterial::LayerID","BSMaterial::MaterialID","BSMaterial::TextureSetID","BSMaterial::MRTextureFile","BSMaterial::TextureReplacement","BSMaterial::Color"}){ids[name]=strings.size();for(auto c:std::string(name))strings.push_back(c);strings.push_back(0);}
    const auto id=[&](const char* name){return ids.at(name);};
    Bytes db;const auto chunk=[&](std::string tag,const Bytes& data){for(auto c:tag)db.push_back(c);Append(db,std::uint32_t(data.size()));db.insert(db.end(),data.begin(),data.end());};
    chunk("BETH",Bytes(8));chunk("STRT",strings);
    for(const auto& [name,number]:ids){Bytes data;Append(data,number);chunk("CLAS",data);}
    const std::vector<std::string> names{"BSComponentDB::CTName","BSMaterial::LayerID","BSMaterial::MaterialID","BSMaterial::TextureSetID","BSMaterial::MRTextureFile","BSMaterial::TextureReplacement","BSMaterial::Color"};
    Bytes map;Append(map,std::uint32_t(0xffffff0b));Append(map,std::uint32_t(0));Append(map,std::uint32_t(names.size()));for(unsigned i=0;i<names.size();++i){Append(map,std::uint16_t(i));map.insert(map.end(),3,0);}chunk("MAPC",map);
    for(const auto& name:names){Bytes data(8);Append(data,std::uint16_t(name.size()+1));data.insert(data.end(),name.begin(),name.end());data.push_back(0);chunk("USER",data);}
    Bytes objects;Append(objects,id("BSComponentDB2::DBFileIndex::ObjectInfo"));Append(objects,std::uint32_t(12));
    for(unsigned i=1;i<=12;++i){objects.insert(objects.end(),12,0);Append(objects,std::uint32_t(i));Append(objects,std::uint32_t(i==12?11:i==7?6:i==6?7:i==5?4:0));objects.insert(objects.end(),13,0);}chunk("LIST",objects);
    struct Component{unsigned object,type,index;Bytes value;};std::vector<Component> components;
    const auto text=[&](unsigned object,unsigned type,unsigned index,std::string value){Bytes data;Append(data,id(names[type].c_str()));Append(data,std::uint16_t(0));Append(data,std::uint16_t(value.size()+1));data.insert(data.end(),value.begin(),value.end());data.push_back(0);components.push_back({object,type,index,data});};
    const auto ref=[&](unsigned object,unsigned type,unsigned target){Bytes data;Append(data,id(names[type].c_str()));Append(data,std::uint32_t(0));Append(data,std::uint32_t(target));components.push_back({object,type,0,data});};
    text(1,0,0,"Example");ref(1,1,2);ref(2,2,3);ref(3,3,5);text(4,4,0,"Data\\Textures\\Shared\\actual_color.dds");text(4,4,1,"Data\\Textures\\Shared\\actual_normal.dds");text(6,0,0,"Cycle");
    text(8,0,0,"Solid");ref(8,1,9);ref(9,2,10);ref(10,3,12);
    Bytes solid;Append(solid,id("BSMaterial::TextureReplacement"));Append(solid,std::uint16_t(0));Append(solid,std::uint8_t(1));Append(solid,std::uint16_t(1));for(unsigned i=0;i<4;++i){Append(solid,std::uint16_t(i));Append(solid,i==0?.2f:i==1?.4f:i==2?.6f:1.f);}components.push_back({11,5,0,solid});
    text(11,4,0,"textures/unused_when_color_is_replaced.dds");
    Bytes overrideColor;Append(overrideColor,id("BSMaterial::TextureReplacement"));Append(overrideColor,std::uint16_t(1));for(unsigned i=0;i<4;++i){Append(overrideColor,std::uint16_t(i));Append(overrideColor,i==0?.3f:i==1?.6f:i==2?.9f:1.f);}components.push_back({12,5,0,overrideColor});

    Bytes indices;Append(indices,id("BSComponentDB2::DBFileIndex::ComponentInfo"));Append(indices,std::uint32_t(components.size()));for(const auto& c:components){Append(indices,std::uint32_t(c.object));Append(indices,std::uint16_t(c.index));Append(indices,std::uint16_t(c.type));}chunk("LIST",indices);
    Bytes edges;Append(edges,id("BSComponentDB2::DBFileIndex::EdgeInfo"));Append(edges,std::uint32_t(0));chunk("LIST",edges);for(const auto& c:components)chunk("DIFF",c.value);
    const auto result=ReadMaterialInheritance(db);const auto found=result.find("example");if(found==result.end()||found->second.texture!="textures/shared/actual_color.dds"||found->second.normal!="textures/shared/actual_normal.dds"||result.contains("cycle"))throw std::runtime_error("Authored inherited TextureSet lookup/cycle bounds failed");
    if(!result.contains("solid")||!result.at("solid").constantColor||result.at("solid").color!=std::array<float,3>{.3f,.6f,.9f}||!result.at("solid").texture.empty())throw std::runtime_error("Authored constant replacement lost to an unused DDS");
    for(const auto n:{0u,1u,25u,300u})if(n<db.size()&&!ReadMaterialInheritance(std::span<const std::uint8_t>(db).first(n)).empty())throw std::runtime_error("Truncated material graph accepted");
}
