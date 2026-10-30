import { NextResponse } from "next/server";

import { calculateImpactScore } from "@/lib/cricket/impact-score";
import { prisma } from "@/lib/prisma";

export async function GET() {
    try {
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

        return NextResponse.json({
            data: leaderboard,
        });
    } catch (error) {
        console.error("GET_LEADERBOARD_ERROR", error);

        return NextResponse.json(
            { message: "Failed to fetch leaderboard" },
            { status: 500 },
        );
    }
}