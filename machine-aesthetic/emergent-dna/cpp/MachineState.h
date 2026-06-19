#pragma once

// Runtime metabolism — changes every frame; not heritable.
struct MachineState {
    float energy = 1.f;        // Vitality 0–1.
    float movementSpeed = 1.f; // Visitor load / motion coupling.
};
