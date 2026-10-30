import { SignJWT, jwtVerify } from "jose";

const secret = process.env.JWT_SECRET;

if (!secret) {
  throw new Error("JWT_SECRET is not configured");
}

const encodedSecret = new TextEncoder().encode(secret);

export interface SessionPayload {
  userId: string;
  email: string;
}

export async function signToken(payload: SessionPayload) {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(encodedSecret);
}

export async function verifyToken(token: string) {
  const { payload } = await jwtVerify(token, encodedSecret);

  return payload as unknown as SessionPayload;
}