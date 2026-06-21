'use client';

import { useEffect, useRef, useState } from 'react';

export default function RobotMascot({ menuOpen = false }: { menuOpen?: boolean }) {
  const leftEyeRef  = useRef<HTMLDivElement>(null);
  const rightEyeRef = useRef<HTMLDivElement>(null);
  const [lp, setLp] = useState({ x: 0, y: 0 });
  const [rp, setRp] = useState({ x: 0, y: 0 });
  const [blink, setBlink]       = useState(false);
  const [fleeCount, setFleeCount] = useState(0);
  const [stumble, setStumble]   = useState(false);
  const stumbleKey = useRef(0); // force animation replay

  useEffect(() => {
    const track = (e: MouseEvent) => {
      const calc = (ref: React.RefObject<HTMLDivElement | null>) => {
        if (!ref.current) return { x: 0, y: 0 };
        const r = ref.current.getBoundingClientRect();
        const cx = r.left + r.width / 2;
        const cy = r.top  + r.height / 2;
        const angle = Math.atan2(e.clientY - cy, e.clientX - cx);
        const dist  = Math.min(Math.hypot(e.clientX - cx, e.clientY - cy), 30);
        const t     = Math.min(dist / 30, 1);
        return { x: Math.cos(angle) * 6 * t, y: Math.sin(angle) * 6 * t };
      };
      setLp(calc(leftEyeRef));
      setRp(calc(rightEyeRef));
    };
    window.addEventListener('mousemove', track);
    return () => window.removeEventListener('mousemove', track);
  }, []);

  // Occasional blink
  useEffect(() => {
    const doBlink = () => {
      setBlink(true);
      setTimeout(() => setBlink(false), 120);
      setTimeout(doBlink, 2800 + Math.random() * 3000);
    };
    const t = setTimeout(doBlink, 2000);
    return () => clearTimeout(t);
  }, []);

  const handleMouseEnter = () => {
    const shouldStumble = Math.random() < 0.33;
    if (shouldStumble && !stumble) {
      stumbleKey.current += 1;
      setStumble(true);
      setTimeout(() => setStumble(false), 750);
    }
    setFleeCount(prev => (prev >= 2 ? 0 : prev + 1));
  };

  const flee = fleeCount * 90;
  const eyeH = blink ? '2px' : '16px';

  return (
    <>
      <style>{`
        @keyframes antenna-pulse {
          0%, 100% { opacity: 1; box-shadow: 0 0 6px 2px #14F195; }
          50%       { opacity: 0.4; box-shadow: 0 0 2px 1px #14F195; }
        }
        @keyframes robot-float {
          0%, 100% { transform: translateY(0px); }
          50%       { transform: translateY(-3px); }
        }
        @keyframes scanline {
          0%   { transform: translateY(-100%); }
          100% { transform: translateY(200%); }
        }
        @keyframes robot-stumble {
          0%   { transform: rotate(0deg)   translateY(0px)   scaleX(1); }
          18%  { transform: rotate(18deg)  translateY(11px)  scaleX(0.88); }
          36%  { transform: rotate(-9deg)  translateY(5px)   scaleX(1.04); }
          54%  { transform: rotate(11deg)  translateY(7px)   scaleX(0.93); }
          72%  { transform: rotate(-4deg)  translateY(2px)   scaleX(1.01); }
          100% { transform: rotate(0deg)   translateY(0px)   scaleX(1); }
        }
      `}</style>

      {/* Outer: positie + flee-transitie */}
      <div
        onMouseEnter={handleMouseEnter}
        style={{
          position: 'fixed',
          top: '72px',
          right: `${130 + flee}px`,
          zIndex: menuOpen ? 35 : 49,
          cursor: 'default',
          userSelect: 'none',
          transition: flee > 0
            ? 'right 0.18s cubic-bezier(0.4,0,0.2,1)'
            : 'right 0.6s cubic-bezier(0.2,0,0,1)',
        }}
      >
        {/* Middle: stumble animatie — aparte laag zodat float niet conflicteert */}
        <div
          key={stumbleKey.current}
          style={{
            animation: stumble
              ? 'robot-stumble 0.75s cubic-bezier(0.4,0,0.2,1) forwards'
              : 'robot-float 3.5s ease-in-out infinite',
            transformOrigin: 'bottom center',
          }}
        >
          {/* Antenne */}
          <div style={{
            width: '2px', height: '14px',
            background: 'rgba(20,241,149,0.4)',
            margin: '0 auto', borderRadius: '1px',
          }} />
          <div style={{
            width: '7px', height: '7px', borderRadius: '50%',
            background: '#14F195', margin: '-1px auto 0',
            animation: 'antenna-pulse 1.8s ease-in-out infinite',
          }} />

          {/* Hoofd */}
          <div style={{
            width: '58px', height: '50px',
            background: '#080812',
            border: '1px solid rgba(20,241,149,0.28)',
            borderRadius: '8px', marginTop: '4px',
            padding: '10px 8px 8px',
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', gap: '7px',
            boxShadow: '0 0 18px rgba(20,241,149,0.06), inset 0 1px 0 rgba(255,255,255,0.04)',
            position: 'relative', overflow: 'hidden',
          }}>
            <div style={{
              position: 'absolute', inset: 0,
              background: 'repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(20,241,149,0.02) 3px, rgba(20,241,149,0.02) 4px)',
              pointerEvents: 'none',
            }} />

            {/* Ogen */}
            <div style={{ display: 'flex', gap: '8px', position: 'relative', zIndex: 1 }}>
              <div ref={leftEyeRef} style={{
                width: '18px', height: eyeH,
                background: '#050510',
                border: '1px solid rgba(20,241,149,0.35)',
                borderRadius: '3px', display: 'flex',
                alignItems: 'center', justifyContent: 'center',
                overflow: 'hidden', transition: 'height 0.06s',
                boxShadow: '0 0 8px rgba(20,241,149,0.15)',
                position: 'relative',
              }}>
                {!blink && (<>
                  <div style={{
                    position: 'absolute', left: 0, right: 0, height: '3px',
                    background: 'rgba(20,241,149,0.18)',
                    animation: 'scanline 2s linear infinite',
                  }} />
                  <div style={{
                    width: '7px', height: '7px', borderRadius: '50%',
                    background: '#14F195',
                    boxShadow: '0 0 6px 2px rgba(20,241,149,0.6)',
                    transform: `translate(${lp.x}px, ${lp.y}px)`,
                    transition: 'transform 0.04s linear',
                    flexShrink: 0, position: 'relative', zIndex: 1,
                  }} />
                </>)}
              </div>

              <div ref={rightEyeRef} style={{
                width: '18px', height: eyeH,
                background: '#050510',
                border: '1px solid rgba(153,69,255,0.35)',
                borderRadius: '3px', display: 'flex',
                alignItems: 'center', justifyContent: 'center',
                overflow: 'hidden', transition: 'height 0.06s',
                boxShadow: '0 0 8px rgba(153,69,255,0.15)',
                position: 'relative',
              }}>
                {!blink && (<>
                  <div style={{
                    position: 'absolute', left: 0, right: 0, height: '3px',
                    background: 'rgba(153,69,255,0.18)',
                    animation: 'scanline 2s linear infinite 0.9s',
                  }} />
                  <div style={{
                    width: '7px', height: '7px', borderRadius: '50%',
                    background: '#9945FF',
                    boxShadow: '0 0 6px 2px rgba(153,69,255,0.6)',
                    transform: `translate(${rp.x}px, ${rp.y}px)`,
                    transition: 'transform 0.04s linear',
                    flexShrink: 0, position: 'relative', zIndex: 1,
                  }} />
                </>)}
              </div>
            </div>

            {/* Mond */}
            <div style={{ display: 'flex', gap: '3px', position: 'relative', zIndex: 1 }}>
              {[0, 1, 2].map(i => (
                <div key={i} style={{
                  width: '5px', height: '3px', borderRadius: '1px',
                  background: i === 1 ? 'rgba(20,241,149,0.5)' : 'rgba(20,241,149,0.18)',
                }} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
