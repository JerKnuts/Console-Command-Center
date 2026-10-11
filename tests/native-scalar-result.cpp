#include "ScalarResult.h"
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
        std::cout << "Scalar capture tests passed: 0, 1, unassigned, failure, invalid, passthrough, null, and exceptions.\n";
        return 0;
    } catch (const std::exception& error) { std::cerr << error.what() << '\n'; return 1; }
}
