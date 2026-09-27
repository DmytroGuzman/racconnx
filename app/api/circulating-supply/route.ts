import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    const databaseUrl = process.env.DATABASE_URL;

    if (!databaseUrl) {
      return NextResponse.json(
        {
          error: "DATABASE_URL is not configured.",
        },
        {
          status: 500,
        }
      );
    }

    const sql = neon(databaseUrl);

    const rows = await sql`
      SELECT
        COALESCE(
          SUM(rcx_raw_amount)
            FILTER (
              WHERE status = 'delivered'
            ),
          0
        )::text AS circulating_raw
      FROM purchases
    `;

    const circulatingRaw = BigInt(
      rows[0]?.circulating_raw ?? "0"
    );

    /*
     * RCX currently uses 6 decimals.
     *
     * 10 RCX = 10,000,000 raw units.
     */
    const RCX_DECIMALS = 6n;
    const divisor = 10n ** RCX_DECIMALS;

    const whole = circulatingRaw / divisor;
    const fraction = circulatingRaw % divisor;

    const circulatingSupply =
      Number(whole) +
      Number(fraction) / Number(divisor);

    return NextResponse.json(
      {
        circulatingSupply,
      },
      {
        headers: {
          "Cache-Control":
            "public, s-maxage=60, stale-while-revalidate=300",
          "Access-Control-Allow-Origin": "*",
        },
      }
    );
  } catch (error) {
    console.error(
      "CIRCULATING SUPPLY API ERROR:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Failed to calculate circulating supply.",
      },
      {
        status: 500,
      }
    );
  }
}