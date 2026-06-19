#pragma once

#include "ofMain.h"

// Species DNA — set once at birth from seed; heritable identity, not frame state.
struct SpeciesDNA {
    int gearCount = 0;           // How many parts does this species have?
    float baseFrequency = 440.f; // Fundamental note of this species (Hz).
    float metabolicRate = 0.f;   // Fast-living vs slow-living species.
    ofColor bloodColor;          // Visual palette of this species.
    float complexity = 0.f;      // Twombly-trace density (0–1).
    long speciesID = 0;          // Unique seed number.
};

inline void deriveSpeciesDNA(SpeciesDNA& species, long seed) {
    species.speciesID = seed;
    ofSeedRandom(seed);

    species.gearCount = static_cast<int>(ofRandom(3, 24));
    species.baseFrequency = ofRandom(110.f, 880.f);
    species.metabolicRate = ofRandom(0.00001f, 0.0001f);
    species.bloodColor = ofColor(
        static_cast<int>(ofRandom(255)),
        static_cast<int>(ofRandom(255)),
        static_cast<int>(ofRandom(255))
    );
    species.complexity = ofRandom(0.2f, 1.f);
}
