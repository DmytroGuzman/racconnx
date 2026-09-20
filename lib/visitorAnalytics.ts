import type { NeonQueryFunction } from "@neondatabase/serverless";

export async function ensureVisitorAnalytics(
  sql: NeonQueryFunction<false, false>
) {
  await sql`
    CREATE TABLE IF NOT EXISTS site_visitors (
      visitor_id TEXT PRIMARY KEY,
      first_seen TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      last_seen TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      page_views BIGINT NOT NULL DEFAULT 0
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS site_visitor_daily (
      day DATE NOT NULL,
      visitor_id TEXT NOT NULL,
      page_views BIGINT NOT NULL DEFAULT 0,
      last_seen TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      PRIMARY KEY (day, visitor_id)
    )
  `;

  await sql`
    CREATE INDEX IF NOT EXISTS site_visitors_last_seen_idx
    ON site_visitors (last_seen)
  `;

  await sql`
    CREATE INDEX IF NOT EXISTS site_visitor_daily_day_idx
    ON site_visitor_daily (day)
  `;
}
