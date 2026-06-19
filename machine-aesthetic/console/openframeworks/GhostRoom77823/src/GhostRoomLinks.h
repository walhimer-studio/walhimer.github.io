#pragma once

#include "GhostRoomLayout.h"

namespace ghost {

/** Ray pick + open browser links matching ghost_dense_77823_room.mjs. */
class GhostRoomLinks {
public:
    void setup();

    /** Returns link URL if a pick target was hit, else empty. */
    std::string pick(const ofCamera& cam, float screenX, float screenY) const;

    static void openLink(const std::string& url);

private:
    struct PickPlane {
        ofVec3f center;
        ofVec3f normal;
        ofVec3f tangent;
        float halfW = 0.f;
        float halfH = 0.f;
        std::string url;
    };

    std::vector<PickPlane> planes_;

    void addPlane(const ofVec3f& center, const ofVec3f& normal, const ofVec3f& tangent, float halfW,
                  float halfH, std::string url);
    static bool intersectPlane(const ofVec3f& origin, const ofVec3f& dir, const PickPlane& plane,
                               float& outT);
};

} // namespace ghost
