#include "RecordDetailsInput.h"
#include <iostream>
int rejected=0;
void Reject(std::uint64_t,const char*,const char*)noexcept{++rejected;}
int main(){try{
    for(const auto& [payload,expected]:std::vector<std::pair<const char*,std::string>>{
        {"{\"formId\":\"0029A851\"}","inspect"},
        {"{\"formId\":\"0029A851\",\"operation\":\"inspect\"}","inspect"},
        {"{\"formId\":\"0018641D\",\"operation\":\"read-book\"}","read-book"}}){
        OSFUI::API::Request raw{};raw.payloadJson=payload;raw.m_reject=Reject;
        OSFUI::API::JsonRequest request{raw};
        if(CCC::RecordDetails::Operation(request)!=expected||rejected)throw std::runtime_error("Valid inspection rejected before reaching the game task");
    }
    for(const auto* payload:{"{\"operation\":1}","{\"operation\":null}","{\"operation\":\"execute\"}"}){
        OSFUI::API::Request raw{};raw.payloadJson=payload;OSFUI::API::JsonRequest request{raw};bool threw=false;
        try{(void)CCC::RecordDetails::Operation(request);}catch(...){threw=true;}
        if(!threw)throw std::runtime_error("Invalid operation accepted");
    }
    std::cout<<"Inspection request tests passed: omitted/default/read operation preserves reply token; malformed operations rejected.\n";return 0;
}catch(const std::exception& e){std::cerr<<e.what()<<'\n';return 1;}}
