import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import { ensureVisitorAnalytics } from "@/lib/visitorAnalytics";
import { checkRateLimit, getClientKey } from "@/lib/rateLimit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function validVisitorId(value: unknown): value is string {
  return (
    typeof value === "string" &&
    value.length >= 16 &&
    value.length <= 100 &&
    /^[a-zA-Z0-9_-]+$/.test(value)
  );
}

export async function POST(request: NextRequest) {
  try {
    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) {
      return NextResponse.json(
        { ok: false, error: "DATABASE_URL is not configured." },
        { status: 500 }
      );
    }

    const body = await request.json();
    const visitorId = body.visitorId;
    const event = body.event === "pageview" ? "pageview" : "heartbeat";

    if (!validVisitorId(visitorId)) {
      return NextResponse.json(
        { ok: false, error: "Invalid visitor id." },
        { status: 400 }
      );
    }

    const sql = neon(databaseUrl);

    // A normal browser sends roughly 2 requests/minute while active.
    // This leaves generous headroom while making bulk counter inflation costly.
    const limit = await checkRateLimit(
      sql,
      "public-analytics",
      getClientKey(request),
      30,
      60
    );

    if (!limit.allowed) {
      return NextResponse.json(
        { ok: false, error: "Too many analytics requests." },
        {
          status: 429,
          headers: { "Retry-After": String(limit.retryAfterSeconds) },
        }
      );
    }

    await ensureVisitorAnalytics(sql);

    if (event === "pageview") {
      await sql`
        INSERT INTO site_visitors (
          visitor_id,
          first_seen,
          last_seen,
          page_views
        )
        VALUES (
          ${visitorId},
          NOW(),
          NOW(),
          1
        )
        ON CONFLICT (visitor_id)
        DO UPDATE SET
          last_seen = NOW(),
          page_views = site_visitors.page_views + 1
      `;

      await sql`
        INSERT INTO site_visitor_daily (
          day,
          visitor_id,
          page_views,
          last_seen
        )
        VALUES (
          CURRENT_DATE,
          ${visitorId},
          1,
          NOW()
        )
        ON CONFLICT (day, visitor_id)
        DO UPDATE SET
          page_views = site_visitor_daily.page_views + 1,
          last_seen = NOW()
      `;
    } else {
      await sql`
        INSERT INTO site_visitors (
          visitor_id,
          first_seen,
          last_seen,
          page_views
        )
        VALUES (
          ${visitorId},
          NOW(),
          NOW(),
          0
        )
        ON CONFLICT (visitor_id)
        DO UPDATE SET
          last_seen = NOW()
      `;

      await sql`
        INSERT INTO site_visitor_daily (
          day,
          visitor_id,
          page_views,
          last_seen
        )
        VALUES (
          CURRENT_DATE,
          ${visitorId},
          0,
          NOW()
        )
        ON CONFLICT (day, visitor_id)
        DO UPDATE SET
          last_seen = NOW()
      `;
    }

    return NextResponse.json(
      { ok: true },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (error) {
    console.error("VISITOR TRACK ERROR:", error);
    return NextResponse.json(
      { ok: false, error: "Failed to record visitor." },
      { status: 500 }
    );
  }
}
