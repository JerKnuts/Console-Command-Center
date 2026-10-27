#pragma once
#include <algorithm>
#include <cstddef>
namespace CCC::Preview {
    // Four 256 KiB chunks keep a base64 reply below the host's 1 MiB envelope.
    // Incoming page requests stay small and retain the existing paced rate.
    inline constexpr unsigned MaxTransferChunkBytes=256u*1024;
    inline std::size_t PreviewChunkSize(unsigned requested,std::size_t remaining){
        return std::min<std::size_t>(std::clamp(requested,4096u,MaxTransferChunkBytes),remaining);
    }
}
