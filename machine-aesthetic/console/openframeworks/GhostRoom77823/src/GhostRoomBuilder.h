#pragma once

#include "GhostRoomLayout.h"

#include <vector>

namespace ghost {

class GhostRoomBuilder {
public:
    void build(ofNode& root, bool includeRoomA = true, bool includeRoomC = true);

    void drawSolid() const;
    void drawEdges() const;

private:
    struct Box {
        ofVec3f pos;
        ofVec3f size;
        ofColor color;
    };
    struct Edge {
        ofVec3f a, b;
        ofColor color;
    };

    std::vector<Box> boxes_;
    std::vector<Edge> edges_;

    void addRoom(float cx, float cz, bool blackRoom, bool doorWest, bool doorEast);
    void addHall(float x0, float x1, bool blackStyle);
    void addEdgesForBox(float cx, float cz, float hw, float hd, float height, bool whiteEdges);
};

} // namespace ghost
