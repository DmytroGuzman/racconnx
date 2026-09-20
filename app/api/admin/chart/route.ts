import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import { isAdminAuthenticated } from "@/lib/adminAuth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    return NextResponse.json({ ok: false, error: "DATABASE_URL is missing." }, { status: 500 });
  }

  try {
    const sql = neon(databaseUrl);

    const rows = await sql`
      SELECT
        DATE(created_at) AS day,
        COUNT(*) FILTER (WHERE status = 'delivered')::int AS purchases,
        COALESCE(SUM(sol_lamports) FILTER (WHERE status = 'delivered'), 0)::text AS sol_lamports,
        COALESCE(SUM(rcx_raw_amount) FILTER (WHERE status = 'delivered'), 0)::text AS rcx_raw
      FROM purchases
      WHERE created_at >= NOW() - INTERVAL '13 days'
      GROUP BY DATE(created_at)
      ORDER BY day ASC
    `;

    return NextResponse.json({
      ok: true,
      days: rows.map((row) => ({
        day: String(row.day),
        purchases: Number(row.purchases),
        sol: Number(row.sol_lamports) / 1_000_000_000,
        rcx: Number(row.rcx_raw) / 1_000_000_000,
      })),
    });
  } catch (error) {
    console.error("ADMIN CHART ERROR:", error);
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : "Chart query failed." },
      { status: 500 }
    );
  }
}
