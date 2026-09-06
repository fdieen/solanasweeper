-- Referral-binding krijgt een vervaldatum
--
-- Migratie 0001 legt een binding vast zonder einddatum: wie ooit via een ?ref=-link
-- binnenkwam, bleef voor altijd aan die referrer hangen — ook jaren later, en ook als de
-- gebruiker inmiddels via iemand anders binnenkomt. Vanaf nu geldt een binding 60 dagen
-- vanaf het moment van binden. Verloopt hij, dan telt de eerstvolgende ?ref=-klik weer
-- (of niemand, en gaat 100% van de fee naar de fee-wallet).
--
-- Bestaande rijen krijgen 60 dagen vanaf hun eigen created_at; rijen die daarmee al
-- verlopen zijn blijven staan, maar worden door /api/referral/binding niet meer
-- teruggegeven (die filtert op expires_at > now()).

alter table public.referral_bindings
  add column if not exists expires_at timestamptz;

update public.referral_bindings
   set expires_at = created_at + interval '60 days'
 where expires_at is null;

alter table public.referral_bindings
  alter column expires_at set default (now() + interval '60 days');

alter table public.referral_bindings
  alter column expires_at set not null;

-- De binding-lookup filtert op expires_at; index erop houdt die goedkoop.
create index if not exists referral_bindings_expires_idx
  on public.referral_bindings (expires_at);
