import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { playerSchema } from "@/lib/validations/player.schema";

interface RouteContext {
    params: Promise<{
        id: string;
    }>;
}

export async function PUT(
    request: Request,
    context: RouteContext,
) {
    try {
        const { id } = await context.params;
        const body = await request.json();

        const result = playerSchema.safeParse(body);

        if (!result.success) {
            return NextResponse.json(
                {
                    message: "Invalid player data",
                    errors: result.error.flatten().fieldErrors,
                },
                { status: 400 },
            );
        }

        const existingPlayer = await prisma.player.findUnique({
            where: {
                id,
            },
        });

        if (!existingPlayer) {
            return NextResponse.json(
                {
                    message: "Player not found",
                },
                { status: 404 },
            );
        }

        const player = await prisma.player.update({
            where: {
                id,
            },
            data: {
                name: result.data.name,
                role: result.data.role,
                basePrice: result.data.basePrice,
                matchesPlayed: result.data.matchesPlayed,
                totalRuns: result.data.totalRuns,
                totalWickets: result.data.totalWickets,
            },
        });

        return NextResponse.json({
            message: "Player updated successfully",
            data: player,
        });
    } catch (error) {
        console.error("UPDATE_PLAYER_ERROR", error);

        return NextResponse.json(
            {
                message: "Failed to update player",
            },
            { status: 500 },
        );
    }
}

export async function DELETE(
    _request: Request,
    context: RouteContext,
) {
    try {
        const { id } = await context.params;

        const existingPlayer = await prisma.player.findUnique({
            where: {
                id,
            },
        });

        if (!existingPlayer) {
            return NextResponse.json(
                {
                    message: "Player not found",
                },
                { status: 404 },
            );
        }

        await prisma.player.delete({
            where: {
                id,
            },
        });

        return NextResponse.json({
            message: "Player deleted successfully",
        });
    } catch (error) {
        console.error("DELETE_PLAYER_ERROR", error);

        return NextResponse.json(
            {
                message: "Failed to delete player",
            },
            { status: 500 },
        );
    }
}