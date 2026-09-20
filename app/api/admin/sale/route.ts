import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import { isAdminAuthenticated } from "@/lib/adminAuth";
import { getSaleSettings } from "@/lib/saleSettings";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function envDefaults() {
  const rcxPerSol = Number(process.env.RCX_PER_SOL);
  const minPurchaseSol = Number(process.env.MIN_PURCHASE_SOL ?? "0.001");
  const maxPurchaseSol = Number(process.env.MAX_PURCHASE_SOL);

  if (
    !Number.isInteger(rcxPerSol) ||
    rcxPerSol <= 0 ||
    !Number.isFinite(minPurchaseSol) ||
    minPurchaseSol <= 0 ||
    !Number.isFinite(maxPurchaseSol) ||
    maxPurchaseSol < minPurchaseSol
  ) {
    throw new Error("Sale environment defaults are invalid.");
  }

  return { rcxPerSol, minPurchaseSol, maxPurchaseSol };
}

function db() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is not configured.");
  return neon(url);
}

export async function GET() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const settings = await getSaleSettings(db(), envDefaults());
    return NextResponse.json({ ok: true, settings });
  } catch (error) {
    console.error("ADMIN SALE GET ERROR:", error);
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : "Failed to load sale settings." },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();

    const active = body.active === true;
    const rcxPerSol = Number(body.rcxPerSol);
    const minPurchaseSol = Number(body.minPurchaseSol);
    const maxPurchaseSol = Number(body.maxPurchaseSol);

    if (!Number.isInteger(rcxPerSol) || rcxPerSol <= 0) {
      return NextResponse.json(
        { ok: false, error: "RCX per SOL має бути цілим числом більше 0." },
        { status: 400 }
      );
    }

    if (!Number.isFinite(minPurchaseSol) || minPurchaseSol <= 0) {
      return NextResponse.json(
        { ok: false, error: "Мінімальна покупка має бути більше 0 SOL." },
        { status: 400 }
      );
    }

    if (!Number.isFinite(maxPurchaseSol) || maxPurchaseSol < minPurchaseSol) {
      return NextResponse.json(
        { ok: false, error: "Максимальна покупка не може бути меншою за мінімальну." },
        { status: 400 }
      );
    }

    const sql = db();

    await getSaleSettings(sql, envDefaults());

    const [row] = await sql`
      UPDATE sale_settings
      SET
        active = ${active},
        rcx_per_sol = ${rcxPerSol},
        min_purchase_sol = ${minPurchaseSol},
        max_purchase_sol = ${maxPurchaseSol},
        updated_at = NOW()
      WHERE id = 1
      RETURNING
        active,
        rcx_per_sol::text,
        min_purchase_sol,
        max_purchase_sol,
        updated_at
    `;

    return NextResponse.json({
      ok: true,
      settings: {
        active: Boolean(row.active),
        rcxPerSol: Number(row.rcx_per_sol),
        minPurchaseSol: Number(row.min_purchase_sol),
        maxPurchaseSol: Number(row.max_purchase_sol),
        updatedAt: String(row.updated_at),
      },
    });
  } catch (error) {
    console.error("ADMIN SALE PUT ERROR:", error);
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : "Failed to save sale settings." },
      { status: 500 }
    );
  }
}
