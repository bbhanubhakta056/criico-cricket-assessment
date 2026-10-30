import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { playerSchema } from "@/lib/validations/player.schema";
import { requireAuth } from "@/lib/auth/require-auth";

export async function GET() {
  try {
    const players = await prisma.player.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({
      data: players.map((player) => ({
        id: player.id,
        name: player.name,
        role: player.role,
        basePrice: Number(player.basePrice),
        matchesPlayed: player.matchesPlayed,
        totalRuns: player.totalRuns,
        totalWickets: player.totalWickets,
        createdAt: player.createdAt.toISOString(),
        updatedAt: player.updatedAt.toISOString(),
      })),
    });
  } catch (error) {
    console.error("GET_PLAYERS_ERROR", error);

    return NextResponse.json(
      {
        message: "Failed to fetch players",
      },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  const { response } = await requireAuth();

  if (response) {
    return response;
  }

  try {
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

    const player = await prisma.player.create({
      data: {
        name: result.data.name,
        role: result.data.role,
        basePrice: result.data.basePrice,
        matchesPlayed: result.data.matchesPlayed,
        totalRuns: result.data.totalRuns,
        totalWickets: result.data.totalWickets,
      },
    });

    return NextResponse.json(
      {
        message: "Player created successfully",
        data: player,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("CREATE_PLAYER_ERROR", error);

    return NextResponse.json(
      {
        message: "Failed to create player",
      },
      { status: 500 },
    );
  }
}