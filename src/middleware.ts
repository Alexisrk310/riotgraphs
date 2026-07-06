import { NextResponse, type NextRequest } from "next/server";

const RATE_LIMIT_MAX = 120;
const RATE_LIMIT_WINDOW_MS = 60_000;
const bucket = new Map<string, { count: number; reset: number }>();

function ratelimit(key: string): { ok: boolean; remaining: number; reset: number } {
  const now = Date.now();
  const entry = bucket.get(key);
  if (!entry || entry.reset < now) {
    bucket.set(key, { count: 1, reset: now + RATE_LIMIT_WINDOW_MS });
    return { ok: true, remaining: RATE_LIMIT_MAX - 1, reset: now + RATE_LIMIT_WINDOW_MS };
  }
  entry.count += 1;
  return { ok: entry.count <= RATE_LIMIT_MAX, remaining: Math.max(0, RATE_LIMIT_MAX - entry.count), reset: entry.reset };
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (pathname.startsWith("/api/")) {
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "anon";
    const rl = ratelimit(`${ip}:${pathname}`);
    if (!rl.ok) {
      return new NextResponse(JSON.stringify({ error: "rate_limited" }), {
        status: 429,
        headers: {
          "content-type": "application/json",
          "x-ratelimit-remaining": String(rl.remaining),
          "x-ratelimit-reset": String(rl.reset),
        },
      });
    }
    const res = NextResponse.next();
    res.headers.set("x-ratelimit-remaining", String(rl.remaining));
    return res;
  }

  const res = NextResponse.next();
  res.headers.set("x-frame-options", "DENY");
  res.headers.set("referrer-policy", "strict-origin-when-cross-origin");
  return res;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)"],
};
