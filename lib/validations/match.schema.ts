import { z } from "zod";

const performanceSchema = z.object({
    playerId: z.string().min(1, "Player is required"),
    runs: z.coerce
        .number()
        .int("Runs must be a whole number")
        .min(0, "Runs cannot be negative"),
    wickets: z.coerce
        .number()
        .int("Wickets must be a whole number")
        .min(0, "Wickets cannot be negative"),
});

export const matchSchema = z.object({
    teamAId: z.string().min(1, "Team A is required"),
    teamBId: z.string().min(1, "Team B is required"),
    playedAt: z.coerce.date().optional(),
    performances: z
        .array(performanceSchema)
        .min(1, "At least one player performance is required"),
});

export type MatchInput = z.infer<typeof matchSchema>;