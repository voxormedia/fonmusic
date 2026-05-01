-- Security and device tracking primitives for FonMusic production hardening.

create table if not exists public.sms_codes (
  id uuid primary key default gen_random_uuid(),
  phone text not null,
  code text not null,
  attempts integer not null default 0,
  used boolean not null default false,
  expires_at timestamptz not null,
  verified_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists sms_codes_phone_created_at_idx
  on public.sms_codes (phone, created_at desc);

alter table public.sms_codes enable row level security;

drop policy if exists "sms_codes_server_only" on public.sms_codes;
create policy "sms_codes_server_only"
  on public.sms_codes
  for all
  using (false)
  with check (false);

alter table public.player_devices
  add column if not exists location_id uuid;

create index if not exists player_devices_location_last_seen_idx
  on public.player_devices (location_id, last_seen desc);

create unique index if not exists player_devices_location_player_uidx
  on public.player_devices (location_id, player_id)
  where location_id is not null;
