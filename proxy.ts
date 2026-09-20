import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import { getMaintenanceSettings } from "@/lib/maintenanceSettings";

export async function proxy(request: NextRequest) {
  try {
    const databaseUrl = process.env.DATABASE_URL;

    if (!databaseUrl) {
      return NextResponse.next();
    }

    const sql = neon(databaseUrl);
    const settings = await getMaintenanceSettings(sql);

    if (settings.enabled) {
      const maintenanceUrl = request.nextUrl.clone();

      maintenanceUrl.pathname = "/maintenance";
      maintenanceUrl.search = "";

      return NextResponse.redirect(maintenanceUrl);
    }

    return NextResponse.next();
  } catch (error) {
    console.error("MAINTENANCE PROXY ERROR:", error);

    return NextResponse.next();
  }
}

export const config = {
  matcher: [
    "/((?!admin(?:/|$)|api(?:/|$)|maintenance(?:/|$)|_next(?:/|$)|.*\\..*).*)",
  ],
};
