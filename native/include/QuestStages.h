#pragma once

#include <zlib.h>
#include <algorithm>
#include <cstddef>
#include <cstdint>
#include <cstring>
#include <span>
#include <stdexcept>
#include <vector>

namespace CCC::QuestStages
{
    constexpr std::size_t kMaxRecordBytes = 64u * 1024u * 1024u;

    inline std::uint16_t U16(const std::byte* data)
    {
        std::uint16_t value;
        std::memcpy(&value, data, sizeof(value));
        return value;
    }

    inline std::uint32_t U32(const std::byte* data)
    {
        std::uint32_t value;
        std::memcpy(&value, data, sizeof(value));
        return value;
    }

    inline std::vector<std::uint16_t> Parse(std::span<const std::byte> stored, bool compressed)
    {
        if (stored.size() > kMaxRecordBytes) throw std::runtime_error("Quest record exceeds the stage-scan size limit.");
        std::vector<std::byte> decoded;
        auto data = stored;
        if (compressed) {
            if (stored.size() < 4) throw std::runtime_error("Compressed quest record is truncated.");
            const auto expectedSize = U32(stored.data());
            if (expectedSize == 0 || expectedSize > kMaxRecordBytes) throw std::runtime_error("Invalid decompressed quest record size.");
            decoded.resize(expectedSize);
            uLongf outputSize = expectedSize;
            const auto result = uncompress(reinterpret_cast<Bytef*>(decoded.data()), &outputSize,
                reinterpret_cast<const Bytef*>(stored.data() + 4), static_cast<uLong>(stored.size() - 4));
            if (result != Z_OK || outputSize != expectedSize) throw std::runtime_error("Quest record decompression failed.");
            data = decoded;
        }

        std::vector<std::uint16_t> stages;
        for (std::size_t offset = 0; offset < data.size();) {
            if (data.size() - offset < 6) throw std::runtime_error("Quest subrecord header is truncated.");
            auto* signature = data.data() + offset;
            std::uint32_t size = U16(signature + 4);
            offset += 6;
            if (std::memcmp(signature, "XXXX", 4) == 0) {
                if (size != 4 || data.size() - offset < 10) throw std::runtime_error("Invalid extended quest subrecord.");
                size = U32(data.data() + offset);
                offset += 4;
                signature = data.data() + offset;
                offset += 6;
            }
            if (size > data.size() - offset) throw std::runtime_error("Quest subrecord payload is truncated.");
            if (std::memcmp(signature, "INDX", 4) == 0) {
                if (size < 2) throw std::runtime_error("Quest stage index is truncated.");
                stages.push_back(U16(data.data() + offset));
            }
            offset += size;
        }
        std::sort(stages.begin(), stages.end());
        stages.erase(std::unique(stages.begin(), stages.end()), stages.end());
        return stages;
    }
}
