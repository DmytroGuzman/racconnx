import type { NeonQueryFunction } from "@neondatabase/serverless";
import { createHash } from "crypto";
import type { NextRequest } from "next/server";

type LimitResult = {
  allowed: boolean;
  remaining: number;
  retryAfterSeconds: number;
};

export async function ensureRateLimitTable(
  sql: NeonQueryFunction<false, false>
) {
  await sql`
    CREATE TABLE IF NOT EXISTS api_rate_limits (
      bucket TEXT NOT NULL,
      client_key TEXT NOT NULL,
      window_start TIMESTAMPTZ NOT NULL,
      request_count INTEGER NOT NULL DEFAULT 0,
      PRIMARY KEY (bucket, client_key)
    )
  `;
}

export function getClientKey(request: NextRequest) {
  /*
   * On common reverse proxies/Vercel, x-forwarded-for is populated by the
   * platform. We hash it so the database does not store a raw IP address.
   * If no proxy IP is available, use a conservative shared fallback bucket.
   */
  const forwarded = request.headers.get("x-forwarded-for");
  const realIp = request.headers.get("x-real-ip");
  const ip = forwarded?.split(",")[0]?.trim() || realIp?.trim() || "unknown";

  return createHash("sha256").update(ip).digest("hex");
}

export async function checkRateLimit(
  sql: NeonQueryFunction<false, false>,
  bucket: string,
  clientKey: string,
  limit: number,
  windowSeconds: number
): Promise<LimitResult> {
  await ensureRateLimitTable(sql);

  const rows = await sql`
    INSERT INTO api_rate_limits (
      bucket,
      client_key,
      window_start,
      request_count
    )
    VALUES (
      ${bucket},
      ${clientKey},
      NOW(),
      1
    )
    ON CONFLICT (bucket, client_key)
    DO UPDATE SET
      window_start = CASE
        WHEN api_rate_limits.window_start <= NOW() - (${windowSeconds} * INTERVAL '1 second')
          THEN NOW()
        ELSE api_rate_limits.window_start
      END,
      request_count = CASE
        WHEN api_rate_limits.window_start <= NOW() - (${windowSeconds} * INTERVAL '1 second')
          THEN 1
        ELSE api_rate_limits.request_count + 1
      END
    RETURNING
      request_count,
      GREATEST(
        0,
        CEIL(
          EXTRACT(
            EPOCH FROM (
              window_start + (${windowSeconds} * INTERVAL '1 second') - NOW()
            )
          )
        )
      )::INTEGER AS retry_after
  `;

  const count = Number(rows[0]?.request_count ?? limit + 1);
  const retryAfterSeconds = Math.max(1, Number(rows[0]?.retry_after ?? windowSeconds));

  return {
    allowed: count <= limit,
    remaining: Math.max(0, limit - count),
    retryAfterSeconds,
  };
}
