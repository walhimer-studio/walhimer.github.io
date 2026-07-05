#pragma once

#include "ofMain.h"
#include "ofxOsc.h"

#include <cmath>
#include <string>

// Machine DNA — Holes in the Sky (C++ brain mirrors JS kernel + eclipse clock).

struct HolesTraits {
    float sky = 0.62f;
    float obscuration = 0.f;
    float atmosphere = 0.4f;
    float listening = 0.55f;
    float machine = 0.68f;
};

struct HolesState {
    int seed = 120826;
    float age = 0.f;
    float lifespanSeconds = 6360.f;
    float vitality = 1.f;
    float stress = 0.f;
    HolesTraits traits;
    float phases[5] = {0.f, 0.f, 0.f, 0.f, 0.f};
    std::string eclipsePhase = "idle";
    float obscuration = 0.f;
    bool running = false;
    float progress = 0.f;
    float simulateDuration = 600.f;
    float simulateElapsed = 0.f;
};

inline float holesClamp01(float v) {
    return ofClamp(v, 0.f, 1.f);
}

inline float holesObscurationAtProgress(float p) {
    const float peak = 0.5f;
    const float maxObs = 0.991f;
    if (p <= peak) return maxObs * (p / peak);
    return maxObs * ((1.f - p) / (1.f - peak));
}

inline std::string holesPhaseAtProgress(float p, float reverseHalf = 0.05f) {
    const float rev0 = 0.5f - reverseHalf;
    const float rev1 = 0.5f + reverseHalf;
    if (p < rev0) return "forward";
    if (p <= rev1) {
        if (holesObscurationAtProgress(p) >= 0.99f && p < 0.5f) return "deep";
        return "reverse";
    }
    return "unwind";
}

inline void holesUpdate(HolesState& s, float dt, float atmoDensity, float aircraft) {
    if (!s.running) return;

    s.simulateElapsed = std::min(s.simulateDuration, s.simulateElapsed + dt);
    s.progress = s.simulateElapsed / s.simulateDuration;
    s.obscuration = holesObscurationAtProgress(s.progress);
    s.eclipsePhase = holesPhaseAtProgress(s.progress);

    s.age += dt;
    const float norm = holesClamp01(s.age / s.lifespanSeconds);
    s.traits.obscuration = s.obscuration;
    s.traits.atmosphere = holesClamp01(atmoDensity * 0.7f + s.traits.atmosphere * 0.3f);
    s.traits.sky = holesClamp01(1.f - s.obscuration * 0.85f + s.traits.listening * 0.1f);
    s.traits.listening = holesClamp01(
        s.traits.listening + dt * (0.01f + s.obscuration * 0.02f) - dt * aircraft * 0.008f
    );
    s.traits.machine = holesClamp01(0.55f + s.traits.atmosphere * 0.25f + s.obscuration * 0.15f);

    if (s.eclipsePhase == "reverse") {
        s.stress = holesClamp01(s.stress + dt * 0.04f);
        s.vitality = holesClamp01(s.vitality - dt * 0.008f);
    } else {
        s.vitality = holesClamp01(1.f - norm * 0.45f);
        s.stress = holesClamp01(s.stress - dt * 0.02f);
    }

    const float periods[5] = {41.f, 59.f, 67.f, 83.f, 101.f};
    for (int i = 0; i < 5; ++i) {
        s.phases[i] = std::fmod(s.age / periods[i], 1.f);
    }

    if (s.progress >= 1.f) s.running = false;
}

inline void holesSendOsc(ofxOscSender& sender, const HolesState& s) {
    ofxOscMessage m;
    m.setAddress("/hit/ready");
    m.addIntArg(1);
    sender.sendMessage(m);

    m.clear();
    m.setAddress("/hit/seed");
    m.addIntArg(s.seed);
    sender.sendMessage(m);

    m.clear();
    m.setAddress("/hit/vitality");
    m.addFloatArg(s.vitality);
    sender.sendMessage(m);

    m.clear();
    m.setAddress("/hit/obscuration");
    m.addFloatArg(s.obscuration);
    sender.sendMessage(m);

    m.clear();
    m.setAddress("/hit/phase");
    m.addStringArg(s.eclipsePhase);
    sender.sendMessage(m);

    m.clear();
    m.setAddress("/hit/clock/progress");
    m.addFloatArg(s.progress);
    sender.sendMessage(m);

    m.clear();
    m.setAddress("/hit/clock/running");
    m.addIntArg(s.running ? 1 : 0);
    sender.sendMessage(m);

    m.clear();
    m.setAddress("/hit/traits/listening");
    m.addFloatArg(s.traits.listening);
    sender.sendMessage(m);
}
