import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import { getMaintenanceSettings } from "@/lib/maintenanceSettings";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const databaseUrl = process.env.DATABASE_URL;

    if (!databaseUrl) {
      return NextResponse.json(
        {
          ok: false,
          error: "DATABASE_URL is not configured.",
        },
        { status: 500 }
      );
    }

    const sql = neon(databaseUrl);
    const settings = await getMaintenanceSettings(sql);

    return NextResponse.json(
      {
        ok: true,
        maintenance: settings.enabled,
      },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate",
        },
      }
    );
  } catch (error) {
    console.error("MAINTENANCE STATUS ERROR:", error);

    return NextResponse.json(
      {
        ok: false,
        error: "Failed to check maintenance status.",
      },
      { status: 500 }
    );
  }
}
