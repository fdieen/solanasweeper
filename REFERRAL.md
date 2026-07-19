# Referral-programma — setup & test

Referrers verdienen **25% van de platform-fee** op elke sweep die via hun link binnenkomt.
De split gebeurt **on-chain in dezelfde sweep-transactie** (75% fee-wallet / 25% referrer).
Supabase wordt alleen gebruikt voor **tracking** (bindings, payout-log, stats); zonder
Supabase werkt de on-chain split gewoon door en wordt tracking stil overgeslagen — een sweep
breekt nooit.

## 1. Supabase-migratie draaien

Open de **Supabase SQL-editor** van je project en draai het script:

```
supabase/migrations/0001_referral.sql
```

Dit maakt `referral_bindings` + `referral_payouts` (met **unieke** `tx_signature`), de
`referral_totals()`-functie, en zet **RLS aan zonder public policies** — alle toegang loopt
via de server-routes met de service role.

## 2. Env-vars zetten (lokaal én Vercel)

Zie `.env.example`. Voor referral zijn nieuw:

| Var | Waar | Let op |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | lokaal + Vercel | publiek |
| `SUPABASE_SERVICE_ROLE_KEY` | lokaal + Vercel | **server-only, nooit `NEXT_PUBLIC_`, nooit committen** |

Op Vercel: Project → Settings → Environment Variables → zet beide voor **Production** (en
Preview als je daar wilt testen). Redeploy daarna.

## 3. Security — hoe bindings ontstaan (en waarom ze niet te vervalsen zijn)

Een binding (`referred_wallet → referrer_wallet`) én een payout ontstaan **uitsluitend** in
`POST /api/referral/record`, en **alleen uit de geverifieerde transactie**. De client stuurt
niets dan de `txSignature`; de server haalt de tx on-chain op en eist dat (a) de tx bevestigd
en geslaagd is, (b) de **fee-payer/signer** de `referred_wallet` is, (c) er een
SystemProgram-transfer naar **onze officiële fee-wallet** in zit (bewijst dat het een sweep van
onze app is), (d) er een tweede transfer naar een ander adres is — dat wordt de
`referrer_wallet` — en (e) de bedragen in de **75/25-verhouding** staan (met kleine
afrondingsmarge). Omdat de referred-wallet de tekenaar van een échte sweep moet zijn (een
handtekening die een aanvaller niet kan vervalsen) en de referrer uit de daadwerkelijke
25%-transfer wordt gelezen (niet uit de request-body), kan niemand een binding aanmaken voor
een wallet die nooit gesweept heeft, en niemand kan zichzelf als referrer van andermans sweep
opgeven. De `record`-route is idempotent op de unieke `tx_signature`; de `binding`-route is
read-only.

## 4. Mainnet-testplan (checklist)

Test met kleine bedragen op mainnet vóór je de `/referral`-pagina ergens linkt.

- [ ] **Happy path:** wallet met 2–3 lege accounts via `?ref=<andere wallet>`, sweep → Solscan toont de 75/25-split naar de fee-wallet en de referrer.
- [ ] **Tracking:** payout-rij verschijnt in Supabase (`referral_payouts`) en op `/referral` bij de stats van de referrer.
- [ ] **Geen ref:** sweep zonder `?ref` → 100% naar de fee-wallet (geen referrer-instructie).
- [ ] **Self-referral:** `?ref=<eigen wallet>` → geen referral-instructie (100% naar fee-wallet).
- [ ] **Binding wint:** tweede sweep met dezelfde wallet zónder ref (of met een andere ref) betaalt nog steeds aan de oorspronkelijke referrer.

## 5. Nog niet gelinkt

De `/referral`-pagina is bereikbaar via de directe URL maar wordt **nergens gelinkt** (nav,
footer, UI). Voeg de link pas toe nadat het testplan hierboven groen is.
