-- Referral hardening — defense-in-depth op de anon/public-rol
--
-- Migratie 0001 zet RLS aan op referral_bindings + referral_payouts en definieert GEEN
-- policies, dus de anon/public-rollen krijgen al nul rij-toegang. Maar de Supabase-default
-- GRANTs (SELECT/INSERT/UPDATE/… voor anon + authenticated) staan er nog wél op, en de
-- referral_totals()-functie is EXECUTE-baar door PUBLIC. Dat betekent dat RLS de ENIGE poort
-- is: gaat RLS ooit uit of komt er per ongeluk een permissieve policy bij, dan liggen de
-- tabellen meteen open.
--
-- Deze migratie trekt die onderliggende privileges in, zodat er niet één, maar twee lagen
-- tussen de publieke API-rollen en de data zitten. Het server-pad gebruikt de service_role
-- (bypasst RLS) en houdt hieronder expliciet volledige toegang — dit kan de app dus nooit breken.

-- Tabellen: haal alle privileges bij anon + authenticated weg.
revoke all on table public.referral_bindings from anon, authenticated;
revoke all on table public.referral_payouts  from anon, authenticated;

-- Functie: EXECUTE is standaard aan PUBLIC gegund (en expliciet aan anon/authenticated) —
-- intrekken bij alle drie. De functie is SECURITY INVOKER, dus RLS blokkeert al, maar
-- weg is weg.
revoke all on function public.referral_totals(text) from public, anon, authenticated;

-- Server-pad expliciet borgen (idempotent): service_role houdt volledige toegang.
grant all     on table    public.referral_bindings      to service_role;
grant all     on table    public.referral_payouts       to service_role;
grant execute on function  public.referral_totals(text) to service_role;
