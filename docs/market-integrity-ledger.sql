-- Velmère Shield persistent Market Integrity Ledger
-- Run in Supabase SQL editor when you want Pass 34 history to survive server restarts.

create table if not exists public.market_integrity_snapshots (
  id bigserial primary key,
  asset_id text not null,
  symbol text not null,
  name text not null,
  observed_at timestamptz not null,
  price numeric null,
  market_cap numeric null,
  volume_24h numeric null,
  risk_score integer not null check (risk_score >= 0 and risk_score <= 100),
  risk_level text not null check (risk_level in ('low', 'medium', 'high', 'critical')),
  signal_count integer not null default 0,
  dominant_agent text null,
  confidence numeric null,
  raw_snapshot jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  unique(asset_id, observed_at)
);

create index if not exists market_integrity_snapshots_asset_time_idx
  on public.market_integrity_snapshots(asset_id, observed_at desc);

create index if not exists market_integrity_snapshots_score_idx
  on public.market_integrity_snapshots(risk_score desc, observed_at desc);

alter table public.market_integrity_snapshots enable row level security;

-- No public read by default. Server-side API reads through SUPABASE_SERVICE_ROLE_KEY.
-- If later you want public read-only history, create a limited view instead of opening this table.
