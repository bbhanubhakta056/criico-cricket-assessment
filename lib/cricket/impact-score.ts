import type { ImpactScoreInput } from "@/types/cricket";

export function calculateImpactScore(player: ImpactScoreInput): number {
  let adjustedRuns = player.totalRuns;
  let adjustedWickets = player.totalWickets;

  // Role multiplier
  if (player.role === "BATSMAN") {
    adjustedRuns *= 1.3;
  }

  if (player.role === "BOWLER") {
    adjustedWickets *= 1.5;
  }

  // Base score after applying the relevant role multiplier
  let score = adjustedRuns * 1.2 + adjustedWickets * 20;

  // Experience penalty / bonus
  if (player.matchesPlayed < 5) {
    score -= 50;
  } else if (player.matchesPlayed > 20) {
    score += 100;
  }

  // Wicketkeepers receive a flat bonus.
  // Since role is a single discriminated value, a wicketkeeper
  // cannot simultaneously receive the bowler multiplier.
  if (player.role === "WICKETKEEPER") {
    score += 30;
  }

  return score;
}