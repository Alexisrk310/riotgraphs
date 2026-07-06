import { ImageResponse } from "next/og";

export const runtime = "edge";
export const contentType = "image/png";
export const size = { width: 1200, height: 630 };

export async function GET(req: Request) {
  const url = new URL(req.url);
  const title = url.searchParams.get("title") ?? "RiotGraphs";
  const subtitle = url.searchParams.get("subtitle") ?? "Riot Games analytics reinvented";

  return new ImageResponse(
    (
      <div
        style={{
          background: "linear-gradient(135deg, #05070d 0%, #0b0f1a 50%, #1a1330 100%)",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "80px",
          color: "white",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ fontSize: 32, opacity: 0.7, letterSpacing: 6 }}>RIOTGRAPHS</div>
        <div style={{ fontSize: 96, fontWeight: 800, marginTop: 20, background: "linear-gradient(90deg,#3b82f6,#22d3ee)", backgroundClip: "text", color: "transparent" }}>
          {title}
        </div>
        <div style={{ fontSize: 36, marginTop: 24, opacity: 0.8 }}>{subtitle}</div>
      </div>
    ),
    { ...size }
  );
}
