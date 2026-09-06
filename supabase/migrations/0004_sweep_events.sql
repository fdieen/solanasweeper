-- Foutlogging voor sweeps
--
-- Eén rij per gebeurtenis in een sweep: een preflight-fout, een overgeslagen groep, een
-- bevestigde transactie of een mislukte transactie. Bedoeld om te kunnen zien wélke fase
-- faalt bij welk soort wallet, zonder in de logs van Vercel te hoeven graven.
--
-- Bewust GEEN persoonsgegevens: alleen het wallet-adres (publiek, staat toch al on-chain),
-- de fase, de uitkomst, een foutcode, een korte melding uit onze eigen humanize-functies,
-- de transactiesignature en twee tellingen. Geen IP, geen user agent, geen mint-adressen,
-- geen tokennamen.

create table if not exists public.sweep_events (
  id bigint generated always as identity primary key,
  created_at timestamptz not null default now(),
  wallet text not null,
  mode text not null check (mode in ('fun', 'pro')),
  phase text not null check (phase in ('scan', 'preflight', 'sign', 'send', 'confirm')),
  outcome text not null check (outcome in ('ok', 'skipped', 'error')),
  error_code text,
  message text,
  signature text,
  accounts_planned integer check (accounts_planned is null or accounts_planned >= 0),
  accounts_done integer check (accounts_done is null or accounts_done >= 0)
);

-- Twee leespaden: "wat ging er de laatste tijd mis" en "wat deed deze wallet".
create index if not exists sweep_events_created_idx on public.sweep_events (created_at desc);
create index if not exists sweep_events_wallet_idx  on public.sweep_events (wallet, created_at desc);
-- Foutanalyse per fase/uitkomst zonder full scan.
create index if not exists sweep_events_phase_idx
  on public.sweep_events (phase, outcome, created_at desc);

-- Zelfde afscherming als referral (migraties 0001 + 0002): RLS aan zonder policies, én de
-- onderliggende GRANTs weg bij anon/authenticated. Schrijven gebeurt uitsluitend via
-- /api/events met de service role; de tabel is voor de browser onbereikbaar.
alter table public.sweep_events enable row level security;

revoke all on table public.sweep_events from anon, authenticated;
grant all  on table public.sweep_events to service_role;
