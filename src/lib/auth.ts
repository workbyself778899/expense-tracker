import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { NextRequest } from "next/server";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "expense-tracker-super-secret-key-2026-secure"
);

export const COOKIE_NAME = "expense_auth_token";

export interface UserTokenPayload {
  userId: string;
  email: string;
  name: string;
}

export async function signToken(payload: UserTokenPayload): Promise<string> {
  return await new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("30d")
    .sign(JWT_SECRET);
}

export async function verifyToken(token: string): Promise<UserTokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return {
      userId: payload.userId as string,
      email: payload.email as string,
      name: payload.name as string,
    };
  } catch {
    return null;
  }
}

export async function getAuthUser(req?: NextRequest): Promise<UserTokenPayload | null> {
  let token: string | undefined;

  // 1. Check cookies from NextRequest if available
  if (req) {
    token = req.cookies.get(COOKIE_NAME)?.value;

    // 2. Also check Authorization header Bearer token
    if (!token) {
      const authHeader = req.headers.get("authorization");
      if (authHeader && authHeader.startsWith("Bearer ")) {
        token = authHeader.substring(7);
      }
    }
  }

  // 3. Fallback to next/headers cookies()
  if (!token) {
    try {
      const cookieStore = await cookies();
      token = cookieStore.get(COOKIE_NAME)?.value;
    } catch {
      // Ignore if not in server component / route handler
    }
  }

  if (!token) return null;
  return await verifyToken(token);
}
