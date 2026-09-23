'use client';

import { useCallback, useState } from 'react';
import MapCanvas from './MapCanvas';

/**
 * MapPin — 3D cartoon-kaart met zwevende pin, rechtsboven op de roadmap.
 * Op hover tekent zich een nieuwe route.
 *
 * Onder het canvas ligt een statische SVG-kaart in dezelfde stijl. Die staat in de
 * server-HTML en is dus bij de eerste paint al in beeld. MapCanvas wordt bewust statisch
 * geïmporteerd (geen next/dynamic): zo zit three.js in de pagina-chunk die de browser al
 * vanuit de HTML ophaalt, in plaats van in een tweede lazy chunk na hydration. Zodra het
 * canvas zijn eerste frame heeft gerenderd, vaagt de SVG weg. Zonder WebGL blijft hij staan.
 */
export default function MapPin() {
  const [ready, setReady] = useState(false);
  const onReady = useCallback(() => setReady(true), []);

  return (
    <div className="map-pin">
      <style>{`
        .map-pin {
          position: absolute;
          top: 80px;
          right: clamp(8px, 4vw, 50px);
          z-index: 5;
          width: 320px;
          height: 280px;
        }
        @media (max-width: 880px) {
          .map-pin { top: 130px; right: clamp(0px, 6vw, 40px); width: 210px; height: 190px; }
        }
        .map-pin-layer { position: absolute; inset: 0; transition: opacity 0.45s ease; }
        @media (prefers-reduced-motion: reduce) { .map-pin-layer { transition: none; } }
      `}</style>

      <svg
        aria-hidden="true"
        className="map-pin-layer"
        viewBox="0 0 320 280"
        style={{ width: '100%', height: '100%', opacity: ready ? 0 : 1 }}
      >
        {/* Kaartplaat in lichte perspectief-kanteling, zoals de 3D-versie (rotation.x = -0.32). */}
        <g transform="translate(160 165) scale(1 0.72) translate(-160 -165)">
          <rect x="34" y="70" width="252" height="190" rx="26" fill="#eef3f7" />
          <rect x="40" y="62" width="240" height="180" rx="24" fill="#3aa0d8" />
          {/* Eilanden: zelfde plek als de land-array in MapCanvas */}
          <g fill="#52c98a">
            <rect x="60" y="94" width="78" height="60" rx="16" transform="rotate(17 99 124)" />
            <rect x="80" y="160" width="50" height="42" rx="14" transform="rotate(-23 105 181)" />
            <rect x="180" y="100" width="88" height="66" rx="18" transform="rotate(-11 224 133)" />
            <rect x="184" y="170" width="38" height="34" rx="12" transform="rotate(29 203 187)" />
            <rect x="140" y="140" width="34" height="30" rx="10" transform="rotate(6 157 155)" />
          </g>
          {/* Route + begin- en eindpunt */}
          <path d="M70 196 C 110 176, 140 186, 176 174 S 226 150, 240 130" fill="none" stroke="#14f195" strokeWidth="5" strokeLinecap="round" />
          <circle cx="70" cy="196" r="6" fill="#14f195" />
          <circle cx="240" cy="130" r="7" fill="#9945ff" />
        </g>
        {/* Pin zweeft boven het eindpunt */}
        <g transform="translate(240 92)" fill="#9945ff">
          <path d="M0 26 L -19 -2 A 22 22 0 1 1 19 -2 Z" />
          <circle cx="0" cy="-8" r="9" fill="#140a26" />
        </g>
      </svg>

      <div className="map-pin-layer" style={{ opacity: ready ? 1 : 0 }}>
        <MapCanvas onReady={onReady} />
      </div>
    </div>
  );
}
