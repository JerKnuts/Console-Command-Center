#pragma once
#include "OSFUI_JSON.h"
namespace CCC::ModelPreview {
    void OnModel(const OSFUI::API::Request&, void*) noexcept;
    void OnChunk(const OSFUI::API::Request&, void*) noexcept;
}
