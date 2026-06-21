"use client";

import { useEffect, useRef, useState } from "react";

/**
 * CircuitBackground — SolSweep hero
 * ---------------------------------
 * Animated circuit-board hero background.
 * - Dim purple/green traces at rest, glow that follows the mouse.
 * - The SolSweep sweep-curve (S-shape from the logo) sits in the center,
 *   rendered in the Solana gradient (#9945FF -> #14F195) with a soft pulse.
 *
 * The canvas sits at z-0; the pointermove listener is on window so the glow
 * keeps tracking even when content (z-10) sits above the canvas.
 */

type RGB = [number, number, number];

interface CircuitBackgroundProps {
  /** Solana purple (default #9945FF) */
  purple?: RGB;
  /** Solana green (default #14F195) */
  green?: RGB;
  /** Show the center S-monogram. Set false for a pure-background variant. */
  showLogo?: boolean;
  /** Sweep-curve scale multiplier (default 3.4) */
  logoScale?: number;
  /** Hover light radius in px (default 170) */
  hoverRadius?: number;
  /** Background color (default #05050a) */
  background?: string;
  className?: string;
}

export default function CircuitBackground({
  purple = [153, 69, 255],
  green = [20, 241, 149],
  showLogo = true,
  logoScale = 3.4,
  hoverRadius = 170,
  background = "#05050a",
  className = "",
}: CircuitBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  // Hint toont elke pagina-load opnieuw; verdwijnt bij hover/klik binnen de sessie
  const [showHint, setShowHint] = useState(true);

  useEffect(() => {
    // non-null assertions zodat de nested closures onder strict TS compileren
    const cv = canvasRef.current!;
    if (!cv) return;
    const ctx = cv.getContext("2d")!;
    if (!ctx) return;

    const DPR = Math.min(window.devicePixelRatio || 1, 2);
    let W = 0;
    let H = 0;
    let cx = 0;
    let cy = 0;
    let raf = 0;
    let t = 0;

    type Pt = { x: number; y: number };
    type Trace = { pts: Pt[]; node: boolean; hue: RGB };
    let traces: Trace[] = [];

    const rand = (a: number, b: number) => a + Math.random() * (b - a);

    // Wave: lichtgolf vanuit het midden die alle traces oplicht
    let waveT = -1;            // tijd sinds wave-start, -1 = inactief
    const WAVE_DUR = 2.1;      // seconden tot de golf de rand bereikt
    const WAVE_BAND = 140;     // dikte van de oplichtende band in px
    const FLASH_DUR = 0.22;    // korte begin-flits
    let lastGem = -Infinity;   // cooldown voor de gem-hover (max 1x/5s)

    function buildTraces() {
      traces = [];
      cx = W / 2;
      cy = H / 2;
      const spokes = 16;
      for (let i = 0; i < spokes; i++) {
        const ang = (i / spokes) * Math.PI * 2 + rand(-0.12, 0.12);
        let x = cx + Math.cos(ang) * rand(85, 120);
        let y = cy + Math.sin(ang) * rand(60, 90);
        const pts: Pt[] = [{ x, y }];
        let dir = ang;
        const segs = Math.floor(rand(4, 9));
        for (let s = 0; s < segs; s++) {
          const len = rand(40, 100);
          if (s > 0 && Math.random() < 0.7) {
            dir += (Math.random() < 0.5 ? 1 : -1) * (Math.PI / 4);
          }
          x += Math.cos(dir) * len;
          y += Math.sin(dir) * len;
          pts.push({ x, y });
          if (x < -40 || x > W + 40 || y < -40 || y > H + 40) break;
        }
        traces.push({ pts, node: Math.random() < 0.6, hue: Math.random() < 0.5 ? purple : green });
      }
      for (let i = 0; i < 8; i++) {
        let x = rand(0, W);
        let y = rand(0, H);
        const pts: Pt[] = [{ x, y }];
        let dir = rand(0, Math.PI * 2);
        for (let s = 0; s < 4; s++) {
          dir += (Math.random() < 0.5 ? 1 : -1) * (Math.PI / 4);
          x += Math.cos(dir) * rand(40, 90);
          y += Math.sin(dir) * rand(40, 90);
          pts.push({ x, y });
        }
        traces.push({ pts, node: Math.random() < 0.5, hue: Math.random() < 0.5 ? purple : green });
      }

      // Extra dichtheid aan de ZIJKANTEN (linker- en rechterkwart), niet in het midden
      const sideCount = 22;
      for (let i = 0; i < sideCount; i++) {
        const leftSide = i % 2 === 0;
        // Startpunt in de linker- of rechterkwart van het scherm
        let x = leftSide ? rand(-20, W * 0.28) : rand(W * 0.72, W + 20);
        let y = rand(-20, H + 20);
        const pts: Pt[] = [{ x, y }];
        // Begin overwegend horizontaal naar de rand toe, met haakse knikken
        let dir = leftSide ? Math.PI : 0;
        const segs = Math.floor(rand(3, 7));
        for (let s = 0; s < segs; s++) {
          if (s > 0 && Math.random() < 0.75) {
            dir += (Math.random() < 0.5 ? 1 : -1) * (Math.PI / 4);
          }
          x += Math.cos(dir) * rand(35, 95);
          y += Math.sin(dir) * rand(35, 95);
          pts.push({ x, y });
          if (x < -60 || x > W + 60 || y < -60 || y > H + 60) break;
        }
        traces.push({ pts, node: Math.random() < 0.6, hue: Math.random() < 0.5 ? purple : green });
      }
    }

    function resize() {
      const r = cv.getBoundingClientRect();
      W = r.width;
      H = r.height;
      cv.width = W * DPR;
      cv.height = H * DPR;
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
      buildTraces();
    }

    function drawSweep() {
      const pulse = 0.6 + 0.4 * Math.sin(t * 1.8);
      ctx.save();
      // Iets hoger gepositioneerd, en subtieler door lagere opacity
      ctx.globalAlpha = 0.4 + pulse * 0.12;
      ctx.translate(cx, cy - H * 0.12);
      ctx.scale(logoScale, logoScale);
      ctx.translate(-23, -24);

      const g2 = ctx.createLinearGradient(0, 0, 48, 48);
      g2.addColorStop(0, `rgb(${purple[0]},${purple[1]},${purple[2]})`);
      g2.addColorStop(1, `rgb(${green[0]},${green[1]},${green[2]})`);
      ctx.strokeStyle = g2;
      ctx.lineWidth = 4;
      ctx.lineCap = "round";
      ctx.shadowColor = `rgba(120,160,255,${0.25 + pulse * 0.2})`;
      ctx.shadowBlur = 10 + pulse * 8;
      ctx.beginPath();
      ctx.moveTo(32, 16);
      ctx.quadraticCurveTo(18, 14, 18, 21);
      ctx.quadraticCurveTo(18, 27, 30, 27);
      ctx.quadraticCurveTo(42, 27, 30, 34);
      ctx.quadraticCurveTo(18, 39, 14, 32);
      ctx.stroke();
      ctx.restore();
    }

    // Hover op de gem (midden) → lichtgolf + hint verbergen
    function draw() {
      t += 0.016;
      ctx.clearRect(0, 0, W, H);

      // Wave-front voortgang
      let waveFront = -1; // -1 = geen actieve golf
      let flash = 0;      // korte flits aan het begin
      if (waveT >= 0) {
        waveT += 0.016;
        const wp = Math.min(waveT / WAVE_DUR, 1);
        const eased = 1 - Math.pow(1 - wp, 2); // ease-out
        waveFront = eased * Math.hypot(W, H) * 0.5;
        // Flits piekt direct bij start en dooft snel uit
        if (waveT < FLASH_DUR) flash = 1 - waveT / FLASH_DUR;
        if (wp >= 1) waveT = -1;
      }
      // Hoeveel een punt oplicht door de golfband
      const waveLit = (px: number, py: number) => {
        if (waveFront < 0) return 0;
        const d = Math.abs(Math.hypot(px - cx, py - cy) - waveFront);
        if (d > WAVE_BAND) return 0;
        const v = 1 - d / WAVE_BAND;
        return v * v;
      };

      for (const tr of traces) {
        const p = tr.pts;
        for (let i = 0; i < p.length - 1; i++) {
          const a = p[i];
          const b = p[i + 1];
          // Alleen oplichten door de lichtgolf, niet door de muis
          const lit = waveLit((a.x + b.x) / 2, (a.y + b.y) / 2);
          // Ruststand: neutraal grijswit (geen kleur). Kleur fade-t in met 'lit'.
          const rest: RGB = [150, 155, 170];
          const k = Math.min(1, lit * 1.4);
          const col: RGB = [
            Math.round(rest[0] + (tr.hue[0] - rest[0]) * k),
            Math.round(rest[1] + (tr.hue[1] - rest[1]) * k),
            Math.round(rest[2] + (tr.hue[2] - rest[2]) * k),
          ];
          // Onzichtbaar in ruststand; alleen zichtbaar bij hover of wave
          if (lit <= 0.01) continue;
          const alpha = lit * 0.95;
          if (lit > 0.05) {
            ctx.shadowColor = `rgba(${tr.hue[0]},${tr.hue[1]},${tr.hue[2]},${lit})`;
            ctx.shadowBlur = 12 * lit;
          } else {
            ctx.shadowBlur = 0;
          }
          ctx.strokeStyle = `rgba(${col[0]},${col[1]},${col[2]},${alpha})`;
          ctx.lineWidth = 1 + lit * 1.5;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
        ctx.shadowBlur = 0;
        if (tr.node) {
          const np = p[p.length - 1];
          // Alleen oplichten door de lichtgolf, niet door de muis
          const lit = waveLit(np.x, np.y);
          // Onzichtbaar in ruststand
          if (lit <= 0.01) continue;
          const restN: RGB = [150, 155, 170];
          const kn = Math.min(1, lit * 1.4);
          const nc: RGB = [
            Math.round(restN[0] + (tr.hue[0] - restN[0]) * kn),
            Math.round(restN[1] + (tr.hue[1] - restN[1]) * kn),
            Math.round(restN[2] + (tr.hue[2] - restN[2]) * kn),
          ];
          ctx.fillStyle = `rgba(${nc[0]},${nc[1]},${nc[2]},${lit * 0.9})`;
          if (lit > 0.05) {
            ctx.shadowColor = `rgba(${tr.hue[0]},${tr.hue[1]},${tr.hue[2]},${lit})`;
            ctx.shadowBlur = 10 * lit;
          }
          ctx.beginPath();
          ctx.arc(np.x, np.y, 2.5 + lit * 2, 0, Math.PI * 2);
          ctx.fill();
          ctx.shadowBlur = 0;
        }
      }

      if (showLogo) drawSweep();

      // Begin-flits: korte zachte radiale lichtpuls vanuit het midden
      if (flash > 0) {
        ctx.save();
        const fr = Math.hypot(W, H) * 0.5;
        const fg = ctx.createRadialGradient(cx, cy, 0, cx, cy, fr);
        fg.addColorStop(0, `rgba(190,210,255,${0.28 * flash})`);
        fg.addColorStop(0.4, `rgba(140,120,255,${0.12 * flash})`);
        fg.addColorStop(1, "rgba(0,0,0,0)");
        ctx.fillStyle = fg;
        ctx.fillRect(0, 0, W, H);
        ctx.restore();
      }

      raf = requestAnimationFrame(draw);
    }

    // Hover over de diamant (midden) → lichtgolf + gem-spin, max 1x per 5s
    function onMove(e: PointerEvent) {
      const r = cv.getBoundingClientRect();
      const gx = cx;
      const gy = cy + (W < 768 ? 50 : 0);
      const dist = Math.hypot(e.clientX - r.left - gx, e.clientY - r.top - gy);
      const radius = W < 768 ? 120 : 160;
      if (dist > radius) return;
      const now = performance.now() / 1000;
      if (now - lastGem < 5) return;
      lastGem = now;
      waveT = 0;
      setShowHint(false);
      window.dispatchEvent(new CustomEvent("gem-spin"));
    }

    resize();
    draw();
    window.addEventListener("resize", resize);
    window.addEventListener("pointermove", onMove);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("resize", resize);
    };
  }, [purple, green, showLogo, logoScale, hoverRadius, background]);

  return (
    <>
      <canvas
        ref={canvasRef}
        className={className}
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          display: "block",
          background,
          zIndex: 0,
        }}
        aria-hidden="true"
      />
      {showHint && (
        <div className="gem-hint">
          <style>{`
            @keyframes gem-hint-bob { 0%,100% { transform: translateX(-50%) translateY(0); } 50% { transform: translateX(-50%) translateY(5px); } }
            @keyframes gem-hint-glow { 0%,100% { opacity: 0.7; } 50% { opacity: 1; } }
            .gem-hint {
              position: absolute;
              top: calc(50% + 165px);
              left: 50%;
              transform: translateX(-50%);
              z-index: 11;
              pointer-events: none;
              animation: gem-hint-bob 2.4s ease-in-out infinite;
            }
            .gem-hint span {
              font-family: 'General Sans', sans-serif;
              font-weight: 600;
              font-size: 0.8rem;
              letter-spacing: 0.04em;
              color: #fff;
              background: rgba(20,12,40,0.6);
              border: 1px solid rgba(153,69,255,0.4);
              border-radius: 999px;
              padding: 7px 16px;
              backdrop-filter: blur(8px);
              -webkit-backdrop-filter: blur(8px);
              box-shadow: 0 0 18px rgba(153,69,255,0.35);
              white-space: nowrap;
              animation: gem-hint-glow 2.4s ease-in-out infinite;
            }
            @media (max-width: 767px) {
              .gem-hint { display: none; }
            }
          `}</style>
          <span>✦ Tap the gem</span>
        </div>
      )}
    </>
  );
}
