#pragma once
#include <cmath>
#include <limits>
#include <optional>
#include <utility>

namespace CCC::ScalarResult
{
    struct Outcome { bool success; std::optional<float> value; };

    // Some commands return a scalar without printing to ConsoleLog. Preserve
    // every finite result, including zero and negative coordinates. A sentinel
    // distinguishes a written result from an untouched output parameter.
    template <class Invoke>
    Outcome CaptureNumber(float* result, bool capture, Invoke&& invoke)
    {
        if (!capture || !result) return { std::forward<Invoke>(invoke)(), std::nullopt };
        const auto previous = *result;
        *result = std::numeric_limits<float>::quiet_NaN();
        bool success;
        try { success = std::forward<Invoke>(invoke)(); }
        catch (...) { if (std::isnan(*result)) *result = previous; throw; }
        if (success && std::isfinite(*result)) return { true, *result };
        if (std::isnan(*result)) *result = previous;
        return { success, std::nullopt };
    }

    template <class Invoke>
    Outcome CaptureBoolean(float* result, bool capture, Invoke&& invoke)
    {
        if (!capture || !result) return { std::forward<Invoke>(invoke)(), std::nullopt };
        const auto previous = *result;
        *result = std::numeric_limits<float>::quiet_NaN();
        bool success;
        try { success = std::forward<Invoke>(invoke)(); }
        catch (...) { if (std::isnan(*result)) *result = previous; throw; }
        if (success && std::isfinite(*result) && (*result == 0.0f || *result == 1.0f)) return { true, *result };
        if (std::isnan(*result)) *result = previous;
        return { success, std::nullopt };
    }
}
