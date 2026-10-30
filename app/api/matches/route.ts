import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { matchSchema } from "@/lib/validations/match.schema";

export async function GET() {
    try {
        const matches = await prisma.match.findMany({
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
        });

        return NextResponse.json({
            data: matches,
        });
    } catch (error) {
        console.error("GET_MATCHES_ERROR", error);

        return NextResponse.json(
            {
                message: "Unable to fetch matches.",
            },
            { status: 500 },
        );
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();

        const result = matchSchema.safeParse(body);

        if (!result.success) {
            return NextResponse.json(
                {
                    message: "Invalid match data.",
                    errors: result.error.flatten().fieldErrors,
                },
                { status: 400 },
            );
        }

        const {
            teamAId,
            teamBId,
            playedAt,
            performances,
        } = result.data;

        // A team cannot play against itself.
        if (teamAId === teamBId) {
            return NextResponse.json(
                {
                    message: "A team cannot play against itself.",
                },
                { status: 400 },
            );
        }

        // Prevent duplicate player performances.
        const playerIds = performances.map(
            (performance) => performance.playerId,
        );

        if (new Set(playerIds).size !== playerIds.length) {
            return NextResponse.json(
                {
                    message: "A player can only have one performance per match.",
                },
                { status: 400 },
            );
        }

        const teams = await prisma.team.findMany({
            where: {
                id: {
                    in: [teamAId, teamBId],
                },
            },
            include: {
                players: {
                    select: {
                        playerId: true,
                    },
                },
            },
        });

        if (teams.length !== 2) {
            return NextResponse.json(
                {
                    message: "One or both teams could not be found.",
                },
                { status: 404 },
            );
        }

        const teamA = teams.find((team) => team.id === teamAId);
        const teamB = teams.find((team) => team.id === teamBId);

        if (!teamA || !teamB) {
            return NextResponse.json(
                {
                    message: "One or both teams could not be found.",
                },
                { status: 404 },
            );
        }

        const teamAPlayerIds = new Set(
            teamA.players.map((player) => player.playerId),
        );

        const teamBPlayerIds = new Set(
            teamB.players.map((player) => player.playerId),
        );

        // Every performance must belong to one of the participating teams.
        for (const performance of performances) {
            const belongsToTeamA = teamAPlayerIds.has(performance.playerId);
            const belongsToTeamB = teamBPlayerIds.has(performance.playerId);

            if (!belongsToTeamA && !belongsToTeamB) {
                return NextResponse.json(
                    {
                        message: `Player ${performance.playerId} is not a member of either participating team.`,
                    },
                    { status: 400 },
                );
            }

            // A player cannot belong to both teams.
            if (belongsToTeamA && belongsToTeamB) {
                return NextResponse.json(
                    {
                        message: `Player ${performance.playerId} cannot belong to both teams.`,
                    },
                    { status: 400 },
                );
            }
        }

        const match = await prisma.$transaction(async (tx) => {
            const createdMatch = await tx.match.create({
                data: {
                    teamAId,
                    teamBId,
                    playedAt: playedAt ?? new Date(),
                    performances: {
                        create: performances.map((performance) => ({
                            playerId: performance.playerId,
                            runs: performance.runs,
                            wickets: performance.wickets,
                        })),
                    },
                },
                include: {
                    performances: true,
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
                },
            });

            // Update player statistics from this match.
            for (const performance of performances) {
                await tx.player.update({
                    where: {
                        id: performance.playerId,
                    },
                    data: {
                        matchesPlayed: {
                            increment: 1,
                        },
                        totalRuns: {
                            increment: performance.runs,
                        },
                        totalWickets: {
                            increment: performance.wickets,
                        },
                    },
                });
            }

            return createdMatch;
        });

        return NextResponse.json(
            {
                message: "Match recorded successfully.",
                data: match,
            },
            { status: 201 },
        );
    } catch (error) {
        console.error("CREATE_MATCH_ERROR", error);

        return NextResponse.json(
            {
                message: "Unable to record match.",
            },
            { status: 500 },
        );
    }
}