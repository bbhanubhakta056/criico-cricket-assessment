import { cookies } from "next/headers";

import { SESSION_COOKIE_NAME } from "@/lib/auth/constants";
import { verifyToken } from "@/lib/auth/jwt";

export async function getCurrentUser() {
    const cookieStore = await cookies();
    const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;

    if (!token) {
        return null;
    }

    try {
        return await verifyToken(token);
    } catch {
        return null;
    }
}