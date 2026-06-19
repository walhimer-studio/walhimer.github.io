#include "ofApp.h"

#include <string>

void ofApp::setup() {
    ofSetFrameRate(60);
    ofSetWindowTitle("Console — seed 77823");
    osc_.setup("127.0.0.1", kOscPort);
    birth(kDefaultSeed);
    setBranch(ConsoleBranch::Ghost);
}

void ofApp::birth(long seed) {
    createSpecies(seed, species_, body_);
    machineState_.energy = 1.f;
    machineState_.movementSpeed = 1.f;
    ofBackground(species_.bloodColor);

    ofxOscMessage ready;
    ready.setAddress("/sm/console/ready");
    ready.addIntArg(1);
    osc_.sendMessage(ready);

    ofxOscMessage seedMsg;
    seedMsg.setAddress("/sm/console/seed");
    seedMsg.addIntArg(static_cast<int>(species_.speciesID));
    osc_.sendMessage(seedMsg);

    ofxOscMessage count;
    count.setAddress("/sm/gear/count");
    count.addIntArg(species_.gearCount);
    osc_.sendMessage(count);

    readySent_ = true;
}

void ofApp::setBranch(ConsoleBranch branch) {
    applyConsoleBranch(branch, console_, machineState_, species_);

    ofxOscMessage msg;
    msg.setAddress("/sm/console/branch");
    msg.addStringArg(consoleBranchId(branch));
    osc_.sendMessage(msg);
}

void ofApp::update() {
    const float dt = ofGetLastFrameTime();
    simulateMachine(species_, machineState_, body_, dt);
    consoleTick(console_, dt);

    if (console_.branch == ConsoleBranch::Surrender && machineState_.energy < 0.35f) {
        console_.stress = std::min(1.f, console_.stress + dt * 0.04f);
    }

    oscAccum_ += dt;
    heartbeatAccum_ += dt;

    if (oscAccum_ >= 1.f / 15.f) {
        sendOscState(oscAccum_);
        oscAccum_ = 0.f;
    }

    if (heartbeatAccum_ >= 1.f) {
        ofxOscMessage beat;
        beat.setAddress("/sm/heartbeat");
        osc_.sendMessage(beat);
        heartbeatAccum_ = 0.f;
    }
}

void ofApp::sendOscState(float /*dt*/) {
    ofxOscMessage energy;
    energy.setAddress("/sm/state/energy");
    energy.addFloatArg(machineState_.energy);
    osc_.sendMessage(energy);

    ofxOscMessage stress;
    stress.setAddress("/sm/state/stress");
    stress.addFloatArg(console_.stress);
    osc_.sendMessage(stress);

    for (int i = 0; i < static_cast<int>(body_.size()); ++i) {
        const auto& part = body_[static_cast<size_t>(i)];
        const bool jammed = machineState_.energy < 0.12f && (i % 3 == 0);

        ofxOscMessage rpm;
        rpm.setAddress("/sm/gear/rpm");
        rpm.addIntArg(i);
        rpm.addFloatArg(part.rpm);
        osc_.sendMessage(rpm);

        const float hz = (part.rpm / 60.f) * 24.f * (species_.baseFrequency / 440.f);
        ofxOscMessage hzMsg;
        hzMsg.setAddress("/sm/gear/hz");
        hzMsg.addIntArg(i);
        hzMsg.addFloatArg(hz);
        osc_.sendMessage(hzMsg);

        ofxOscMessage jam;
        jam.setAddress("/sm/gear/jam");
        jam.addIntArg(i);
        jam.addIntArg(jammed ? 1 : 0);
        osc_.sendMessage(jam);
    }
}

void ofApp::draw() {
    ofBackground(species_.bloodColor);

    const float ghostMix = console_.branch == ConsoleBranch::Ghost ? 1.f : 0.35f;
    ofPushMatrix();
    ofTranslate(ofGetWidth() * 0.5f, ofGetHeight() * 0.52f);

    if (console_.goldPulse) {
        ofSetColor(255, 210, 80, 180);
        ofDrawCircle(0, 0, 120.f + sinf(ofGetElapsedTimef() * 8.f) * 8.f);
    }

    ofSetColor(255, 255, 255, static_cast<int>(180 + ghostMix * 75));
    for (const auto& part : body_) {
        part.draw();
    }
    ofPopMatrix();

    drawHud();
    drawBranchHint();
}

void ofApp::drawHud() const {
    ofSetColor(20, 20, 20);
    ofDrawRectangle(0, 0, ofGetWidth(), 56);

    ofSetColor(245, 245, 245);
    ofDrawBitmapStringHighlight("Console", 16, 22, ofColor::black, ofColor(245, 245, 245));
    ofDrawBitmapStringHighlight(
        "seed " + ofToString(species_.speciesID) +
            "  gen " + ofToString(console_.generation) +
            "  branch " + std::string(consoleBranchId(console_.branch)),
        16,
        40,
        ofColor::black,
        ofColor(245, 245, 245)
    );

    const std::string stats =
        "energy " + ofToString(machineState_.energy, 2) +
        "  stress " + ofToString(console_.stress, 2) +
        "  gears " + ofToString(species_.gearCount) +
        "  base " + ofToString(species_.baseFrequency, 0) + " Hz";
    ofDrawBitmapStringHighlight(
        stats,
        ofGetWidth() - 420,
        32,
        ofColor::black,
        ofColor(245, 245, 245)
    );

    if (!readySent_) {
        ofDrawBitmapStringHighlight("osc …", ofGetWidth() - 80, 22, ofColor::black, ofColor(255, 200, 80));
    }
}

void ofApp::drawBranchHint() const {
    const int y = ofGetHeight() - 48;
    const int w = ofGetWidth() / 3;
    const char* labels[] = {"1 room_a", "2 ghost", "3 surrender"};

    for (int i = 0; i < 3; ++i) {
        const bool active = static_cast<int>(console_.branch) == i;
        ofSetColor(active ? ofColor(30, 30, 30) : ofColor(230, 230, 230));
        ofDrawRectangle(i * w, y, w - 2, 40);
        ofSetColor(active ? ofColor(245, 245, 245) : ofColor(60, 60, 60));
        ofDrawBitmapString(labels[i], i * w + 12, y + 26);
    }
}

ConsoleBranch ofApp::branchFromMouseX(int x) const {
    const int third = ofGetWidth() / 3;
    if (x < third) return ConsoleBranch::RoomA;
    if (x < third * 2) return ConsoleBranch::Ghost;
    return ConsoleBranch::Surrender;
}

void ofApp::keyPressed(int key) {
    switch (key) {
        case '1':
            setBranch(ConsoleBranch::RoomA);
            break;
        case '2':
            setBranch(ConsoleBranch::Ghost);
            break;
        case '3':
            setBranch(ConsoleBranch::Surrender);
            break;
        case ' ':
            consoleVisitorNudge(console_);
            break;
        case 'g':
        case 'G':
            consoleGoldPulse(console_);
            {
                ofxOscMessage gold;
                gold.setAddress("/sm/event/gold");
                gold.addFloatArg(0.75f);
                osc_.sendMessage(gold);
            }
            break;
        case 'r':
        case 'R':
            console_.generation += 1;
            birth(ofGetUnixTime());
            {
                ofxOscMessage gen;
                gen.setAddress("/sm/dna/generation");
                gen.addIntArg(console_.generation);
                osc_.sendMessage(gen);
            }
            setBranch(console_.branch);
            break;
        case 'f':
            ofToggleFullscreen();
            break;
        default:
            break;
    }
}

void ofApp::mousePressed(int x, int y, int /*button*/) {
    if (y >= ofGetHeight() - 48) {
        setBranch(branchFromMouseX(x));
    } else {
        consoleVisitorNudge(console_, 0.35f);
    }
}
