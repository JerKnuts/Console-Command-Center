#pragma once
inline void TestMaterialInheritance() {
    using namespace CCC::Preview;
    Bytes strings;std::unordered_map<std::string,std::uint32_t> ids;
    for(const auto* name:{"BSComponentDB2::DBFileIndex::ObjectInfo","BSComponentDB2::DBFileIndex::ComponentInfo","BSComponentDB2::DBFileIndex::EdgeInfo","BSComponentDB::CTName","BSMaterial::LayerID","BSMaterial::MaterialID","BSMaterial::TextureSetID","BSMaterial::MRTextureFile","BSMaterial::TextureReplacement","BSMaterial::Color","BSMaterial::ShaderModelComponent","BSMaterial::BlenderID","BSMaterial::UVStreamID","BSMaterial::Scale","BSMaterial::BlendModeComponent","BSMaterial::AlphaSettingsComponent"}){ids[name]=strings.size();for(auto c:std::string(name))strings.push_back(c);strings.push_back(0);}
    const auto id=[&](const char* name){return ids.at(name);};
    Bytes db;const auto chunk=[&](std::string tag,const Bytes& data){for(auto c:tag)db.push_back(c);Append(db,std::uint32_t(data.size()));db.insert(db.end(),data.begin(),data.end());};
    chunk("BETH",Bytes(8));chunk("STRT",strings);
    for(const auto& [name,number]:ids){Bytes data;Append(data,number);chunk("CLAS",data);}
    const std::vector<std::string> names{"BSComponentDB::CTName","BSMaterial::LayerID","BSMaterial::MaterialID","BSMaterial::TextureSetID","BSMaterial::MRTextureFile","BSMaterial::TextureReplacement","BSMaterial::Color","BSMaterial::ShaderModelComponent","BSMaterial::BlenderID","BSMaterial::UVStreamID","BSMaterial::Scale","BSMaterial::BlendModeComponent","BSMaterial::AlphaSettingsComponent"};
    Bytes map;Append(map,std::uint32_t(0xffffff0b));Append(map,std::uint32_t(0));Append(map,std::uint32_t(names.size()));for(unsigned i=0;i<names.size();++i){Append(map,std::uint16_t(i));map.insert(map.end(),3,0);}chunk("MAPC",map);
    for(const auto& name:names){Bytes data(8);Append(data,std::uint16_t(name.size()+1));data.insert(data.end(),name.begin(),name.end());data.push_back(0);chunk("USER",data);}
    Bytes objects;Append(objects,id("BSComponentDB2::DBFileIndex::ObjectInfo"));Append(objects,std::uint32_t(26));
    for(unsigned i=1;i<=26;++i){objects.insert(objects.end(),12,0);Append(objects,std::uint32_t(i));Append(objects,std::uint32_t(i>=20&&i<=22?8:i==12?11:i==7?6:i==6?7:i==5?4:0));objects.insert(objects.end(),13,0);}chunk("LIST",objects);
    struct Component{unsigned object,type,index;Bytes value;};std::vector<Component> components;
    const auto text=[&](unsigned object,unsigned type,unsigned index,std::string value){Bytes data;Append(data,id(names[type].c_str()));Append(data,std::uint16_t(0));Append(data,std::uint16_t(value.size()+1));data.insert(data.end(),value.begin(),value.end());data.push_back(0);components.push_back({object,type,index,data});};
    const auto ref=[&](unsigned object,unsigned type,unsigned target){Bytes data;Append(data,id(names[type].c_str()));Append(data,std::uint32_t(0));Append(data,std::uint32_t(target));components.push_back({object,type,0,data});};
    text(1,0,0,"Example");ref(1,1,2);ref(2,2,3);ref(3,3,5);text(4,4,0,"Data\\Textures\\Shared\\actual_color.dds");text(4,4,1,"Data\\Textures\\Shared\\actual_normal.dds");text(6,0,0,"Cycle");
    text(13,0,0,"Crafted_InHailer");ref(13,1,2);
    // A generic material unrelated to reported items exercises shared masked layers.
    text(14,0,0,"GenericMasked");text(14,7,0,"Character4Layer");ref(14,1,2);ref(14,1,15);components.back().index=1;ref(14,8,19);
    ref(15,2,16);ref(15,9,18);ref(16,3,17);text(17,4,0,"textures/shared/detail_color.dds");text(17,4,1,"textures/shared/detail_normal.dds");text(17,4,3,"textures/shared/detail_rough.dds");text(19,4,0,"textures/shared/body_mask.dds");text(19,11,0,"CharacterCombine");
    Bytes uvScale;Append(uvScale,id("BSMaterial::Scale"));Append(uvScale,std::uint16_t(0));Append(uvScale,std::uint16_t(0));Append(uvScale,4.f);Append(uvScale,std::uint16_t(1));Append(uvScale,2.f);components.push_back({18,10,0,uvScale});
    text(8,0,0,"Solid");ref(8,1,9);ref(9,2,10);ref(10,3,12);
    Bytes solid;Append(solid,id("BSMaterial::TextureReplacement"));Append(solid,std::uint16_t(0));Append(solid,std::uint8_t(1));Append(solid,std::uint16_t(1));for(unsigned i=0;i<4;++i){Append(solid,std::uint16_t(i));Append(solid,i==0?.2f:i==1?.4f:i==2?.6f:1.f);}components.push_back({11,5,0,solid});
    text(11,4,0,"textures/unused_when_color_is_replaced.dds");
    Bytes overrideColor;Append(overrideColor,id("BSMaterial::TextureReplacement"));Append(overrideColor,std::uint16_t(1));for(unsigned i=0;i<4;++i){Append(overrideColor,std::uint16_t(i));Append(overrideColor,i==0?.3f:i==1?.6f:i==2?.9f:1.f);}components.push_back({12,5,0,overrideColor});

    text(8,7,0,"1LayerStandard");
    text(20,0,0,"AlphaInheritedChild");text(21,0,0,"AlphaCutout");text(22,0,0,"OpaqueWithUnusedMask");
    const auto alpha=[&](unsigned object,bool enabled,float threshold){Bytes data;Append(data,id("BSMaterial::AlphaSettingsComponent"));Append(data,std::uint16_t(0));Append(data,std::uint8_t(enabled));Append(data,std::uint16_t(1));Append(data,threshold);components.push_back({object,12,0,data});};
    alpha(8,false,.25f);alpha(21,true,.45f);
    Bytes alphaDiff;Append(alphaDiff,id("BSMaterial::AlphaSettingsComponent"));Append(alphaDiff,std::uint16_t(4));Append(alphaDiff,std::uint8_t(1));components.push_back({20,12,0,alphaDiff});
    text(12,4,2,"textures/template/unused_opacity.dds");
    for(const auto [slot,value]:std::array<std::pair<unsigned,float>,3>{{{3,.2f},{4,.85f},{5,.5f}}}){Bytes data;Append(data,id("BSMaterial::TextureReplacement"));Append(data,std::uint16_t(0));Append(data,std::uint8_t(1));Append(data,std::uint16_t(1));for(unsigned c=0;c<4;++c){Append(data,std::uint16_t(c));Append(data,c==3?1.f:value);}components.push_back({11,5,slot,data});}

    text(23,0,0,"EmptyFirstLayer");text(23,7,0,"2LayerEffect");ref(23,1,24);ref(24,2,25);ref(25,3,26);ref(23,1,2);components.back().index=1;
    Bytes indices;Append(indices,id("BSComponentDB2::DBFileIndex::ComponentInfo"));Append(indices,std::uint32_t(components.size()));for(const auto& c:components){Append(indices,std::uint32_t(c.object));Append(indices,std::uint16_t(c.index));Append(indices,std::uint16_t(c.type));}chunk("LIST",indices);
    Bytes edges;Append(edges,id("BSComponentDB2::DBFileIndex::EdgeInfo"));Append(edges,std::uint32_t(0));chunk("LIST",edges);for(const auto& c:components)chunk("DIFF",c.value);
    const auto result=ReadMaterialInheritance(db);const auto found=result.find("example");if(found==result.end()||found->second.texture!="textures/shared/actual_color.dds"||found->second.normal!="textures/shared/actual_normal.dds"||result.contains("cycle"))throw std::runtime_error("Authored inherited TextureSet lookup/cycle bounds failed");
    {
        MaterialAppearance opaque;opaque.authored=true;opaque.opacityMode=1;
        Bytes pixels{40,60,80,0,70,90,110,100};ApplyAuthoredOpacity(pixels,opaque);
        if(pixels[3]!=255||pixels[7]!=255||pixels[0]!=40)throw std::runtime_error("Opaque material inherited another surface's transparency.");
        MaterialAppearance cutout=opaque;cutout.opacityMode=2;cutout.alphaThreshold=.45f;
        pixels={40,60,80,0,70,90,110,100,90,100,120,200};ApplyAuthoredOpacity(pixels,cutout);
        if(pixels[3]!=0||pixels[7]!=0||pixels[11]!=255)throw std::runtime_error("Authored cutout threshold did not preserve the solid/deleted portions.");
        MaterialAppearance unknown;Bytes fractional{40,60,80,90};ApplyAuthoredOpacity(fractional,unknown);
        if(fractional[3]!=90)throw std::runtime_error("Unknown/effect opacity was made opaque.");
        Mesh tinted;tinted.tinted=true;tinted.pixels={100,120,140,255};auto tint=opaque;tint.tint={1,0,0};tint.tintWeight=0;ApplyAuthoredTint(tinted,tint);
        if(tinted.pixels!=Bytes{100,120,140,255}||tinted.tinted)throw std::runtime_error("Zero-weight tint changed the base material.");
        tinted.tinted=true;tint.tintWeight=.5f;tint.tintMultiply=true;ApplyAuthoredTint(tinted,tint);
        if(tinted.pixels!=Bytes{100,60,70,255})throw std::runtime_error("Authored weighted multiply tint failed.");
    }
    if(result.at("emptyfirstlayer").texture!="textures/shared/actual_color.dds")throw std::runtime_error("A sole authored surface in another layer was lost behind an empty first layer.");
    if(result.at("solid").constantRoughness!=.2f||result.at("solid").constantMetal!=.85f||result.at("solid").constantAO!=.5f)throw std::runtime_error("Inherited scalar material replacements were lost.");
    if(result.at("alphainheritedchild").opacityMode!=1||result.at("alphainheritedchild").alphaThreshold!=.25f||!result.at("opaquewithunusedmask").opacity.empty())throw std::runtime_error("Partial alpha DIFF lost inherited opacity settings.");
    if(result.at("alphacutout").opacityMode!=2||result.at("alphacutout").alphaThreshold!=.45f||result.at("alphacutout").opacity!="textures/template/unused_opacity.dds")throw std::runtime_error("Cutout settings or their authored mask were lost.");
    if(!result.contains("genericmasked")||result.at("genericmasked").overlays.size()!=1||result.at("genericmasked").overlays[0].mask!="textures/shared/body_mask.dds"||result.at("genericmasked").overlays[0].normal!="textures/shared/detail_normal.dds"||result.at("genericmasked").overlays[0].scale!=std::array<float,2>{4,2})throw std::runtime_error("Generic masked layers/UV inheritance failed");
    if(!result.contains("solid")||!result.at("solid").constantColor||result.at("solid").color!=std::array<float,3>{.3f,.6f,.9f}||!result.at("solid").texture.empty())throw std::runtime_error("Authored constant replacement lost to an unused DDS");
    {
        const auto fixture=std::filesystem::temp_directory_path()/("ccc-graph-tint-"+std::to_string(std::chrono::steady_clock::now().time_since_epoch().count()));
        struct Cleanup {std::filesystem::path path;~Cleanup(){std::error_code ec;std::filesystem::remove_all(path,ec);}} cleanup{fixture};
        std::filesystem::create_directories(fixture/"materials");
        {std::ofstream out(fixture/"materials/materialsbeta.cdb",std::ios::binary);out.write(reinterpret_cast<const char*>(db.data()),db.size());}
        MaterialDatabase database(fixture);database.Find("unused.mat");
        // Simulate the flattened name reader borrowing a red tint while retaining
        // the right albedo. Only the reviewed inhaler should use its authored graph.
        Bytes flattened;
        const auto field=[&](unsigned type,const Bytes& bytes){flattened.insert(flattened.end(),{'D','I','F','F'});Append(flattened,std::uint32_t(8+bytes.size()));Append(flattened,std::uint32_t(type));Append(flattened,std::uint16_t(0));Append(flattened,std::uint16_t(type==0x25a?0:bytes.size()));flattened.insert(flattened.end(),bytes.begin(),bytes.end());};
        const auto text=[&](unsigned type,std::string value){Bytes bytes(value.begin(),value.end());bytes.push_back(0);field(type,bytes);};
        text(0x1f4,"Crafted_InHailer_Material1");Bytes tint;for(float v:{1.f,.3f,.3f,1.f}){Append(tint,v);Append(tint,std::uint16_t(0));}field(0x25a,tint);
        text(0x1f4,"Crafted_InHailer_TextureSet1");text(0x38a,"textures/shared/actual_color.dds");database.Parse(flattened);
        const auto actual=database.Find("materials/items/drugs_or_medical/crafted_inhailer.mat");
        if(actual.tinted||actual.texture!="textures/shared/actual_color.dds"||actual.normal!="textures/shared/actual_normal.dds")throw std::runtime_error("Inhaler retained a neighboring tint instead of its authored graph");
        if(database.Find("materials/mod/crafted_inhailer.mat").tinted)throw std::runtime_error("Shared authored ownership rule was not applied to another material path");
    }
    for(const auto n:{0u,1u,25u,300u})if(n<db.size()&&!ReadMaterialInheritance(std::span<const std::uint8_t>(db).first(n)).empty())throw std::runtime_error("Truncated material graph accepted");
}
