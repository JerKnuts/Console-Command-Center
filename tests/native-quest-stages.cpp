#include "QuestStages.h"
#include <iostream>
#include <fstream>
#include <array>

using Bytes = std::vector<std::byte>;
void U16(Bytes& out, std::uint16_t value) { out.push_back(std::byte(value & 255)); out.push_back(std::byte(value >> 8)); }
void U32(Bytes& out, std::uint32_t value) { for (int i = 0; i < 4; ++i) out.push_back(std::byte((value >> (i * 8)) & 255)); }
void Tag(Bytes& out, const char* tag) { for (int i = 0; i < 4; ++i) out.push_back(std::byte(tag[i])); }
void Stage(Bytes& out, std::uint16_t stage) { Tag(out, "INDX"); U16(out, 4); U16(out, stage); U16(out, 0); }
void Check(bool result, const char* message) { if (!result) throw std::runtime_error(message); }
void Reject(const Bytes& bytes, bool compressed) {
    bool rejected = false;
    try { (void)CCC::QuestStages::Parse(bytes, compressed); } catch (const std::exception&) { rejected = true; }
    Check(rejected, "Malformed data was accepted.");
}
int main(int argc, char** argv) {
    try {
        Bytes data;
        Stage(data, 100); Stage(data, 0); Stage(data, 10); Stage(data, 10); Stage(data, 65535);
        const std::vector<std::uint16_t> expected{ 0, 10, 100, 65535 };
        Check(CCC::QuestStages::Parse(data, false) == expected, "Uncompressed stages were incorrect.");
        uLongf length = compressBound(static_cast<uLong>(data.size()));
        Bytes packed(4 + length);
        std::uint32_t unpackedSize = static_cast<std::uint32_t>(data.size());
        std::memcpy(packed.data(), &unpackedSize, 4);
        Check(compress2(reinterpret_cast<Bytef*>(packed.data() + 4), &length,
            reinterpret_cast<const Bytef*>(data.data()), static_cast<uLong>(data.size()), Z_BEST_SPEED) == Z_OK, "Fixture compression failed.");
        packed.resize(4 + length);
        Check(CCC::QuestStages::Parse(packed, true) == expected, "Compressed stages were incorrect.");
        Bytes extended; Tag(extended, "XXXX"); U16(extended, 4); U32(extended, 4); Tag(extended, "INDX"); U16(extended, 0); U16(extended, 42); U16(extended, 0);
        Check(CCC::QuestStages::Parse(extended, false) == std::vector<std::uint16_t>{42}, "Extended subrecord stage was incorrect.");
        Check(CCC::QuestStages::Parse({}, false).empty(), "Empty stage data was not empty.");
        Reject(Bytes{ std::byte{1} }, false);
        auto truncated = data; truncated.pop_back(); Reject(truncated, false);
        auto corrupt = packed; corrupt[4] = std::byte{0}; Reject(corrupt, true);
        Bytes oversized; U32(oversized, 0xFFFFFFFF); Reject(oversized, true);
        std::cout << "Quest stage parser: compressed, uncompressed, extended, duplicate, empty, and malformed cases passed.\n";
        if (argc > 1) {
            std::ifstream input(argv[1], std::ios::binary);
            Check(static_cast<bool>(input), "Real plugin could not be opened.");
            std::size_t quests = 0, stages = 0, compressedQuests = 0;
            std::array<std::byte, 24> header{};
            while (input.read(reinterpret_cast<char*>(header.data()), header.size())) {
                const auto size = CCC::QuestStages::U32(header.data() + 4);
                if (std::memcmp(header.data(), "GRUP", 4) == 0) continue;
                if (std::memcmp(header.data(), "QUST", 4) != 0) { input.seekg(size, std::ios::cur); continue; }
                const auto flags = CCC::QuestStages::U32(header.data() + 8);
                if ((flags & 0x20) != 0) { input.seekg(size, std::ios::cur); continue; }
                Check(size <= CCC::QuestStages::kMaxRecordBytes, "Real quest payload exceeded limit.");
                Bytes payload(size);
                Check(static_cast<bool>(input.read(reinterpret_cast<char*>(payload.data()), size)), "Real quest payload truncated.");
                stages += CCC::QuestStages::Parse(payload, (flags & 0x40000) != 0).size();
                ++quests;
                if ((flags & 0x40000) != 0) ++compressedQuests;
            }
            Check(quests > 0 && stages > 0, "No real quest stages found.");
            std::cout << "Real plugin: " << quests << " quests, " << stages << " stages, " << compressedQuests << " compressed quests.\n";
        }
        return 0;
    } catch (const std::exception& error) { std::cerr << error.what() << '\n'; return 1; }
}
