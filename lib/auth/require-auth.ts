import { NextResponse } from "next/server";

import { getCurrentUser } from "@/lib/auth/session";

export async function requireAuth() {
    const user = await getCurrentUser();

    if (!user) {
        return {
            user: null,
            response: NextResponse.json(
                { message: "Unauthorized" },
                { status: 401 },
            ),
        };
    }

    return {
        user,
        response: null,
    };
}