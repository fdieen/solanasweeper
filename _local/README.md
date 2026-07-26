# _local/ — persoonlijke scratch-map

Alles in deze map wordt **genegeerd door git** (zie `.gitignore`) — behalve deze
README, die als anker in de repo staat zodat de map bestaat en zichzelf uitlegt.

## Waarvoor
Zet hier je losse persoonlijke werkbestanden neer die niet in de site-build horen:
screenshots, bron-/asset-bestanden, exports, marketing-materiaal, zip-jes, wat dan ook.

## Waarom
Voorkomt dat losse bestanden in de repo-root belanden en per ongeluk meegecommit
worden. Dit is **laag 1**. De root-globs in `.gitignore` (`/*.png`, `/*.zip`, …) zijn
**laag 2**: een tweede vangnet voor als er tóch iets buiten deze map in de root valt.
Beide lagen staan er bewust — niet weghalen.

Bestaande asset-mappen (`x-assets/`, `youtube banner/`) mogen hierheen verhuizen
wanneer je daar zin in hebt; verplicht is het niet.
