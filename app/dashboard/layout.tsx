import Link from "next/link";

export default function DashboardLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <div className="min-h-screen bg-neutral-50">
            <header className="border-b border-neutral-200 bg-white">
                <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
                    <div className="flex items-center gap-8">
                        <Link
                            href="/dashboard"
                            className="text-xl font-bold tracking-tight text-neutral-950"
                        >
                            Criico
                        </Link>

                        <nav className="hidden items-center gap-1 md:flex">
                            <NavLink href="/dashboard">Dashboard</NavLink>
                            <NavLink href="/dashboard/players">Players</NavLink>
                            <NavLink href="/dashboard/matches">Matches</NavLink>
                            <NavLink href="/dashboard/leaderboard">
                                Leaderboard
                            </NavLink>
                            <NavLink href="/dashboard/teams">Teams</NavLink>
                        </nav>
                    </div>

                    <form action="/api/auth/logout" method="POST">
                        <button
                            type="submit"
                            className="rounded-lg border border-neutral-200 px-4 py-2 text-sm font-medium text-neutral-700 transition hover:bg-neutral-50"
                        >
                            Logout
                        </button>
                    </form>
                </div>
            </header>

            <main className="mx-auto max-w-7xl px-6 py-8">{children}</main>

        </div>
    );
}

function NavLink({
    href,
    children,
}: {
    href: string;
    children: React.ReactNode;
}) {
    return (
        <Link
            href={href}
            className="rounded-lg px-3 py-2 text-sm font-medium text-neutral-600 transition hover:bg-neutral-100 hover:text-neutral-950"
        >
            {children}
        </Link>
    );
}