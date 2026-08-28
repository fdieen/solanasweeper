# Ecosystem listing assets

Voor de aanmelding bij solana.com/ecosystem en DappRadar.

## Screenshots

Alle drie gerenderd met Playwright tegen de live site (https://solanasweeper.com),
in dezelfde schone chromium-context: geen extensies, geen profiel, geen bookmarks,
geen wallet. Viewport 1440x900, deviceScaleFactor 2.

Alleen statische pagina's. Het sweep-overzicht en de checker-met-resultaat zitten
achter een wallet-connectie (`components/WalletScan.tsx` en `components/FunMode.tsx`
geven `null` terug zonder verbinding), dus die staan hier bewust niet in — liever
geen scherm dan een nagebootst scherm.

| # | bestand | pagina | formaat |
| --- | --- | --- | --- |
| 1 | `01-homepage-hero.png` | `/` | 2880x1520 |
| 2 | `02-how-it-works.png` | `/how-it-works` | 2880x1800 |
| 3 | `03-safety-non-custodial.png` | `/safety` | 2880x1800 |

De hero is bijgesneden op 1440x760 CSS-pixels: de laatste inhoud eindigt daar op
y=1375 van 1800, de rest was leeg verloop. Bij de twee artikelpagina's loopt de
tekst door tot de onderrand, dus daar viel niets weg te snijden.

Op de hero staat de wallet-checker in lege staat. Dat is de bedoeling: het toont
dat je hem zonder verbinding kunt gebruiken.

Rendermethode: `shoot-static.js`, bewust buiten de repo gehouden zodat Playwright
niet in de dependencies van de app belandt.

### Gecomprimeerde versies voor uploadformulieren

Naast elke PNG staat een `-compressed.jpg` met dezelfde afmetingen, voor formulieren
met een uploadlimiet. De PNG's blijven het origineel.

| bestand | formaat | PNG | JPG |
| --- | --- | --- | --- |
| `01-homepage-hero` | 2880x1520 | 2,3 MB | 328 KB |
| `02-how-it-works` | 2880x1800 | 2,3 MB | 332 KB |
| `03-safety-non-custodial` | 2880x1800 | 2,2 MB | 322 KB |

JPEG kwaliteit 90, progressive, zonder chroma-subsampling (4:4:4) zodat de groene
tekst en accenten scherp blijven. Geen PNG-variant: er is geen pngquant of oxipng
op deze machine, en PNG8 via PIL haalde de 500 KB niet voor twee van de drie
(642 en 484 KB bij 128 kleuren) én bandeert de verlopen zichtbaar.

Opnieuw genereren kan met PIL:

```python
src.save(out, 'JPEG', quality=90, optimize=True, progressive=True, subsampling=0)
```

## Logo

`solanasweeper-logo-250x250.png` — 250x250, geschaald uit `youtube-avatar-800x800.png`
(repo-root) met LANCZOS. 42 KB, ruim onder de 150 KB-limiet van DappRadar, dus geen
JPG-fallback nodig en de donkere gradient blijft intact.
