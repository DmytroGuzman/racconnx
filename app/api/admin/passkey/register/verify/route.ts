import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { neon } from "@neondatabase/serverless";
import { verifyRegistrationResponse } from "@simplewebauthn/server";

import { isAdminAuthenticated } from "@/lib/adminAuth";
import {
  PASSKEY_ORIGIN,
  PASSKEY_RP_ID,
} from "@/lib/passkey";

export const runtime = "nodejs";

const CHALLENGE_COOKIE =
  "rcx_passkey_registration_challenge";

export async function POST(request: NextRequest) {
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

    const verification =
      await verifyRegistrationResponse({
        response: body,
        expectedChallenge,
        expectedOrigin: PASSKEY_ORIGIN,
        expectedRPID: PASSKEY_RP_ID,
        requireUserVerification: true,
      });

    if (
      !verification.verified ||
      !verification.registrationInfo
    ) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "Не вдалося підтвердити Passkey.",
        },
        {
          status: 400,
        }
      );
    }

    const {
      credential,
      credentialDeviceType,
      credentialBackedUp,
    } = verification.registrationInfo;

    const publicKey =
      Buffer.from(
        credential.publicKey
      ).toString("base64");

    const transports =
      credential.transports ?? [];

    const sql = neon(databaseUrl);

    await sql`
      INSERT INTO admin_passkeys (
        credential_id,
        public_key,
        counter,
        transports,
        device_type,
        backed_up
      )
      VALUES (
        ${credential.id},
        ${publicKey},
        ${credential.counter},
        ${transports},
        ${credentialDeviceType},
        ${credentialBackedUp}
      )
      ON CONFLICT (credential_id)
      DO UPDATE SET
        public_key = EXCLUDED.public_key,
        counter = EXCLUDED.counter,
        transports = EXCLUDED.transports,
        device_type = EXCLUDED.device_type,
        backed_up = EXCLUDED.backed_up
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

    return NextResponse.json({
      ok: true,
      message: "Passkey успішно додано.",
    });
  } catch (error) {
    console.error(
      "PASSKEY REGISTRATION VERIFY ERROR:",
      error
    );

    return NextResponse.json(
      {
        ok: false,
        error:
          error instanceof Error
            ? error.message
            : "Не вдалося зберегти Passkey.",
      },
      {
        status: 500,
      }
    );
  }
}
