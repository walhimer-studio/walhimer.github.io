-- Surrender Stack POC — run once in Supabase SQL Editor
-- Enable Realtime on genomes + scars after running (Database → Replication)

create table if not exists venues (
  id text primary key,
  label text not null,
  created_at timestamptz not null default now()
);

insert into venues (id, label) values
  ('mac-local', 'MacBook POC'),
  ('tokyo', 'Tokyo install'),
  ('california', 'California install')
on conflict (id) do nothing;

create table if not exists genomes (
  id uuid primary key default gen_random_uuid(),
  venue_id text not null references venues(id) on delete cascade,
  species_id text not null default 'surrender-machines',
  seed bigint not null,
  generation int not null default 0,
  parent_id text,
  genome_json jsonb not null,
  updated_at timestamptz not null default now(),
  unique (venue_id, species_id)
);

create index if not exists genomes_species_idx on genomes (species_id);

create table if not exists scars (
  id uuid primary key default gen_random_uuid(),
  venue_id text not null references venues(id) on delete cascade,
  species_id text not null default 'surrender-machines',
  scar_id text not null,
  trait text not null,
  delta double precision not null,
  reason text not null default 'break',
  at_age double precision not null default 0,
  created_at timestamptz not null default now(),
  unique (venue_id, species_id, scar_id)
);

create index if not exists scars_species_created_idx on scars (species_id, created_at desc);
create index if not exists scars_venue_idx on scars (venue_id);

create table if not exists operator_events (
  id uuid primary key default gen_random_uuid(),
  venue_id text not null references venues(id) on delete cascade,
  species_id text not null default 'surrender-machines',
  event_json jsonb not null,
  created_at timestamptz not null default now()
);

-- POC: permissive RLS off, or allow service role only.
-- For quick test without service role, uncomment:
-- alter table genomes enable row level security;
-- create policy "poc_all" on genomes for all using (true) with check (true);
-- (repeat for scars, operator_events if using anon key)

comment on table genomes is 'One active genome row per venue + species; genome_json = organism.express()';
comment on table scars is 'Append-only scar log; other venues merge by scar_id';
