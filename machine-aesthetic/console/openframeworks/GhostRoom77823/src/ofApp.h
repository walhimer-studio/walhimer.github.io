#pragma once

#include "ofMain.h"
#include "ofxOsc.h"

#include "GhostRoomBuilder.h"
#include "GhostRoomLayout.h"
#include "GhostWireBuilder.h"
#include "GhostZone.h"
#include "GhostCodeWalls.h"
#include "GhostWallPanels.h"
#include "GhostTextCylinder.h"
#include "GhostRoomLinks.h"
#include "SurrenderMachine.h"

class ofApp : public ofBaseApp {
public:
    ofApp() : wireBuilder_(ghostRoot_) {}

    void setup() override;
    void update() override;
    void draw() override;
    void keyPressed(int key) override;
    void keyReleased(int key) override;
    void mouseDragged(int x, int y, int button) override;
    void mousePressed(int x, int y, int button) override;
    void windowResized(int w, int h) override;

private:
    static constexpr int kOscPort = 7400;

    ghost::GhostRoomBuilder rooms_;
    ghost::GhostCodeWalls codeWalls_;
    ghost::GhostWallPanels wallPanels_;
    ghost::GhostTextCylinder textCylinder_;
    ghost::GhostRoomLinks roomLinks_;
    surrender::SurrenderMachine surrenderMachine_;
    ofNode ghostRoot_;
    ghost::GhostWireBuilder wireBuilder_;
    ghost::GhostZoneOsc zoneOsc_;

    ofCamera cam_;
    ofVec3f camPos_;
    float yaw_ = 0.f;
    float pitch_ = 0.f;
    bool keys_[512] = {};

    float heartbeatAccum_ = 0.f;
    bool spinActive_ = false;
    bool surrenderActive_ = false;

    void orientSpawnEast();
    void updateWalk(float dt);
    void drawHud() const;
    void drawSurrenderWithLights() const;
    ofVec3f forwardFlat() const;
    ofVec3f rightFlat() const;
};
