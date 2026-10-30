export interface TeamPlayer {
    id: string;
    name: string;
    role: "BATSMAN" | "BOWLER" | "ALL_ROUNDER" | "WICKETKEEPER";
}

export interface Team {
    id: string;
    name: string;
    players: TeamPlayer[];
    createdAt: string;
    updatedAt: string;
}

export interface TeamFormData {
    name: string;
    playerIds: string[];
}