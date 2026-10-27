#include "ScalarResult.h"
#include "NumericQuery.h"
#include "QueuedQueryMatch.h"
#include "InventoryQuery.h"
#include "RandomPercentQuery.h"
#include <cstring>
#include <vector>
#include <iostream>
#include <stdexcept>
void Check(bool value, const char* reason) { if (!value) throw std::runtime_error(reason); }
int main() {
    try {
        float value = 9;
        auto result = CCC::ScalarResult::CaptureBoolean(&value, true, [&] { value = 0; return true; });
        Check(result.success && result.value && *result.value == 0 && value == 0, "Zero must be a verified result.");
        result = CCC::ScalarResult::CaptureBoolean(&value, true, [&] { value = 1; return true; });
        Check(result.success && result.value && *result.value == 1 && value == 1, "One must be a verified result.");
        value = 7;
        result = CCC::ScalarResult::CaptureBoolean(&value, true, [] { return true; });
        Check(result.success && !result.value && value == 7, "An unassigned return must not fabricate zero.");
        result = CCC::ScalarResult::CaptureBoolean(&value, true, [&] { value = 0; return false; });
        Check(!result.success && !result.value, "Failed execution must not verify a value.");
        result = CCC::ScalarResult::CaptureBoolean(&value, true, [&] { value = 2; return true; });
        Check(!result.value && value == 2, "Non-boolean values must not be coerced.");
        int calls = 0; value = 4;
        result = CCC::ScalarResult::CaptureBoolean(&value, false, [&] { ++calls; Check(value == 4, "Ordinary console result was modified before execution."); value = 1; return true; });
        Check(calls == 1 && !result.value && value == 1, "Ordinary calls must forward once unchanged.");
        result = CCC::ScalarResult::CaptureBoolean(nullptr, true, [&] { ++calls; return true; });
        Check(result.success && !result.value && calls == 2, "Null result calls must forward unchanged.");
        value = 6; bool threw = false;
        try { (void)CCC::ScalarResult::CaptureBoolean(&value, true, []() -> bool { throw std::runtime_error("Fixture"); }); } catch (...) { threw = true; }
        Check(threw && value == 6, "Exceptions must restore an unassigned result.");
        for (float expected : {0.0f, 99.0f, 123456.0f, -174.125f, 0.875f}) {
            value = 5;
            result = CCC::ScalarResult::CaptureNumber(&value, true, [&] { value = expected; return true; });
            Check(result.success && result.value && *result.value == expected, "Numeric capture lost or changed the actual return.");
        }
        value = 17;
        result = CCC::ScalarResult::CaptureNumber(&value, true, [] { return true; });
        Check(!result.value && value == 17, "Untouched numeric output was fabricated.");
        result = CCC::ScalarResult::CaptureNumber(&value, true, [&] { value = 0; return false; });
        Check(!result.success && !result.value, "Failed numeric call became a result.");
        result = CCC::ScalarResult::CaptureNumber(&value, true, [&] { value = std::numeric_limits<float>::infinity(); return true; });
        Check(!result.value, "Infinite return must not be captured.");
        value = 3; calls = 0;
        result = CCC::ScalarResult::CaptureNumber(&value, false, [&] { ++calls; Check(value == 3, "Unrelated output changed."); value = 4; return true; });
        Check(calls == 1 && !result.value && value == 4, "Unrelated numeric call must forward once.");
        result = CCC::ScalarResult::CaptureNumber(nullptr, true, [&] { ++calls; return true; });
        Check(!result.value && calls == 2, "Null numeric output must forward once.");
        value = 12; threw = false;
        try { (void)CCC::ScalarResult::CaptureNumber(&value, true, []() -> bool { throw std::runtime_error("Fixture"); }); } catch (...) { threw = true; }
        Check(threw && value == 12, "Numeric exceptions must restore unwritten output.");
        using namespace CCC::NumericQuery;
        for (const auto& spec : specs) {
            const auto command = std::string(spec.target ? "player." : "") + spec.name
                + (std::string_view(spec.name) == "GetItemCount" ? " 0000000F" : std::string_view(spec.name) == "GetStartingPos" ? " x" : "");
            const auto plan = Parse(command);
            Check(plan && &specs[plan->slot] == &spec && plan->targetID == (spec.target ? 0x14 : 0), "Wrong query routing or target.");
            Check(ValidResult(spec.kind, 0), "A real zero must be accepted.");
        }
        for (const auto* command : {"GetItemCount 0000000F", "player.GetDead 1", "player.GetStartingPos q", "player.GetItemCount 00ZZ", "player.GetGold; quit", "player.IsRaining"}) {
            bool rejected = false;
            try { rejected = !Parse(command); } catch (const std::runtime_error&) { rejected = true; }
            Check(rejected, "Malformed command must not arm numeric capture.");
        }
        Check(!Parse("player.ActorExposedToSky"), "Existing sky adapter must remain separate.");
        Check(!Parse("player.SetScale 2"), "Mutation must not arm result capture.");
        Check(Parse("FF123456.getstartingpos Z")->targetID == 0xFF123456, "Manual reference ID failed.");
        Check(!ValidResult(ResultKind::boolean, 2) && !ValidResult(ResultKind::percent, 101)
            && !ValidResult(ResultKind::count, -1) && ValidResult(ResultKind::number, -12.5f), "Result-domain checks failed.");
        // Execute scopes can finish before the queued callback. Match the
        // compiler-owned source, operation, target and arguments on delivery.
        const auto starting = *Parse("FF123456.GetStartingPos x");
        Check(CCC::QueuedQuery::MatchesSource("FF123456.GetStartingPos x", starting), "Matching queued source rejected.");
        Check(CCC::QueuedQuery::MatchesSource("GetStartingPos X", starting), "Compiler-resolved target source rejected.");
        Check(!CCC::QueuedQuery::MatchesSource("FF123456.GetStartingPos y", starting), "Wrong axis accepted.");
        Check(!CCC::QueuedQuery::MatchesSource("FF123457.GetStartingPos x", starting), "Wrong target accepted.");
        Check(!CCC::QueuedQuery::MatchesSource("FF123456.GetPos x", starting), "Wrong operation accepted.");
        Check(!CCC::QueuedQuery::MatchesSource("FF123456.GetStartingPos x; quit", starting), "Multiple operations accepted.");
        const auto random = *Parse("GetRandomPercent");
        Check(CCC::QueuedQuery::MatchesSource("GetRandomPercent\n", random), "Queued newline rejected.");
        struct Request { bool complete = false; std::chrono::steady_clock::time_point numericDeadline; };
        CCC::QueuedQuery::PendingSlot<Request> pending;
        const auto now = std::chrono::steady_clock::now();
        auto request = [&] {
            auto state = std::make_shared<Request>();state->numericDeadline = now + std::chrono::seconds{2};
            pending.Arm(state);return state;
        }(); // The enqueue stack frame has returned before the callback arrives.
        Check(pending.Active(now + std::chrono::milliseconds{50}) == request, "Queued callback lost its request after enqueue returned.");
        request->complete = true;Check(!pending.Active(now), "Completed request accepted a late callback.");
        request->complete = false;Check(!pending.Active(now + std::chrono::seconds{3}), "Expired callback accepted.");
        request.reset();Check(!pending.Active(now), "Observer kept a canceled request alive.");
        std::vector<unsigned char> memory(8192);
        const std::uintptr_t script = 0x10000, text = script + 4096;
        std::memcpy(memory.data() + CCC::QueuedQuery::kRuntimeTextOffset, &text, sizeof(text));
        std::strcpy(reinterpret_cast<char*>(memory.data() + 4096), "GetRandomPercent");
        const auto read = [&](std::uintptr_t address, void* destination, std::size_t size) {
            if (address < script || address - script > memory.size() || size > memory.size() - (address - script)) return false;
            std::memcpy(destination, memory.data() + address - script, size);return true;
        };
        const auto source = CCC::QueuedQuery::ReadSource(script, read);
        Check(source && *source == "GetRandomPercent", "Runtime script source pointer read incorrectly.");
        Check(!CCC::QueuedQuery::ReadSource(0, read) && !CCC::QueuedQuery::ReadSource(0xFFFF0000, read), "Unreadable script accepted.");
        std::fill(memory.begin() + 4096, memory.end(), 'x');
        Check(!CCC::QueuedQuery::ReadSource(script, read), "Unterminated source exceeded its bound.");
        struct Object { std::uint32_t id; std::uint32_t GetFormID() const { return id; } } credits{0xF}, item{0xABF9};
        struct Stack { std::uint32_t count; };
        struct Item { Object* object; std::vector<Stack> stacks; };
        const std::vector<Item> inventory{{&credits,{{10},{20}}},{nullptr,{{99}}},{&credits,{{4}}},{&item,{{7}}}};
        Check(CCC::InventoryQuery::ItemCount(inventory, 0xF) == 34, "Credit stacks were not combined.");
        Check(CCC::InventoryQuery::ItemCount(inventory, 0xABF9) == 7, "Item count read incorrectly.");
        Check(CCC::InventoryQuery::ItemCount(inventory, 0x123) == 0, "An absent item must return a genuine zero.");
        for (const auto expected : {0.0f, 12.26f, 99.75f, 100.0f}) {
            int invoked = 0;
            const auto percent = CCC::RandomPercentQuery::Read([&](float* result) {++invoked;*result=expected;return true;});
            Check(percent == expected && invoked == 1, "Direct engine percentage was rounded, replaced or generated more than once.");
            Check(ValidResult(ResultKind::percent, percent), "A fractional percentage was rejected.");
        }
        for (int failure = 0; failure < 5; ++failure) {
            bool rejected = false;
            try { (void)CCC::RandomPercentQuery::Read([&](float* result) {
                if (failure == 0) return true; // Unwritten output is not zero.
                *result = failure == 1 ? -1.0f : failure == 2 ? 101.0f : failure == 3 ? std::numeric_limits<float>::infinity() : 12.26f;
                return failure != 4;
            }); } catch (const std::runtime_error&) { rejected = true; }
            Check(rejected, "Invalid or unsuccessful random query fabricated a readout.");
        }
        std::cout << "Scalar, queued-source, direct inventory and fractional random query fixtures passed.\n";
        return 0;
    } catch (const std::exception& error) { std::cerr << error.what() << '\n'; return 1; }
}
