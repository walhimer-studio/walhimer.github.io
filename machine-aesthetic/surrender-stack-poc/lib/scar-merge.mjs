function clamp01(v) {
  return Math.max(0, Math.min(1, v));
}

/**
 * Merge remote scar rows from other venues into a local express() snapshot.
 * Does not duplicate scar_id already present locally.
 * @param {object} localExpress organism.express()
 * @param {Array} remoteRows Supabase scars rows (other venues)
 * @returns {{ merged: object, added: number }}
 */
export function mergeRemoteScarsIntoExpress(localExpress, remoteRows) {
  const merged = structuredClone(localExpress);
  const seen = new Set(merged.scars.map((s) => s.id));
  let added = 0;

  for (const row of remoteRows) {
    const scarId = row.scar_id;
    if (!scarId || seen.has(scarId)) continue;

    const delta = clamp01(Number(row.delta) || 0);
    const trait = row.trait || "scar";
    merged.scars.push({
      id: scarId,
      trait,
      delta,
      reason: `${row.reason ?? "break"}@${row.venue_id}`,
      atAge: Number(row.at_age) || 0,
    });
    if (trait in merged.traits) {
      merged.traits[trait] = clamp01(merged.traits[trait] + delta);
    }
    merged.traits.scar = clamp01((merged.traits.scar ?? 0) + delta * 0.5);
    seen.add(scarId);
    added += 1;
  }

  return { merged, added };
}

/**
 * Find scars in express snapshot not yet persisted (by scar id).
 */
export function findNewScars(expressSnap, persistedIds) {
  const set = persistedIds instanceof Set ? persistedIds : new Set(persistedIds);
  return expressSnap.scars.filter((s) => !set.has(s.id));
}
