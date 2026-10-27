#pragma once
#include "NumericQuery.h"
#include <cstddef>
#include <cstdint>
#include <optional>
#include <limits>
#include <memory>
#include <chrono>
#include <string>

namespace CCC::QueuedQuery
{
    // Starfield 1.16.244 Script::SetText (RVA 00C122A0) stores the owned
    // source pointer at +0x50. The pinned CommonLib Script::text layout is
    // different, so do not dereference that field or use a condition adapter.
    inline constexpr std::uintptr_t kRuntimeTextOffset = 0x50;
    inline constexpr std::size_t kMaximumSource = 1024;

    // The request/poll task owns State. A callback slot only observes it and
    // cannot keep a finished request alive. Callers synchronize access.
    template <class State>
    class PendingSlot
    {
        std::weak_ptr<State> pending;
    public:
        void Arm(const std::shared_ptr<State>& state) { pending = state; }
        std::shared_ptr<State> Active(std::chrono::steady_clock::time_point now) const {
            auto state = pending.lock();
            return state && !state->complete && now <= state->numericDeadline ? state : nullptr;
        }
    };

    template <class Read>
    std::optional<std::string> ReadSource(std::uintptr_t script, Read&& read)
    {
        if (!script || script > std::numeric_limits<std::uintptr_t>::max() - kRuntimeTextOffset) return std::nullopt;
        std::uintptr_t source = 0;
        if (!read(script + kRuntimeTextOffset, &source, sizeof(source)) || !source
            || source > std::numeric_limits<std::uintptr_t>::max() - kMaximumSource) return std::nullopt;
        std::string text;
        for (std::size_t i = 0; i <= kMaximumSource; ++i) {
            char ch = 0;
            if (!read(source + i, &ch, 1)) return std::nullopt;
            if (!ch) return text;
            text.push_back(ch);
        }
        return std::nullopt;
    }

    inline bool MatchesSource(const std::string& source, const NumericQuery::Plan& expected)
    {
        try {
            if (expected.slot >= NumericQuery::specs.size()) return false;
            // Console compilation may resolve a target separately and retain
            // only the unprefixed operation in Script::text. In that case the
            // wrapper still checks the actual object against expected.targetID.
            auto candidate = source;
            if (NumericQuery::specs[expected.slot].target) {
                std::istringstream input(source);std::string verb;input >> verb;
                if (verb.find('.') == std::string::npos) {
                    // Parse with a harmless explicit player prefix; target
                    // identity is checked by the caller using the actual object.
                    candidate = "player." + source;
                }
            }
            const auto plan = NumericQuery::Parse(candidate);
            if (!plan || plan->slot != expected.slot) return false;
            if (NumericQuery::Lower(plan->argument) != NumericQuery::Lower(expected.argument)) return false;
            std::istringstream input(source);std::string verb;input >> verb;
            return verb.find('.') == std::string::npos || plan->targetID == expected.targetID;
        } catch (...) { return false; }
    }
}
