import {
  NextRequest,
  NextResponse,
} from "next/server";

import { neon } from "@neondatabase/serverless";

import {
  Connection,
  PublicKey,
} from "@solana/web3.js";

import { getMint } from "@solana/spl-token";

import { isAdminAuthenticated } from "@/lib/adminAuth";
import { getSaleSettings } from "@/lib/saleSettings";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/*
|--------------------------------------------------------------------------
| SOLANA
|--------------------------------------------------------------------------
*/

const RPC_URL =
  process.env.SOLANA_RPC_URL ??
  "https://api.mainnet-beta.solana.com";

/*
|--------------------------------------------------------------------------
| ENV DEFAULTS
|--------------------------------------------------------------------------
*/

function envDefaults() {
  const rcxPerSol =
    Number(process.env.RCX_PER_SOL);

  const minPurchaseSol =
    Number(
      process.env.MIN_PURCHASE_SOL ??
        "0.001"
    );

  const maxPurchaseSol =
    Number(
      process.env.MAX_PURCHASE_SOL
    );

  if (
    !Number.isInteger(rcxPerSol) ||
    rcxPerSol <= 0 ||
    !Number.isFinite(minPurchaseSol) ||
    minPurchaseSol <= 0 ||
    !Number.isFinite(maxPurchaseSol) ||
    maxPurchaseSol < minPurchaseSol
  ) {
    throw new Error(
      "Sale environment defaults are invalid."
    );
  }

  return {
    rcxPerSol,
    minPurchaseSol,
    maxPurchaseSol,
  };
}

/*
|--------------------------------------------------------------------------
| DATABASE
|--------------------------------------------------------------------------
*/

function db() {
  const url =
    process.env.DATABASE_URL;

  if (!url) {
    throw new Error(
      "DATABASE_URL is not configured."
    );
  }

  return neon(url);
}

/*
|--------------------------------------------------------------------------
| PRESALE CAP
|--------------------------------------------------------------------------
*/

function getPresaleCap() {
  const cap =
    Number(
      process.env.PRESALE_CAP_RCX ??
        "300000000"
    );

  if (
    !Number.isFinite(cap) ||
    cap <= 0 ||
    !Number.isInteger(cap)
  ) {
    throw new Error(
      "PRESALE_CAP_RCX must be a positive integer."
    );
  }

  return cap;
}

/*
|--------------------------------------------------------------------------
| GET
|--------------------------------------------------------------------------
*/

export async function GET() {
  if (
    !(await isAdminAuthenticated())
  ) {
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

  try {
    const sql = db();

    const settings =
      await getSaleSettings(
        sql,
        envDefaults()
      );

    const presaleCapRcx =
      getPresaleCap();

    /*
    |--------------------------------------------------------------------------
    | TOKEN MINT
    |--------------------------------------------------------------------------
    |
    | Decimals отримуємо безпосередньо з поточного RCX mint.
    | Ніякого hardcode 6 або 9.
    |
    */

    const mintAddress =
      process.env.RCX_MINT;

    if (!mintAddress) {
      throw new Error(
        "RCX_MINT is not configured."
      );
    }

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

    const decimals =
      mintInfo.decimals;

    const multiplier =
      10n **
      BigInt(decimals);

    /*
    |--------------------------------------------------------------------------
    | PRESALE STATE
    |--------------------------------------------------------------------------
    |
    | reserved_rcx_raw:
    | RCX, які зараз зарезервовані активними покупками.
    |
    */

    const [state] =
      await sql`
        SELECT
          reserved_rcx_raw::text
            AS reserved_rcx_raw

        FROM sale_state

        WHERE id = 1

        LIMIT 1
      `;

    /*
    |--------------------------------------------------------------------------
    | SOLD RCX
    |--------------------------------------------------------------------------
    |
    | Проданими вважаємо тільки покупки,
    | які реально отримали статус delivered.
    |
    */

    const [sold] =
      await sql`
        SELECT
          COALESCE(
            SUM(rcx_raw_amount)
              FILTER (
                WHERE status = 'delivered'
              ),
            0
          )::text
            AS sold_raw

        FROM purchases
      `;

    /*
    |--------------------------------------------------------------------------
    | RAW VALUES
    |--------------------------------------------------------------------------
    */

    const capRaw =
      BigInt(presaleCapRcx) *
      multiplier;

    const soldRaw =
      BigInt(
        sold?.sold_raw ??
          "0"
      );

    const reservedRaw =
      BigInt(
        state?.reserved_rcx_raw ??
          "0"
      );

    /*
    |--------------------------------------------------------------------------
    | PRESALE MATH
    |--------------------------------------------------------------------------
    |
    | used = sold + reserved
    |
    | remaining =
    | cap - sold - reserved
    |
    */

    const usedRaw =
      soldRaw +
      reservedRaw;

    const remainingRaw =
      capRaw > usedRaw
        ? capRaw -
          usedRaw
        : 0n;

    /*
    |--------------------------------------------------------------------------
    | DISPLAY VALUES
    |--------------------------------------------------------------------------
    */

    const displayMultiplier =
      10 ** decimals;

    const soldRcx =
      Number(soldRaw) /
      displayMultiplier;

    const reservedRcx =
      Number(reservedRaw) /
      displayMultiplier;

    const remainingRcx =
      Number(remainingRaw) /
      displayMultiplier;

    const usedRcx =
      Number(usedRaw) /
      displayMultiplier;

    const progress =
      presaleCapRcx > 0
        ? Math.min(
            100,
            (
              usedRcx /
              presaleCapRcx
            ) * 100
          )
        : 0;

    /*
    |--------------------------------------------------------------------------
    | RESPONSE
    |--------------------------------------------------------------------------
    */

    return NextResponse.json({
      ok: true,

      settings: {
        ...settings,

        presale: {
          cap:
            presaleCapRcx,

          sold:
            soldRcx,

          reserved:
            reservedRcx,

          remaining:
            remainingRcx,

          progress,
        },
      },
    });
  } catch (error) {
    console.error(
      "ADMIN SALE GET ERROR:",
      error
    );

    return NextResponse.json(
      {
        ok: false,

        error:
          error instanceof Error
            ? error.message
            : "Failed to load sale settings.",
      },
      {
        status: 500,
      }
    );
  }
}

/*
|--------------------------------------------------------------------------
| PUT
|--------------------------------------------------------------------------
*/

export async function PUT(
  request: NextRequest
) {
  if (
    !(await isAdminAuthenticated())
  ) {
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

  try {
    const body =
      await request.json();

    const active =
      body.active === true;

    const rcxPerSol =
      Number(body.rcxPerSol);

    const minPurchaseSol =
      Number(
        body.minPurchaseSol
      );

    const maxPurchaseSol =
      Number(
        body.maxPurchaseSol
      );

    /*
    |--------------------------------------------------------------------------
    | VALIDATION
    |--------------------------------------------------------------------------
    */

    if (
      !Number.isInteger(rcxPerSol) ||
      rcxPerSol <= 0
    ) {
      return NextResponse.json(
        {
          ok: false,

          error:
            "RCX per SOL має бути цілим числом більше 0.",
        },
        {
          status: 400,
        }
      );
    }

    if (
      !Number.isFinite(
        minPurchaseSol
      ) ||
      minPurchaseSol <= 0
    ) {
      return NextResponse.json(
        {
          ok: false,

          error:
            "Мінімальна покупка має бути більше 0 SOL.",
        },
        {
          status: 400,
        }
      );
    }

    if (
      !Number.isFinite(
        maxPurchaseSol
      ) ||
      maxPurchaseSol <
        minPurchaseSol
    ) {
      return NextResponse.json(
        {
          ok: false,

          error:
            "Максимальна покупка не може бути меншою за мінімальну.",
        },
        {
          status: 400,
        }
      );
    }

    /*
    |--------------------------------------------------------------------------
    | DATABASE
    |--------------------------------------------------------------------------
    */

    const sql = db();

    await getSaleSettings(
      sql,
      envDefaults()
    );

    const [row] =
      await sql`
        UPDATE sale_settings

        SET
          active =
            ${active},

          rcx_per_sol =
            ${rcxPerSol},

          min_purchase_sol =
            ${minPurchaseSol},

          max_purchase_sol =
            ${maxPurchaseSol},

          updated_at =
            NOW()

        WHERE id = 1

        RETURNING
          active,
          rcx_per_sol::text,
          min_purchase_sol,
          max_purchase_sol,
          updated_at
      `;

    /*
    |--------------------------------------------------------------------------
    | RESPONSE
    |--------------------------------------------------------------------------
    */

    return NextResponse.json({
      ok: true,

      settings: {
        active:
          Boolean(
            row.active
          ),

        rcxPerSol:
          Number(
            row.rcx_per_sol
          ),

        minPurchaseSol:
          Number(
            row.min_purchase_sol
          ),

        maxPurchaseSol:
          Number(
            row.max_purchase_sol
          ),

        updatedAt:
          String(
            row.updated_at
          ),
      },
    });
  } catch (error) {
    console.error(
      "ADMIN SALE PUT ERROR:",
      error
    );

    return NextResponse.json(
      {
        ok: false,

        error:
          error instanceof Error
            ? error.message
            : "Failed to save sale settings.",
      },
      {
        status: 500,
      }
    );
  }
}