import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { neon } from "@neondatabase/serverless";
import { generateAuthenticationOptions } from "@simplewebauthn/server";

import { PASSKEY_RP_ID } from "@/lib/passkey";

export const runtime = "nodejs";

const CHALLENGE_COOKIE =
  "rcx_passkey_authentication_challenge";

export async function POST() {
  try {
    const databaseUrl = process.env.DATABASE_URL;

    if (!databaseUrl) {
      throw new Error(
        "DATABASE_URL is not configured."
      );
    }

    const sql = neon(databaseUrl);

    const passkeys =
      await sql`
        SELECT
          credential_id,
          transports
        FROM admin_passkeys
        ORDER BY created_at DESC
      `;

    if (passkeys.length === 0) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "Passkey ще не налаштовано.",
        },
        {
          status: 404,
        }
      );
    }

    const options =
      await generateAuthenticationOptions({
        rpID: PASSKEY_RP_ID,

        userVerification: "required",

        allowCredentials: passkeys.map(
          (row) => ({
            id: String(
              row.credential_id
            ),
            transports:
              Array.isArray(
                row.transports
              )
                ? row.transports
                : undefined,
          })
        ),
      });

    const cookieStore = await cookies();

    cookieStore.set(
      CHALLENGE_COOKIE,
      options.challenge,
      {
        httpOnly: true,
        secure:
          process.env.NODE_ENV ===
          "production",
        sameSite: "strict",
        path: "/",
        maxAge: 5 * 60,
      }
    );

    return NextResponse.json({
      ok: true,
      options,
    });
  } catch (error) {
    console.error(
      "PASSKEY LOGIN OPTIONS ERROR:",
      error
    );

    return NextResponse.json(
      {
        ok: false,
        error:
          error instanceof Error
            ? error.message
            : "Не вдалося почати вхід через Passkey.",
      },
      {
        status: 500,
      }
    );
  }
}
