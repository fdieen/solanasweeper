'use client';

import { useCallback, useState } from 'react';
import KeyCanvas from './KeyCanvas';

/**
 * KeyClient — de 3D-sleutel op /safety, met een statische SVG-sleutel eronder.
 *
 * De SVG staat in de server-HTML en is dus bij de eerste paint al in beeld. KeyCanvas
 * wordt bewust statisch geïmporteerd (geen next/dynamic): zo zit three.js in de
 * pagina-chunk die de browser al vanuit de HTML ophaalt, in plaats van in een tweede
 * lazy chunk die pas na hydration wordt aangevraagd. Zodra het canvas zijn eerste frame
 * heeft gerenderd, vaagt de SVG weg. Zonder WebGL blijft de SVG gewoon staan.
 */
export default function KeyClient() {
  const [ready, setReady] = useState(false);
  const onReady = useCallback(() => setReady(true), []);

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <svg
        aria-hidden="true"
        viewBox="0 0 100 100"
        style={{
          position: 'absolute', inset: 0, width: '100%', height: '100%',
          opacity: ready ? 0 : 1, transition: 'opacity 0.45s ease',
          filter: 'drop-shadow(0 0 10px rgba(20,241,149,0.25))',
        }}
      >
        <defs>
          <linearGradient id="keyMetal" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#f2fbf7" />
            <stop offset="45%" stopColor="#b9d6ca" />
            <stop offset="100%" stopColor="#6f8f83" />
          </linearGradient>
        </defs>
        {/* Zelfde opbouw als het 3D-model: ring, schacht, twee tanden, 20° gekanteld. */}
        <g transform="rotate(-20 50 50)" fill="url(#keyMetal)">
          <circle cx="50" cy="26" r="15" fill="none" stroke="url(#keyMetal)" strokeWidth="9" />
          <rect x="45.5" y="38" width="9" height="46" rx="4" />
          <rect x="53" y="64" width="12" height="6" rx="2" />
          <rect x="53" y="74" width="9" height="6" rx="2" />
        </g>
      </svg>
      <div style={{ position: 'absolute', inset: 0, opacity: ready ? 1 : 0, transition: 'opacity 0.45s ease' }}>
        <KeyCanvas onReady={onReady} />
      </div>
    </div>
  );
}
