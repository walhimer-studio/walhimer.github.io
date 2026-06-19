#pragma once

#include "ofMain.h"
#include "GhostRoomLayout.h"

namespace ghost {

inline uint32_t ghostImul(uint32_t a, uint32_t b) {
    return static_cast<uint32_t>(static_cast<uint64_t>(a) * b);
}

/** Same 32-bit PRNG as ghost-machine-core.mjs makeRng — seed 77823 matches browser. */
class GhostRng {
public:
    explicit GhostRng(uint32_t seed = kSeed) : s_(seed) {}

    float random() {
        s_ = s_ + 0x6d2b79f5u;
        uint32_t t = s_;
        t = ghostImul(t ^ (t >> 15), t | 1u);
        t ^= t + ghostImul(t ^ (t >> 7), t | 61u);
        return static_cast<float>((t ^ (t >> 14)) >> 0) / 4294967296.f;
    }

    float uniform(float a, float b) { return a + random() * (b - a); }

    int randint(int a, int b) { return a + static_cast<int>(std::floor(random() * (b - a + 1))); }

    bool chance(float p) { return random() < p; }

    char choice(const char* opts, int count) {
        return opts[randint(0, count - 1)];
    }

private:
    uint32_t s_;
};

} // namespace ghost
