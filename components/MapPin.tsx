'use client';

import { useCallback, useState } from 'react';
import MapCanvas from './MapCanvas';

/**
 * MapPin — 3D cartoon-kaart met zwevende pin, rechtsboven op de roadmap.
 * Op hover tekent zich een nieuwe route.
 *
 * Onder het canvas ligt /roadmap-map-frame.png: de eerste frame (t=0) van precies deze
 * scene, headless gerenderd op 2x met transparante achtergrond. Die <img> staat in de
 * server-HTML en is dus bij de eerste paint al in beeld; omdat het dezelfde frame is,
 * valt de overgang naar het canvas niet op. Verander je de scene (camera, kleuren,
 * pin, route 0), render de PNG dan opnieuw. MapCanvas wordt bewust statisch geïmporteerd
 * (geen next/dynamic): zo zit three.js in de pagina-chunk die de browser al vanuit de
 * HTML ophaalt, in plaats van in een tweede lazy chunk na hydration. Zonder WebGL blijft
 * de afbeelding gewoon staan.
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

      {/* eslint-disable-next-line @next/next/no-img-element -- exacte eerste frame, geen optimalisatie gewenst */}
      <img
        src="/roadmap-map-frame.png"
        alt=""
        aria-hidden="true"
        width={320}
        height={280}
        fetchPriority="high"
        className="map-pin-layer"
        style={{ width: '100%', height: '100%', opacity: ready ? 0 : 1 }}
      />

      <div className="map-pin-layer" style={{ opacity: ready ? 1 : 0 }}>
        <MapCanvas onReady={onReady} />
      </div>
    </div>
  );
}
