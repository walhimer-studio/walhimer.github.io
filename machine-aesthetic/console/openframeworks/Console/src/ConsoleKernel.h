#pragma once

#include <algorithm>

#include "MachineState.h"
#include "SpeciesDNA.h"
#include "SpeciesKernel.h"

#include <string>

enum class ConsoleBranch { RoomA, Ghost, Surrender };

inline const char* consoleBranchId(ConsoleBranch branch) {
    switch (branch) {
        case ConsoleBranch::RoomA: return "room_a";
        case ConsoleBranch::Ghost: return "ghost";
        case ConsoleBranch::Surrender: return "surrender";
    }
    return "room_a";
}

struct ConsoleState {
    ConsoleBranch branch = ConsoleBranch::Ghost;
    int generation = 0;
    float stress = 0.15f;
    float branchBlend = 0.f;
    bool goldPulse = false;
    float goldPulseTimer = 0.f;
};

inline void applyConsoleBranch(
    ConsoleBranch branch,
    ConsoleState& console,
    MachineState& machine,
    SpeciesDNA& /*species*/
) {
    console.branch = branch;
    switch (branch) {
        case ConsoleBranch::RoomA:
            machine.movementSpeed = 0.55f;
            break;
        case ConsoleBranch::Ghost:
            machine.movementSpeed = 0.85f;
            break;
        case ConsoleBranch::Surrender:
            machine.movementSpeed = 1.25f;
            console.stress = std::min(1.f, console.stress + 0.08f);
            break;
    }
}

inline void consoleVisitorNudge(ConsoleState& console, float amount = 0.2f) {
    console.stress = std::min(1.f, console.stress + amount * 0.12f);
}

inline void consoleGoldPulse(ConsoleState& console, float intensity = 0.7f) {
    console.goldPulse = true;
    console.goldPulseTimer = 1.2f;
    console.stress = std::max(0.f, console.stress - intensity * 0.25f);
}

inline void consoleTick(ConsoleState& console, float dt) {
    if (console.goldPulseTimer > 0.f) {
        console.goldPulseTimer = std::max(0.f, console.goldPulseTimer - dt);
        if (console.goldPulseTimer <= 0.f) {
            console.goldPulse = false;
        }
    }

    const float target = static_cast<float>(static_cast<int>(console.branch));
    console.branchBlend += (target - console.branchBlend) * std::min(1.f, dt * 3.f);
}
