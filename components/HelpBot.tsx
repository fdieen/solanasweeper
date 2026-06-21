'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * HelpBot — FAQ-mascotte
 * ----------------------
 * Schattige witte robotkop met donker scherm en twee teal pixel-ogen.
 * - Ogen volgen subtiel de muis
 * - Knippert af en toe
 * - Zweeft zachtjes + twee zwevende bolletjes eromheen
 * - Op hover: blije "^^" oogjes
 */
export default function HelpBot() {
  const faceRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [blink, setBlink] = useState(false);
  const [happy, setHappy] = useState(false);

  useEffect(() => {
    const track = (e: MouseEvent) => {
      if (!faceRef.current) return;
      const r = faceRef.current.getBoundingClientRect();
      const cx = r.left + r.width / 2;
      const cy = r.top + r.height / 2;
      const ang = Math.atan2(e.clientY - cy, e.clientX - cx);
      const dist = Math.min(Math.hypot(e.clientX - cx, e.clientY - cy), 40);
      const t = Math.min(dist / 40, 1);
      setPos({ x: Math.cos(ang) * 5 * t, y: Math.sin(ang) * 4 * t });
    };
    window.addEventListener('mousemove', track);
    return () => window.removeEventListener('mousemove', track);
  }, []);

  useEffect(() => {
    let to: ReturnType<typeof setTimeout>;
    const loop = () => {
      setBlink(true);
      setTimeout(() => setBlink(false), 130);
      to = setTimeout(loop, 2600 + Math.random() * 3200);
    };
    to = setTimeout(loop, 2200);
    return () => clearTimeout(to);
  }, []);

  const PixelEye = ({ happy }: { happy: boolean }) => {
    if (happy) {
      return (
        <div style={{
          width: '26px', height: '14px',
          borderBottom: '5px solid #14F195',
          borderRadius: '0 0 14px 14px',
          filter: 'drop-shadow(0 0 6px rgba(20,241,149,0.7))',
        }} />
      );
    }
    return (
      <div style={{
        width: '26px',
        height: blink ? '4px' : '26px',
        borderRadius: '50%',
        background: '#14F195',
        boxShadow: '0 0 12px 2px rgba(20,241,149,0.7)',
        transition: 'height 0.1s, transform 0.08s linear',
        transform: `translate(${pos.x}px, ${pos.y}px)`,
        // Pixel-textuur over het oog
        backgroundImage: blink ? 'none' : `
          repeating-linear-gradient(0deg, rgba(0,0,0,0.18) 0 2px, transparent 2px 4px),
          repeating-linear-gradient(90deg, rgba(0,0,0,0.18) 0 2px, transparent 2px 4px)
        `,
      }} />
    );
  };

  return (
    <div className="help-bot">
      <style>{`
        @keyframes helpbot-float { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-8px); } }
        @keyframes sphere-a { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-14px); } }
        @keyframes sphere-b { 0%,100% { transform: translateY(0); } 50% { transform: translateY(12px); } }
        @keyframes antenna-tip { 0%,100% { opacity: 1; box-shadow: 0 0 8px 2px #14F195; } 50% { opacity: 0.5; box-shadow: 0 0 3px 1px #14F195; } }

        .help-bot {
          position: absolute;
          top: 96px;
          right: clamp(24px, 6vw, 90px);
          z-index: 5;
          pointer-events: auto;
          user-select: none;
        }
        @media (max-width: 880px) {
          .help-bot { position: relative; top: 0; right: 0; margin: 100px auto 8px; display: flex; justify-content: center; }
        }
      `}</style>

      <div
        onMouseEnter={() => { setHappy(true); }}
        onMouseLeave={() => { setHappy(false); }}
        style={{
          position: 'relative',
          width: '150px',
          animation: 'helpbot-float 4s ease-in-out infinite',
          cursor: 'pointer',
        }}
      >
        {/* Antenne */}
        <div style={{ width: '3px', height: '16px', background: 'rgba(255,255,255,0.5)', borderRadius: '2px', margin: '0 auto' }} />
        <div style={{ width: '9px', height: '9px', borderRadius: '50%', background: '#14F195', margin: '-2px auto 0', animation: 'antenna-tip 1.8s ease-in-out infinite' }} />

        {/* Oortjes */}
        <div style={{ position: 'absolute', top: '70px', left: '-6px', width: '18px', height: '38px', background: 'linear-gradient(180deg, #2a2a32, #15151b)', borderRadius: '8px', boxShadow: '0 4px 10px rgba(0,0,0,0.4)' }} />
        <div style={{ position: 'absolute', top: '70px', right: '-6px', width: '18px', height: '38px', background: 'linear-gradient(180deg, #2a2a32, #15151b)', borderRadius: '8px', boxShadow: '0 4px 10px rgba(0,0,0,0.4)' }} />

        {/* Kop */}
        <div style={{
          position: 'relative',
          marginTop: '6px',
          width: '150px',
          height: '124px',
          borderRadius: '34px',
          background: 'linear-gradient(160deg, #ffffff 0%, #eef0f5 60%, #dfe2ea 100%)',
          boxShadow: '0 20px 45px rgba(0,0,0,0.45), inset 0 3px 6px rgba(255,255,255,0.9), inset 0 -8px 14px rgba(160,165,180,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          {/* Scherm */}
          <div ref={faceRef} style={{
            width: '116px',
            height: '78px',
            borderRadius: '22px',
            background: 'radial-gradient(ellipse at 30% 25%, #1a1c24 0%, #07080d 70%)',
            boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.8), 0 1px 0 rgba(255,255,255,0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '16px',
            position: 'relative',
            overflow: 'hidden',
          }}>
            {/* Glans */}
            <div style={{ position: 'absolute', top: '8px', left: '12px', width: '30px', height: '14px', borderRadius: '50%', background: 'rgba(255,255,255,0.12)', filter: 'blur(2px)' }} />
            <PixelEye happy={happy} />
            <PixelEye happy={happy} />
          </div>
        </div>

        {/* Nekje */}
        <div style={{ width: '46px', height: '20px', background: 'linear-gradient(180deg, #eef0f5, #d4d7df)', borderRadius: '0 0 16px 16px', margin: '-2px auto 0', boxShadow: '0 6px 12px rgba(0,0,0,0.3)' }} />

        {/* Zwevende bolletjes */}
        <div style={{ position: 'absolute', bottom: '-18px', left: '-2px', width: '26px', height: '26px', borderRadius: '50%', background: 'radial-gradient(circle at 35% 30%, #ffffff, #d2d5de)', boxShadow: '0 6px 14px rgba(0,0,0,0.35)', animation: 'sphere-a 3.4s ease-in-out infinite' }} />
        <div style={{ position: 'absolute', bottom: '-6px', right: '0px', width: '20px', height: '20px', borderRadius: '50%', background: 'radial-gradient(circle at 35% 30%, #ffffff, #d2d5de)', boxShadow: '0 6px 14px rgba(0,0,0,0.35)', animation: 'sphere-b 3.0s ease-in-out infinite' }} />
      </div>
    </div>
  );
}
