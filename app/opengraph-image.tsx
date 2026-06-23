import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "SolSweeper — Reclaim your SOL";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "90px",
          background:
            "radial-gradient(ellipse 90% 80% at 75% 60%, #221140 0%, #0a0618 60%, #06040d 100%)",
          fontFamily: "sans-serif",
          position: "relative",
        }}
      >
        {/* Glow accents */}
        <div
          style={{
            position: "absolute",
            bottom: -120,
            left: -80,
            width: 520,
            height: 520,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(153,69,255,0.45), transparent 70%)",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: -100,
            right: -60,
            width: 460,
            height: 460,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(20,241,149,0.30), transparent 70%)",
          }}
        />

        {/* Eyebrow */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
            fontSize: 28,
            letterSpacing: 4,
            textTransform: "uppercase",
            color: "rgba(255,255,255,0.6)",
            marginBottom: 28,
          }}
        >
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 12,
              background: "linear-gradient(135deg, #9945FF, #14F195)",
            }}
          />
          SolSweeper
        </div>

        {/* Title */}
        <div
          style={{
            fontSize: 108,
            fontWeight: 800,
            lineHeight: 1.02,
            letterSpacing: -3,
            color: "#ffffff",
          }}
        >
          Sweep Your
          <br />
          Dust Into SOL
        </div>

        {/* Subtitle */}
        <div
          style={{
            fontSize: 34,
            color: "rgba(255,255,255,0.55)",
            marginTop: 36,
            maxWidth: 820,
          }}
        >
          Close empty token accounts, reclaim locked SOL, and clean your wallet in one click.
        </div>
      </div>
    ),
    { ...size }
  );
}
