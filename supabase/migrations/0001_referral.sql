-- Referral-programma voor SolanaSweeper
-- Draai dit in de Supabase SQL editor (of via de CLI) op je project.

-- Binding: welke referrer heeft deze wallet aangebracht (vastgelegd bij de eerste sweep).
create table if not exists public.referral_bindings (
  referred_wallet text primary key,
  referrer_wallet text not null,
  created_at timestamptz not null default now()
);

-- Payout-log: één rij per bevestigde sweep-tx met een referrer-aandeel.
create table if not exists public.referral_payouts (
  id bigint generated always as identity primary key,
  referrer_wallet text not null,
  referred_wallet text not null,
  tx_signature text not null unique,
  fee_lamports bigint not null,
  referrer_share_lamports bigint not null,
  created_at timestamptz not null default now()
);

create index if not exists referral_payouts_referrer_idx
  on public.referral_payouts (referrer_wallet, created_at desc);

-- Exacte totalen per referrer (aantal sweeps + totaal verdiend in lamports).
create or replace function public.referral_totals(p_referrer text)
returns table (sweeps bigint, total_lamports bigint)
language sql stable as $$
  select count(*)::bigint,
         coalesce(sum(referrer_share_lamports), 0)::bigint
  from public.referral_payouts
  where referrer_wallet = p_referrer;
$$;

-- RLS aan. Bewust GEEN policies → anon/authenticated kunnen niets lezen/schrijven.
-- Alle toegang loopt via de server-routes met de service role (die RLS bypasst).
alter table public.referral_bindings enable row level security;
alter table public.referral_payouts  enable row level security;
