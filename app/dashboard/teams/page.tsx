import { Suspense } from "react";

import TeamsClient from "@/components/teams/TeamsClient";
import { prisma } from "@/lib/prisma";
import type { Team } from "@/types/team";

function TeamsLoading() {
    return (
        <div className="space-y-6">
            <div className="h-8 w-40 animate-pulse rounded bg-gray-200" />

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {[1, 2, 3].map((item) => (
                    <div
                        key={item}
                        className="h-48 animate-pulse rounded-xl bg-gray-100"
                    />
                ))}
            </div>
        </div>
    );
}

async function TeamsData() {
    const teams = await prisma.team.findMany({
        orderBy: {
            createdAt: "desc",
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
    });

    const serializedTeams: Team[] = teams.map((team) => ({
        id: team.id,
        name: team.name,
        players: team.players.map(({ player }) => player),
        createdAt: team.createdAt.toISOString(),
        updatedAt: team.updatedAt.toISOString(),
    }));

    return <TeamsClient initialTeams={serializedTeams} />;
}

export default function TeamsPage() {
    return (
        <Suspense fallback={<TeamsLoading />}>
            <TeamsData />
        </Suspense>
    );
}