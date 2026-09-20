import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import { isAdminAuthenticated } from "@/lib/adminAuth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json(
      { ok: false, error: "Unauthorized" },
      { status: 401 }
    );
  }

  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    return NextResponse.json(
      { ok: false, error: "DATABASE_URL is not configured." },
      { status: 500 }
    );
  }

  try {
    const sql = neon(databaseUrl);

    const [stats] = await sql`
      SELECT
        COUNT(*) FILTER (WHERE status = 'delivered')::int AS delivered,
        COUNT(*) FILTER (WHERE status = 'processing')::int AS processing,
        COUNT(*) FILTER (WHERE status = 'failed')::int AS failed,
        COUNT(DISTINCT buyer_wallet) FILTER (WHERE status = 'delivered')::int AS unique_buyers,
        COALESCE(SUM(sol_lamports) FILTER (WHERE status = 'delivered'), 0)::text AS sol_lamports,
        COALESCE(SUM(rcx_raw_amount) FILTER (WHERE status = 'delivered'), 0)::text AS rcx_raw
      FROM purchases
    `;

    return NextResponse.json({
      ok: true,
      stats: {
        delivered: Number(stats.delivered),
        processing: Number(stats.processing),
        failed: Number(stats.failed),
        uniqueBuyers: Number(stats.unique_buyers),
        solReceived: Number(stats.sol_lamports) / 1_000_000_000,
        rcxSold: Number(stats.rcx_raw) / 1_000_000_000,
      },
    });
  } catch (error) {
    console.error("ADMIN OVERVIEW ERROR:", error);

    return NextResponse.json(
      { ok: false, error: "Не вдалося завантажити статистику." },
      { status: 500 }
    );
  }
}
