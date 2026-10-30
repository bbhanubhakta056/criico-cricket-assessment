import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { teamSchema } from "@/lib/validations/team.schema";
import { requireAuth } from "@/lib/auth/require-auth";

export async function GET() {
    try {
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

        const serializedTeams = teams.map((team) => ({
            id: team.id,
            name: team.name,
            players: team.players.map(({ player }) => player),
            createdAt: team.createdAt.toISOString(),
            updatedAt: team.updatedAt.toISOString(),
        }));

        return NextResponse.json(serializedTeams);
    } catch (error) {
        console.error("GET_TEAMS_ERROR", error);

        return NextResponse.json(
            { message: "Unable to fetch teams." },
            { status: 500 },
        );
    }
}

export async function POST(request: NextRequest) {
    const { response } = await requireAuth();

    if (response) {
        return response;
    }

    try {
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

        const existingTeam = await prisma.team.findFirst({
            where: {
                name: {
                    equals: name,
                    mode: "insensitive",
                },
            },
        });

        if (existingTeam) {
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

        const team = await prisma.team.create({
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

        return NextResponse.json(
            {
                id: team.id,
                name: team.name,
                players: team.players.map(({ player }) => player),
                createdAt: team.createdAt.toISOString(),
                updatedAt: team.updatedAt.toISOString(),
            },
            { status: 201 },
        );
    } catch (error) {
        console.error("CREATE_TEAM_ERROR", error);

        return NextResponse.json(
            { message: "Unable to create team." },
            { status: 500 },
        );
    }
}