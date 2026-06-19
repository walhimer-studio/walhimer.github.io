// Reference openFrameworks wiring — paste into your ofApp.h / ofApp.cpp.
// Requires ofxOsc. OSC addresses here match the AI Studio snippets; migrate to
// /sm/* when wiring production hosts (see ../../docs/OSC.md).

#include "ofApp.h"
#include "MachineState.h"
#include "SpeciesDNA.h"
#include "SpeciesKernel.h"

#include "ofxOsc.h"

class ofApp : public ofBaseApp {
public:
    SpeciesDNA species;
    MachineState state;
    std::vector<MachinePart> machineBody;
    ofxOscSender sender;

    void setup() override {
        ofSetFrameRate(60);
        ofBackground(species.bloodColor);

        // 1. Create a unique seed (the birth).
        const long seed = ofGetUnixTime();
        createSpecies(seed, species, machineBody);
        ofBackground(species.bloodColor);

        // 2. Broadcast channel to Pure Data (edit IP/port for install).
        sender.setup("127.0.0.1", 12345);
    }

    void update() override {
        simulateMachine(species, state, machineBody, ofGetLastFrameTime());

        ofxOscMessage identity;
        identity.setAddress("/species/identity");
        identity.addIntArg(species.gearCount);
        identity.addFloatArg(species.baseFrequency);
        identity.addFloatArg(state.energy);
        sender.sendMessage(identity);
    }

    void draw() override {
        ofPushMatrix();
        ofTranslate(ofGetWidth() * 0.5f, ofGetHeight() * 0.5f);
        ofSetColor(species.bloodColor);
        for (const auto& part : machineBody) {
            part.draw();
        }
        ofPopMatrix();
    }
};
