import { NextRequest, NextResponse } from "next/server";
import { timingSafeEqual } from "crypto";
import { createAdminSession, getAdminPassword } from "@/lib/adminAuth";
import { neon } from "@neondatabase/serverless";
import { checkRateLimit, getClientKey } from "@/lib/rateLimit";

export const runtime = "nodejs";

function safeEqual(a: string, b: string) {
  const left = Buffer.from(a);
  const right = Buffer.from(b);

  if (left.length !== right.length) return false;

  return timingSafeEqual(left, right);
}

export async function POST(request: NextRequest) {
  try {
    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) {
      throw new Error("DATABASE_URL is not configured.");
    }

    const sql = neon(databaseUrl);
    const limit = await checkRateLimit(
      sql,
      "admin-login",
      getClientKey(request),
      8,
      15 * 60
    );

    if (!limit.allowed) {
      return NextResponse.json(
        { ok: false, error: "Забагато спроб входу. Спробуйте пізніше." },
        {
          status: 429,
          headers: { "Retry-After": String(limit.retryAfterSeconds) },
        }
      );
    }

    const body = await request.json();
    const password = String(body.password ?? "");

    if (!password || !safeEqual(password, getAdminPassword())) {
      return NextResponse.json(
        { ok: false, error: "Невірний пароль." },
        { status: 401 }
      );
    }

    await createAdminSession();

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("ADMIN LOGIN ERROR:", error);

    return NextResponse.json(
      { ok: false, error: "Не вдалося виконати вхід." },
      { status: 500 }
    );
  }
}
