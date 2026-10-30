"use client";

import { useMemo, useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import type { Team } from "@/types/team";
import type { MatchFormData } from "@/types/match";

interface MatchFormProps {
    teams: Team[];
    onSuccess: () => void;
}

export default function MatchForm({
    teams,
    onSuccess,
}: MatchFormProps) {
    const [teamAId, setTeamAId] = useState("");
    const [teamBId, setTeamBId] = useState("");
    const [playedAt, setPlayedAt] = useState("");
    const [performanceValues, setPerformanceValues] = useState<
        Record<string, { runs: number; wickets: number }>
    >(() => {
        const values: Record<
            string,
            { runs: number; wickets: number }
        > = {};

        return values;
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const teamA = useMemo(
        () => teams.find((team) => team.id === teamAId),
        [teams, teamAId],
    );

    const teamB = useMemo(
        () => teams.find((team) => team.id === teamBId),
        [teams, teamBId],
    );

    const selectedPlayers = useMemo(() => {
        const players = [
            ...(teamA?.players ?? []),
            ...(teamB?.players ?? []),
        ];

        return players;
    }, [teamA, teamB]);

    const performances = selectedPlayers.map((player) => ({
        playerId: player.id,
        runs: performanceValues[player.id]?.runs ?? 0,
        wickets: performanceValues[player.id]?.wickets ?? 0,
    }));

    function updatePerformance(
        playerId: string,
        field: "runs" | "wickets",
        value: number,
    ) {
        setPerformanceValues((current) => ({
            ...current,
            [playerId]: {
                runs: current[playerId]?.runs ?? 0,
                wickets: current[playerId]?.wickets ?? 0,
                [field]: value,
            },
        }));
    }

    function resetForm() {
        setTeamAId("");
        setTeamBId("");
        setPlayedAt("");
    }

    async function handleSubmit(
        event: React.FormEvent<HTMLFormElement>,
    ) {
        event.preventDefault();

        if (!teamAId || !teamBId) {
            toast.error("Please select both teams.");
            return;
        }

        if (teamAId === teamBId) {
            toast.error("A team cannot play against itself.");
            return;
        }

        if (selectedPlayers.length === 0) {
            toast.error(
                "Both teams must have players before recording a match.",
            );
            return;
        }

        const invalidPerformance = performances.find(
            (performance) =>
                performance.runs < 0 ||
                performance.wickets < 0 ||
                !Number.isInteger(performance.runs) ||
                !Number.isInteger(performance.wickets),
        );

        if (invalidPerformance) {
            toast.error(
                "Runs and wickets must be non-negative whole numbers.",
            );
            return;
        }

        const payload: MatchFormData = {
            teamAId,
            teamBId,
            playedAt: playedAt
                ? new Date(playedAt).toISOString()
                : undefined,
            performances,
        };

        setIsSubmitting(true);

        try {
            const response = await fetch("/api/matches", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(payload),
            });

            const data = await response.json();

            if (!response.ok) {
                toast.error(
                    data.message ?? "Unable to record match.",
                );
                return;
            }

            toast.success("Match recorded successfully.");

            resetForm();
            onSuccess();
        } catch {
            toast.error("Something went wrong. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-8">
            {/* Teams */}
            <section>
                <div className="mb-4">
                    <h2 className="text-sm font-semibold text-gray-950">
                        Match Teams
                    </h2>

                    <p className="mt-1 text-xs text-gray-500">
                        Select the two teams participating in this match.
                    </p>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                    <div>
                        <label
                            htmlFor="team-a"
                            className="mb-2 block text-sm font-medium text-gray-700"
                        >
                            Team A
                        </label>

                        <select
                            id="team-a"
                            value={teamAId}
                            onChange={(event) =>
                                setTeamAId(event.target.value)
                            }
                            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 outline-none focus:border-black"
                        >
                            <option value="">Select team</option>

                            {teams.map((team) => (
                                <option key={team.id} value={team.id}>
                                    {team.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label
                            htmlFor="team-b"
                            className="mb-2 block text-sm font-medium text-gray-700"
                        >
                            Team B
                        </label>

                        <select
                            id="team-b"
                            value={teamBId}
                            onChange={(event) =>
                                setTeamBId(event.target.value)
                            }
                            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 outline-none focus:border-black"
                        >
                            <option value="">Select team</option>

                            {teams
                                .filter((team) => team.id !== teamAId)
                                .map((team) => (
                                    <option key={team.id} value={team.id}>
                                        {team.name}
                                    </option>
                                ))}
                        </select>
                    </div>
                </div>

                <div className="mt-4">
                    <label
                        htmlFor="played-at"
                        className="mb-2 block text-sm font-medium text-gray-700"
                    >
                        Match Date
                    </label>

                    <input
                        id="played-at"
                        type="datetime-local"
                        value={playedAt}
                        onChange={(event) =>
                            setPlayedAt(event.target.value)
                        }
                        className="rounded-lg border border-gray-300 px-3 py-2.5 outline-none focus:border-black"
                    />
                </div>
            </section>

            {/* Performances */}
            <section>
                <div className="mb-4">
                    <h2 className="text-sm font-semibold text-gray-950">
                        Player Performances
                    </h2>

                    <p className="mt-1 text-xs text-gray-500">
                        Enter runs and wickets for players who participated.
                    </p>
                </div>

                {!teamAId || !teamBId ? (
                    <div className="rounded-lg border border-dashed border-gray-300 p-8 text-center text-sm text-gray-500">
                        Select both teams to enter player performances.
                    </div>
                ) : selectedPlayers.length === 0 ? (
                    <div className="rounded-lg border border-dashed border-gray-300 p-8 text-center text-sm text-gray-500">
                        No players are available for the selected teams.
                    </div>
                ) : (
                    <div className="overflow-hidden rounded-xl border border-gray-200">
                        <div className="hidden grid-cols-[1fr_120px_120px] gap-4 border-b border-gray-200 bg-gray-50 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500 md:grid">
                            <div>Player</div>
                            <div>Runs</div>
                            <div>Wickets</div>
                        </div>

                        <div className="divide-y divide-gray-100">
                            {selectedPlayers.map((player) => {
                                const performance = performances.find(
                                    (item) => item.playerId === player.id,
                                );

                                return (
                                    <div
                                        key={player.id}
                                        className="grid gap-4 px-4 py-4 md:grid-cols-[1fr_120px_120px] md:items-center"
                                    >
                                        <div>
                                            <p className="text-sm font-medium text-gray-900">
                                                {player.name}
                                            </p>

                                            <p className="mt-0.5 text-xs text-gray-500">
                                                {player.role.replaceAll("_", " ")}
                                            </p>
                                        </div>

                                        <div>
                                            <label className="mb-1 block text-xs text-gray-500 md:hidden">
                                                Runs
                                            </label>

                                            <input
                                                type="number"
                                                min="0"
                                                step="1"
                                                value={performance?.runs ?? 0}
                                                onChange={(event) =>
                                                    updatePerformance(
                                                        player.id,
                                                        "runs",
                                                        Number(event.target.value),
                                                    )
                                                }
                                                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-black"
                                            />
                                        </div>

                                        <div>
                                            <label className="mb-1 block text-xs text-gray-500 md:hidden">
                                                Wickets
                                            </label>

                                            <input
                                                type="number"
                                                min="0"
                                                step="1"
                                                value={performance?.wickets ?? 0}
                                                onChange={(event) =>
                                                    updatePerformance(
                                                        player.id,
                                                        "wickets",
                                                        Number(event.target.value),
                                                    )
                                                }
                                                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-black"
                                            />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
            </section>

            <div className="flex justify-end border-t border-gray-200 pt-5">
                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="inline-flex items-center gap-2 rounded-lg bg-black px-5 py-2.5 text-sm font-medium text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
                >
                    {isSubmitting && (
                        <Loader2 className="h-4 w-4 animate-spin" />
                    )}

                    Record Match
                </button>
            </div>
        </form>
    );
}