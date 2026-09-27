import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { neon } from "@neondatabase/serverless";
import { generateRegistrationOptions } from "@simplewebauthn/server";

import { isAdminAuthenticated } from "@/lib/adminAuth";
import {
  PASSKEY_RP_ID,
  PASSKEY_RP_NAME,
  PASSKEY_USER_ID,
  PASSKEY_USER_NAME,
} from "@/lib/passkey";

export const runtime = "nodejs";

const CHALLENGE_COOKIE =
  "rcx_passkey_registration_challenge";

export async function POST() {
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

  try {
    const databaseUrl = process.env.DATABASE_URL;

    if (!databaseUrl) {
      throw new Error(
        "DATABASE_URL is not configured."
      );
    }

    const sql = neon(databaseUrl);

    const existing =
      await sql`
        SELECT
          credential_id,
          transports
        FROM admin_passkeys
        ORDER BY created_at DESC
      `;

    const options =
      await generateRegistrationOptions({
        rpName: PASSKEY_RP_NAME,
        rpID: PASSKEY_RP_ID,

        userID: new TextEncoder().encode(
          PASSKEY_USER_ID
        ),

        userName: PASSKEY_USER_NAME,
        userDisplayName: PASSKEY_USER_NAME,

        attestationType: "none",

        authenticatorSelection: {
          residentKey: "required",
          userVerification: "required",
        },

        excludeCredentials: existing.map(
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
      "PASSKEY REGISTRATION OPTIONS ERROR:",
      error
    );

    return NextResponse.json(
      {
        ok: false,
        error:
          error instanceof Error
            ? error.message
            : "Не вдалося почати налаштування Passkey.",
      },
      {
        status: 500,
      }
    );
  }
}
