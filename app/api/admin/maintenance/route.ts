import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import { isAdminAuthenticated } from "@/lib/adminAuth";
import { getMaintenanceSettings } from "@/lib/maintenanceSettings";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

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
    const settings = await getMaintenanceSettings(db());
    return NextResponse.json({ ok: true, settings });
  } catch (error) {
    console.error("ADMIN MAINTENANCE GET ERROR:", error);
    return NextResponse.json(
      {
        ok: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to load maintenance settings.",
      },
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
    const enabled = body.enabled === true;
    const message = String(body.message ?? "").trim();

    if (!message || message.length > 500) {
      return NextResponse.json(
        { ok: false, error: "Повідомлення має містити від 1 до 500 символів." },
        { status: 400 }
      );
    }

    const sql = db();
    await getMaintenanceSettings(sql);

    const [row] = await sql`
      UPDATE maintenance_settings
      SET
        enabled = ${enabled},
        message = ${message},
        updated_at = NOW()
      WHERE id = 1
      RETURNING enabled, message, updated_at
    `;

    return NextResponse.json({
      ok: true,
      settings: {
        enabled: Boolean(row.enabled),
        message: String(row.message),
        updatedAt: String(row.updated_at),
      },
    });
  } catch (error) {
    console.error("ADMIN MAINTENANCE PUT ERROR:", error);
    return NextResponse.json(
      {
        ok: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to save maintenance settings.",
      },
      { status: 500 }
    );
  }
}
