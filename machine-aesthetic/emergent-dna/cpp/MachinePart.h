#pragma once

#include "ofMain.h"

// The Artist defines the Part — mesh, friction, how it yields as energy drops.
class MachinePart {
public:
    ofVec3f position;
    ofVec3f axis = ofVec3f(0, 0, 1);
    float radius = 24.f;
    float friction = 0.2f;
    float rpm = 12.f;
    float angle = 0.f;
    ofMesh mesh;

    void buildMesh() {
        mesh.clear();
        mesh.setMode(OF_PRIMITIVE_LINE_LOOP);
        const int segments = 24;
        for (int i = 0; i < segments; ++i) {
            const float t = static_cast<float>(i) / segments * TWO_PI;
            mesh.addVertex(ofVec3f(cosf(t) * radius, sinf(t) * radius, 0.f));
        }
    }

    // Part slows as organism energy drops.
    void update(float dt, float energy) {
        const float drag = friction * (1.f - energy);
        rpm *= (1.f - drag * dt * 2.f);
        angle += rpm * dt * TWO_PI / 60.f;
    }

    void draw() const {
        ofPushMatrix();
        ofTranslate(position);
        ofRotateRad(angle, axis.x, axis.y, axis.z);
        ofSetColor(255);
        mesh.drawWireframe();
        ofPopMatrix();
    }
};
