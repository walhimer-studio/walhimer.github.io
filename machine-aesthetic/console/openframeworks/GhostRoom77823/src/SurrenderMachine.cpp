#include "SurrenderMachine.h"

#include <cmath>
#include <limits>
#include <sstream>

namespace surrender {

namespace {

constexpr int kAngerSlider = 50;
constexpr int kEgoSlider = 50;
constexpr int kAttachmentSlider = 50;

} // namespace

ofNode& SurrenderMachine::makeGroup(ofNode& parent) {
    groups_.push_back(std::make_unique<ofNode>());
    groups_.back()->setParent(parent);
    return *groups_.back();
}

void SurrenderMachine::setup(int seed, float roomX, float roomY) {
    seed_ = seed;
    rng_ = ghost::GhostRng(static_cast<uint32_t>(seed));
    scale_ = scaleForRoom(ghost::kRoomH);

    parts_.clear();
    groups_.clear();
    spinners_.clear();

    root_.setPosition(roomX, roomY, 0.f);
    anchor_.setParent(root_);
    anchor_.setScale(scale_);
    machinePivot_.setParent(anchor_);
    machinePivot_.setPosition(0, 0, 0);
    machineRoot_.setParent(machinePivot_);
    machineRoot_.setScale(1.f, -1.f, 1.f);

    state_ = State{};
    state_.angerVal = kAngerSlider / 100.f;
    state_.egoVal = kEgoSlider / 100.f;
    state_.attachmentVal = kAttachmentSlider / 100.f;

    updateTargets();
    buildMachine(0.f);
    syncRebuildFlags();
    elapsed_ = 0.f;
}

FillResult SurrenderMachine::fillAt(float x, float y, float z, float baseHue, float hueSpread, float maxAlpha,
                                    float t, float stress) {
    return machineFill(x, y, z, baseHue, hueSpread, maxAlpha, t, stress, state_.shadowAmount, rng_);
}

void SurrenderMachine::applyFill(Part& part, float t) {
    const FillResult f = fillAt(part.meta.x, part.meta.y, part.meta.z, part.meta.baseHue, part.meta.hueSpread,
                                part.meta.maxAlpha, t, part.meta.stress);
    part.color = hsbColor(f.h, f.s, f.b);
    part.alpha = f.a;
}

ofVec3f SurrenderMachine::jitter(float stress) {
    if (stress <= 0.f || state_.shadowAmount >= 1.f) return {0, 0, 0};
    const float m = stress * stress * 120.f;
    return {rng_.uniform(-m, m), rng_.uniform(-m, m), rng_.uniform(-m, m)};
}

float SurrenderMachine::speedMult(float stress) const {
    return (1.f + stress * stress * 7.f) * lerpf(1.f, 0.04f, state_.shadowAmount);
}

SurrenderMachine::Part& SurrenderMachine::addBox(ofNode& parent, float w, float h, float d, float x, float y, float z,
                               float baseHue, float hueSpread, float maxAlpha, float t, float stress) {
    auto part = std::make_unique<Part>();
    part->node.setParent(parent);
    part->node.setPosition(x, y, z);
    part->isBox = true;
    part->dim.set(w, h, d);
    part->meta = {x, y, z, baseHue, hueSpread, maxAlpha, stress};
    part->animated = true;
    applyFill(*part, t);
    Part& ref = *part;
    parts_.push_back(std::move(part));
    return ref;
}

SurrenderMachine::Part& SurrenderMachine::addCyl(ofNode& parent, float r, float h, float x, float y, float z, float baseHue,
                               float hueSpread, float maxAlpha, float t, float stress) {
    auto part = std::make_unique<Part>();
    part->node.setParent(parent);
    part->node.setPosition(x, y, z);
    part->isBox = false;
    part->dim.set(r, h, 0);
    part->meta = {x, y, z, baseHue, hueSpread, maxAlpha, stress};
    part->animated = true;
    applyFill(*part, t);
    Part& ref = *part;
    parts_.push_back(std::move(part));
    return ref;
}

void SurrenderMachine::addSpinner(ofNode& pivot, char axis, float speed, const char* stressKind) {
    spinners_.push_back({&pivot, axis, speed, stressKind && std::string(stressKind) == "attachment"});
}

void SurrenderMachine::buildGearTeeth(ofNode& parent, float radius, float thickness, int teeth, float x, float y,
                                      float z, float toothHue, float maxAlpha, float stress, float t, char axis) {
    const float tD = thickness * 1.1f;
    const float tW = (kTau * radius) / (teeth * 4.f);
    const float tH = radius * 0.12f;
    for (int i = 0; i < teeth; ++i) {
        const float a = (kTau * i) / teeth;
        auto& g = makeGroup(parent);
        if (axis == 'y') {
            g.setPosition(std::cos(a) * radius, 0, std::sin(a) * radius);
            g.setOrientation(glm::angleAxis(a, glm::vec3(0, 1, 0)));
        } else {
            g.setPosition(0, std::cos(a) * radius, std::sin(a) * radius);
            g.setOrientation(glm::angleAxis(a, glm::vec3(1, 0, 0)));
        }
        addBox(g, tW, tH, tD, x, y, z, toothHue, 130.f, maxAlpha, t, stress);
    }
}

void SurrenderMachine::clearMachine() {
    parts_.clear();
    groups_.clear();
    spinners_.clear();
    state_.machineBuilt = false;
}

std::string SurrenderMachine::signature() const {
    std::ostringstream oss;
    oss << seed_ << '|' << state_.gPlatformExtras << '|' << state_.gColumnCount << '|' << state_.gGearCount
        << '|' << state_.gPulleyCount << '|' << state_.gRodCount;
    return oss.str();
}

void SurrenderMachine::updateTargets() {
    state_.angerVal = kAngerSlider / 100.f;
    state_.egoVal = kEgoSlider / 100.f;
    state_.attachmentVal = kAttachmentSlider / 100.f;
    state_.angerStress = stressOf(state_.angerVal);
    state_.egoStress = stressOf(state_.egoVal);
    state_.attachmentStress = stressOf(state_.attachmentVal);

    const float rA = richness(state_.angerVal);
    const float rE = richness(state_.egoVal);
    const float rAt = richness(state_.attachmentVal);

    state_.gGearCount = static_cast<int>(std::floor(mapf(rA, 0.f, 1.f, 4.f, 200.f)));
    state_.gPlatformExtras = static_cast<int>(std::floor(mapf(rE, 0.f, 1.f, 0.f, 3.f)));
    state_.gColumnCount = static_cast<int>(std::floor(mapf(rE, 0.f, 1.f, 3.f, 12.f)));
    state_.gPulleyCount = static_cast<int>(std::floor(mapf(rAt, 0.f, 1.f, 2.f, 60.f)));
    state_.gRodCount = static_cast<int>(std::floor(mapf(rAt, 0.f, 1.f, 1.f, 20.f)));
    if (state_.gColumnCount < 2) state_.gGearCount = std::min(state_.gGearCount, 4);
}

bool SurrenderMachine::needsRebuild() const {
    return !state_.machineBuilt || state_.gPlatformExtras != state_.prevPlatformExtras ||
           state_.gColumnCount != state_.prevColumnCount || state_.gGearCount != state_.prevGearCount ||
           state_.gPulleyCount != state_.prevPulleyCount || state_.gRodCount != state_.prevRodCount ||
           signature() != builtSig_;
}

void SurrenderMachine::syncRebuildFlags() {
    state_.prevPlatformExtras = state_.gPlatformExtras;
    state_.prevColumnCount = state_.gColumnCount;
    state_.prevGearCount = state_.gGearCount;
    state_.prevPulleyCount = state_.gPulleyCount;
    state_.prevRodCount = state_.gRodCount;
}

void SurrenderMachine::plate(float x, float y, float z, float w, float h, float d, float t) {
    const ofVec3f j = jitter(state_.egoStress);
    auto& g = makeGroup(machineRoot_);
    g.setPosition(x + j.x, y + h * 0.5f + j.y, z + j.z);
    addBox(g, w, h, d, x, y, z, 305.f, 110.f, 80.f, t, state_.egoStress);
}

void SurrenderMachine::snapToFloor() {
    float minY = std::numeric_limits<float>::max();
    for (const auto& p : parts_) {
        const ofVec3f wp = p->node.getGlobalPosition();
        const float half = p->isBox ? p->dim.y * 0.5f : p->dim.y * 0.5f;
        minY = std::min(minY, wp.y - half * scale_);
    }
    if (minY == std::numeric_limits<float>::max()) return;
    const float dy = root_.getPosition().y - minY;
    const ofVec3f mp = machinePivot_.getPosition();
    machinePivot_.setPosition(mp.x, mp.y + dy / scale_, mp.z);
}

void SurrenderMachine::buildMachine(float t) {
    clearMachine();
    rng_ = ghost::GhostRng(static_cast<uint32_t>(seed_));

    const float sf = 1.2f;
    const float bW = 600.f * sf, bD = 600.f * sf, bT = 25.f * sf;

    plate(0, 0, 0, bW, bT, bD, t);
    for (int i = 0; i < state_.gPlatformExtras; ++i) {
        plate(rng_.uniform(-60.f, 60.f) * sf, -rng_.uniform(80.f, 220.f) * sf, rng_.uniform(-60.f, 60.f) * sf,
              bW * rng_.uniform(0.5f, 1.f), bT * rng_.uniform(0.6f, 1.4f), bD * rng_.uniform(0.5f, 1.f), t);
    }

    std::vector<ColPos> colPositions;
    const float colH = rng_.uniform(140.f, 220.f) * sf;
    const float colR = rng_.uniform(14.f, 24.f) * sf;
    for (int i = 0; i < state_.gColumnCount; ++i) {
        const float x = rng_.uniform(-bW * 0.35f, bW * 0.35f);
        const float z = rng_.uniform(-bD * 0.35f, bD * 0.35f);
        const float y = -colH * 0.5f - bT * 0.5f;
        const ofVec3f j = jitter(state_.egoStress);
        auto& g = makeGroup(machineRoot_);
        g.setPosition(x + j.x, y + j.y, z + j.z);
        g.setOrientation(glm::angleAxis(static_cast<float>(M_PI * 0.5), glm::vec3(1, 0, 0)));
        addCyl(g, colR, colH, x, y, z, 320.f, 90.f, 78.f, t, state_.egoStress);
        colPositions.push_back({x, -colH, z});
    }

    for (int i = 0; i < state_.gGearCount; ++i) {
        if (colPositions.empty()) break;
        const ColPos& anch = colPositions[rng_.randint(0, static_cast<int>(colPositions.size()) - 1)];
        const float r = rng_.uniform(40.f, 80.f) * sf;
        const float thick = rng_.uniform(14.f, 26.f) * sf;
        const int teeth = rng_.randint(8, 18);
        const bool horizontal = rng_.random() < 0.5f;
        const ofVec3f j = jitter(state_.angerStress);
        auto& g = makeGroup(machineRoot_);
        g.setPosition(anch.x + rng_.uniform(-80.f, 20.f) + j.x, anch.y + rng_.uniform(-200.f, 200.f) + j.y,
                       anch.z + rng_.uniform(-20.f, 20.f) + j.z);
        g.setOrientation(glm::angleAxis(rng_.uniform(0.f, kTau), glm::vec3(0, 1, 0)));
        const float px = g.getPosition().x, py = g.getPosition().y, pz = g.getPosition().z;
        const float s = state_.angerStress;
        addCyl(g, r, thick, px, py, pz, horizontal ? 15.f : 25.f, horizontal ? 140.f : 160.f, 80.f, t, s);
        buildGearTeeth(g, r, thick, teeth, px, py, pz, horizontal ? 30.f : 40.f, 82.f, s, t,
                       horizontal ? 'y' : 'x');
        addSpinner(g, horizontal ? 'y' : 'x',
                   (rng_.choice("+-", 2) == '-' ? -1.f : 1.f) * rng_.uniform(0.2f, 0.8f), "anger");
    }

    for (int i = 0; i < state_.gPulleyCount; ++i) {
        if (colPositions.size() < 2) break;
        const ColPos& a = colPositions[rng_.randint(0, static_cast<int>(colPositions.size()) - 1)];
        const ColPos& b = colPositions[rng_.randint(0, static_cast<int>(colPositions.size()) - 1)];
        if (a.x == b.x && a.y == b.y && a.z == b.z) continue;
        const float midX = (a.x + b.x) * 0.5f, midY = (a.y + b.y) * 0.5f, midZ = (a.z + b.z) * 0.5f;
        const float r = rng_.uniform(25.f, 55.f) * sf;
        const float th = rng_.uniform(10.f, 18.f) * sf;
        const ofVec3f j = jitter(state_.attachmentStress);
        auto& g = makeGroup(machineRoot_);
        g.setPosition(midX + j.x, midY + rng_.uniform(-40.f, 40.f) + j.y, midZ + j.z);
        const float px = g.getPosition().x, py = g.getPosition().y, pz = g.getPosition().z;
        const float st = state_.attachmentStress;
        addCyl(g, r, th * 0.5f, px, py, pz, 80.f, 130.f, 75.f, t, st);
        auto& inner = makeGroup(g);
        addCyl(inner, r * 0.7f, th * 1.2f, px, py, pz, 200.f, 90.f, 60.f, t, st);
        addSpinner(g, 'y', (rng_.choice("+-", 2) == '-' ? -1.f : 1.f) * rng_.uniform(0.4f, 1.f), "attachment");
    }

    for (int i = 0; i < state_.gRodCount; ++i) {
        if (colPositions.size() < 2) break;
        const ColPos& a = colPositions[rng_.randint(0, static_cast<int>(colPositions.size()) - 1)];
        const ColPos& b = colPositions[rng_.randint(0, static_cast<int>(colPositions.size()) - 1)];
        if (a.x == b.x && a.y == b.y && a.z == b.z) continue;
        const float dx = b.x - a.x, dy = b.y - a.y, dz = b.z - a.z;
        const float len = std::sqrt(dx * dx + dy * dy + dz * dz);
        const float midX = (a.x + b.x) * 0.5f, midY = (a.y + b.y) * 0.5f, midZ = (a.z + b.z) * 0.5f;
        const float rotY = std::atan2(dx, dz);
        const float rotX = std::atan2(-dy, std::sqrt(dz * dz + dx * dx));
        const float radius = rng_.uniform(5.f, 9.f) * sf;
        const ofVec3f jR = jitter(state_.egoStress);
        auto& g = makeGroup(machineRoot_);
        g.setPosition(midX + jR.x, midY + jR.y, midZ + jR.z);
        g.setOrientation(glm::angleAxis(rotX, glm::vec3(1, 0, 0)) * glm::angleAxis(rotY, glm::vec3(0, 1, 0)));
        addCyl(g, radius, len, midX, midY, midZ, 210.f, 160.f, 70.f, t, state_.egoStress);

        const float rAng = richness(state_.angerVal);
        const float rAtt = richness(state_.attachmentVal);
        const float eff = rAtt <= 0.f ? 0.f : rAng;
        const int nG = static_cast<int>(std::floor(mapf(eff, 0.f, 1.f, 0.f, 8.f)));
        const int nP = static_cast<int>(std::floor(mapf(rAtt, 0.f, 1.f, 0.f, 8.f)));
        const int total = nG + nP;
        int gc = 0, pc = 0, idx = 0;
        while (idx < total) {
            std::string kind;
            if (gc < nG && pc < nP)
                kind = rng_.random() * (nG - gc + nP - pc) < (nG - gc) ? "gear" : "pulley";
            else
                kind = gc < nG ? "gear" : "pulley";

            auto& attG = makeGroup(g);
            attG.setPosition(0, ((idx + 1.f) / (total + 1.f) - 0.5f) * len, 0);
            const bool isG = kind == "gear";
            const float aS = isG ? state_.angerStress : state_.attachmentStress;
            const ofVec3f jA = jitter(aS);
            attG.setPosition(attG.getPosition() + jA);
            const float attR = radius * rng_.uniform(1.4f, 2.2f);
            const float attT = radius * rng_.uniform(0.6f, 1.3f);
            const bool horiz = rng_.random() < 0.5f;
            if (horiz) attG.setOrientation(glm::angleAxis(rng_.uniform(0.f, kTau), glm::vec3(0, 1, 0)));
            else attG.setOrientation(glm::angleAxis(rng_.uniform(0.f, kTau), glm::vec3(1, 0, 0)));

            if (isG) {
                addCyl(attG, attR, attT, 0, 0, 0, horiz ? 15.f : 25.f, 150.f, 80.f, t, aS);
                buildGearTeeth(attG, attR, attT, rng_.randint(6, 14), 0, 0, 0, 30.f, 82.f, aS, t,
                               horiz ? 'y' : 'x');
                addSpinner(attG, horiz ? 'y' : 'x',
                           (rng_.choice("+-", 2) == '-' ? -1.f : 1.f) * rng_.uniform(0.3f, 1.f), "anger");
                gc++;
            } else {
                addCyl(attG, attR, attT * 0.5f, 0, 0, 0, 80.f, 130.f, 75.f, t, aS);
                auto& in2 = makeGroup(attG);
                addCyl(in2, attR * 0.7f, attT * 1.1f, 0, 0, 0, 200.f, 90.f, 60.f, t, aS);
                addSpinner(attG, 'y', (rng_.choice("+-", 2) == '-' ? -1.f : 1.f) * rng_.uniform(0.3f, 1.f),
                           "attachment");
                pc++;
            }
            idx++;
        }
    }

    state_.machineBuilt = true;
    builtSig_ = signature();
    snapToFloor();
}

void SurrenderMachine::update(float dt, bool active) {
    elapsed_ += dt;
    const float t = elapsed_;

    if (needsRebuild()) {
        buildMachine(t);
        syncRebuildFlags();
    }

    if (active) {
        const float smA = speedMult(state_.angerStress);
        const float smAt = speedMult(state_.attachmentStress);
        for (auto& s : spinners_) {
            const float sm = s.attachmentKind ? smAt : smA;
            const float d = -s.baseSpeed * sm * dt;
            if (s.axis == 'x') s.pivot->rotateRad(d, 1, 0, 0);
            else if (s.axis == 'y') s.pivot->rotateRad(d, 0, 1, 0);
            else s.pivot->rotateRad(d, 0, 0, 1);
        }
    }

    for (auto& p : parts_) {
        if (p->animated) applyFill(*p, t);
    }
}

void SurrenderMachine::draw() const {
    ofEnableDepthTest();
    ofEnableAlphaBlending();
    ofFill();

    for (const auto& p : parts_) {
        ofPushMatrix();
        p->node.transformGL();
        ofSetColor(p->color, p->alpha * 255.f);
        if (p->isBox) ofDrawBox(0, 0, 0, p->dim.x, p->dim.y, p->dim.z);
        else ofDrawCylinder(0, 0, 0, p->dim.x, p->dim.y);
        ofPopMatrix();
    }
}

} // namespace surrender
