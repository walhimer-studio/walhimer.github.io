#pragma once

#include "GhostRoomLayout.h"
#include "GhostRng.h"

#include <memory>
#include <vector>

namespace ghost {

inline constexpr float kTau = 6.28318530718f;

inline ofVec3f cpt(float cx, float cy, float cz, float r, char plane, int i, int n) {
    const float a = kTau * static_cast<float>(i) / static_cast<float>(n);
    if (plane == 'x') return {cx + r * std::cos(a), cy, cz + r * std::sin(a)};
    if (plane == 'y') return {cx + r * std::cos(a), cy + r * std::sin(a), cz};
    return {cx, cy + r * std::sin(a), cz + r * std::cos(a)};
}

struct GhostSpinner {
    ofNode pivot;
    ofMesh mesh;
    char axis = 'y';
    float speed = 0.f;
};

class GhostWireBuilder {
public:
    explicit GhostWireBuilder(ofNode& root) : root_(root) {
        stack_.push_back(&staticRoot_);
        staticRoot_.setParent(root_);
    }

    void setColor(const ofColor& c) { lineColor_ = c; }
    void resetColor() { lineColor_ = Palette::ink(); }

    void pushSpin(float px, float py, float pz, char axis, float durationSec, bool reverse) {
        auto spinner = std::make_shared<GhostSpinner>();
        spinner->pivot.setPosition(px, py, pz);
        spinner->axis = axis;
        spinner->speed = (reverse ? -1.f : 1.f) * (kTau / durationSec);
        spinner->pivot.setParent(root_);
        stack_.push_back(&spinner->pivot);
        spinners_.push_back(spinner);
    }

    void popSpin() {
        if (stack_.size() <= 1) return;
        stack_.pop_back();
    }

    void updateSpinners(float dt) {
        for (auto& s : spinners_) {
            const float d = s->speed * dt;
            if (s->axis == 'x') s->pivot.rotateRad(d, 1, 0, 0);
            else if (s->axis == 'y') s->pivot.rotateRad(d, 0, 1, 0);
            else s->pivot.rotateRad(d, 0, 0, 1);
        }
    }

    void draw() {
        ofPushMatrix();
        staticRoot_.transformGL();
        for (auto& mesh : staticMeshes_) {
            ofSetColor(mesh.second);
            mesh.first.drawWireframe();
        }
        ofPopMatrix();
        for (auto& s : spinners_) {
            ofPushMatrix();
            s->pivot.transformGL();
            ofSetColor(Palette::ink());
            s->mesh.drawWireframe();
            ofPopMatrix();
        }
    }

    const std::vector<std::shared_ptr<GhostSpinner>>& spinners() const { return spinners_; }

    void seg(const ofVec3f& a, const ofVec3f& b, float opacity = 1.f);
    void spoly(const std::vector<ofVec3f>& pts, bool close, float opacity = 1.f);
    void box(float x, float y, float z, float bw, float bh, float bd);
    void disk(float cx, float cy, float cz, float r, char plane, int n);
    void cyl(float cx, float cy, float cz, float r, float h, int n, int ribs);
    void cylX(float cx, float cy, float cz, float r, float length, int n);
    void cylZ(float cx, float cy, float cz, float r, float length, int n);
    void ringXZ(float cx, float cy, float cz, float rOut, float rIn, float h, int n);
    void gearRingXZ(float cx, float cy, float cz, float r, int teeth, float th);
    void gearRingXY(float cx, float cy, float cz, float r, int teeth, float th);
    void gearRingYZ(float cx, float cy, float cz, float r, int teeth, float th);
    void gearXZ(float cx, float cy, float cz, float r, int teeth, float th);
    void spokes(float cx, float cy, float cz, float r, int n, char plane);
    void pipe(const ofVec3f& a, const ofVec3f& b);

private:
    ofNode& root_;
    ofNode staticRoot_;
    std::vector<ofNode*> stack_;
    ofColor lineColor_ = Palette::ink();
    std::vector<std::pair<ofMesh, ofColor>> staticMeshes_;
    std::vector<std::shared_ptr<GhostSpinner>> spinners_;

    ofMesh& currentMesh();
    void addLineToMesh(ofMesh& mesh, const ofVec3f& a, const ofVec3f& b);
};

float spinDur(GhostRng& rng, float lo, float hi);
void drawMachine(GhostWireBuilder& w, GhostRng& rng);

} // namespace ghost
