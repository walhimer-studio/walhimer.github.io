#pragma once

#include "GhostRoomLayout.h"

#include "ofxOsc.h"

namespace ghost {

enum class ZoneId { ApproachA, RoomA, HallAB, RoomB, HallBC, RoomC };

struct ZoneSpec {
    const char* id;
    const char* branch;
    int spin;
    int surrender;
    float hz;
};

inline ZoneSpec zoneSpec(ZoneId z) {
    switch (z) {
        case ZoneId::ApproachA:
            return {"approach_a", "room_a", 0, 0, 92.f};
        case ZoneId::RoomA:
            return {"room_a", "room_a", 0, 0, 110.f};
        case ZoneId::HallAB:
            return {"hall_ab", "ghost", 0, 0, 140.f};
        case ZoneId::RoomB:
            return {"room_b", "ghost", 1, 0, 178.f};
        case ZoneId::HallBC:
            return {"hall_bc", "surrender", 0, 0, 220.f};
        case ZoneId::RoomC:
            return {"room_c", "surrender", 0, 1, 266.f};
    }
    return {"room_a", "room_a", 0, 0, 110.f};
}

/** Same region logic as ghost_dense_77823_room.mjs updateHud(). */
inline ZoneId detectZone(const ofVec3f& pos) {
    if (pos.x < kHallABx1) {
        if (pos.x >= kRoomAX - kRW) return ZoneId::RoomA;
        return ZoneId::ApproachA;
    }
    if (pos.x < kHallBCx0) {
        if (pos.x < 0.f) return ZoneId::HallAB;
        return ZoneId::RoomB;
    }
    if (pos.x < kRoomCX + kRW) {
        if (pos.x < kHallBCx1) return ZoneId::HallBC;
        return ZoneId::RoomC;
    }
    return ZoneId::RoomC;
}

inline bool spinBandActive(const ofVec3f& pos) {
    return pos.x >= kGhostSpinX0 && pos.x <= kGhostSpinX1;
}

inline bool surrenderBandActive(const ofVec3f& pos) {
    const float x0 = kRoomCX - kRW + 0.5f;
    const float x1 = kRoomCX + kRW - 0.5f;
    return pos.x >= x0 && pos.x <= x1;
}

inline void clampWalkPosition(ofVec3f& pos) {
    pos.x = ofClamp(pos.x, kBoundXMin, kBoundXMax);
    const bool inHall =
        (pos.x >= kHallABx0 && pos.x <= kHallABx1) ||
        (pos.x >= kHallBCx0 && pos.x <= kHallBCx1);
    const float zBound = inHall ? kBoundHallZ : kBoundRoomZ;
    pos.z = ofClamp(pos.z, -zBound, zBound);
    pos.y = kEyeHeight;
}

class GhostZoneOsc {
public:
    void setup(const std::string& host, int port) { sender_.setup(host, port); }

    void boot() {
        sendInt("/sm/console/ready", 1);
        sendInt("/sm/ghost/ready", 1);
        sendInt("/sm/console/seed", kSeed);
        sendInt("/sm/ghost/seed", kSeed);
        sendZone(ZoneId::RoomA);
    }

    void heartbeat() {
        ofxOscMessage msg;
        msg.setAddress("/sm/heartbeat");
        sender_.sendMessage(msg);
    }

    void sendZone(ZoneId zone) {
        const ZoneSpec z = zoneSpec(zone);
        sendString("/sm/ghost/zone", z.id);
        sendString("/sm/console/branch", z.branch);
        sendInt("/sm/ghost/spin_active", z.spin);
        sendInt("/sm/ghost/surrender_active", z.surrender);
        sendFloatPair("/sm/gear/hz", 0, z.hz);
        sendFloat("/sm/state/stress", stress_);
        current_ = zone;
    }

    void updateFromPosition(const ofVec3f& pos) {
        const ZoneId next = detectZone(pos);
        if (next != current_) sendZone(next);
    }

    void visitorNudge() { stress_ = std::min(1.f, stress_ + 0.12f); sendFloat("/sm/state/stress", stress_); }

    void goldEvent() {
        stress_ = std::max(0.f, stress_ - 0.2f);
        sendFloat("/sm/event/gold", 0.75f);
        sendFloat("/sm/state/stress", stress_);
    }

    ZoneId current() const { return current_; }

private:
    ofxOscSender sender_;
    ZoneId current_ = ZoneId::RoomA;
    float stress_ = 0.15f;

    void sendInt(const std::string& addr, int v) {
        ofxOscMessage msg;
        msg.setAddress(addr);
        msg.addIntArg(v);
        sender_.sendMessage(msg);
    }

    void sendFloat(const std::string& addr, float v) {
        ofxOscMessage msg;
        msg.setAddress(addr);
        msg.addFloatArg(v);
        sender_.sendMessage(msg);
    }

    void sendString(const std::string& addr, const std::string& v) {
        ofxOscMessage msg;
        msg.setAddress(addr);
        msg.addStringArg(v);
        sender_.sendMessage(msg);
    }

    void sendFloatPair(const std::string& addr, int i, float f) {
        ofxOscMessage msg;
        msg.setAddress(addr);
        msg.addIntArg(i);
        msg.addFloatArg(f);
        sender_.sendMessage(msg);
    }
};

} // namespace ghost
