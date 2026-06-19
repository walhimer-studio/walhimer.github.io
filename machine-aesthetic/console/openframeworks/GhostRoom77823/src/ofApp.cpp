#include "ofApp.h"

#include <cmath>
#include <string>

namespace {

constexpr float kTextCylinderY = 2.85f;
constexpr float kSpawnLookX = ghost::kRoomAX;
constexpr float kSpawnLookY = kTextCylinderY;
constexpr float kSpawnLookZ = 0.f;
constexpr float kFov = 55.f;
constexpr float kNear = 0.05f;
constexpr float kFar = 200.f;
constexpr float kMouseSens = 0.003f;

std::pair<std::string, std::string> hudLinesForZone(ghost::ZoneId zone, int seed) {
    switch (zone) {
        case ghost::ZoneId::ApproachA:
            return {"Approach · Room A", "ghost seed 77823 · room B ahead"};
        case ghost::ZoneId::RoomA:
            return {"Room A · black · code mural",
                    "text cylinder · walk moon · left wall · building outline · click links"};
        case ghost::ZoneId::HallAB:
            return {"Hall A–B", "seed " + ofToString(seed)};
        case ghost::ZoneId::RoomB:
            return {"Room B · ghost wireframe", "seed " + ofToString(seed)};
        case ghost::ZoneId::HallBC:
            return {"Hall B–C", "surrender · seed " + ofToString(seed)};
        case ghost::ZoneId::RoomC:
            return {"Room C · surrender machine", "surrender · seed " + ofToString(seed)};
    }
    return {"Ghost Room 77823", "seed " + ofToString(seed)};
}

} // namespace

void ofApp::setup() {
    ofSetFrameRate(60);
    ofEnableDepthTest();
    ofBackground(255);
    ofSetWindowTitle("Ghost Room 77823");

    cam_.setupPerspective(false, kFov, kNear, kFar);

    rooms_.build(ghostRoot_, true, true);

    const std::string wallpaperPath = ofToDataPath("code-wallpaper-77823.png", true);
    if (!codeWalls_.load(wallpaperPath)) {
        ofLogWarning("ofApp") << "Code wallpaper missing — run: node machine-aesthetic/console/port/generate-code-wallpaper.mjs";
    }

    if (!wallPanels_.load(ofToDataPath("walk-moon-wall-panel.png", true),
                          ofToDataPath("building-outline-wall-panel.png", true))) {
        ofLogWarning("ofApp") << "Wall panels missing — run: ./scripts/sync-room-assets.sh";
    }

    if (!textCylinder_.setup()) {
        ofLogWarning("ofApp") << "Text cylinder setup failed (font?)";
    }

    roomLinks_.setup();

    ghost::GhostRng rng(ghost::kSeed);
    ghost::drawMachine(wireBuilder_, rng);

    surrenderMachine_.setup(ghost::kSeed, ghost::kRoomCX, 0.04f);

    zoneOsc_.setup("127.0.0.1", kOscPort);
    zoneOsc_.boot();

    orientSpawnEast();
    spinActive_ = ghost::spinBandActive(camPos_);
}

void ofApp::orientSpawnEast() {
    camPos_.set(ghost::kRoomAX - 8.f, ghost::kEyeHeight, 0.f);
    const float dx = kSpawnLookX - camPos_.x;
    const float dz = kSpawnLookZ - camPos_.z;
    yaw_ = std::atan2(dx, dz);
    pitch_ = 0.f;
}

ofVec3f ofApp::forwardFlat() const {
    return {std::sin(yaw_), 0.f, std::cos(yaw_)};
}

ofVec3f ofApp::rightFlat() const {
    const ofVec3f fwd = forwardFlat();
    return fwd.getCrossed(ofVec3f(0, 1, 0)).normalize();
}

void ofApp::updateWalk(float dt) {
    const bool run = ofGetKeyPressed(OF_KEY_LEFT_SHIFT) || ofGetKeyPressed(OF_KEY_RIGHT_SHIFT);
    const float vel = (run ? 4.f : 2.f) * dt;

    const ofVec3f fwd = forwardFlat();
    const ofVec3f right = rightFlat();

    if (keys_['w'] || keys_[OF_KEY_UP]) camPos_ += fwd * vel;
    if (keys_['s'] || keys_[OF_KEY_DOWN]) camPos_ -= fwd * vel;
    if (keys_['a'] || keys_[OF_KEY_LEFT]) camPos_ -= right * vel;
    if (keys_['d'] || keys_[OF_KEY_RIGHT]) camPos_ += right * vel;

    ghost::clampWalkPosition(camPos_);
}

void ofApp::update() {
    const float dt = ofGetLastFrameTime();
    updateWalk(dt);

    spinActive_ = ghost::spinBandActive(camPos_);
    surrenderActive_ = ghost::surrenderBandActive(camPos_);
    if (spinActive_) wireBuilder_.updateSpinners(dt);

    textCylinder_.update(dt, camPos_);
    surrenderMachine_.update(dt, surrenderActive_);

    zoneOsc_.updateFromPosition(camPos_);

    heartbeatAccum_ += dt;
    if (heartbeatAccum_ >= 1.f) {
        zoneOsc_.heartbeat();
        heartbeatAccum_ = 0.f;
    }
}

void ofApp::drawSurrenderWithLights() const {
    ofEnableLighting();
    ofEnableDepthTest();
    ofSetSmoothLighting(true);
    ofSetGlobalAmbientColor(ofFloatColor(0.65f, 0.65f, 0.65f));

    ofLight dir1;
    dir1.enable();
    dir1.setDirectional();
    dir1.setDiffuseColor(ofFloatColor(1.f, 1.f, 1.f));
    dir1.setPosition(ghost::kRoomCX + 350.f, -400.f, -1000.f);

    ofLight dir2;
    dir2.enable();
    dir2.setDirectional();
    dir2.setDiffuseColor(ofFloatColor(0.706f, 0.706f, 1.f));
    dir2.setPosition(ghost::kRoomCX - 300.f, 200.f, 1000.f);

    surrenderMachine_.draw();

    dir2.disable();
    dir1.disable();
    ofDisableLighting();
}

void ofApp::draw() {
    ofBackground(255);

    cam_.setPosition(camPos_);
    ofVec3f lookDir;
    lookDir.x = std::sin(yaw_) * std::cos(pitch_);
    lookDir.y = std::sin(pitch_);
    lookDir.z = std::cos(yaw_) * std::cos(pitch_);
    cam_.lookAt(camPos_ + lookDir * 10.f);

    cam_.begin();
    rooms_.drawSolid();
    codeWalls_.draw();
    wallPanels_.draw();
    ofSetLineWidth(1.f);
    wireBuilder_.draw();
    textCylinder_.draw(camPos_);
    drawSurrenderWithLights();
    rooms_.drawEdges();
    cam_.end();

    drawHud();
}

void ofApp::drawHud() const {
    const ghost::ZoneId zone = ghost::detectZone(camPos_);
    const auto lines = hudLinesForZone(zone, ghost::kSeed);

    ofSetColor(245, 245, 245, 220);
    ofDrawRectangle(12, ofGetHeight() - 56, 560, 44);
    ofSetColor(30);
    ofDrawBitmapString(lines.first, 20, ofGetHeight() - 36);
    ofDrawBitmapString(lines.second, 20, ofGetHeight() - 18);

    ofSetColor(245, 245, 245, 220);
    ofDrawRectangle(ofGetWidth() - 220, 12, 208, 24);
    ofSetColor(30);
    ofDrawBitmapString(
        std::string("seed ") + ofToString(ghost::kSeed) +
            (spinActive_ ? " · spin" : "") + (surrenderActive_ ? " · surrender" : ""),
        ofGetWidth() - 212,
        28
    );
}

void ofApp::keyPressed(int key) {
    if (key >= 0 && key < 512) keys_[key] = true;

    switch (key) {
        case ' ':
            zoneOsc_.visitorNudge();
            break;
        case 'g':
        case 'G':
            zoneOsc_.goldEvent();
            break;
        case 'f':
        case 'F':
            ofToggleFullscreen();
            break;
        case 'r':
        case 'R':
            orientSpawnEast();
            zoneOsc_.sendZone(ghost::detectZone(camPos_));
            break;
        default:
            break;
    }
}

void ofApp::keyReleased(int key) {
    if (key >= 0 && key < 512) keys_[key] = false;
}

void ofApp::mousePressed(int x, int y, int button) {
    if (button != OF_MOUSE_BUTTON_LEFT) return;
    const std::string link = roomLinks_.pick(cam_, static_cast<float>(x), static_cast<float>(y));
    if (!link.empty()) ghost::GhostRoomLinks::openLink(link);
}

void ofApp::mouseDragged(int x, int y, int button) {
    if (button != OF_MOUSE_BUTTON_LEFT) return;
    const float dx = x - ofGetPreviousMouseX();
    const float dy = y - ofGetPreviousMouseY();
    yaw_ -= dx * kMouseSens;
    pitch_ = ofClamp(pitch_ - dy * kMouseSens, -0.35f, 0.35f);
}

void ofApp::windowResized(int w, int h) {
    cam_.setupPerspective(false, kFov, kNear, kFar);
    (void)w;
    (void)h;
}
