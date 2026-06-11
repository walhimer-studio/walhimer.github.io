/** Copy to supabase-config.local.mjs — use service role key for dna-bridge (server-side). */
export const supabaseConfig = {
  url: "https://YOUR_PROJECT.supabase.co",
  /** Prefer service_role in bridge; never commit real keys. */
  serviceRoleKey: "YOUR_SERVICE_ROLE_KEY",
};

export const SPECIES_ID = "surrender-machines";
