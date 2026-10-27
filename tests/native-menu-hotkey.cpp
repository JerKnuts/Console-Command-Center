#include "MenuHotkeyBinding.h"
#include <fstream>
#include <iostream>
#include <stdexcept>
#include <string>

void Check(bool value,const char* message){if(!value)throw std::runtime_error(message);}
std::string Block(std::string action,unsigned key){
    std::string bytes(3,'\0');bytes[0]=3;
    bytes.append("MainGameplay",12);bytes+='\0';bytes+=action;bytes+='\0';
    bytes.append("\1\0\0\0",4);
    for(unsigned shift=0;shift<32;shift+=8)bytes+=char(key>>shift);
    bytes[1]=char(bytes.size()>>8);bytes[2]=char(bytes.size());return bytes;
}
int main(int argc,char** argv){try{
    using namespace CCC::MenuHotkey;
    const auto bound=Block("console.command-center/openCCC",0x79);
    Check(KeyboardBinding(bound)==0x79,"F10 keyboard binding not parsed");
    for(std::size_t n=0;n<bound.size();++n)Check(!KeyboardBinding(std::string_view(bound).substr(0,n)),"Truncated save was accepted");
    Check(!KeyboardBinding(Block("console.command-center/openCCC",0xFF)),"Unbound key accepted");
    Check(!KeyboardBinding(Block("console.command-center/openCCC",0)),"Zero key accepted");
    Check(!KeyboardBinding(Block("another/openCCC",0x79)),"Another mod binding accepted");
    Check(!KeyboardBinding(Block("console.command-center/openCCCExtra",0x79)),"Prefix action accepted");
    auto devices=Block("other/action",0x70)+bound;
    Check(!KeyboardBinding(devices),"Controller block treated as keyboard");
    auto invalid=bound;invalid[0]=2;Check(!KeyboardBinding(invalid),"Unknown format accepted");
    invalid=bound;invalid[invalid.size()-8]=char(255);Check(!KeyboardBinding(invalid),"Oversized key count accepted");
    PressLatch latch;
    Check(!latch.Update(0x79,true,true),"Held new binding activated");
    Check(!latch.Update(0x79,false,true),"Release activated");
    Check(latch.Update(0x79,true,true),"Fresh press did not activate");
    Check(!latch.Update(0x79,true,true),"Held key repeated");
    latch.Update(0x79,false,false);
    Check(!latch.Update(0x79,true,false),"Blocked screen activated");
    Check(!latch.Update(0x79,true,true),"Held key activated after leaving blocked screen");
    latch.Update(0x79,false,true);Check(latch.Update(0x79,true,true),"Release did not rearm");
    Check(!latch.Update(0x78,true,true),"Rebind activated held key");
    if(argc==2){std::ifstream input(argv[1],std::ios::binary);std::string bytes((std::istreambuf_iterator<char>(input)),{});Check(KeyboardBinding(bytes)==0x79,"Current real Controls file did not resolve F10");}
    std::cout<<"Menu hotkey binding and press tests passed\n";return 0;
}catch(const std::exception& error){std::cerr<<error.what()<<'\n';return 1;}}
