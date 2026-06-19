#include "GhostWireBuilder.h"

#include <algorithm>
#include <cmath>
#include <vector>

namespace ghost {

ofMesh& GhostWireBuilder::currentMesh() {
    ofNode* node = stack_.back();
    for (auto& s : spinners_) {
        if (&s->pivot == node) return s->mesh;
    }
    if (staticMeshes_.empty() || staticMeshes_.back().second != lineColor_) {
        ofMesh m;
        m.setMode(OF_PRIMITIVE_LINES);
        staticMeshes_.emplace_back(m, lineColor_);
    }
    return staticMeshes_.back().first;
}

void GhostWireBuilder::addLineToMesh(ofMesh& mesh, const ofVec3f& a, const ofVec3f& b) {
    mesh.addVertex(a);
    mesh.addVertex(b);
}

void GhostWireBuilder::seg(const ofVec3f& a, const ofVec3f& b, float /*opacity*/) {
    addLineToMesh(currentMesh(), a, b);
}

void GhostWireBuilder::spoly(const std::vector<ofVec3f>& pts, bool close, float opacity) {
    const int n = static_cast<int>(pts.size());
    for (int i = 0; i < n; ++i) {
        const int j = (i + 1) % n;
        if (!close && i == n - 1) break;
        seg(pts[i], pts[j], opacity);
    }
}

void GhostWireBuilder::box(float x, float y, float z, float bw, float bh, float bd) {
    const ofVec3f c[8] = {
        {x, y, z}, {x + bw, y, z}, {x + bw, y, z + bd}, {x, y, z + bd},
        {x, y + bh, z}, {x + bw, y + bh, z}, {x + bw, y + bh, z + bd}, {x, y + bh, z + bd},
    };
    const int solid[9][2] = {{0,1},{0,3},{0,4},{1,5},{3,7},{4,5},{4,7},{5,6},{6,7}};
    const int hidden[3][2] = {{1,2},{2,3},{2,6}};
    for (auto& e : solid) seg(c[e[0]], c[e[1]]);
    for (auto& e : hidden) seg(c[e[0]], c[e[1]], 0.45f);
}

void GhostWireBuilder::disk(float cx, float cy, float cz, float r, char plane, int n) {
    std::vector<ofVec3f> pts;
    pts.reserve(n);
    for (int i = 0; i < n; ++i) pts.push_back(cpt(cx, cy, cz, r, plane, i, n));
    spoly(pts, true);
}

void GhostWireBuilder::cyl(float cx, float cy, float cz, float r, float h, int n, int ribs) {
    std::vector<ofVec3f> bot, top;
    for (int i = 0; i < n; ++i) {
        bot.push_back(cpt(cx, cy, cz, r, 'x', i, n));
        top.push_back(cpt(cx, cy + h, cz, r, 'x', i, n));
    }
    int li = 0, ri = 0;
    for (int i = 1; i < n; ++i) {
        if (bot[i].x < bot[li].x) li = i;
        if (bot[i].x > bot[ri].x) ri = i;
    }
    spoly(bot, true);
    spoly(top, true);
    seg(bot[li], top[li]);
    seg(bot[ri], top[ri]);
    if (ribs > 0) {
        const int step = std::max(1, n / ribs);
        for (int i = 0; i < n; i += step) seg(bot[i], top[i], 0.35f);
    }
}

void GhostWireBuilder::cylX(float cx, float cy, float cz, float r, float length, int n) {
    std::vector<ofVec3f> lpts, rpts;
    for (int i = 0; i < n; ++i) {
        const float a = kTau * i / n;
        lpts.emplace_back(cx - length * 0.5f, cy + r * std::sin(a), cz + r * std::cos(a));
        rpts.emplace_back(cx + length * 0.5f, cy + r * std::sin(a), cz + r * std::cos(a));
    }
    int ti = 0, bi = 0;
    for (int i = 1; i < n; ++i) {
        if (lpts[i].y < lpts[ti].y) ti = i;
        if (lpts[i].y > lpts[bi].y) bi = i;
    }
    spoly(lpts, true);
    spoly(rpts, true);
    seg(lpts[ti], rpts[ti]);
    seg(lpts[bi], rpts[bi]);
}

void GhostWireBuilder::cylZ(float cx, float cy, float cz, float r, float length, int n) {
    std::vector<ofVec3f> lpts, rpts;
    for (int i = 0; i < n; ++i) {
        const float a = kTau * i / n;
        lpts.emplace_back(cx + r * std::cos(a), cy + r * std::sin(a), cz - length * 0.5f);
        rpts.emplace_back(cx + r * std::cos(a), cy + r * std::sin(a), cz + length * 0.5f);
    }
    int ti = 0, bi = 0;
    for (int i = 1; i < n; ++i) {
        if (lpts[i].y < lpts[ti].y) ti = i;
        if (lpts[i].y > lpts[bi].y) bi = i;
    }
    spoly(lpts, true);
    spoly(rpts, true);
    seg(lpts[ti], rpts[ti]);
    seg(lpts[bi], rpts[bi]);
}

void GhostWireBuilder::ringXZ(float cx, float cy, float cz, float rOut, float rIn, float h, int n) {
    for (float yy : {cy, cy + h}) {
        std::vector<ofVec3f> o, in;
        for (int i = 0; i < n; ++i) {
            o.push_back(cpt(cx, yy, cz, rOut, 'x', i, n));
            in.push_back(cpt(cx, yy, cz, rIn, 'x', i, n));
        }
        spoly(o, true);
        spoly(in, true, 0.65f);
    }
    std::vector<ofVec3f> botO, topO;
    for (int i = 0; i < n; ++i) {
        botO.push_back(cpt(cx, cy, cz, rOut, 'x', i, n));
        topO.push_back(cpt(cx, cy + h, cz, rOut, 'x', i, n));
    }
    int li = 0, ri = 0;
    for (int i = 1; i < n; ++i) {
        if (botO[i].x < botO[li].x) li = i;
        if (botO[i].x > botO[ri].x) ri = i;
    }
    seg(botO[li], topO[li]);
    seg(botO[ri], topO[ri]);
}

void GhostWireBuilder::gearRingXZ(float cx, float cy, float cz, float r, int teeth, float th) {
    ringXZ(cx, cy, cz, r, r * 0.82f, th, 64);
    const float thR = r * 0.078f;
    for (int i = 0; i < teeth; ++i) {
        const float a1 = kTau * (i - 0.4f) / teeth;
        const float a2 = kTau * (i + 0.4f) / teeth;
        auto tp = [&](float a, float rr, float yy) {
            return ofVec3f(cx + rr * std::cos(a), yy, cz + rr * std::sin(a));
        };
        spoly({tp(a1, r, cy + th), tp(a2, r, cy + th), tp(a2, r + thR, cy + th), tp(a1, r + thR, cy + th)}, true, 0.75f);
        seg(tp(a1, r + thR, cy), tp(a1, r + thR, cy + th), 0.55f);
    }
}

void GhostWireBuilder::gearRingXY(float cx, float cy, float cz, float r, int teeth, float th) {
    const int n = 64;
    std::vector<ofVec3f> ptsF, ptsB;
    for (int i = 0; i < n; ++i) {
        ptsF.push_back(cpt(cx, cy, cz, r, 'y', i, n));
        ptsB.push_back(cpt(cx, cy, cz + th, r, 'y', i, n));
    }
    spoly(ptsF, true);
    spoly(ptsB, true, 0.55f);
    disk(cx, cy, cz, r * 0.82f, 'y', n);
}

void GhostWireBuilder::gearRingYZ(float cx, float cy, float cz, float r, int teeth, float th) {
    const int n = 72;
    auto yz = [&](float dx, float rr) {
        std::vector<ofVec3f> out;
        for (int i = 0; i < n; ++i) {
            const float a = kTau * i / n;
            out.emplace_back(cx + dx, cy + rr * std::sin(a), cz + rr * std::cos(a));
        }
        return out;
    };
    spoly(yz(0, r), true);
    spoly(yz(th, r), true, 0.55f);
}

void GhostWireBuilder::gearXZ(float cx, float cy, float cz, float r, int teeth, float th) {
    const float thR = r * 0.12f;
    for (int i = 0; i < teeth; ++i) {
        const float a1 = kTau * (i - 0.38f) / teeth;
        const float a2 = kTau * (i + 0.38f) / teeth;
        auto tp = [&](float a, float rr, float yy) {
            return ofVec3f(cx + rr * std::cos(a), yy, cz + rr * std::sin(a));
        };
        spoly({tp(a1, r, cy + th), tp(a2, r, cy + th), tp(a2, r + thR, cy + th), tp(a1, r + thR, cy + th)}, true, 0.75f);
        seg(tp(a1, r + thR, cy), tp(a1, r + thR, cy + th), 0.5f);
    }
    disk(cx, cy, cz, r, 'x', 48);
    disk(cx, cy + th, cz, r * 0.88f, 'x', 48);
    disk(cx, cy + th, cz, r * 0.18f, 'x', 48);
}

void GhostWireBuilder::spokes(float cx, float cy, float cz, float r, int n, char plane) {
    for (int i = 0; i < n; ++i) {
        const float a = (3.14159265f * i) / n;
        if (plane == 'x') {
            seg({cx + r * std::cos(a), cy, cz + r * std::sin(a)}, {cx - r * std::cos(a), cy, cz - r * std::sin(a)}, 0.4f);
        } else if (plane == 'z') {
            seg({cx, cy + r * std::sin(a), cz + r * std::cos(a)}, {cx, cy - r * std::sin(a), cz - r * std::cos(a)}, 0.4f);
        } else {
            seg({cx + r * std::cos(a), cy + r * std::sin(a), cz}, {cx - r * std::cos(a), cy - r * std::sin(a), cz}, 0.4f);
        }
    }
}

void GhostWireBuilder::pipe(const ofVec3f& a, const ofVec3f& b) { seg(a, b); }

float spinDur(GhostRng& rng, float lo, float hi) { return rng.uniform(lo, hi); }

void drawMachine(GhostWireBuilder& w, GhostRng& rng) {
    float baseTop = 0.f;
    const int nLayers = rng.randint(3, 6);
    const float baseW = rng.uniform(5.5f, 7.5f);
    const float baseD = rng.uniform(3.5f, 5.f);
    for (int i = 0; i < nLayers; ++i) {
        const float shrink = i * rng.uniform(0.12f, 0.22f);
        float yOff = 0.f;
        for (int j = 0; j < i; ++j) yOff += rng.uniform(0.12f, 0.26f);
        w.box(-baseW * 0.5f + shrink, yOff, -baseD * 0.5f + shrink,
              baseW - shrink * 2.f, rng.uniform(0.12f, 0.26f), baseD - shrink * 2.f);
    }
    for (int i = 0; i < nLayers; ++i) baseTop += rng.uniform(0.12f, 0.26f);

    const float outerR = rng.uniform(2.2f, 3.4f);
    const int outerTeeth = rng.randint(36, 60);
    const float outerTh = rng.uniform(0.18f, 0.32f);
    const float outerY = rng.uniform(1.4f, 2.2f);
    const float outerOx = rng.uniform(-0.5f, 0.5f);
    const float outerOz = rng.uniform(-0.5f, 0.5f);

    w.pushSpin(outerOx, outerY, outerOz, 'y', spinDur(rng, 18, 26), rng.chance(0.5f));
    w.setColor(Palette::lightBlue());
    w.gearRingXZ(0, 0, 0, outerR, outerTeeth, outerTh);
    w.spokes(0, outerTh * 0.5f, 0, outerR * 0.88f, rng.randint(5, 10), 'x');
    w.resetColor();
    w.popSpin();

    const int nRings = rng.randint(8, 14);
    const char planes[] = {'x', 'x', 'y', 'y', 'z', 'z'};
    for (int i = 0; i < nRings; ++i) {
        const float r = rng.uniform(0.4f, outerR - 0.3f);
        const int teeth = rng.randint(8, 44);
        const float y = rng.uniform(baseTop, outerY + 1.5f);
        const float th = rng.uniform(0.08f, 0.24f);
        const float ox = rng.uniform(-0.6f, 0.6f);
        const float oz = rng.uniform(-0.6f, 0.6f);
        const char plane = planes[rng.randint(0, 5)];
        const char axis = plane == 'x' ? 'y' : (plane == 'y' ? 'z' : 'x');
        w.pushSpin(ox, y, oz, axis, spinDur(rng, 8, 18), rng.chance(0.5f));
        if (i % 5 == 0) w.setColor(Palette::maroon());
        if (plane == 'x') w.gearRingXZ(0, 0, 0, r, teeth, th);
        else if (plane == 'y') w.gearRingXY(0, 0, 0, r, teeth, th);
        else w.gearRingYZ(0, 0, 0, r, teeth, th);
        w.resetColor();
        w.popSpin();
    }

    const int nBoxes = rng.randint(10, 20);
    for (int i = 0; i < nBoxes; ++i) {
        w.box(rng.uniform(-2.8f, 1.5f), rng.uniform(baseTop, 3.f), rng.uniform(-1.5f, 1.5f),
              rng.uniform(0.4f, 2.5f), rng.uniform(0.3f, 2.f), rng.uniform(0.3f, 2.f));
    }

    const int nTowers = rng.randint(12, 20);
    std::vector<std::array<float, 3>> towers;
    for (int i = 0; i < nTowers; ++i) {
        towers.push_back({rng.uniform(-2.4f, 2.2f), baseTop, rng.uniform(-1.2f, 1.2f)});
    }
    for (int ti = 0; ti < static_cast<int>(towers.size()); ++ti) {
        const float tx = towers[ti][0], ty = towers[ti][1], tz = towers[ti][2];
        const float th = rng.uniform(2.f, 4.5f);
        w.setColor(Palette::navy());
        w.cyl(tx, ty, tz, 0.1f, th, 48, 0);
        w.resetColor();
        const int nG = rng.randint(2, 6);
        for (int j = 0; j < nG; ++j) {
            const float gy = ty + (th * (j + 1)) / (nG + 1) + rng.uniform(-0.12f, 0.12f);
            const float gr = rng.uniform(0.28f, 1.3f);
            const int gt = rng.randint(6, 24);
            const float gth = rng.uniform(0.07f, 0.22f);
            w.pushSpin(tx, gy, tz, 'y', spinDur(rng, 5, 11), rng.chance(0.5f));
            if (ti == 0 && j == 0) w.setColor(Palette::gold());
            w.gearXZ(0, 0, 0, gr, gt, gth);
            w.resetColor();
            w.popSpin();
        }
    }

    const float discStep = rng.uniform(0.16f, 0.28f);
    const float discShrink = rng.uniform(0.12f, 0.22f);
    const int nDiscs = rng.randint(10, 20);
    for (int i = 0; i < nDiscs; ++i) {
        const float yy = baseTop + i * discStep;
        const float r = outerR * 0.92f - i * discShrink;
        if (r > 0.15f) {
            w.pushSpin(rng.uniform(-0.3f, 0.3f), yy, rng.uniform(-0.3f, 0.3f), 'y', spinDur(rng, 10, 20), rng.chance(0.5f));
            w.disk(0, 0, 0, r, 'x', 48);
            w.popSpin();
        }
    }

    struct CylCfg { float r, h; int ribs; };
    std::vector<CylCfg> cylConfigs;
    for (int i = 0; i < rng.randint(6, 10); ++i) {
        cylConfigs.push_back({rng.uniform(0.1f, 2.8f), rng.uniform(0.3f, 4.2f), rng.randint(2, 14)});
    }
    std::sort(cylConfigs.begin(), cylConfigs.end(), [](const CylCfg& a, const CylCfg& b) { return a.r > b.r; });
    for (int ci = 0; ci < static_cast<int>(cylConfigs.size()); ++ci) {
        if (ci == 0) w.setColor(Palette::skyBlue());
        w.cyl(rng.uniform(-0.4f, 0.4f), baseTop, rng.uniform(-0.4f, 0.4f),
              cylConfigs[ci].r, cylConfigs[ci].h, 48, cylConfigs[ci].ribs);
        w.resetColor();
    }

    for (int i = 0; i < rng.randint(4, 8); ++i) {
        w.cyl(rng.uniform(-2.2f, 2.2f), baseTop, rng.uniform(-1.5f, 1.5f),
              rng.uniform(0.3f, 1.f), rng.uniform(0.8f, 2.8f), 48, rng.randint(2, 6));
    }
    for (int i = 0; i < rng.randint(4, 8); ++i) {
        w.cylX(rng.uniform(-0.5f, 0.5f), rng.uniform(baseTop + 0.3f, 3.5f), rng.uniform(-0.8f, 0.8f),
               rng.uniform(0.18f, 0.5f), rng.uniform(2.5f, 5.5f), 32);
    }
    for (int i = 0; i < rng.randint(2, 5); ++i) {
        w.cylZ(rng.uniform(-0.5f, 0.5f), rng.uniform(baseTop + 0.3f, 3.5f), rng.uniform(-0.4f, 0.4f),
               rng.uniform(0.2f, 0.45f), rng.uniform(2.5f, 4.5f), 32);
    }

    const char facePlanes[] = {'z', 'z', 'y', 'y', 'z'};
    for (int i = 0; i < rng.randint(8, 16); ++i) {
        const char plane = facePlanes[rng.randint(0, 4)];
        const float cx = plane == 'z' ? (rng.chance(0.5f) ? -2.2f : 2.2f) : rng.uniform(-1.5f, 1.5f);
        const float cy = rng.uniform(baseTop + 0.2f, 3.f);
        const float cz = plane == 'z' ? rng.uniform(-1.2f, 1.2f) : (rng.chance(0.5f) ? -1.2f : 1.2f);
        const float r = rng.uniform(0.3f, 1.05f);
        const char axis = plane == 'y' ? 'z' : 'x';
        w.pushSpin(cx, cy, cz, axis, spinDur(rng, 6, 12), rng.chance(0.5f));
        w.disk(0, 0, 0, r, plane, 48);
        w.disk(0, 0, 0, r * 0.55f, plane, 48);
        w.spokes(0, 0, 0, r * 0.48f, rng.randint(4, 8), plane);
        w.popSpin();
    }

    const int nPipes = rng.randint(14, 24);
    std::vector<ofVec3f> anchors;
    for (int i = 0; i < nPipes * 2; ++i) {
        anchors.emplace_back(rng.uniform(-2.5f, 2.5f), rng.uniform(baseTop + 0.5f, 4.f), rng.uniform(-1.5f, 1.5f));
    }
    for (int i = 0; i < nPipes; ++i) w.pipe(anchors[i * 2], anchors[i * 2 + 1]);

    for (int i = 0; i < rng.randint(16, 28); ++i) {
        w.box(rng.uniform(-2.6f, 2.6f), rng.uniform(baseTop, 3.8f), rng.uniform(-1.6f, 1.6f),
              rng.uniform(0.12f, 0.6f), rng.uniform(0.08f, 0.42f), rng.uniform(0.12f, 0.48f));
    }
}

} // namespace ghost
