import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import { isAdminAuthenticated } from "@/lib/adminAuth";
import { getSaleSettings } from "@/lib/saleSettings";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

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
     * sale_state зберігає весь allocation,
     * який уже був зарезервований системою.
     *
     * Це включає успішно видані RCX,
     * а також невизначені покупки, які
     * потребують ручної перевірки.
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
     * Отримуємо decimals з RCX_MINT через
     * вже відомий формат токена.
     *
     * Для поточного RCX mint = 9 decimals.
     *
     * Значення також можна перевірити через
     * /api/admin/health.
     */

    const decimals = 9;

    const multiplier =
      10n ** BigInt(decimals);

    const capRaw =
      BigInt(presaleCapRcx) *
      multiplier;

    const reservedRaw =
      state
        ? BigInt(
            state.reserved_rcx_raw
          )
        : 0n;

    const remainingRaw =
      reservedRaw < capRaw
        ? capRaw - reservedRaw
        : 0n;

    const reservedRcx =
      Number(reservedRaw) /
      10 ** decimals;

    const remainingRcx =
      Number(remainingRaw) /
      10 ** decimals;

    const progress =
      presaleCapRcx > 0
        ? Math.min(
            100,
            (reservedRcx /
              presaleCapRcx) *
              100
          )
        : 0;

    /*
     * Окремо рахуємо реально delivered RCX.
     * Це дозволяє відрізнити:
     *
     * sold       = реально видано покупцям
     * reserved   = зайнято allocation загалом
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
          )::text AS rcx_raw
        FROM purchases
      `;

    const soldRaw =
      BigInt(
        sold?.rcx_raw ?? "0"
      );

    const soldRcx =
      Number(soldRaw) /
      10 ** decimals;

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

    return NextResponse.json({
      ok: true,

      settings: {
        active:
          Boolean(row.active),

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