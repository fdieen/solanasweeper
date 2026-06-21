'use client';

import dynamic from 'next/dynamic';

const MapCanvas = dynamic(() => import('./MapCanvas'), { ssr: false });

/**
 * MapPin — 3D cartoon-kaart met zwevende pin, rechtsboven op de roadmap.
 * Op hover tekent zich een nieuwe route.
 */
export default function MapPin() {
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
      `}</style>
      <MapCanvas />
    </div>
  );
}
