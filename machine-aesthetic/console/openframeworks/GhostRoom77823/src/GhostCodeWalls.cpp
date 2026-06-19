#include "GhostCodeWalls.h"

#include <cmath>

namespace ghost {

namespace {

constexpr float kWallT = 0.15f;
constexpr float kWallFace = kWallT * 0.5f + 0.002f;

} // namespace

bool GhostCodeWalls::load(const std::string& pngPath) {
    planes_.clear();
    if (!ofLoadImage(texture_, pngPath)) return false;
    texture_.setTextureWrap(GL_REPEAT, GL_REPEAT);
    addPlanesForRoomA();
    addPlanesForHallAB();
    return true;
}

void GhostCodeWalls::addPlanesForRoomA() {
    const float cx = kRoomAX;
    const float cz = 0.f;
    const float hw = kRW;
    const float hd = kRD;
    const float height = kRoomH;
    const float yMid = height * 0.5f;
    const float halfDoor = kDoorWidth * 0.5f;
    const float segD = hd - halfDoor;

    planes_.push_back({{cx, yMid, cz - hd + kWallFace}, 0.f, kRoomW, height});
    planes_.push_back({{cx, yMid, cz + hd - kWallFace}, static_cast<float>(M_PI), kRoomW, height});
    planes_.push_back({{cx - hw + kWallFace, yMid, cz}, static_cast<float>(M_PI * 0.5f), kRoomD, height});
    planes_.push_back(
        {{cx + hw - kWallFace, yMid, cz - halfDoor - segD * 0.5f}, static_cast<float>(-M_PI * 0.5f), segD, height});
    planes_.push_back(
        {{cx + hw - kWallFace, yMid, cz + halfDoor + segD * 0.5f}, static_cast<float>(-M_PI * 0.5f), segD, height});
}

void GhostCodeWalls::addPlanesForHallAB() {
    const float x0 = kHallABx0;
    const float x1 = kHallABx1;
    const float len = x1 - x0;
    const float cx = (x0 + x1) * 0.5f;
    const float hw = kHallWidth * 0.5f;
    const float height = kRoomH;
    const float yMid = height * 0.5f;

    planes_.push_back({{cx, yMid, -hw + kWallFace}, 0.f, len, height});
    planes_.push_back({{cx, yMid, hw - kWallFace}, static_cast<float>(M_PI), len, height});
}

void GhostCodeWalls::drawPlane(const Plane& p) const {
    ofPushMatrix();
    ofTranslate(p.pos);
    ofRotateRad(p.rotY, 0, 1, 0);
    ofSetColor(255);
    texture_.draw(-p.width * 0.5f, -p.height * 0.5f, 0, p.width, p.height);
    ofPopMatrix();
}

void GhostCodeWalls::draw() const {
    if (!texture_.isAllocated()) return;
    ofEnableDepthTest();
    ofEnableAlphaBlending();
    ofSetColor(255);
    for (const auto& p : planes_) drawPlane(p);
}

} // namespace ghost
