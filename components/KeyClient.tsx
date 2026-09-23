'use client';

import { useCallback, useState } from 'react';
import KeyCanvas from './KeyCanvas';

/**
 * KeyClient — de 3D-sleutel op /safety, met /safety-key-frame.png eronder: de eerste
 * frame (t=0) van precies deze scene, headless gerenderd op 2x met transparante
 * achtergrond. Die <img> staat in de server-HTML en is dus bij de eerste paint al in
 * beeld; omdat het dezelfde frame is, valt de overgang naar het canvas niet op. Verander
 * je de scene (camera, materiaal, lichten), render de PNG dan opnieuw.
 *
 * KeyCanvas wordt bewust statisch geïmporteerd (geen next/dynamic): zo zit three.js in
 * de pagina-chunk die de browser al vanuit de HTML ophaalt, in plaats van in een tweede
 * lazy chunk die pas na hydration wordt aangevraagd. Zonder WebGL blijft de afbeelding
 * gewoon staan.
 */
export default function KeyClient() {
  const [ready, setReady] = useState(false);
  const onReady = useCallback(() => setReady(true), []);

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      {/* eslint-disable-next-line @next/next/no-img-element -- exacte eerste frame, geen optimalisatie gewenst */}
      <img
        src="/safety-key-frame.png"
        alt=""
        aria-hidden="true"
        width={150}
        height={150}
        fetchPriority="high"
        style={{
          position: 'absolute', inset: 0, width: '100%', height: '100%',
          opacity: ready ? 0 : 1, transition: 'opacity 0.45s ease',
        }}
      />
      <div style={{ position: 'absolute', inset: 0, opacity: ready ? 1 : 0, transition: 'opacity 0.45s ease' }}>
        <KeyCanvas onReady={onReady} />
      </div>
    </div>
  );
}
