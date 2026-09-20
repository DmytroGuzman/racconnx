import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

const COOKIE_NAME = "rcx_admin_session";
const SESSION_TTL = 60 * 60 * 12; // 12 hours

function getSecret() {
  const value = process.env.ADMIN_SESSION_SECRET;

  if (!value || value.length < 32) {
    throw new Error("ADMIN_SESSION_SECRET must contain at least 32 characters.");
  }

  return new TextEncoder().encode(value);
}

export function getAdminPassword() {
  const value = process.env.ADMIN_PASSWORD;

  if (!value) {
    throw new Error("ADMIN_PASSWORD is not configured.");
  }

  return value;
}

export async function createAdminSession() {
  const token = await new SignJWT({ role: "admin" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_TTL}s`)
    .sign(getSecret());

  const cookieStore = await cookies();

  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: SESSION_TTL,
  });
}

export async function destroyAdminSession() {
  const cookieStore = await cookies();

  cookieStore.set(COOKIE_NAME, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: 0,
  });
}

export async function isAdminAuthenticated() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(COOKIE_NAME)?.value;

    if (!token) return false;

    const { payload } = await jwtVerify(token, getSecret());

    return payload.role === "admin";
  } catch {
    return false;
  }
}
