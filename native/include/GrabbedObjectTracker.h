#pragma once

#include <RE/Starfield.h>

namespace CCC
{
    class GrabbedObjectTracker final : public RE::BSTEventSink<RE::TESGrabReleaseEvent>
    {
    public:
        static GrabbedObjectTracker& GetSingleton()
        {
            static GrabbedObjectTracker singleton;
            return singleton;
        }

        void Register()
        {
            if (registered) return;
            if (auto* source = RE::TESGrabReleaseEvent::GetEventSource()) {
                source->RegisterSink(this);
                registered = true;
            }
        }

        [[nodiscard]] RE::TESObjectREFR* GetGrabbedReference() const noexcept
        {
            return grabbedReference.get();
        }

        RE::BSEventNotifyControl ProcessEvent(
            const RE::TESGrabReleaseEvent& event,
            RE::BSTEventSource<RE::TESGrabReleaseEvent>*) override
        {
            if (event.grabbed && event.target) {
                grabbedReference = event.target;
            } else if (!event.grabbed && (!event.target || event.target.get() == grabbedReference.get())) {
                grabbedReference.reset();
            }
            return RE::BSEventNotifyControl::kContinue;
        }

    private:
        RE::NiPointer<RE::TESObjectREFR> grabbedReference;
        bool registered{ false };
    };
}
