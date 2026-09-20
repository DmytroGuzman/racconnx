import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import { isAdminAuthenticated } from "@/lib/adminAuth";
import { ensureVisitorAnalytics } from "@/lib/visitorAnalytics";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) throw new Error("DATABASE_URL is not configured.");

    const sql = neon(databaseUrl);
    await ensureVisitorAnalytics(sql);

    const [summary] = await sql`
      SELECT
        (
          SELECT COUNT(*)::BIGINT
          FROM site_visitors
          WHERE last_seen >= NOW() - INTERVAL '90 seconds'
        ) AS online_now,
        (
          SELECT COUNT(*)::BIGINT
          FROM site_visitor_daily
          WHERE day = CURRENT_DATE
        ) AS visitors_today,
        (
          SELECT COUNT(*)::BIGINT
          FROM site_visitors
        ) AS total_visitors,
        (
          SELECT COALESCE(SUM(page_views), 0)::BIGINT
          FROM site_visitors
        ) AS page_views
    `;

    const days = await sql`
      WITH calendar AS (
        SELECT generate_series(
          CURRENT_DATE - INTERVAL '6 days',
          CURRENT_DATE,
          INTERVAL '1 day'
        )::date AS day
      )
      SELECT
        calendar.day::text AS day,
        COUNT(site_visitor_daily.visitor_id)::BIGINT AS visitors,
        COALESCE(SUM(site_visitor_daily.page_views), 0)::BIGINT AS page_views
      FROM calendar
      LEFT JOIN site_visitor_daily
        ON site_visitor_daily.day = calendar.day
      GROUP BY calendar.day
      ORDER BY calendar.day ASC
    `;

    return NextResponse.json(
      {
        ok: true,
        stats: {
          onlineNow: Number(summary.online_now ?? 0),
          visitorsToday: Number(summary.visitors_today ?? 0),
          totalVisitors: Number(summary.total_visitors ?? 0),
          pageViews: Number(summary.page_views ?? 0),
        },
        days: days.map((row) => ({
          day: String(row.day),
          visitors: Number(row.visitors ?? 0),
          pageViews: Number(row.page_views ?? 0),
        })),
      },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (error) {
    console.error("ADMIN ANALYTICS ERROR:", error);
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "Analytics failed.",
      },
      { status: 500 }
    );
  }
}
