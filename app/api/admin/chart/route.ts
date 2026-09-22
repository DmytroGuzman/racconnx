import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import { isAdminAuthenticated } from "@/lib/adminAuth";

import {
  Connection,
  PublicKey,
  LAMPORTS_PER_SOL,
} from "@solana/web3.js";

import { getMint } from "@solana/spl-token";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const RPC_URL =
  process.env.SOLANA_RPC_URL ??
  "https://api.mainnet-beta.solana.com";

export async function GET() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json(
      {
        ok: false,
        error: "Unauthorized",
      },
      {
        status: 401,
      }
    );
  }

  const databaseUrl =
    process.env.DATABASE_URL;

  const mintAddress =
    process.env.RCX_MINT;

  if (!databaseUrl) {
    return NextResponse.json(
      {
        ok: false,
        error:
          "DATABASE_URL is missing.",
      },
      {
        status: 500,
      }
    );
  }

  if (!mintAddress) {
    return NextResponse.json(
      {
        ok: false,
        error:
          "RCX_MINT is not configured.",
      },
      {
        status: 500,
      }
    );
  }

  try {
    const sql =
      neon(databaseUrl);

    const connection =
      new Connection(
        RPC_URL,
        "confirmed"
      );

    const mint =
      new PublicKey(
        mintAddress
      );

    const mintInfo =
      await getMint(
        connection,
        mint
      );

    const rcxMultiplier =
      10 ** mintInfo.decimals;

    const rows =
      await sql`
        SELECT
          DATE(created_at)
            AS day,

          COUNT(*) FILTER (
            WHERE status = 'delivered'
          )::int AS purchases,

          COALESCE(
            SUM(sol_lamports)
              FILTER (
                WHERE status = 'delivered'
              ),
            0
          )::text AS sol_lamports,

          COALESCE(
            SUM(rcx_raw_amount)
              FILTER (
                WHERE status = 'delivered'
              ),
            0
          )::text AS rcx_raw

        FROM purchases

        WHERE
          created_at >=
          NOW() -
          INTERVAL '13 days'

        GROUP BY
          DATE(created_at)

        ORDER BY
          day ASC
      `;

    return NextResponse.json({
      ok: true,

      days:
        rows.map((row) => ({
          day:
            String(row.day),

          purchases:
            Number(
              row.purchases
            ),

          sol:
            Number(
              row.sol_lamports
            ) /
            LAMPORTS_PER_SOL,

          rcx:
            Number(
              row.rcx_raw
            ) /
            rcxMultiplier,
        })),
    });
  } catch (error) {
    console.error(
      "ADMIN CHART ERROR:",
      error
    );

    return NextResponse.json(
      {
        ok: false,

        error:
          error instanceof Error
            ? error.message
            : "Chart query failed.",
      },
      {
        status: 500,
      }
    );
  }
}