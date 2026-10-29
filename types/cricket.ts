export const PLAYER_ROLES = [
  "BATSMAN",
  "BOWLER",
  "ALL_ROUNDER",
  "WICKETKEEPER",
] as const;

export type PlayerRole = (typeof PLAYER_ROLES)[number];

export interface ImpactScoreInput {
  role: PlayerRole;
  totalRuns: number;
  totalWickets: number;
  matchesPlayed: number;
}