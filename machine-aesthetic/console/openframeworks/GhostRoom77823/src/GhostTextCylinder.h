#pragma once

#include "GhostRoomLayout.h"

namespace ghost {

/** text11 word cylinder — canvas illusion on a billboard (text-cylinder-core.mjs). */
class GhostTextCylinder {
public:
    bool setup();
    void update(float dt, const ofVec3f& cameraPos);
    void draw(const ofVec3f& cameraPos) const;

private:
    static constexpr int kCanvasSize = 1024;
    static constexpr float kPlaneSize = 7.f;
    static constexpr float kRotSpeed = 0.55f;

    ofFbo fbo_;
    ofTrueTypeFont font_;
    ofVec3f position_{kRoomAX, 2.85f, 0.f};
    float angle_ = 0.f;

    std::string phrase_ = "ME - I WILL NOT BECOME THEIR NARRATIVE ";
    int rows_ = 8;
    float radius_ = 320.f;
    float rowSpacing_ = 88.f;
    float baseFontSize_ = 64.f;
    float tiltAngle_ = 0.14f;

    struct LetterDraw {
        std::string ch;
        float sx, sy, scale, rz2, foreshorten;
        bool facing;
    };

    void renderFrame();
    ofColor letterColor(bool facing) const;
};

} // namespace ghost
