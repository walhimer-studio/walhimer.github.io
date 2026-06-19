#pragma once

#include "GhostRoomLayout.h"

namespace ghost {

/** Walk moon + building outline panels on Room A N/S walls (ghost_dense_77823_room.mjs). */
class GhostWallPanels {
public:
    bool load(const std::string& walkMoonPng, const std::string& buildingOutlinePng);
    void draw() const;
    bool ready() const { return walkMoon_.isAllocated() && buildingOutline_.isAllocated(); }

private:
    struct Panel {
        ofTexture* texture = nullptr;
        ofVec3f pos;
        float rotY = 0.f;
        float width = 0.f;
        float height = 0.f;
    };

    ofTexture walkMoon_;
    ofTexture buildingOutline_;
    Panel walkMoonPanel_;
    Panel buildingOutlinePanel_;

    void drawPanel(const Panel& panel) const;
};

} // namespace ghost
