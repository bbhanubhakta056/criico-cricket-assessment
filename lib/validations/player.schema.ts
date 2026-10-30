import { z } from "zod";
import { PLAYER_ROLES } from "@/types/cricket";

export const playerSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name is too long"),

  role: z.enum(PLAYER_ROLES),

  basePrice: z.coerce
    .number()
    .min(0, "Base price cannot be negative"),

  matchesPlayed: z.coerce
    .number()
    .int("Matches played must be a whole number")
    .min(0, "Matches played cannot be negative"),

  totalRuns: z.coerce
    .number()
    .int("Total runs must be a whole number")
    .min(0, "Total runs cannot be negative"),

  totalWickets: z.coerce
    .number()
    .int("Total wickets must be a whole number")
    .min(0, "Total wickets cannot be negative"),
});

export type PlayerInput = z.infer<typeof playerSchema>;