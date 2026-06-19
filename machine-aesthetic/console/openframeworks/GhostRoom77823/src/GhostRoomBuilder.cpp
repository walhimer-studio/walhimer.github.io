#include "GhostRoomBuilder.h"

#include <array>

namespace ghost {

void GhostRoomBuilder::addEdgesForBox(float cx, float cz, float hw, float hd, float height, bool whiteEdges) {
    const float wallT = 0.15f;
    const float yFloor = 0.04f;
    const float yCeil = height - 0.03f;
    const float inset = 0.01f;
    const float ix0 = cx - hw + wallT * 0.5f + inset;
    const float ix1 = cx + hw - wallT * 0.5f - inset;
    const float iz0 = cz - hd + wallT * 0.5f + inset;
    const float iz1 = cz + hd - wallT * 0.5f - inset;
    const float yFloorEdge = yFloor + inset;
    const float yCeilEdge = yCeil - inset;
    const float cg = whiteEdges ? 0.f : 0.04f;
    const ofColor edgeCol = whiteEdges ? ofColor(200) : ofColor(255);

    auto addEdge = [&](ofVec3f a, ofVec3f b) { edges_.push_back({a, b, edgeCol}); };

    addEdge({ix0 + cg, yFloorEdge, iz0}, {ix1 - cg, yFloorEdge, iz0});
    addEdge({ix1, yFloorEdge, iz0 + cg}, {ix1, yFloorEdge, iz1 - cg});
    addEdge({ix1 - cg, yFloorEdge, iz1}, {ix0 + cg, yFloorEdge, iz1});
    addEdge({ix0, yFloorEdge, iz1 - cg}, {ix0, yFloorEdge, iz0 + cg});
    addEdge({ix0 + cg, yCeilEdge, iz0}, {ix1 - cg, yCeilEdge, iz0});
    addEdge({ix1, yCeilEdge, iz0 + cg}, {ix1, yCeilEdge, iz1 - cg});
    addEdge({ix1 - cg, yCeilEdge, iz1}, {ix0 + cg, yCeilEdge, iz1});
    addEdge({ix0, yCeilEdge, iz1 - cg}, {ix0, yCeilEdge, iz0 + cg});
    addEdge({ix0, yFloorEdge + cg, iz0}, {ix0, yCeilEdge - cg, iz0});
    addEdge({ix1, yFloorEdge + cg, iz0}, {ix1, yCeilEdge - cg, iz0});
    addEdge({ix1, yFloorEdge + cg, iz1}, {ix1, yCeilEdge - cg, iz1});
    addEdge({ix0, yFloorEdge + cg, iz1}, {ix0, yCeilEdge - cg, iz1});
}

void GhostRoomBuilder::addRoom(float cx, float cz, bool blackRoom, bool doorWest, bool doorEast) {
    const float hw = kRW;
    const float hd = kRD;
    const float height = kRoomH;
    const float wallT = 0.15f;
    const ofColor surf = blackRoom ? ofColor(0) : ofColor(255);

    auto box = [&](ofVec3f pos, ofVec3f size) { boxes_.push_back({pos, size, surf}); };

    box({cx, 0, cz}, {kRoomW, 0.08f, kRoomD});
    box({cx, height, cz}, {kRoomW, 0.06f, kRoomD});
    box({cx, height * 0.5f, cz - hd}, {kRoomW, height, wallT});
    box({cx, height * 0.5f, cz + hd}, {kRoomW, height, wallT});

    const float halfDoor = kDoorWidth * 0.5f;
    const float segD = hd - halfDoor;

    auto ew = [&](float x, bool hasDoor) {
        if (!hasDoor) {
            box({x, height * 0.5f, cz}, {wallT, height, kRoomD});
            return;
        }
        box({x, height * 0.5f, cz - halfDoor - segD * 0.5f}, {wallT, height, segD});
        box({x, height * 0.5f, cz + halfDoor + segD * 0.5f}, {wallT, height, segD});
    };
    ew(cx - hw, doorWest);
    ew(cx + hw, doorEast);

    addEdgesForBox(cx, cz, hw, hd, height, !blackRoom);
}

void GhostRoomBuilder::addHall(float x0, float x1, bool blackStyle) {
    const float len = x1 - x0;
    const float cx = (x0 + x1) * 0.5f;
    const float hw = kHallWidth * 0.5f;
    const float height = kRoomH;
    const float wallT = 0.15f;
    const ofColor surf = blackStyle ? ofColor(0) : ofColor(255);

    auto box = [&](ofVec3f pos, ofVec3f size) { boxes_.push_back({pos, size, surf}); };
    box({cx, 0, 0}, {len, 0.08f, kHallWidth});
    box({cx, height, 0}, {len, 0.06f, kHallWidth});
    box({cx, height * 0.5f, -hw}, {len, height, wallT});
    box({cx, height * 0.5f, hw}, {len, height, wallT});

    const float inset = 0.01f;
    const float ix0 = x0 + inset;
    const float ix1 = x1 - inset;
    const float iz0 = -hw + wallT * 0.5f + inset;
    const float iz1 = hw - wallT * 0.5f - inset;
    const float yFloorEdge = 0.04f + inset;
    const float yCeilEdge = height - 0.03f - inset;
    const ofColor edgeCol = blackStyle ? ofColor(255) : ofColor(200);

    auto addEdge = [&](ofVec3f a, ofVec3f b) { edges_.push_back({a, b, edgeCol}); };
    addEdge({ix0, yFloorEdge, iz0}, {ix1, yFloorEdge, iz0});
    addEdge({ix1, yFloorEdge, iz0}, {ix1, yFloorEdge, iz1});
    addEdge({ix1, yFloorEdge, iz1}, {ix0, yFloorEdge, iz1});
    addEdge({ix0, yFloorEdge, iz1}, {ix0, yFloorEdge, iz0});
    addEdge({ix0, yCeilEdge, iz0}, {ix1, yCeilEdge, iz0});
    addEdge({ix1, yCeilEdge, iz0}, {ix1, yCeilEdge, iz1});
    addEdge({ix1, yCeilEdge, iz1}, {ix0, yCeilEdge, iz1});
    addEdge({ix0, yCeilEdge, iz1}, {ix0, yCeilEdge, iz0});
}

void GhostRoomBuilder::build(ofNode& /*root*/, bool includeRoomA, bool includeRoomC) {
    boxes_.clear();
    edges_.clear();
    if (includeRoomA) addRoom(kRoomAX, 0, true, false, true);
    addRoom(0, 0, false, true, true);
    if (includeRoomC) addRoom(kRoomCX, 0, false, true, false);
    addHall(kHallABx0, kHallABx1, true);
    addHall(kHallBCx0, kHallBCx1, false);
}

void GhostRoomBuilder::drawSolid() const {
    ofEnableDepthTest();
    ofFill();
    for (const auto& b : boxes_) {
        ofSetColor(b.color);
        ofDrawBox(b.pos, b.size.x, b.size.y, b.size.z);
    }
}

void GhostRoomBuilder::drawEdges() const {
    ofNoFill();
    ofSetLineWidth(1.f);
    for (const auto& e : edges_) {
        ofSetColor(e.color);
        ofDrawLine(e.a, e.b);
    }
}

} // namespace ghost
