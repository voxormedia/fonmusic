create table if not exists public.invoice_requests (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  client_id uuid null,
  plan text,
  company_name text,
  tin text,
  legal_address text,
  contact_name text,
  phone text,
  messenger text,
  email text,
  locations_count int default 1,
  needs_box boolean default false,
  comment text,
  status text default 'new'
);

alter table public.clients add column if not exists subscription_end_date timestamptz;
alter table public.clients add column if not exists billing_type text;
alter table public.clients add column if not exists billing_period_months int;
