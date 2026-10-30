import PlayersClient from "@/components/players/PlayersClient";
import { prisma } from "@/lib/prisma";
import type { Player } from "@/types/player";

export default async function PlayersPage() {
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