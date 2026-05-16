-- Multi-zone architecture for FonMusic.
-- clients -> venues -> zones -> player_devices

create table if not exists public.venues (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null,
  name text not null,
  address text,
  is_active boolean default true,
  created_at timestamptz default now()
);

create table if not exists public.zones (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null,
  venue_id uuid references public.venues(id) on delete cascade,
  legacy_location_id uuid unique,
  name text not null,
  zone_type text,
  address text,
  device_type text default 'web',
  device_id text,
  station_key text,
  template_key text,
  default_template_key text,
  music_mode text default 'automatic',
  price_monthly integer default 0,
  is_primary boolean default false,
  is_active boolean default true,
  created_at timestamptz default now()
);

create index if not exists venues_client_idx
  on public.venues (client_id, is_active, created_at);

create index if not exists zones_client_idx
  on public.zones (client_id, is_active, created_at);

create index if not exists zones_venue_idx
  on public.zones (venue_id, is_active, created_at);

alter table public.player_devices
  add column if not exists zone_id uuid;

alter table public.player_devices
  add column if not exists mode text default 'work';

create index if not exists player_devices_zone_last_seen_idx
  on public.player_devices (zone_id, last_seen desc);

create unique index if not exists player_devices_zone_player_uidx
  on public.player_devices (zone_id, player_id)
  where zone_id is not null and mode = 'work';

-- Backfill: each old location becomes a venue with one primary zone.
insert into public.venues (client_id, name, address, is_active, created_at)
select
  l.client_id,
  coalesce(nullif(l.name, ''), 'Основной объект'),
  l.address,
  coalesce(l.is_active, true),
  coalesce(l.created_at, now())
from public.locations l
where not exists (
  select 1 from public.zones z where z.legacy_location_id = l.id
);

insert into public.zones (
  client_id,
  venue_id,
  legacy_location_id,
  name,
  zone_type,
  address,
  device_type,
  device_id,
  station_key,
  template_key,
  default_template_key,
  music_mode,
  price_monthly,
  is_primary,
  is_active,
  created_at
)
select
  l.client_id,
  v.id,
  l.id,
  coalesce(nullif(l.name, ''), 'Основная зона'),
  null,
  l.address,
  coalesce(l.device_type, 'web'),
  l.device_id,
  l.station_key,
  l.template_key,
  l.default_template_key,
  coalesce(l.music_mode, 'automatic'),
  0,
  true,
  coalesce(l.is_active, true),
  coalesce(l.created_at, now())
from public.locations l
join lateral (
  select id
  from public.venues
  where client_id = l.client_id
    and name = coalesce(nullif(l.name, ''), 'Основной объект')
  order by created_at asc
  limit 1
) v on true
where not exists (
  select 1 from public.zones z where z.legacy_location_id = l.id
);
