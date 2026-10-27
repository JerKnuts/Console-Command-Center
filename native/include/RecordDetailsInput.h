#pragma once
#include "OSFUI_JSON.h"
#include <stdexcept>
namespace CCC::RecordDetails {
    inline std::string Operation(const OSFUI::API::JsonRequest& request) {
        // JsonRequest::Get rejects missing fields immediately. Optional fields
        // must be read from Payload so the default does not consume the reply.
        const auto operation=request.Payload().value("operation",std::string("inspect"));
        if(operation!="inspect"&&operation!="read-book"&&operation!="read-slate-audio")throw std::runtime_error("Unsupported inspection operation.");
        return operation;
    }
}
