#include "GhostRoomLinks.h"

#include <cmath>
#include <limits>

namespace ghost {

namespace {

constexpr float kWallT = 0.15f;
constexpr float kWallFace = kWallT * 0.5f + 0.002f;
constexpr float kTextPlaneSize = 7.f;

const char* kWalkMoonUrl =
    "https://mark-walhimer.com/sketches/loop-art-critique-2026/walk_moon_audio_standalone.html";
const char* kBuildingOutlineUrl =
    "https://mark-walhimer.com/sketches/loop-art-critique-2026/machine-aesthetic/building-outline-only.html";
const char* kSurrenderPdfUrl =
    "https://mark-walhimer.com/sketches/loop-art-critique-2026/machine-aesthetic/surrender-machine-ibm-mono.pdf";
const char* kTextCylinderUrl = "https://mark-walhimer.com/sketches/text11.html";

} // namespace

void GhostRoomLinks::setup() {
    planes_.clear();

    const float yMid = kRoomH * 0.5f;
    const float halfDoor = kDoorWidth * 0.5f;
    const float segD = kRD - halfDoor;

    // North wall — walk moon (normal +Z).
    addPlane({kRoomAX, yMid, -kRD + kWallFace},
             {0, 0, 1},
             {1, 0, 0},
             kRoomW * 0.5f,
             kRoomH * 0.5f,
             kWalkMoonUrl);

    // South wall — building outline (normal -Z).
    addPlane({kRoomAX, yMid, kRD - kWallFace},
             {0, 0, -1},
             {-1, 0, 0},
             kRoomW * 0.5f,
             kRoomH * 0.5f,
             kBuildingOutlineUrl);

    // East wall segment right of door — PDF (normal -X).
    addPlane({kRoomAX + kRW - kWallFace, yMid, halfDoor + segD * 0.5f},
             {-1, 0, 0},
             {0, 0, 1},
             segD * 0.5f,
             kRoomH * 0.5f,
             kSurrenderPdfUrl);

    // Text cylinder hit box (text-cylinder-core.mjs).
    addPlane({kRoomAX, 2.85f, 0.f},
             {0, 0, 1},
             {1, 0, 0},
             kTextPlaneSize * 0.35f,
             kTextPlaneSize * 0.35f,
             kTextCylinderUrl);
}

void GhostRoomLinks::addPlane(const ofVec3f& center, const ofVec3f& normal, const ofVec3f& tangent,
                              float halfW, float halfH, std::string url) {
    planes_.push_back({center, normal.getNormalized(), tangent.getNormalized(), halfW, halfH, std::move(url)});
}

bool GhostRoomLinks::intersectPlane(const ofVec3f& origin, const ofVec3f& dir, const PickPlane& plane,
                                    float& outT) {
    const float denom = dir.dot(plane.normal);
    if (std::abs(denom) < 1e-6f) return false;
    outT = (plane.center - origin).dot(plane.normal) / denom;
    if (outT < 0.f) return false;

    const ofVec3f hit = origin + dir * outT;
    const ofVec3f delta = hit - plane.center;
    const float u = delta.dot(plane.tangent);
    const ofVec3f bitangent = plane.normal.getCrossed(plane.tangent).normalize();
    const float v = delta.dot(bitangent);
    return std::abs(u) <= plane.halfW && std::abs(v) <= plane.halfH;
}

std::string GhostRoomLinks::pick(const ofCamera& cam, float screenX, float screenY) const {
    const ofVec3f origin = cam.screenToWorld(ofVec3f(screenX, screenY, 0.f));
    const ofVec3f farPt = cam.screenToWorld(ofVec3f(screenX, screenY, 1.f));
    ofVec3f dir = farPt - origin;
    if (dir.lengthSquared() < 1e-8f) return {};
    dir.normalize();

    float bestT = std::numeric_limits<float>::max();
    const PickPlane* best = nullptr;

    for (const auto& plane : planes_) {
        float t = 0.f;
        if (!intersectPlane(origin, dir, plane, t)) continue;
        if (t < bestT) {
            bestT = t;
            best = &plane;
        }
    }

    return best ? best->url : std::string{};
}

void GhostRoomLinks::openLink(const std::string& url) {
    if (url.empty()) return;
    ofLaunchBrowser(url);
}

} // namespace ghost
