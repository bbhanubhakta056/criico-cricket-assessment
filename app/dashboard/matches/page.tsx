import { Suspense } from "react";

import MatchesClient from "@/components/matches/MatchesClient";
import { prisma } from "@/lib/prisma";
import type { Match } from "@/types/match";

function MatchesLoading() {
    return (
        <div className="space-y-6">
            <div className="h-8 w-48 animate-pulse rounded bg-gray-200" />

            <div className="h-80 animate-pulse rounded-xl bg-gray-100" />
        </div>
    );
}

async function MatchesData() {
    const [teams, matches] = await Promise.all([
        prisma.team.findMany({
            orderBy: {
                name: "asc",
            },
            include: {
                players: {
                    include: {
                        player: {
                            select: {
                                id: true,
                                name: true,
                                role: true,
                            },
                        },
                    },
                },
            },
        }),

        prisma.match.findMany({
            orderBy: {
                playedAt: "desc",
            },
            include: {
                teamA: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
                teamB: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
                performances: {
                    include: {
                        player: {
                            select: {
                                id: true,
                                name: true,
                                role: true,
                            },
                        },
                    },
                },
            },
        }),
    ]);

    const serializedTeams = teams.map((team) => ({
        id: team.id,
        name: team.name,
        players: team.players.map(({ player }) => player),
        createdAt: team.createdAt.toISOString(),
        updatedAt: team.updatedAt.toISOString(),
    }));

    const serializedMatches: Match[] = matches.map((match) => ({
        id: match.id,
        playedAt: match.playedAt.toISOString(),
        teamA: match.teamA,
        teamB: match.teamB,
        performances: match.performances.map(
            (performance) => ({
                id: performance.id,
                playerId: performance.playerId,
                runs: performance.runs,
                wickets: performance.wickets,
                player: performance.player,
            }),
        ),
    }));

    return (
        <MatchesClient
            initialTeams={serializedTeams}
            initialMatches={serializedMatches}
        />
    );
}

export default function MatchesPage() {
    return (
        <Suspense fallback={<MatchesLoading />}>
            <MatchesData />
        </Suspense>
    );
}