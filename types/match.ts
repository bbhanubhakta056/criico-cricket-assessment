export interface MatchTeam {
    id: string;
    name: string;
}

export interface MatchPlayer {
    id: string;
    name: string;
    role: "BATSMAN" | "BOWLER" | "ALL_ROUNDER" | "WICKETKEEPER";
}

export interface MatchPerformance {
    id?: string;
    playerId: string;
    runs: number;
    wickets: number;
    player?: MatchPlayer;
}

export interface Match {
    id: string;
    playedAt: string;
    teamA: MatchTeam;
    teamB: MatchTeam;
    performances: MatchPerformance[];
}

export interface MatchFormData {
    teamAId: string;
    teamBId: string;
    playedAt?: string;
    performances: {
        playerId: string;
        runs: number;
        wickets: number;
    }[];
}