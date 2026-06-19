#pragma once

#include "ofMain.h"

namespace ghost {

inline constexpr int kSeed = 77823;

inline constexpr float kRoomW = 28.f;
inline constexpr float kRoomD = 28.f;
inline constexpr float kRoomH = 9.f;

inline constexpr float kHallWidth = 4.f;
inline constexpr float kHallLenBC = 8.f;
inline constexpr float kHallLenAB = 16.f;
inline constexpr float kDoorWidth = 4.f;

inline constexpr float kRW = kRoomW * 0.5f;
inline constexpr float kRD = kRoomD * 0.5f;

inline constexpr float kRoomAX = -(kRW + kHallLenAB + kRW);
inline constexpr float kRoomCX = kRW + kHallLenBC + kRW;

inline constexpr float kHallABx0 = kRoomAX + kRW;
inline constexpr float kHallABx1 = -kRW;
inline constexpr float kHallBCx0 = kRW;
inline constexpr float kHallBCx1 = kRoomCX - kRW;

inline constexpr float kGhostSpinX0 = kHallABx0 - 2.f;
inline constexpr float kGhostSpinX1 = kHallBCx0;

inline constexpr float kBoundXMin = kRoomAX - kRW + 1.2f;
inline constexpr float kBoundXMax = kRoomCX + kRW - 1.2f;
inline constexpr float kBoundRoomZ = kRD - 1.2f;
inline constexpr float kBoundHallZ = kHallWidth * 0.5f - 0.2f;

inline constexpr float kEyeHeight = 1.62f;

struct Palette {
    static ofColor ink() { return ofColor(44, 48, 52); }
    static ofColor lightBlue() { return ofColor(116, 180, 220); }
    static ofColor skyBlue() { return ofColor(128, 184, 232); }
    static ofColor navy() { return ofColor(90, 120, 140); }
    static ofColor gold() { return ofColor(236, 160, 24); }
    static ofColor maroon() { return ofColor(102, 32, 32); }
};

} // namespace ghost
