'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * ScannerBot — how-it-works mascot
 * --------------------------------
 * Een klein robotje linksonder dat continu een radar-scan uitvoert.
 * - Roterende scan-arm met fade-trail (radar sweep)
 * - Random "blips" die oplichten alsof er iets gevonden wordt
 * - Op hover: blije wiggle + status "FOUND" knippert
 * Bewust geen muis-tracking — ander gedrag dan de hero-robot.
 */
export default function ScannerBot() {
  const [happy, setHappy] = useState(false);
  const [blips, setBlips] = useState<{ id: number; x: number; y: number }[]>([]);
  const idRef = useRef(0);

  // Periodiek een blip laten verschijnen op de radar
  useEffect(() => {
    const spawn = () => {
      const ang = Math.random() * Math.PI * 2;
      const rad = 14 + Math.random() * 22;
      const id  = idRef.current++;
      setBlips(prev => [...prev, {
        id,
        x: Math.cos(ang) * rad,
        y: Math.sin(ang) * rad,
      }]);
      setTimeout(() => setBlips(prev => prev.filter(b => b.id !== id)), 1600);
    };
    const iv = setInterval(spawn, 1300);
    return () => clearInterval(iv);
  }, []);

  return (
    <>
      <style>{`
        @keyframes scan-sweep   { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes bot-hover    { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-4px); } }
        @keyframes bot-pop      { 0% { transform: scale(1); } 45% { transform: scale(1.22); } 100% { transform: scale(1); } }
        @keyframes blip-pop     { 0% { transform: scale(0); opacity: 0; } 25% { transform: scale(1.3); opacity: 1; } 100% { transform: scale(0.6); opacity: 0; } }
        @keyframes ring-pulse   { 0% { transform: scale(0.6); opacity: 0.5; } 100% { transform: scale(1.25); opacity: 0; } }
        @keyframes eye-scan     { 0%,100% { transform: translateX(-2px); } 50% { transform: translateX(2px); } }
        @keyframes status-blink { 0%,100% { opacity: 0.35; } 50% { opacity: 1; } }

        /* Rechtsboven, onder het hamburgermenu — scrollt mee met de pagina */
        .scanner-bot {
          position: absolute;
          top: 84px;
          right: 28px;
          bottom: auto;
          left: auto;
          z-index: 40;
        }
        /* Mobiel: iets kleiner */
        @media (max-width: 767px) {
          .scanner-bot {
            top: 76px;
            right: 20px;
            transform: scale(0.8);
            transform-origin: top right;
          }
        }
      `}</style>

      <div
        className="scanner-bot"
        onMouseEnter={() => { setHappy(true); setTimeout(() => setHappy(false), 900); }}
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '10px',
          userSelect: 'none',
          cursor: 'default',
        }}
      >
        {/* Radar */}
        <div style={{
          position: 'relative',
          width: '84px',
          height: '84px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(20,241,149,0.06) 0%, rgba(8,6,16,0.85) 70%)',
          border: '1px solid rgba(20,241,149,0.22)',
          boxShadow: '0 0 24px rgba(20,241,149,0.12), inset 0 0 20px rgba(20,241,149,0.05)',
          overflow: 'hidden',
        }}>
          {/* Radar-ringen */}
          {[0.42, 0.7].map((s, i) => (
            <div key={i} style={{
              position: 'absolute', inset: 0, margin: 'auto',
              width: `${s * 84}px`, height: `${s * 84}px`,
              borderRadius: '50%',
              border: '1px solid rgba(20,241,149,0.12)',
            }} />
          ))}
          {/* Kruis */}
          <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, height: '1px', background: 'rgba(20,241,149,0.10)' }} />
          <div style={{ position: 'absolute', left: '50%', top: 0, bottom: 0, width: '1px', background: 'rgba(20,241,149,0.10)' }} />

          {/* Roterende sweep-arm */}
          <div style={{
            position: 'absolute', inset: 0,
            animation: `scan-sweep ${happy ? '0.7s' : '3s'} linear infinite`,
          }}>
            <div style={{
              position: 'absolute',
              top: 0, left: '50%',
              width: '50%', height: '50%',
              transformOrigin: 'left bottom',
              background: 'conic-gradient(from 0deg, rgba(20,241,149,0.35) 0deg, rgba(20,241,149,0) 55deg)',
              borderTopRightRadius: '100%',
            }} />
          </div>

          {/* Blips */}
          {blips.map(b => (
            <div key={b.id} style={{
              position: 'absolute',
              top: '50%', left: '50%',
              width: '7px', height: '7px',
              marginLeft: `${b.x - 3.5}px`,
              marginTop: `${b.y - 3.5}px`,
            }}>
              <div style={{
                width: '7px', height: '7px', borderRadius: '50%',
                background: '#9945FF',
                boxShadow: '0 0 8px 2px rgba(153,69,255,0.8)',
                animation: 'blip-pop 1.6s ease-out forwards',
              }} />
              <div style={{
                position: 'absolute', inset: '-3px',
                borderRadius: '50%',
                border: '1px solid rgba(153,69,255,0.6)',
                animation: 'ring-pulse 1.6s ease-out forwards',
              }} />
            </div>
          ))}

          {/* Botje in het midden — centering los van de animatie */}
          <div style={{
            position: 'absolute', top: '50%', left: '50%',
            transform: 'translate(-50%, -50%)',
          }}>
            <div style={{
              width: '26px', height: '22px',
              background: happy ? '#10231a' : '#0c0a18',
              border: `1px solid rgba(20,241,149,${happy ? 0.8 : 0.4})`,
              borderRadius: '6px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: happy
                ? '0 0 20px rgba(20,241,149,0.5)'
                : '0 0 10px rgba(20,241,149,0.15)',
              transition: 'background 0.2s, border-color 0.2s, box-shadow 0.2s',
              animation: happy ? 'bot-pop 0.5s ease-out' : 'none',
            }}>
              {/* Oog: scant normaal, wordt een ronde "!" bij hover */}
              {happy ? (
                <div style={{
                  width: '6px', height: '6px', borderRadius: '50%',
                  background: '#14F195',
                  boxShadow: '0 0 10px 2px rgba(20,241,149,0.9)',
                }} />
              ) : (
                <div style={{
                  width: '12px', height: '4px',
                  borderRadius: '2px',
                  background: 'rgba(20,241,149,0.18)',
                  overflow: 'hidden',
                  display: 'flex', alignItems: 'center',
                }}>
                  <div style={{
                    width: '5px', height: '4px', borderRadius: '2px',
                    background: '#14F195',
                    boxShadow: '0 0 6px 1px rgba(20,241,149,0.8)',
                    animation: 'eye-scan 1.4s ease-in-out infinite',
                  }} />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Status-label */}
        <span style={{
          fontFamily: 'General Sans, sans-serif',
          fontSize: '0.6rem',
          fontWeight: 600,
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          color: happy ? '#14F195' : 'rgba(20,241,149,0.55)',
          animation: 'status-blink 2s ease-in-out infinite',
        }}>
          {happy ? 'Found junk!' : 'Scanning…'}
        </span>
      </div>
    </>
  );
}
