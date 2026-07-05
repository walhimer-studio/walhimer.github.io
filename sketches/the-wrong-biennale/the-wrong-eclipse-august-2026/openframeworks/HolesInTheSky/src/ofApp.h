#pragma once

#include "ofMain.h"
#include "ofxOsc.h"

#include "HolesKernel.h"

class ofApp : public ofBaseApp {
public:
    void setup() override;
    void update() override;
    void draw() override;
    void keyPressed(int key) override;

private:
    static constexpr int kOscPort = 9000;

    HolesState state_;
    ofxOscSender osc_;
    float oscAccum_ = 0.f;
    float atmoDensity_ = 0.4f;
    float aircraft_ = 0.f;

    void drawLifeBar() const;
    void drawObscBar() const;
};
