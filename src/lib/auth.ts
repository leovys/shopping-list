import { SignJWT, jwtVerify } from "jose";
import { NextRequest } from "next/server";

const secret = () =>
  new TextEncoder().encode(
    process.env.JWT_SECRET || "fallback-secret-troque-em-producao"
  );

export async function signToken(userId: string): Promise<string> {
  return new SignJWT({ userId })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("30d")
    .sign(secret());
}

export async function verifyToken(token: string): Promise<{ userId: string }> {
  const { payload } = await jwtVerify(token, secret());
  return payload as { userId: string };
}

export async function getUserIdFromRequest(
  req: NextRequest
): Promise<string | null> {
  const auth = req.headers.get("Authorization");
  if (!auth?.startsWith("Bearer ")) return null;
  try {
    const { userId } = await verifyToken(auth.slice(7));
    return userId;
  } catch {
    return null;
  }
}
