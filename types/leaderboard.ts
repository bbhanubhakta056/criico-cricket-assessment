import type { PlayerRole } from "@/types/cricket";

export interface LeaderboardPlayer {
    id: string;
    name: string;
    role: PlayerRole;
    basePrice: number;
    matchesPlayed: number;
    totalRuns: number;
    totalWickets: number;
    impactScore: number;
}