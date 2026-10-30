"use client";

import { useState } from "react";
import { CalendarDays, Plus, Trophy, Users, X } from "lucide-react";

import MatchForm from "@/components/matches/MatchForm";
import type { Match } from "@/types/match";
import type { Team } from "@/types/team";

interface MatchesClientProps {
    initialTeams: Team[];
    initialMatches: Match[];
}

export default function MatchesClient({
    initialTeams,
    initialMatches,
}: MatchesClientProps) {
    const [matches, setMatches] = useState<Match[]>(
        initialMatches,
    );
    const [showForm, setShowForm] = useState(false);

    function handleSuccess() {
        window.location.reload();
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                <div>
                    <p className="text-sm font-medium text-gray-500">
                        Match Management
                    </p>

                    <h1 className="mt-1 text-2xl font-semibold tracking-tight text-gray-950">
                        Matches
                    </h1>

                    <p className="mt-1 text-sm text-gray-500">
                        Record matches and update player statistics.
                    </p>
                </div>

                <button
                    type="button"
                    onClick={() => setShowForm(true)}
                    disabled={initialTeams.length < 2}
                    className="inline-flex items-center justify-center gap-2 rounded-lg bg-black px-4 py-2.5 text-sm font-medium text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-40"
                >
                    <Plus className="h-4 w-4" />
                    Record Match
                </button>
            </div>

            {initialTeams.length < 2 && (
                <div className="rounded-xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-800">
                    Create at least two teams before recording a match.
                </div>
            )}

            {matches.length === 0 ? (
                <div className="rounded-xl border border-dashed border-gray-300 bg-white px-6 py-16 text-center">
                    <Trophy className="mx-auto h-10 w-10 text-gray-400" />

                    <h2 className="mt-4 text-lg font-semibold text-gray-900">
                        No matches recorded
                    </h2>

                    <p className="mx-auto mt-2 max-w-md text-sm text-gray-500">
                        Record your first match to start building player
                        statistics and the leaderboard.
                    </p>
                </div>
            ) : (
                <div className="space-y-4">
                    {matches.map((match) => (
                        <div
                            key={match.id}
                            className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm"
                        >
                            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                                <div>
                                    <div className="flex items-center gap-2 text-sm font-semibold text-gray-900">
                                        <span>{match.teamA.name}</span>

                                        <span className="text-gray-400">vs</span>

                                        <span>{match.teamB.name}</span>
                                    </div>

                                    <div className="mt-1 flex items-center gap-2 text-xs text-gray-500">
                                        <CalendarDays className="h-3.5 w-3.5" />

                                        {new Date(
                                            match.playedAt,
                                        ).toLocaleString()}
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 text-xs text-gray-500">
                                    <Users className="h-3.5 w-3.5" />

                                    {match.performances.length} performances
                                </div>
                            </div>

                            {match.performances.length > 0 && (
                                <div className="mt-5 overflow-hidden rounded-lg border border-gray-100">
                                    <div className="grid grid-cols-[1fr_80px_80px] bg-gray-50 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
                                        <div>Player</div>
                                        <div>Runs</div>
                                        <div>Wickets</div>
                                    </div>

                                    <div className="divide-y divide-gray-100">
                                        {match.performances.map((performance) => (
                                            <div
                                                key={performance.id}
                                                className="grid grid-cols-[1fr_80px_80px] px-3 py-2.5 text-sm"
                                            >
                                                <div className="font-medium text-gray-800">
                                                    {performance.player?.name}
                                                </div>

                                                <div className="text-gray-600">
                                                    {performance.runs}
                                                </div>

                                                <div className="text-gray-600">
                                                    {performance.wickets}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {showForm && (
                <div className="fixed inset-0 z-50 overflow-y-auto bg-black/40 p-4">
                    <div className="flex min-h-full items-center justify-center">
                        <div className="w-full max-w-3xl rounded-2xl bg-white shadow-2xl">
                            <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
                                <div>
                                    <h2 className="font-semibold text-gray-950">
                                        Record Match
                                    </h2>

                                    <p className="mt-0.5 text-xs text-gray-500">
                                        Enter the performance of players in this match.
                                    </p>
                                </div>

                                <button
                                    type="button"
                                    onClick={() => setShowForm(false)}
                                    className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-900"
                                    aria-label="Close"
                                >
                                    <X className="h-5 w-5" />
                                </button>
                            </div>

                            <div className="p-6">
                                <MatchForm
                                    teams={initialTeams}
                                    onSuccess={handleSuccess}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}