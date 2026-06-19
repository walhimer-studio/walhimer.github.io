#include "GhostTextCylinder.h"

#include <algorithm>
#include <cmath>
#include <vector>

namespace ghost {

namespace {

constexpr float kCanvasRef = 1450.f;
constexpr float kLetterHScale = 0.45f;
constexpr float kCamZ = 1000.f;
constexpr float kTwoPi = 6.28318530718f;

bool loadSansFont(ofTrueTypeFont& font, int size) {
    static const char* kPaths[] = {
        "/System/Library/Fonts/Helvetica.ttc",
        "/System/Library/Fonts/Supplemental/Arial.ttf",
        "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
        "/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf",
    };
    for (const char* p : kPaths) {
        if (ofFile::doesFileExist(p) && font.load(p, size)) return true;
    }
    return font.load("", size);
}

} // namespace

ofColor GhostTextCylinder::letterColor(bool facing) const {
    return facing ? ofColor(255) : ofColor(136);
}

bool GhostTextCylinder::setup() {
    ofFboSettings settings;
    settings.width = kCanvasSize;
    settings.height = kCanvasSize;
    settings.internalformat = GL_RGBA;
    settings.useDepth = false;
    settings.useStencil = false;
    fbo_.allocate(settings);
    if (!fbo_.isAllocated()) return false;

    const int fontPx = static_cast<int>(baseFontSize_ * (kCanvasSize / kCanvasRef));
    if (!loadSansFont(font_, fontPx)) return false;

    // Defer first FBO text draw until update() — GL/font mesh can crash if rendered in setup().
    return true;
}

void GhostTextCylinder::renderFrame() {
    const float sc = kCanvasSize / kCanvasRef;
    const float cx = kCanvasSize * 0.5f;
    const float cy = kCanvasSize * 0.5f;
    const float step = kTwoPi / static_cast<float>(phrase_.size());
    const float cosA = std::cos(angle_);
    const float sinA = std::sin(angle_);
    const float midRow = (rows_ - 1) * 0.5f;
    const float cosTilt = std::cos(tiltAngle_);
    const float sinTilt = std::sin(tiltAngle_);

    std::vector<LetterDraw> drawn;
    drawn.reserve(phrase_.size() * static_cast<size_t>(rows_));

    for (int row = 0; row < rows_; ++row) {
        const float rowY3D = (row - midRow) * rowSpacing_;
        const float twist = row * 0.12f;

        for (size_t j = 0; j < phrase_.size(); ++j) {
            const float a = -static_cast<float>(j) * step + twist;
            const float x = std::cos(a) * radius_;
            const float z = std::sin(a) * radius_;

            const float rx = x * cosA - z * sinA;
            const float rz = x * sinA + z * cosA;
            const float ry = rowY3D * cosTilt - rz * sinTilt;
            const float rz2 = rowY3D * sinTilt + rz * cosTilt;

            const float depth = kCamZ - rz2;
            const float scale = kCamZ / depth;
            const float sx = cx + rx * scale * sc;
            const float sy = cy + ry * scale * sc;
            const bool facing = rz > 0.f;
            const float foreshorten = std::abs(rz) / (radius_ > 0.f ? radius_ : 1.f);

            drawn.push_back({std::string(1, phrase_[j]), sx, sy, scale, rz2, foreshorten, facing});
        }
    }

    std::sort(drawn.begin(), drawn.end(), [](const LetterDraw& a, const LetterDraw& b) {
        return a.rz2 < b.rz2;
    });

    fbo_.begin();
    ofClear(0, 0, 0, 0);
    ofEnableAlphaBlending();
    ofPushStyle();

    for (const auto& d : drawn) {
        ofSetColor(letterColor(d.facing), d.facing ? 255 : 140);
        ofPushMatrix();
        ofTranslate(d.sx, d.sy);
        const float hScale = kLetterHScale * d.foreshorten;
        if (!d.facing) ofScale(-hScale * d.scale, d.scale);
        else ofScale(hScale * d.scale, d.scale);
        const auto bb = font_.getStringBoundingBox(d.ch, 0, 0);
        font_.drawString(d.ch, -bb.width * 0.5f, bb.height * 0.35f);
        ofPopMatrix();
    }

    ofPopStyle();
    fbo_.end();
}

void GhostTextCylinder::update(float dt, const ofVec3f& cameraPos) {
    angle_ += kRotSpeed * dt;
    renderFrame();
    (void)cameraPos;
}

void GhostTextCylinder::draw(const ofVec3f& cameraPos) const {
    if (!fbo_.isAllocated()) return;

    ofPushMatrix();
    ofTranslate(position_);
    const ofVec3f toCam = cameraPos - position_;
    const float yaw = std::atan2(toCam.x, toCam.z);
    ofRotateRad(yaw, 0, 1, 0);

    ofEnableDepthTest();
    ofEnableAlphaBlending();
    ofSetColor(255);
    fbo_.draw(-kPlaneSize * 0.5f, -kPlaneSize * 0.5f, kPlaneSize, kPlaneSize);
    ofPopMatrix();
}

} // namespace ghost
