import type { NeonQueryFunction } from "@neondatabase/serverless";

export type MaintenanceSettings = {
  enabled: boolean;
  message: string;
  updatedAt: string | null;
};

const DEFAULT_MESSAGE =
  "We're upgrading RaccoonX. We'll be back soon.";

export async function ensureMaintenanceSettings(
  sql: NeonQueryFunction<false, false>
) {
  await sql`
    CREATE TABLE IF NOT EXISTS maintenance_settings (
      id SMALLINT PRIMARY KEY CHECK (id = 1),
      enabled BOOLEAN NOT NULL DEFAULT FALSE,
      message TEXT NOT NULL DEFAULT 'We''re upgrading RaccoonX. We''ll be back soon.',
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;
}

export async function getMaintenanceSettings(
  sql: NeonQueryFunction<false, false>
): Promise<MaintenanceSettings> {
  await ensureMaintenanceSettings(sql);

  await sql`
    INSERT INTO maintenance_settings (
      id,
      enabled,
      message
    )
    VALUES (
      1,
      FALSE,
      ${DEFAULT_MESSAGE}
    )
    ON CONFLICT (id) DO NOTHING
  `;

  const rows = await sql`
    SELECT
      enabled,
      message,
      updated_at
    FROM maintenance_settings
    WHERE id = 1
  `;

  const row = rows[0];

  if (!row) {
    throw new Error("Maintenance settings row was not created.");
  }

  return {
    enabled: Boolean(row.enabled),
    message: String(row.message || DEFAULT_MESSAGE),
    updatedAt: row.updated_at
      ? String(row.updated_at)
      : null,
  };
}