import Link from "next/link";

import RegisterForm from "@/components/auth/RegisterForm";

export default function RegisterPage() {
    return (
        <main className="flex min-h-screen bg-neutral-50">
            <section className="flex w-full items-center justify-center px-6 py-12 lg:w-1/2">
                <div className="w-full max-w-md">
                    <Link
                        href="/"
                        className="mb-12 inline-block text-xl font-bold tracking-tight text-neutral-950"
                    >
                        Criico
                    </Link>

                    <div className="mb-8">
                        <p className="mb-2 text-sm font-medium text-neutral-500">
                            Get started
                        </p>

                        <h1 className="text-3xl font-bold tracking-tight text-neutral-950">
                            Create your account
                        </h1>

                        <p className="mt-3 text-sm leading-6 text-neutral-500">
                            Create an account to manage players, matches, statistics,
                            and cricket rankings.
                        </p>
                    </div>

                    <RegisterForm />
                </div>
            </section>

            <section className="hidden bg-neutral-950 p-12 text-white lg:flex lg:w-1/2 lg:flex-col lg:justify-between">
                <div>
                    <span className="rounded-full border border-white/15 px-3 py-1 text-xs text-neutral-300">
                        Cricket Management
                    </span>
                </div>

                <div className="max-w-lg">
                    <h2 className="text-4xl font-semibold leading-tight tracking-tight">
                        Build your team. Track performance. Find your impact.
                    </h2>

                    <p className="mt-5 leading-7 text-neutral-400">
                        Criico brings local cricket player management, match
                        performance, and data-driven rankings together in one place.
                    </p>
                </div>

                <p className="text-sm text-neutral-500">
                    Criico Cricket Management
                </p>
            </section>
        </main>
    );
}