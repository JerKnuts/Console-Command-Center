#include "RecordDescriptions.h"
#include "PreviewRecords.h"
#include <iostream>
using CCC::Preview::Bytes;
void Check(bool value,const char* text){if(!value)throw std::runtime_error(text);}
template<class T>void Put(Bytes& bytes,T value){const auto* p=reinterpret_cast<const std::uint8_t*>(&value);bytes.insert(bytes.end(),p,p+sizeof(T));}
void Field(Bytes& b,const std::string& tag,const Bytes& value){b.insert(b.end(),tag.begin(),tag.end());Put<std::uint16_t>(b,value.size());b.insert(b.end(),value.begin(),value.end());}
Bytes Record(const std::string& type,const Bytes& body,std::uint32_t id=0,std::uint32_t flags=0){Bytes b(type.begin(),type.end());Put<std::uint32_t>(b,body.size());Put(b,flags);Put(b,id);Put<std::uint64_t>(b,0);b.insert(b.end(),body.begin(),body.end());return b;}
int main(int argc,char** argv){try{
    Bytes table;Put<std::uint32_t>(table,1);Put<std::uint32_t>(table,10);Put<std::uint32_t>(table,42);Put<std::uint32_t>(table,0);Put<std::uint32_t>(table,6);for(char c:std::string("Hello\0",6))table.push_back(c);
    Check(CCC::Details::ParseDescriptions(table).at(42)=="Hello","Description decode failed");
    for(unsigned size=0;size<table.size();++size){try{CCC::Details::ParseDescriptions(std::span(table).first(size));throw std::logic_error("Truncated table was accepted");}catch(const std::runtime_error&){}}
    Bytes longTable;Put<std::uint32_t>(longTable,1);Put<std::uint32_t>(longTable,20005);Put<std::uint32_t>(longTable,7);Put<std::uint32_t>(longTable,0);Put<std::uint32_t>(longTable,20001);longTable.insert(longTable.end(),20000,'a');longTable.push_back(0);
    Check(CCC::Details::ParseDescriptions(longTable).at(7).size()==20000,"Long book text was truncated to the item overview limit");
    const auto fixture=std::filesystem::temp_directory_path()/"ccc-record-details-fixture";std::filesystem::create_directories(fixture/"Strings");
    {std::ofstream f(fixture/"Strings"/"fixture_en.dlstrings",std::ios::binary);f.write(reinterpret_cast<const char*>(table.data()),table.size());}
    CCC::Details::DescriptionStore store(fixture);Check(store.Lookup("Fixture.esm","fr",42)=="Hello","English fallback failed");Check(store.Lookup("../Fixture.esm","en",42).empty(),"Unsafe plugin accepted");
    Bytes body;Field(body,"DESC",Bytes{'S','u','m','m','a','r','y',0});Field(body,"PRRK",{});Field(body,"DESC",Bytes{'A','c','t','i','v','i','t','y',0});Field(body,"DESC",Bytes{'R','a','n','k',' ', '1',0});Field(body,"PRRF",{});
    auto file=Record("TES4",{});const auto perk=Record("PERK",body,0x800);file.insert(file.end(),perk.begin(),perk.end());
    {std::ofstream f(fixture/"Fixture.esm",std::ios::binary);f.write(reinterpret_cast<const char*>(file.data()),file.size());}
    CCC::Preview::RecordScenes records(fixture,{{"Fixture.esm",0,4}});const auto descriptions=records.ReadDescriptions(0x04000800);
    Check(records.InlineDescription(0x04000800)=="Summary","Inline summary failed");Check(descriptions.ranks.size()==1&&CCC::Details::Text(descriptions.ranks[0])=="Rank 1","Rank activity text leaked into rank description");
    Check(records.ReadDescriptions(0x05000800).summary.empty(),"Wrong load order identity matched");
    if(argc==3){CCC::Details::DescriptionStore installed(argv[1]);CCC::Preview::RecordScenes real(argv[1],{{"Starfield.esm",0,0}});const auto id=std::stoul(argv[2],nullptr,16);const auto record=real.ReadDescriptions(id);if(record.summary.size()==4){CCC::Preview::Reader r{record.summary};std::cout<<installed.Lookup(record.plugin,"en",r.Read<std::uint32_t>())<<'\n';}for(const auto& bytes:record.ranks){CCC::Preview::Reader r{bytes};std::cout<<installed.Lookup(record.plugin,"en",r.Read<std::uint32_t>())<<'\n';}}
    std::cout<<"Description bounds, language fallback, inline records and perk ranks passed.\n";return 0;
}catch(const std::exception& e){std::cerr<<e.what()<<'\n';return 1;}}
