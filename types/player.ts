import type { PlayerRole } from "@/types/cricket";

export interface Player {
    id: string;
    name: string;
    role: PlayerRole;
    basePrice: number;
    matchesPlayed: number;
    totalRuns: number;
    totalWickets: number;
    createdAt: string;
    updatedAt: string;
}

export interface PlayerFormData {
    name: string;
    role: PlayerRole;
    basePrice: number;
    matchesPlayed: number;
    totalRuns: number;
    totalWickets: number;
}