#pragma once
#include <cstdint>

namespace CCC::InventoryQuery
{
    template <class Item>
    std::uint64_t StackCount(const Item& item)
    {
        std::uint64_t count = 0;
        for (const auto& stack : item.stacks) count += stack.count;
        return count;
    }
    template <class Entries>
    std::uint64_t ItemCount(const Entries& entries, std::uint32_t id)
    {
        std::uint64_t count = 0;
        for (const auto& item : entries) {
            if (item.object && item.object->GetFormID() == id) count += StackCount(item);
        }
        return count;
    }
}
