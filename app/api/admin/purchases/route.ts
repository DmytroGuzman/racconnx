import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import { isAdminAuthenticated } from "@/lib/adminAuth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    return NextResponse.json({ ok: false, error: "DATABASE_URL is not configured." }, { status: 500 });
  }

  try {
    const sql = neon(databaseUrl);
    const mode = request.nextUrl.searchParams.get("mode") ?? "all";
    const limitParam = Number(request.nextUrl.searchParams.get("limit") ?? "500");
    const limit = Number.isFinite(limitParam) ? Math.min(Math.max(Math.trunc(limitParam), 1), 1000) : 500;

    const rows = mode === "review"
      ? await sql`
          SELECT id, payment_signature, buyer_wallet, sol_lamports::text,
                 rcx_raw_amount::text, status, rcx_signature, created_at, updated_at
          FROM purchases
          WHERE status IN ('processing', 'failed')
          ORDER BY updated_at DESC
          LIMIT ${limit}
        `
      : await sql`
          SELECT id, payment_signature, buyer_wallet, sol_lamports::text,
                 rcx_raw_amount::text, status, rcx_signature, created_at, updated_at
          FROM purchases
          ORDER BY created_at DESC
          LIMIT ${limit}
        `;

    return NextResponse.json({
      ok: true,
      purchases: rows.map((row) => ({
        id: Number(row.id),
        paymentSignature: String(row.payment_signature),
        buyerWallet: String(row.buyer_wallet),
        sol: Number(row.sol_lamports) / 1_000_000_000,
        rcx: Number(row.rcx_raw_amount) / 1_000_000_000,
        status: String(row.status),
        rcxSignature: row.rcx_signature ? String(row.rcx_signature) : null,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      })),
    });
  } catch (error) {
    console.error("ADMIN PURCHASES ERROR:", error);
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : "Не вдалося завантажити покупки." },
      { status: 500 }
    );
  }
}
