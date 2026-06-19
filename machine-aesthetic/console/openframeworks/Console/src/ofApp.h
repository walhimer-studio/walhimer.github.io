#pragma once

#include "ofMain.h"
#include "ofxOsc.h"

#include "ConsoleKernel.h"
#include "MachineState.h"
#include "SpeciesDNA.h"
#include "SpeciesKernel.h"

class ofApp : public ofBaseApp {
public:
    void setup() override;
    void update() override;
    void draw() override;
    void keyPressed(int key) override;
    void mousePressed(int x, int y, int button) override;

private:
    static constexpr long kDefaultSeed = 77823;
    static constexpr int kOscPort = 7400;

    SpeciesDNA species_;
    MachineState machineState_;
    ConsoleState console_;
    std::vector<MachinePart> body_;

    ofxOscSender osc_;
    float oscAccum_ = 0.f;
    float heartbeatAccum_ = 0.f;
    bool readySent_ = false;

    void birth(long seed);
    void setBranch(ConsoleBranch branch);
    void sendOscState(float dt);
    void drawHud() const;
    void drawBranchHint() const;
    ConsoleBranch branchFromMouseX(int x) const;
};
