#pragma once
#include <cmath>
#include <limits>
#include <stdexcept>

namespace CCC::RandomPercentQuery
{
    template <class Invoke>
    float Read(Invoke&& invoke)
    {
        float result = std::numeric_limits<float>::quiet_NaN();
        const bool success = invoke(&result);
        if (!success || !std::isfinite(result) || result < 0 || result > 100)
            throw std::runtime_error("The game did not return a valid random percentage.");
        return result;
    }
}
