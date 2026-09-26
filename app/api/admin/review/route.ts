import {
  NextRequest,
  NextResponse,
} from "next/server";

import {
  neon,
} from "@neondatabase/serverless";

import {
  isAdminAuthenticated,
} from "@/lib/adminAuth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/*
|--------------------------------------------------------------------------
| DATABASE
|--------------------------------------------------------------------------
*/

function db() {
  const databaseUrl =
    process.env.DATABASE_URL;

  if (!databaseUrl) {
    throw new Error(
      "DATABASE_URL is not configured."
    );
  }

  return neon(databaseUrl);
}

/*
|--------------------------------------------------------------------------
| POST
|--------------------------------------------------------------------------
|
| Manual resolution of purchases that require review.
|
| Actions:
|
| mark_delivered
|   The administrator verified on-chain that RCX was delivered.
|
| release
|   The administrator verified that RCX was NOT delivered and wants
|   to release the reserved presale allocation.
|
*/

export async function POST(
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

    const purchaseId =
      Number(body.purchaseId);

    const action =
      String(body.action ?? "");

    const rcxSignature =
      typeof body.rcxSignature === "string"
        ? body.rcxSignature.trim()
        : "";

    if (
      !Number.isSafeInteger(purchaseId) ||
      purchaseId <= 0
    ) {
      return NextResponse.json(
        {
          ok: false,
          error: "Invalid purchase ID.",
        },
        {
          status: 400,
        }
      );
    }

    if (
      action !== "mark_delivered" &&
      action !== "release"
    ) {
      return NextResponse.json(
        {
          ok: false,
          error: "Invalid review action.",
        },
        {
          status: 400,
        }
      );
    }

    if (
      action === "mark_delivered" &&
      !rcxSignature
    ) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "RCX delivery signature is required.",
        },
        {
          status: 400,
        }
      );
    }

    const sql =
      db();

    /*
    |--------------------------------------------------------------------------
    | MARK DELIVERED
    |--------------------------------------------------------------------------
    |
    | Only a failed/processing purchase may be resolved.
    |
    | The CTE changes the purchase first. sale_state is modified only
    | when that UPDATE actually returned a row.
    |
    | This makes repeated requests idempotent with respect to reservation.
    |
    */

    if (action === "mark_delivered") {
      const result =
        await sql`
          WITH resolved AS (
            UPDATE purchases

            SET
              status = 'delivered',

              rcx_signature =
                ${rcxSignature},

              updated_at =
                NOW()

            WHERE
              id =
                ${purchaseId}

              AND status IN (
                'processing',
                'failed'
              )

            RETURNING
              id,
              rcx_raw_amount
          ),

          released AS (
            UPDATE sale_state

            SET
              reserved_rcx_raw =
                GREATEST(
                  0,
                  reserved_rcx_raw -
                    COALESCE(
                      (
                        SELECT
                          rcx_raw_amount
                        FROM resolved
                        LIMIT 1
                      ),
                      0
                    )
                ),

              updated_at =
                NOW()

            WHERE
              id = 1

              AND EXISTS (
                SELECT 1
                FROM resolved
              )

            RETURNING
              reserved_rcx_raw
          )

          SELECT
            id
          FROM resolved
        `;

      if (result.length === 0) {
        return NextResponse.json(
          {
            ok: false,
            error:
              "Purchase was already resolved or does not exist.",
          },
          {
            status: 409,
          }
        );
      }

      return NextResponse.json({
        ok: true,
        action: "mark_delivered",
        purchaseId,
      });
    }

    /*
    |--------------------------------------------------------------------------
    | RELEASE RESERVATION
    |--------------------------------------------------------------------------
    |
    | IMPORTANT:
    |
    | This action must only be used after the administrator has verified
    | that RCX was NOT delivered.
    |
    | The purchase remains failed, but we need a state transition so that
    | the same reservation cannot be released twice.
    |
    | We use status = 'cancelled' for the final resolved state.
    |
    */

    const result =
      await sql`
        WITH resolved AS (
          UPDATE purchases

          SET
            status = 'cancelled',
            updated_at = NOW()

          WHERE
            id =
              ${purchaseId}

            AND status IN (
              'processing',
              'failed'
            )

          RETURNING
            id,
            rcx_raw_amount
        ),

        released AS (
          UPDATE sale_state

          SET
            reserved_rcx_raw =
              GREATEST(
                0,
                reserved_rcx_raw -
                  COALESCE(
                    (
                      SELECT
                        rcx_raw_amount
                      FROM resolved
                      LIMIT 1
                    ),
                    0
                  )
              ),

            updated_at =
              NOW()

          WHERE
            id = 1

            AND EXISTS (
              SELECT 1
              FROM resolved
            )

          RETURNING
            reserved_rcx_raw
        )

        SELECT
          id
        FROM resolved
      `;

    if (result.length === 0) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "Purchase was already resolved or does not exist.",
        },
        {
          status: 409,
        }
      );
    }

    return NextResponse.json({
      ok: true,
      action: "release",
      purchaseId,
    });
  } catch (error) {
    console.error(
      "ADMIN REVIEW ERROR:",
      error
    );

    return NextResponse.json(
      {
        ok: false,

        error:
          error instanceof Error
            ? error.message
            : "Review action failed.",
      },
      {
        status: 500,
      }
    );
  }
}