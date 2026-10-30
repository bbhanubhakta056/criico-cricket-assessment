import { z } from "zod";

export const teamSchema = z.object({
    name: z
        .string()
        .trim()
        .min(2, "Team name must be at least 2 characters")
        .max(100, "Team name is too long"),

    playerIds: z.array(z.string().min(1)).default([]),
});

export type TeamInput = z.infer<typeof teamSchema>;