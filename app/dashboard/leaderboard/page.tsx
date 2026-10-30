import { Suspense } from "react";

import { calculateImpactScore } from "@/lib/cricket/impact-score";
import { prisma } from "@/lib/prisma";

function formatRole(role: string) {
    return role
        .replaceAll("_", " ")
        .toLowerCase()
        .replace(/\b\w/g, (char) => char.toUpperCase());
}

async function LeaderboardData() {
    const players = await prisma.player.findMany({
        orderBy: [
            { totalRuns: "desc" },
            { totalWickets: "desc" },
        ],
    });

    const leaderboard = players
        .map((player) => ({
            id: player.id,
            name: player.name,
            role: player.role,
            basePrice: Number(player.basePrice),
            matchesPlayed: player.matchesPlayed,
            totalRuns: player.totalRuns,
            totalWickets: player.totalWickets,
            impactScore: calculateImpactScore({
                role: player.role,
                totalRuns: player.totalRuns,
                totalWickets: player.totalWickets,
                matchesPlayed: player.matchesPlayed,
            }),
        }))
        .sort((a, b) => b.impactScore - a.impactScore);

    if (leaderboard.length === 0) {
        return (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
                <h2 className="text-lg font-semibold text-slate-900">
                    No players yet
                </h2>

                <p className="mt-2 text-sm text-slate-500">
                    Add players to start building the leaderboard.
                </p>
            </div>
        );
    }

    return (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="overflow-x-auto">
                <table className="w-full min-w-[900px] text-left">
                    <thead className="border-b border-slate-200 bg-slate-50">
                        <tr>
                            <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                                Rank
                            </th>

                            <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                                Player
                            </th>

                            <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                                Role
                            </th>

                            <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">
                                Matches
                            </th>

                            <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">
                                Runs
                            </th>

                            <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">
                                Wickets
                            </th>

                            <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">
                                Base Price
                            </th>

                            <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">
                                Impact Score
                            </th>
                        </tr>
                    </thead>

                    <tbody className="divide-y divide-slate-100">
                        {leaderboard.map((player, index) => (
                            <tr
                                key={player.id}
                                className="transition-colors hover:bg-slate-50"
                            >
                                <td className="px-6 py-5">
                                    <div
                                        className={[
                                            "flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold",
                                            index === 0
                                                ? "bg-amber-100 text-amber-700"
                                                : index === 1
                                                    ? "bg-slate-200 text-slate-700"
                                                    : index === 2
                                                        ? "bg-orange-100 text-orange-700"
                                                        : "bg-slate-100 text-slate-500",
                                        ].join(" ")}
                                    >
                                        {index + 1}
                                    </div>
                                </td>

                                <td className="px-6 py-5">
                                    <div className="font-semibold text-slate-900">
                                        {player.name}
                                    </div>
                                </td>

                                <td className="px-6 py-5">
                                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                                        {formatRole(player.role)}
                                    </span>
                                </td>

                                <td className="px-6 py-5 text-right font-medium text-slate-700">
                                    {player.matchesPlayed}
                                </td>

                                <td className="px-6 py-5 text-right font-medium text-slate-700">
                                    {player.totalRuns}
                                </td>

                                <td className="px-6 py-5 text-right font-medium text-slate-700">
                                    {player.totalWickets}
                                </td>

                                <td className="px-6 py-5 text-right font-medium text-slate-700">
                                    {player.basePrice.toLocaleString()}
                                </td>

                                <td className="px-6 py-5 text-right">
                                    <span className="text-lg font-bold text-slate-950">
                                        {player.impactScore.toFixed(1)}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

function LeaderboardLoading() {
    return (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
            <div className="h-14 animate-pulse bg-slate-100" />

            <div className="space-y-4 p-6">
                {Array.from({ length: 6 }).map((_, index) => (
                    <div
                        key={index}
                        className="h-12 animate-pulse rounded-lg bg-slate-100"
                    />
                ))}
            </div>
        </div>
    );
}

export default function LeaderboardPage() {
    return (
        <main className="space-y-8">
            <div>
                <p className="text-sm font-medium text-blue-600">Performance</p>

                <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-950">
                    Leaderboard
                </h1>

                <p className="mt-2 max-w-2xl text-sm text-slate-500">
                    Player rankings calculated using the Criico Impact Score formula.
                </p>
            </div>

            <Suspense fallback={<LeaderboardLoading />}>
                <LeaderboardData />
            </Suspense>
        </main>
    );
}