#pragma once

#include "GhostRoomLayout.h"
#include "GhostRng.h"
#include "SurrenderMath.h"

#include <memory>
#include <string>
#include <vector>

namespace surrender {

/** Surrender Machines embed — port of surrender-machines-three-core.js (seed 77823, flat Room C). */
class SurrenderMachine {
public:
    void setup(int seed = ghost::kSeed, float roomX = ghost::kRoomCX, float roomY = 0.04f);
    void update(float dt, bool active);
    void draw() const;

    int seed() const { return seed_; }

private:
    static constexpr int kCylSeg = 16;
    static constexpr float kTau = 6.28318530718f;

    struct Part {
        ofNode node;
        bool isBox = true;
        ofVec3f dim;
        FillMeta meta;
        ofColor color;
        float alpha = 1.f;
        bool animated = false;
    };

    struct Spinner {
        ofNode* pivot = nullptr;
        char axis = 'y';
        float baseSpeed = 0.f;
        bool attachmentKind = false;
    };

    struct ColPos {
        float x, y, z;
    };

    struct State {
        float angerVal = 0.5f, egoVal = 0.5f, attachmentVal = 0.5f;
        float angerStress = 0, egoStress = 0, attachmentStress = 0;
        float shadowAmount = 0;
        int gPlatformExtras = 0, gColumnCount = 4, gGearCount = 60;
        int gPulleyCount = 10, gRodCount = 5;
        bool machineBuilt = false;
        int prevPlatformExtras = -1, prevColumnCount = -1, prevGearCount = -1;
        int prevPulleyCount = -1, prevRodCount = -1;
    };

    ofNode root_;
    ofNode anchor_;
    ofNode machinePivot_;
    ofNode machineRoot_;

    float scale_ = 0.01f;
    int seed_ = ghost::kSeed;
    float elapsed_ = 0.f;
    std::string builtSig_;

    State state_;
    ghost::GhostRng rng_;
    std::vector<std::unique_ptr<Part>> parts_;
    std::vector<std::unique_ptr<ofNode>> groups_;
    std::vector<Spinner> spinners_;

    ofNode& makeGroup(ofNode& parent);

    void updateTargets();
    bool needsRebuild() const;
    void syncRebuildFlags();
    std::string signature() const;

    void clearMachine();
    void buildMachine(float t);
    void snapToFloor();

    ofVec3f jitter(float stress);
    float speedMult(float stress) const;

    FillResult fillAt(float x, float y, float z, float baseHue, float hueSpread, float maxAlpha, float t,
                      float stress);
    void applyFill(Part& part, float t);

    Part& addBox(ofNode& parent, float w, float h, float d, float x, float y, float z, float baseHue,
                 float hueSpread, float maxAlpha, float t, float stress);
    Part& addCyl(ofNode& parent, float r, float h, float x, float y, float z, float baseHue, float hueSpread,
                 float maxAlpha, float t, float stress);
    void buildGearTeeth(ofNode& parent, float radius, float thickness, int teeth, float x, float y, float z,
                        float toothHue, float maxAlpha, float stress, float t, char axis);
    void addSpinner(ofNode& pivot, char axis, float speed, const char* stressKind);
    void plate(float x, float y, float z, float w, float h, float d, float t);
};

} // namespace surrender
