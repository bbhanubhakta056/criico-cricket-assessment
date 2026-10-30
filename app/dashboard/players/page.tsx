import { Suspense } from "react";

import PlayersClient from "@/components/players/PlayersClient";
import { prisma } from "@/lib/prisma";
import type { Player } from "@/types/player";

function PlayersLoading() {
    return (
        <div className="space-y-6">
            <div className="h-8 w-48 animate-pulse rounded bg-gray-200" />

            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                {[1, 2, 3].map((item) => (
                    <div
                        key={item}
                        className="h-24 animate-pulse rounded-xl bg-gray-100"
                    />
                ))}
            </div>

            <div className="h-96 animate-pulse rounded-xl bg-gray-100" />
        </div>
    );
}

async function PlayersData() {
    const players = await prisma.player.findMany({
        orderBy: {
            createdAt: "desc",
        },
    });

    const serializedPlayers: Player[] = players.map((player) => ({
        id: player.id,
        name: player.name,
        role: player.role,
        basePrice: Number(player.basePrice),
        matchesPlayed: player.matchesPlayed,
        totalRuns: player.totalRuns,
        totalWickets: player.totalWickets,
        createdAt: player.createdAt.toISOString(),
        updatedAt: player.updatedAt.toISOString(),
    }));

    return <PlayersClient initialPlayers={serializedPlayers} />;
}

export default function PlayersPage() {
    return (
        <Suspense fallback={<PlayersLoading />}>
            <PlayersData />
        </Suspense>
    );
}