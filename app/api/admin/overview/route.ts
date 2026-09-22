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
          "DATABASE_URL is not configured.",
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

    const [stats] =
      await sql`
        SELECT
          COUNT(*) FILTER (
            WHERE status = 'delivered'
          )::int AS delivered,

          COUNT(*) FILTER (
            WHERE status = 'processing'
          )::int AS processing,

          COUNT(*) FILTER (
            WHERE status = 'failed'
          )::int AS failed,

          COUNT(DISTINCT buyer_wallet)
            FILTER (
              WHERE status = 'delivered'
            )::int AS unique_buyers,

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
      `;

    return NextResponse.json({
      ok: true,

      stats: {
        delivered:
          Number(stats.delivered),

        processing:
          Number(stats.processing),

        failed:
          Number(stats.failed),

        uniqueBuyers:
          Number(
            stats.unique_buyers
          ),

        solReceived:
          Number(
            stats.sol_lamports
          ) /
          LAMPORTS_PER_SOL,

        rcxSold:
          Number(
            stats.rcx_raw
          ) /
          rcxMultiplier,
      },
    });
  } catch (error) {
    console.error(
      "ADMIN OVERVIEW ERROR:",
      error
    );

    return NextResponse.json(
      {
        ok: false,

        error:
          error instanceof Error
            ? error.message
            : "Failed to load admin overview.",
      },
      {
        status: 500,
      }
    );
  }
}