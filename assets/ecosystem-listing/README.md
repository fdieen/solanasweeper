# Ecosystem listing assets

Voor de aanmelding bij solana.com/ecosystem en DappRadar.

## Screenshots

Gerenderd met Playwright tegen de live site (https://solanasweeper.com) in een
schone chromium-context: geen extensies, geen profiel, geen bookmarks.
Viewport 1440x900, deviceScaleFactor 2, dus 2880x1800 PNG.

Script: `scratchpad/shoot.js` (buiten de repo — Playwright staat bewust niet in
de dependencies van de app).

| bestand | wat |
| --- | --- |
| `01-wallet-checker-no-connect.png` | de checker met een echt scanresultaat, zonder wallet-connectie |
| `03-homepage-hero.png` | de hero |

Volgorde in de listing: 01 eerst — de no-connect checker is het onderscheidende punt.

## Logo

`solanasweeper-logo-250x250.png` — 250x250, geschaald uit `youtube-avatar-800x800.png`
met LANCZOS. PNG blijft ruim onder de 150 KB-limiet van DappRadar, dus geen JPG nodig.
