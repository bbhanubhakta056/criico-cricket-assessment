import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { teamSchema } from "@/lib/validations/team.schema";

interface RouteContext {
    params: Promise<{
        id: string;
    }>;
}

export async function PUT(
    request: NextRequest,
    context: RouteContext,
) {
    try {
        const { id } = await context.params;
        const body = await request.json();

        const result = teamSchema.safeParse(body);

        if (!result.success) {
            return NextResponse.json(
                {
                    message: "Invalid team data.",
                    errors: result.error.flatten().fieldErrors,
                },
                { status: 400 },
            );
        }

        const { name, playerIds } = result.data;

        const existingTeam = await prisma.team.findUnique({
            where: {
                id,
            },
        });

        if (!existingTeam) {
            return NextResponse.json(
                {
                    message: "Team not found.",
                },
                { status: 404 },
            );
        }

        const duplicateName = await prisma.team.findFirst({
            where: {
                id: {
                    not: id,
                },
                name: {
                    equals: name,
                    mode: "insensitive",
                },
            },
        });

        if (duplicateName) {
            return NextResponse.json(
                {
                    message: "A team with this name already exists.",
                },
                { status: 409 },
            );
        }

        const players = playerIds.length
            ? await prisma.player.findMany({
                where: {
                    id: {
                        in: playerIds,
                    },
                },
                select: {
                    id: true,
                },
            })
            : [];

        if (players.length !== playerIds.length) {
            return NextResponse.json(
                {
                    message: "One or more selected players do not exist.",
                },
                { status: 400 },
            );
        }

        const team = await prisma.$transaction(async (tx) => {
            await tx.teamPlayer.deleteMany({
                where: {
                    teamId: id,
                },
            });

            return tx.team.update({
                where: {
                    id,
                },
                data: {
                    name,
                    players: {
                        create: playerIds.map((playerId) => ({
                            player: {
                                connect: {
                                    id: playerId,
                                },
                            },
                        })),
                    },
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
        });

        return NextResponse.json({
            id: team.id,
            name: team.name,
            players: team.players.map(({ player }) => player),
            createdAt: team.createdAt.toISOString(),
            updatedAt: team.updatedAt.toISOString(),
        });
    } catch (error) {
        console.error("UPDATE_TEAM_ERROR", error);

        return NextResponse.json(
            { message: "Unable to update team." },
            { status: 500 },
        );
    }
}

export async function DELETE(
    _request: NextRequest,
    context: RouteContext,
) {
    try {
        const { id } = await context.params;

        const team = await prisma.team.findUnique({
            where: {
                id,
            },
            include: {
                matchesAsTeamA: {
                    select: {
                        id: true,
                    },
                    take: 1,
                },
                matchesAsTeamB: {
                    select: {
                        id: true,
                    },
                    take: 1,
                },
            },
        });

        if (!team) {
            return NextResponse.json(
                {
                    message: "Team not found.",
                },
                { status: 404 },
            );
        }

        if (
            team.matchesAsTeamA.length > 0 ||
            team.matchesAsTeamB.length > 0
        ) {
            return NextResponse.json(
                {
                    message: "Teams used in matches cannot be deleted.",
                },
                { status: 409 },
            );
        }

        await prisma.team.delete({
            where: {
                id,
            },
        });

        return NextResponse.json({
            message: "Team deleted successfully.",
        });
    } catch (error) {
        console.error("DELETE_TEAM_ERROR", error);

        return NextResponse.json(
            { message: "Unable to delete team." },
            { status: 500 },
        );
    }
}