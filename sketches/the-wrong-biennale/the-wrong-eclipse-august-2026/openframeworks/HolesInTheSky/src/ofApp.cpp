#include "ofApp.h"

void ofApp::setup() {
    ofSetFrameRate(60);
    ofSetWindowTitle("Holes in the Sky — OF brain");
    ofBackground(7, 8, 12);
    osc_.setup("127.0.0.1", kOscPort);
    state_.seed = 120826;
}

void ofApp::update() {
    const float dt = ofGetLastFrameTime();
    holesUpdate(state_, dt, atmoDensity_, aircraft_);
    oscAccum_ += dt;
    if (oscAccum_ >= 1.f / 15.f) {
        holesSendOsc(osc_, state_);
        oscAccum_ = 0.f;
    }
}

void ofApp::draw() {
    ofBackground(7, 8, 12);
    ofSetColor(154, 168, 200);
    ofDrawBitmapString("Holes in the Sky · Machine DNA brain", 24, 28);
    ofDrawBitmapString(
        "Space start/stop · OSC /hit -> 127.0.0.1:" + ofToString(kOscPort),
        24,
        48
    );
    ofDrawBitmapString(
        "phase " + state_.eclipsePhase + " · obs " + ofToString(state_.obscuration, 3),
        24,
        68
    );

    drawLifeBar();
    drawObscBar();
}

void ofApp::drawLifeBar() const {
    const float x = 24.f;
    const float y = 100.f;
    const float w = ofGetWidth() - 48.f;
    const float h = 8.f;
    ofSetColor(40, 44, 56);
    ofDrawRectangle(x, y, w, h);
    ofSetColor(196, 184, 150);
    ofDrawRectangle(x, y, w * state_.vitality, h);
    ofSetColor(154, 168, 200, 180);
    ofDrawBitmapString("life " + ofToString(state_.vitality, 3), x, y - 6);
}

void ofApp::drawObscBar() const {
    const float x = 24.f;
    const float y = 140.f;
    const float w = ofGetWidth() - 48.f;
    const float h = 8.f;
    ofSetColor(40, 44, 56);
    ofDrawRectangle(x, y, w, h);
    ofSetColor(26, 32, 48);
    ofDrawRectangle(x, y, w * state_.obscuration, h);
    ofSetColor(154, 168, 200, 180);
    ofDrawBitmapString("obscuration " + ofToString(state_.obscuration, 3), x, y - 6);
}

void ofApp::keyPressed(int key) {
    if (key == ' ') {
        state_.running = !state_.running;
        if (state_.running && state_.progress >= 1.f) {
            state_.simulateElapsed = 0.f;
            state_.progress = 0.f;
            state_.age = 0.f;
            state_.vitality = 1.f;
        }
    }
    if (key == 'r' || key == 'R') {
        state_.simulateElapsed = 0.f;
        state_.progress = 0.f;
        state_.age = 0.f;
        state_.vitality = 1.f;
        state_.stress = 0.f;
        state_.running = false;
    }
}
