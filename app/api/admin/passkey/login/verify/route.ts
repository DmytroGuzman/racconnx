import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { neon } from "@neondatabase/serverless";
import { verifyAuthenticationResponse } from "@simplewebauthn/server";

import { createAdminSession } from "@/lib/adminAuth";
import {
  PASSKEY_ORIGIN,
  PASSKEY_RP_ID,
} from "@/lib/passkey";

export const runtime = "nodejs";

const CHALLENGE_COOKIE =
  "rcx_passkey_authentication_challenge";

export async function POST(request: NextRequest) {
  try {
    const databaseUrl = process.env.DATABASE_URL;

    if (!databaseUrl) {
      throw new Error(
        "DATABASE_URL is not configured."
      );
    }

    const cookieStore = await cookies();

    const expectedChallenge =
      cookieStore.get(
        CHALLENGE_COOKIE
      )?.value;

    if (!expectedChallenge) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "Passkey challenge відсутній або застарів. Спробуй ще раз.",
        },
        {
          status: 400,
        }
      );
    }

    const body = await request.json();

    const credentialID =
      body?.id;

    if (
      !credentialID ||
      typeof credentialID !== "string"
    ) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "Некоректний Passkey credential.",
        },
        {
          status: 400,
        }
      );
    }

    const sql = neon(databaseUrl);

    const rows =
      await sql`
        SELECT
          credential_id,
          public_key,
          counter,
          transports
        FROM admin_passkeys
        WHERE credential_id = ${credentialID}
        LIMIT 1
      `;

    if (rows.length === 0) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "Цей Passkey не зареєстрований.",
        },
        {
          status: 401,
        }
      );
    }

    const passkey = rows[0];

    const publicKey =
      new Uint8Array(
        Buffer.from(
          String(passkey.public_key),
          "base64"
        )
      );

    const verification =
      await verifyAuthenticationResponse({
        response: body,

        expectedChallenge,

        expectedOrigin:
          PASSKEY_ORIGIN,

        expectedRPID:
          PASSKEY_RP_ID,

        requireUserVerification: true,

        credential: {
          id: String(
            passkey.credential_id
          ),
          publicKey,
          counter: Number(
            passkey.counter
          ),
          transports:
            Array.isArray(
              passkey.transports
            )
              ? passkey.transports
              : undefined,
        },
      });

    if (!verification.verified) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "Не вдалося підтвердити Passkey.",
        },
        {
          status: 401,
        }
      );
    }

    await sql`
      UPDATE admin_passkeys
      SET
        counter =
          ${verification.authenticationInfo.newCounter},
        last_used_at = NOW()
      WHERE credential_id =
        ${credentialID}
    `;

    cookieStore.set(
      CHALLENGE_COOKIE,
      "",
      {
        httpOnly: true,
        secure:
          process.env.NODE_ENV ===
          "production",
        sameSite: "strict",
        path: "/",
        maxAge: 0,
      }
    );

    await createAdminSession();

    return NextResponse.json({
      ok: true,
    });
  } catch (error) {
    console.error(
      "PASSKEY LOGIN VERIFY ERROR:",
      error
    );

    return NextResponse.json(
      {
        ok: false,
        error:
          error instanceof Error
            ? error.message
            : "Не вдалося увійти через Passkey.",
      },
      {
        status: 500,
      }
    );
  }
}
