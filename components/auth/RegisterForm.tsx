"use client";

import Link from "next/link";
import { useActionState, useEffect } from "react";
import { toast } from "sonner";

import {
    registerAction,
    type RegisterActionState,
} from "@/lib/auth/register-action";

const initialState: RegisterActionState = {
    success: false,
    message: "",
};

export default function RegisterForm() {
    const [state, formAction, isPending] = useActionState(
        registerAction,
        initialState,
    );

    useEffect(() => {
        if (state.message && !state.success) {
            toast.error(state.message);
        }
    }, [state]);

    return (
        <form action={formAction} className="space-y-5">
            <div>
                <label
                    htmlFor="name"
                    className="mb-2 block text-sm font-medium text-neutral-700"
                >
                    Full name
                </label>

                <input
                    id="name"
                    name="name"
                    type="text"
                    required
                    autoComplete="name"
                    placeholder="Your full name"
                    className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm text-neutral-950 outline-none transition placeholder:text-neutral-400 focus:border-neutral-400"
                />

                {state.fieldErrors?.name?.[0] && (
                    <p className="mt-1.5 text-xs text-red-600">
                        {state.fieldErrors.name[0]}
                    </p>
                )}
            </div>

            <div>
                <label
                    htmlFor="email"
                    className="mb-2 block text-sm font-medium text-neutral-700"
                >
                    Email address
                </label>

                <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    autoComplete="email"
                    placeholder="you@example.com"
                    className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm text-neutral-950 outline-none transition placeholder:text-neutral-400 focus:border-neutral-400"
                />

                {state.fieldErrors?.email?.[0] && (
                    <p className="mt-1.5 text-xs text-red-600">
                        {state.fieldErrors.email[0]}
                    </p>
                )}
            </div>

            <div>
                <label
                    htmlFor="password"
                    className="mb-2 block text-sm font-medium text-neutral-700"
                >
                    Password
                </label>

                <input
                    id="password"
                    name="password"
                    type="password"
                    required
                    minLength={8}
                    autoComplete="new-password"
                    placeholder="At least 8 characters"
                    className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm text-neutral-950 outline-none transition placeholder:text-neutral-400 focus:border-neutral-400"
                />

                {state.fieldErrors?.password?.[0] && (
                    <p className="mt-1.5 text-xs text-red-600">
                        {state.fieldErrors.password[0]}
                    </p>
                )}
            </div>

            <button
                type="submit"
                disabled={isPending}
                className="w-full rounded-xl bg-neutral-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
                {isPending ? "Creating account..." : "Create account"}
            </button>

            <p className="text-center text-sm text-neutral-500">
                Already have an account?{" "}
                <Link
                    href="/login"
                    className="font-semibold text-neutral-950 hover:underline"
                >
                    Sign in
                </Link>
            </p>
        </form>
    );
}