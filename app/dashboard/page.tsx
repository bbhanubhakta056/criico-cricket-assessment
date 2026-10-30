import Link from "next/link";
import { Suspense } from "react";
import {
    ArrowRight,
    Award,
    Shield,
    Swords,
    Target,
    Trophy,
    UserRound,
    Users,
} from "lucide-react";

import { prisma } from "@/lib/prisma";
import { calculateImpactScore } from "@/lib/cricket/impact-score";

function formatRole(role: string) {
    return role
        .replaceAll("_", " ")
        .toLowerCase()
        .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

async function DashboardData() {
    const [playerCount, teamCount, matchCount, players] = await Promise.all([
        prisma.player.count(),
        prisma.team.count(),
        prisma.match.count(),

        prisma.player.findMany({
            select: {
                id: true,
                name: true,
                role: true,
                matchesPlayed: true,
                totalRuns: true,
                totalWickets: true,
            },
        }),
    ]);

    const playersWithImpact = players.map((player) => ({
        ...player,
        impactScore: calculateImpactScore({
            role: player.role,
            matchesPlayed: player.matchesPlayed,
            totalRuns: player.totalRuns,
            totalWickets: player.totalWickets,
        }),
    }));

    const topBatter = playersWithImpact
        .filter((player) => player.role === "BATSMAN")
        .sort((a, b) => b.totalRuns - a.totalRuns)[0];

    const topBowler = playersWithImpact
        .filter((player) => player.role === "BOWLER")
        .sort((a, b) => b.totalWickets - a.totalWickets)[0];

    const topAllRounder = playersWithImpact
        .filter((player) => player.role === "ALL_ROUNDER")
        .sort((a, b) => b.impactScore - a.impactScore)[0];

    const topWicketkeeper = playersWithImpact
        .filter((player) => player.role === "WICKETKEEPER")
        .sort((a, b) => b.impactScore - a.impactScore)[0];

    const overallLeader = [...playersWithImpact].sort(
        (a, b) => b.impactScore - a.impactScore,
    )[0];

    const overviewStats = [
        {
            label: "Players",
            value: playerCount,
            description: "Registered players",
            icon: Users,
            href: "/dashboard/players",
        },
        {
            label: "Teams",
            value: teamCount,
            description: "Created teams",
            icon: Shield,
            href: "/dashboard/teams",
        },
        {
            label: "Matches",
            value: matchCount,
            description: "Recorded matches",
            icon: Swords,
            href: "/dashboard/matches",
        },
    ];

    const playerLeaders = [
        {
            label: "Top Batter",
            player: topBatter,
            value: topBatter ? `${topBatter.totalRuns} runs` : "No data",
            icon: Award,
        },
        {
            label: "Top Bowler",
            player: topBowler,
            value: topBowler ? `${topBowler.totalWickets} wickets` : "No data",
            icon: Target,
        },
        {
            label: "Top All-rounder",
            player: topAllRounder,
            value: topAllRounder
                ? `${topAllRounder.impactScore.toFixed(1)} impact`
                : "No data",
            icon: Trophy,
        },
        {
            label: "Top Wicketkeeper",
            player: topWicketkeeper,
            value: topWicketkeeper
                ? `${topWicketkeeper.impactScore.toFixed(1)} impact`
                : "No data",
            icon: UserRound,
        },
    ];

    return (
        <>
            {/* Overview */}
            <section className="mt-8">
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                    {overviewStats.map((stat) => {
                        const Icon = stat.icon;

                        return (
                            <Link
                                key={stat.label}
                                href={stat.href}
                                className="group rounded-xl border border-neutral-200 bg-white p-5 transition hover:border-neutral-300 hover:shadow-sm"
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-neutral-100">
                                        <Icon className="h-5 w-5 text-neutral-700" />
                                    </div>

                                    <ArrowRight className="h-4 w-4 text-neutral-400 transition group-hover:translate-x-1 group-hover:text-neutral-700" />
                                </div>

                                <div className="mt-5">
                                    <p className="text-sm font-medium text-neutral-500">
                                        {stat.label}
                                    </p>

                                    <p className="mt-1 text-3xl font-semibold text-neutral-900">
                                        {stat.value}
                                    </p>

                                    <p className="mt-1 text-sm text-neutral-500">
                                        {stat.description}
                                    </p>
                                </div>
                            </Link>
                        );
                    })}
                </div>
            </section>

            {/* Player leaders */}
            <section className="mt-10">
                <div className="mb-4 flex items-end justify-between gap-4">
                    <div>
                        <h2 className="text-xl font-semibold text-neutral-900">
                            Player Leaders
                        </h2>

                        <p className="mt-1 text-sm text-neutral-500">
                            Leading players based on current cricket statistics.
                        </p>
                    </div>

                    <Link
                        href="/dashboard/leaderboard"
                        className="hidden items-center gap-1 text-sm font-medium text-neutral-600 transition hover:text-neutral-900 sm:flex"
                    >
                        View leaderboard
                        <ArrowRight className="h-4 w-4" />
                    </Link>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    {playerLeaders.map((leader) => {
                        const Icon = leader.icon;

                        return (
                            <div
                                key={leader.label}
                                className="rounded-xl border border-neutral-200 bg-white p-5"
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-neutral-100">
                                        <Icon className="h-4 w-4 text-neutral-700" />
                                    </div>

                                    <span className="text-xs font-medium uppercase tracking-wide text-neutral-400">
                                        {leader.label}
                                    </span>
                                </div>

                                <div className="mt-5">
                                    <p className="truncate text-lg font-semibold text-neutral-900">
                                        {leader.player?.name ?? "No player"}
                                    </p>

                                    <p className="mt-1 text-sm font-medium text-neutral-600">
                                        {leader.value}
                                    </p>

                                    {leader.player && (
                                        <p className="mt-3 text-xs text-neutral-400">
                                            {leader.player.matchesPlayed} matches
                                        </p>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>

                <Link
                    href="/dashboard/leaderboard"
                    className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-neutral-600 sm:hidden"
                >
                    View leaderboard
                    <ArrowRight className="h-4 w-4" />
                </Link>
            </section>

            {/* Overall leader */}
            <section className="mt-10">
                <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-6">
                    <div className="flex flex-col justify-between gap-6 md:flex-row md:items-center">
                        <div className="flex items-start gap-4">
                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-neutral-900">
                                <Trophy className="h-6 w-6 text-white" />
                            </div>

                            <div>
                                <p className="text-sm font-medium text-neutral-500">
                                    Overall Impact Leader
                                </p>

                                {overallLeader ? (
                                    <>
                                        <h2 className="mt-1 text-2xl font-semibold text-neutral-900">
                                            {overallLeader.name}
                                        </h2>

                                        <p className="mt-1 text-sm text-neutral-600">
                                            {formatRole(overallLeader.role)}
                                            {" · "}
                                            {overallLeader.matchesPlayed} matches
                                            {" · "}
                                            {overallLeader.totalRuns} runs
                                            {" · "}
                                            {overallLeader.totalWickets} wickets
                                        </p>
                                    </>
                                ) : (
                                    <>
                                        <h2 className="mt-1 text-xl font-semibold text-neutral-900">
                                            No player data
                                        </h2>

                                        <p className="mt-1 text-sm text-neutral-500">
                                            Add players to generate leaderboard statistics.
                                        </p>
                                    </>
                                )}
                            </div>
                        </div>

                        {overallLeader && (
                            <div className="md:text-right">
                                <p className="text-sm text-neutral-500">Impact Score</p>

                                <p className="mt-1 text-3xl font-semibold text-neutral-900">
                                    {overallLeader.impactScore.toFixed(1)}
                                </p>

                                <Link
                                    href="/dashboard/leaderboard"
                                    className="mt-2 inline-flex items-center gap-1 text-sm font-medium text-neutral-600 transition hover:text-neutral-900"
                                >
                                    View leaderboard
                                    <ArrowRight className="h-4 w-4" />
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </section>
        </>
    );
}

function DashboardLoading() {
    return (
        <div className="mt-8 space-y-10">
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {Array.from({ length: 3 }).map((_, index) => (
                    <div
                        key={index}
                        className="h-40 animate-pulse rounded-xl border border-neutral-200 bg-neutral-50"
                    />
                ))}
            </div>

            <div>
                <div className="mb-4 h-6 w-40 animate-pulse rounded bg-neutral-100" />

                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    {Array.from({ length: 4 }).map((_, index) => (
                        <div
                            key={index}
                            className="h-40 animate-pulse rounded-xl border border-neutral-200 bg-neutral-50"
                        />
                    ))}
                </div>
            </div>

            <div className="h-36 animate-pulse rounded-xl border border-neutral-200 bg-neutral-50" />
        </div>
    );
}

export default function DashboardPage() {
    return (
        <main className="min-h-screen p-8">
            <div>
                <p className="text-sm font-medium text-neutral-500">
                    Overview
                </p>

                <h1 className="mt-1 text-3xl font-semibold text-neutral-900">
                    Cricket Dashboard
                </h1>

                <p className="mt-2 text-neutral-600">
                    Overview of teams, matches, and player performance.
                </p>
            </div>

            <Suspense fallback={<DashboardLoading />}>
                <DashboardData />
            </Suspense>
        </main>
    );
}