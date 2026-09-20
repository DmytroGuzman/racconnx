import type { NeonQueryFunction } from "@neondatabase/serverless";

export type SaleSettings = {
  active: boolean;
  rcxPerSol: number;
  minPurchaseSol: number;
  maxPurchaseSol: number;
  updatedAt: string | null;
};

export async function ensureSaleSettings(
  sql: NeonQueryFunction<false, false>
) {
  await sql`
    CREATE TABLE IF NOT EXISTS sale_settings (
      id SMALLINT PRIMARY KEY CHECK (id = 1),
      active BOOLEAN NOT NULL DEFAULT TRUE,
      rcx_per_sol BIGINT NOT NULL CHECK (rcx_per_sol > 0),
      min_purchase_sol DOUBLE PRECISION NOT NULL CHECK (min_purchase_sol > 0),
      max_purchase_sol DOUBLE PRECISION NOT NULL CHECK (max_purchase_sol >= min_purchase_sol),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;
}

export async function getSaleSettings(
  sql: NeonQueryFunction<false, false>,
  defaults: {
    rcxPerSol: number;
    minPurchaseSol: number;
    maxPurchaseSol: number;
  }
): Promise<SaleSettings> {
  await ensureSaleSettings(sql);

  await sql`
    INSERT INTO sale_settings (
      id,
      active,
      rcx_per_sol,
      min_purchase_sol,
      max_purchase_sol
    )
    VALUES (
      1,
      TRUE,
      ${defaults.rcxPerSol},
      ${defaults.minPurchaseSol},
      ${defaults.maxPurchaseSol}
    )
    ON CONFLICT (id) DO NOTHING
  `;

  const [row] = await sql`
    SELECT
      active,
      rcx_per_sol::text,
      min_purchase_sol,
      max_purchase_sol,
      updated_at
    FROM sale_settings
    WHERE id = 1
  `;

  return {
    active: Boolean(row.active),
    rcxPerSol: Number(row.rcx_per_sol),
    minPurchaseSol: Number(row.min_purchase_sol),
    maxPurchaseSol: Number(row.max_purchase_sol),
    updatedAt: row.updated_at ? String(row.updated_at) : null,
  };
}
