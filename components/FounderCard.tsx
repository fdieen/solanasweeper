'use client';

import { useState } from 'react';

/**
 * FounderCard — portretkaart op /founders met een zwaaiend pixel-handje.
 *
 * Bij hover (pointerenter, dus ook een tik op mobiel) komt rechtsonder in het scherm een
 * hand omhoog, zwaait twee keer en zakt weer weg. De hand is getekend op hetzelfde
 * 48×48-raster als het portret (1 hand-pixel = 1 portret-pixel) in de huidtint van de
 * founder, en ligt ónder de pixelraster-overlay (::after) van .founders-screen, zodat hij
 * bij de foto lijkt te horen. De animatie loopt altijd af (state gaat pas uit op
 * animationend), ook als de muis eerder weggaat. Zie .founders-hand in globals.css.
 */

export type Founder = {
  name: string;
  img: string;
  alt: string;
  blurb: string;
  chip: string;
  /** Huidtint uit het portret: [licht, schaduw, omlijning] */
  skin: [string, string, string];
};

/* Pixelkaart van de hand, 11 breed × 13 hoog. L = licht, S = schaduw, O = omlijning. */
const HAND = [
  '..O.O.O....',
  '.OLOLOLO...',
  '.OLOLOLO.O.',
  '.OLLLLLOOLO',
  '.OLLLLLLLLO',
  'OOLLLLLLLO.',
  'OLLLLLLLSO.',
  'OLLLLLLSSO.',
  '.OLLLLLSO..',
  '..OLLLSSO..',
  '..OLLLSO...',
  '..OLLSSO...',
  '..OLLSSO...',
];
const HAND_W = HAND[0].length;
const HAND_H = HAND.length;
const GRID = 48; // pixels van het portret

function HandSprite({ skin }: { skin: Founder['skin'] }) {
  const fill: Record<string, string> = { L: skin[0], S: skin[1], O: skin[2] };
  return (
    <svg
      className="founders-hand"
      viewBox={`0 0 ${HAND_W} ${HAND_H}`}
      width={HAND_W}
      height={HAND_H}
      aria-hidden="true"
      style={{ width: `${(HAND_W / GRID) * 100}%`, height: `${(HAND_H / GRID) * 100}%` }}
      shapeRendering="crispEdges"
    >
      {HAND.flatMap((row, y) =>
        Array.from(row).map((c, x) =>
          c === '.' ? null : <rect key={`${x}-${y}`} x={x} y={y} width={1} height={1} fill={fill[c]} />,
        ),
      )}
    </svg>
  );
}

export default function FounderCard({ founder }: { founder: Founder }) {
  const [waving, setWaving] = useState(false);

  return (
    <article
      className="founders-card"
      data-waving={waving ? '' : undefined}
      onPointerEnter={() => setWaving(true)}
    >
      {/* Portret op een SOL-E-scherm: afgerond display, groene gloed, pixelraster-overlay.
          Bewust een plain <img> (zoals het logo en de hero): de 48×48-bron blijft zo
          scherp via image-rendering: pixelated, zonder next/image-resampling. */}
      <div className="founders-screen">
        {/* eslint-disable-next-line @next/next/no-img-element -- pixel-art, geen resampling gewenst */}
        <img src={founder.img} alt={founder.alt} width={100} height={100} />
        <div className="founders-hand-clip" onAnimationEnd={() => setWaving(false)}>
          <HandSprite skin={founder.skin} />
        </div>
      </div>
      <div className="founders-who">
        <h2>{founder.name}</h2>
        <p>{founder.blurb}</p>
        <span className="founders-chip">{founder.chip}</span>
      </div>
    </article>
  );
}
