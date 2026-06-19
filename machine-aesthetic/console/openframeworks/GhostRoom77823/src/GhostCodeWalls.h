#pragma once

#include "GhostRoomLayout.h"

namespace ghost {

/** Code-mural wallpaper planes — Room A + hall A–B (matches ghost-machine-core.mjs). */
class GhostCodeWalls {
public:
    bool load(const std::string& pngPath);
    void draw() const;
    bool ready() const { return texture_.isAllocated(); }

private:
    struct Plane {
        ofVec3f pos;
        float rotY;
        float width;
        float height;
    };

    ofTexture texture_;
    std::vector<Plane> planes_;

    void addPlanesForRoomA();
    void addPlanesForHallAB();
    void drawPlane(const Plane& p) const;
};

} // namespace ghost
