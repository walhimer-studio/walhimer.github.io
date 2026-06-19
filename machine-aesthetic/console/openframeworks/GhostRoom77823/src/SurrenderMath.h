#pragma once

#include "GhostRng.h"
#include "ofMain.h"

namespace surrender {

inline float clampf(float v, float a, float b) { return ofClamp(v, a, b); }
inline float lerpf(float a, float b, float t) { return a + (b - a) * t; }
inline float mapf(float v, float a, float b, float c, float d) {
    return c + (d - c) * ((v - a) / (b - a));
}

inline float richness(float val) { return std::min(val / 0.65f, 1.f); }
inline float stressOf(float val) { return std::max(0.f, (val - 0.65f) / 0.35f); }

inline float pseudoNoise(float x, float y, float z) {
    const float n = std::sin(x * 12.9898f + y * 78.233f + z * 37.719f) * 43758.5453f;
    return n - std::floor(n);
}

inline ofColor hsbColor(float h, float s, float b) {
    h = std::fmod(std::fmod(h, 360.f) + 360.f, 360.f);
    s = clampf(s / 100.f, 0.f, 1.f);
    b = clampf(b / 100.f, 0.f, 1.f);
    if (s <= 0.f) return ofColor(b * 255, b * 255, b * 255);

    const float sector = h / 60.f;
    const int i = static_cast<int>(std::floor(sector)) % 6;
    const float f = sector - std::floor(sector);
    const float p = b * (1.f - s);
    const float q = b * (1.f - s * f);
    const float t = b * (1.f - s * (1.f - f));

    float r, g, bl;
    switch (i) {
        case 0: r = b; g = t; bl = p; break;
        case 1: r = q; g = b; bl = p; break;
        case 2: r = p; g = b; bl = t; break;
        case 3: r = p; g = q; bl = b; break;
        case 4: r = t; g = p; bl = b; break;
        default: r = b; g = p; bl = q; break;
    }
    return ofColor(r * 255, g * 255, bl * 255);
}

struct FillMeta {
    float x = 0, y = 0, z = 0;
    float baseHue = 0, hueSpread = 0, maxAlpha = 0, stress = 0;
};

struct FillResult {
    float h, s, b, a;
};

inline FillResult machineFill(float x, float y, float z, float baseHue, float hueSpread, float maxAlpha,
                              float t, float stress, float shadowAmount, ghost::GhostRng& rng) {
    if (shadowAmount >= 1.f) {
        const float nz = pseudoNoise(x * 0.002f, y * 0.002f, t * 0.05f);
        return {0.f, 0.f, lerpf(90.f, 96.f, nz), 0.08f};
    }
    const float nx = clampf(mapf(x, -600.f, 600.f, -1.f, 1.f), -1.f, 1.f);
    const float ny = clampf(mapf(y, -600.f, 600.f, -1.f, 1.f), -1.f, 1.f);
    const float nz = clampf(mapf(z, -600.f, 600.f, -1.f, 1.f), -1.f, 1.f);
    const float pf = nx + ny + nz;
    const float tf = std::sin(t * 0.9f + pf * 2.5f);
    float h = baseHue + hueSpread * (0.5f * pf + 0.5f * tf);
    h = lerpf(h, 0.f, stress * 0.7f);
    maxAlpha = std::min(maxAlpha, 85.f);
    float alpha = lerpf(maxAlpha * 0.25f, maxAlpha, (ny + 1.f) * 0.5f);
    if (stress > 0.5f && rng.random() < stress * 0.35f) alpha *= rng.uniform(0.1f, 0.5f);
    const float sat = lerpf(100.f, 0.f, shadowAmount);
    const float bri = lerpf(100.f, 95.f, shadowAmount);
    alpha = lerpf(alpha, 6.f, shadowAmount);
    return {std::fmod(h + 360.f, 360.f), sat, bri, alpha / 100.f};
}

inline float scaleForRoom(float roomHeight, float factor = 0.52f, float modelHeight = 680.f) {
    return (roomHeight * factor) / modelHeight;
}

} // namespace surrender
