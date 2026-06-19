#pragma once

#include "MachinePart.h"
#include "SpeciesDNA.h"

#include <vector>

// The Kernel assembles the Machine from seed — body topology, not expression polish.
inline void createSpecies(long seed, SpeciesDNA& species, std::vector<MachinePart>& machineBody) {
    deriveSpeciesDNA(species, seed);
    machineBody.clear();
    machineBody.reserve(species.gearCount);

    for (int i = 0; i < species.gearCount; ++i) {
        MachinePart part;
        part.position = ofVec3f(
            ofRandom(-100.f, 100.f),
            ofRandom(-60.f, 60.f),
            ofRandom(-20.f, 20.f)
        );
        part.radius = ofRandom(12.f, 48.f);
        part.friction = ofRandom(0.05f, 0.45f);
        part.rpm = ofRandom(4.f, 28.f) * (i == 0 ? 1.f : 0.6f);
        part.angle = ofRandom(TWO_PI);
        part.buildMesh();
        machineBody.push_back(part);
    }
}

inline void simulateMachine(
    SpeciesDNA& species,
    MachineState& state,
    std::vector<MachinePart>& machineBody,
    float dt
) {
    // Decay rate comes from species DNA; current level is runtime state.
    const float decay = species.metabolicRate * state.movementSpeed;
    state.energy = ofClamp(state.energy - decay * dt, 0.f, 1.f);

    for (auto& part : machineBody) {
        part.update(dt, state.energy);
    }
}
