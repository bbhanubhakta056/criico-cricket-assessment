import Link from "next/link";
import LoginForm from "@/components/auth/LoginForm";

export default function LoginPage() {
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
                            Welcome back
                        </p>

                        <h1 className="text-3xl font-bold tracking-tight text-neutral-950">
                            Sign in to your account
                        </h1>

                        <p className="mt-3 text-sm leading-6 text-neutral-500">
                            Manage cricket players, matches, statistics, and leaderboard
                            rankings.
                        </p>
                    </div>

                    <LoginForm />

                    <p className="mt-8 text-center text-sm text-neutral-500">
                        Don&apos;t have an account?{" "}
                        <Link
                            href="/register"
                            className="font-semibold text-neutral-950 hover:underline"
                        >
                            Create account
                        </Link>
                    </p>
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
                        Manage your cricket ecosystem from one place.
                    </h2>

                    <p className="mt-5 leading-7 text-neutral-400">
                        Players, performances, match statistics and impact rankings
                        designed for local cricket teams.
                    </p>
                </div>

                <p className="text-sm text-neutral-500">
                    Criico Cricket Management
                </p>
            </section>
        </main>
    );
}