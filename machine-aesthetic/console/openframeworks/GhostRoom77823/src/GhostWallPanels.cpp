#include "GhostWallPanels.h"

#include <cmath>

namespace ghost {

namespace {

constexpr float kWallT = 0.15f;
constexpr float kWallFace = kWallT * 0.5f + 0.002f;
constexpr float kPanelEpsilon = 0.004f;

} // namespace

bool GhostWallPanels::load(const std::string& walkMoonPng, const std::string& buildingOutlinePng) {
    if (!ofLoadImage(walkMoon_, walkMoonPng)) return false;
    if (!ofLoadImage(buildingOutline_, buildingOutlinePng)) return false;

    const float yMid = kRoomH * 0.5f;

    walkMoonPanel_ = {&walkMoon_,
                      {kRoomAX, yMid, -kRD + kWallFace + kPanelEpsilon},
                      0.f,
                      kRoomW,
                      kRoomH};

    buildingOutlinePanel_ = {&buildingOutline_,
                             {kRoomAX, yMid, kRD - kWallFace - kPanelEpsilon},
                             static_cast<float>(M_PI),
                             kRoomW,
                             kRoomH};

    return true;
}

void GhostWallPanels::drawPanel(const Panel& panel) const {
    if (!panel.texture || !panel.texture->isAllocated()) return;

    ofPushMatrix();
    ofTranslate(panel.pos);
    ofRotateRad(panel.rotY, 0, 1, 0);
    ofSetColor(255);
    panel.texture->draw(-panel.width * 0.5f, -panel.height * 0.5f, 0, panel.width, panel.height);
    ofPopMatrix();
}

void GhostWallPanels::draw() const {
    if (!ready()) return;

    ofEnableDepthTest();
    ofEnableAlphaBlending();
    ofDepthMask(false);
    drawPanel(walkMoonPanel_);
    drawPanel(buildingOutlinePanel_);
    ofDepthMask(true);
}

} // namespace ghost
