/**
 * emergent-dna-core.js — v1.1.0
 *
 * GENOTYPE ONLY:
 *   • seeded randomness + trait vectors for individuals of a species
 *   • optional social pool: shared trait memory + peer learning (ecology-adjacent, still no spawn/death timers)
 *   • no Three.js, p5, WebGL, Tone; no spawn/hold/death scheduling
 *
 * Canonical constructor matches Document 5 / ARS system-prompt:
 *   this.s = (seed >>> 0) || 1
 */
(function (global) {
  'use strict';

  function SeedRng(seed) {
    this.s = (seed >>> 0) || 1;
  }
  SeedRng.prototype.next = function () {
    var x = Math.sin(this.s++) * 10000;
    return x - Math.floor(x);
  };
  SeedRng.prototype.range = function (a, b) {
    return a + this.next() * (b - a);
  };
  SeedRng.prototype.pick = function (arr) {
    return arr[Math.floor(this.next() * arr.length)];
  };
  SeedRng.prototype.shuffle = function (arr) {
    var a = arr.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(this.next() * (i + 1));
      var t = a[i];
      a[i] = a[j];
      a[j] = t;
    }
    return a;
  };

  /** Document 5 name — same constructor as SeedRng */
  var Rand = SeedRng;

  function SpeciesGenome(seed, geneSchema) {
    this.seed = seed >>> 0;
    this.rng = new SeedRng(this.seed);
    this.speciesTraits = {
      metabolic: this.rng.range(0.85, 1.15),
      plasticity: this.rng.range(0.7, 1.3),
    };
    this.geneSchema = geneSchema || {};
    this._extra = {};
    var self = this;
    Object.keys(this.geneSchema).forEach(function (key) {
      var pair = self.geneSchema[key];
      self._extra[key] = self.rng.range(pair[0], pair[1]);
    });
  }

  function expressIndividual(species, defaultTraits) {
    var rng = species.rng;
    var st = species.speciesTraits;
    var out = {};
    var defs =
      defaultTraits ||
      {
        span: function (r, sp) {
          return r.range(0.4, 1.0) * st.plasticity;
        },
        hue: function (r) {
          return r.range(0, 360);
        },
        expressedGrow: function (r, sp) {
          return r.range(4200, 10000) / st.metabolic;
        },
        expressedFade: function (r, sp) {
          return r.range(4500, 8000) / st.metabolic;
        },
        breathAmp: function (r) {
          return r.range(0.8, 2.8);
        },
        breathPhase: function (r) {
          return r.range(0, Math.PI * 2);
        },
      };

    Object.keys(defs).forEach(function (k) {
      out[k] = defs[k](rng, species);
    });
    Object.assign(out, species._extra);
    return out;
  }

  /** Uses Math.random — not part of deterministic seeded world */
  function mutateSeed(seed, magnitude) {
    var m = magnitude == null ? 0x1fffff : magnitude;
    return (seed ^ (Math.floor(Math.random() * m) + 1)) >>> 0;
  }

  /**
   * Running aggregate of trait snapshots from entities or completed runs.
   * New genomes can "learn" by nudging toward the pool centroid (social learning).
   * Optional localStorage persistence — pool state is not part of pure seed replay unless you save/load it.
   */
  function SocialPool(options) {
    var o = options || {};
    this.storageKey = o.storageKey || null;
    this._count = 0;
    this._metabolicSum = 0;
    this._plasticitySum = 0;
    this._extraSums = {};
    this._extraCounts = {};
    if (this.storageKey && typeof localStorage !== 'undefined') {
      this._loadFromStorage();
    }
  }

  SocialPool.prototype.record = function (snapshot) {
    if (!snapshot || !snapshot.speciesTraits) return;
    var st = snapshot.speciesTraits;
    if (typeof st.metabolic === 'number' && typeof st.plasticity === 'number') {
      this._count += 1;
      this._metabolicSum += st.metabolic;
      this._plasticitySum += st.plasticity;
    }
    var ex = snapshot.extra || snapshot.geneExtras;
    if (ex && typeof ex === 'object') {
      var self = this;
      Object.keys(ex).forEach(function (k) {
        var v = ex[k];
        if (typeof v !== 'number' || !isFinite(v)) return;
        if (!self._extraCounts[k]) {
          self._extraCounts[k] = 0;
          self._extraSums[k] = 0;
        }
        self._extraCounts[k] += 1;
        self._extraSums[k] += v;
      });
    }
    if (this.storageKey && typeof localStorage !== 'undefined') {
      this._saveToStorage();
    }
  };

  SocialPool.prototype.centroid = function () {
    if (this._count < 1) return null;
    var out = {
      speciesTraits: {
        metabolic: this._metabolicSum / this._count,
        plasticity: this._plasticitySum / this._count,
      },
      extra: {},
    };
    var self = this;
    Object.keys(this._extraCounts).forEach(function (k) {
      if (self._extraCounts[k] > 0) {
        out.extra[k] = self._extraSums[k] / self._extraCounts[k];
      }
    });
    return out;
  };

  SocialPool.prototype.clear = function () {
    this._count = 0;
    this._metabolicSum = 0;
    this._plasticitySum = 0;
    this._extraSums = {};
    this._extraCounts = {};
    if (this.storageKey && typeof localStorage !== 'undefined') {
      try {
        localStorage.removeItem(this.storageKey);
      } catch (e) {}
    }
  };

  SocialPool.prototype._saveToStorage = function () {
    if (!this.storageKey) return;
    try {
      var payload = {
        count: this._count,
        metabolicSum: this._metabolicSum,
        plasticitySum: this._plasticitySum,
        extraSums: this._extraSums,
        extraCounts: this._extraCounts,
      };
      localStorage.setItem(this.storageKey, JSON.stringify(payload));
    } catch (e) {}
  };

  SocialPool.prototype._loadFromStorage = function () {
    if (!this.storageKey) return;
    try {
      var raw = localStorage.getItem(this.storageKey);
      if (!raw) return;
      var payload = JSON.parse(raw);
      if (!payload || typeof payload.count !== 'number') return;
      this._count = payload.count;
      this._metabolicSum = payload.metabolicSum || 0;
      this._plasticitySum = payload.plasticitySum || 0;
      this._extraSums = payload.extraSums && typeof payload.extraSums === 'object' ? payload.extraSums : {};
      this._extraCounts = payload.extraCounts && typeof payload.extraCounts === 'object' ? payload.extraCounts : {};
    } catch (e) {}
  };

  /**
   * Blend species traits toward the pool centroid. Call after SpeciesGenome construction,
   * typically before expressIndividual. alpha ∈ [0,1] — strength of social influence.
   */
  function nudgeSpeciesFromPool(species, pool, alpha) {
    if (!species || !pool || alpha == null) return;
    var a = Math.max(0, Math.min(1, alpha));
    if (a <= 0) return;
    var c = pool.centroid();
    if (!c) return;
    species.speciesTraits.metabolic = species.speciesTraits.metabolic * (1 - a) + c.speciesTraits.metabolic * a;
    species.speciesTraits.plasticity = species.speciesTraits.plasticity * (1 - a) + c.speciesTraits.plasticity * a;
    if (!c.extra || !species._extra) return;
    Object.keys(species._extra).forEach(function (k) {
      if (typeof c.extra[k] !== 'number' || !isFinite(c.extra[k])) return;
      if (typeof species._extra[k] !== 'number') return;
      species._extra[k] = species._extra[k] * (1 - a) + c.extra[k] * a;
    });
  }

  /**
   * Blend toward the average of peer species (same moment / cohort). peers: array of SpeciesGenome-like objects with speciesTraits.
   */
  function learnFromPeers(species, peers, alpha) {
    if (!species || !peers || peers.length === 0) return;
    var a = alpha == null ? 0.2 : Math.max(0, Math.min(1, alpha));
    if (a <= 0) return;
    var nm = 0;
    var np = 0;
    var n = 0;
    var extraSums = {};
    var extraCounts = {};
    peers.forEach(function (p) {
      if (!p || !p.speciesTraits) return;
      nm += p.speciesTraits.metabolic;
      np += p.speciesTraits.plasticity;
      n += 1;
      if (!p._extra) return;
      Object.keys(p._extra).forEach(function (k) {
        var v = p._extra[k];
        if (typeof v !== 'number' || !isFinite(v)) return;
        extraCounts[k] = (extraCounts[k] || 0) + 1;
        extraSums[k] = (extraSums[k] || 0) + v;
      });
    });
    if (n < 1) return;
    var am = nm / n;
    var ap = np / n;
    species.speciesTraits.metabolic = species.speciesTraits.metabolic * (1 - a) + am * a;
    species.speciesTraits.plasticity = species.speciesTraits.plasticity * (1 - a) + ap * a;
    Object.keys(species._extra || {}).forEach(function (k) {
      if (!extraCounts[k]) return;
      var avg = extraSums[k] / extraCounts[k];
      species._extra[k] = species._extra[k] * (1 - a) + avg * a;
    });
  }

  var api = {
    SeedRng: SeedRng,
    Rand: Rand,
    SpeciesGenome: SpeciesGenome,
    expressIndividual: expressIndividual,
    mutateSeed: mutateSeed,
    SocialPool: SocialPool,
    nudgeSpeciesFromPool: nudgeSpeciesFromPool,
    learnFromPeers: learnFromPeers,
  };

  global.EmergentDNA = api;

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = api;
  }
})(typeof globalThis !== 'undefined' ? globalThis : this);
