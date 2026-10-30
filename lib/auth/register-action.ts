"use server";

import { hash } from "bcryptjs";
import { redirect } from "next/navigation";

import { prisma } from "@/lib/prisma";
import { registerSchema } from "@/lib/validations/auth.schema";

export type RegisterActionState = {
    success: boolean;
    message: string;
    fieldErrors?: {
        name?: string[];
        email?: string[];
        password?: string[];
    };
};

export async function registerAction(
    _previousState: RegisterActionState,
    formData: FormData,
): Promise<RegisterActionState> {
    const rawData = {
        name: formData.get("name"),
        email: formData.get("email"),
        password: formData.get("password"),
    };

    const result = registerSchema.safeParse(rawData);

    if (!result.success) {
        return {
            success: false,
            message: "Please correct the highlighted fields.",
            fieldErrors: result.error.flatten().fieldErrors,
        };
    }

    try {
        const existingUser = await prisma.user.findUnique({
            where: {
                email: result.data.email,
            },
        });

        if (existingUser) {
            return {
                success: false,
                message: "An account with this email already exists.",
                fieldErrors: {
                    email: ["An account with this email already exists."],
                },
            };
        }

        const passwordHash = await hash(result.data.password, 12);

        await prisma.user.create({
            data: {
                name: result.data.name,
                email: result.data.email,
                passwordHash,
            },
        });
    } catch (error) {
        console.error("REGISTER_ACTION_ERROR", error);

        return {
            success: false,
            message: "Unable to create your account. Please try again.",
        };
    }

    redirect("/login");
}