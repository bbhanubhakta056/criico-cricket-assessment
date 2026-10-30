"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";

import { calculateImpactScore } from "@/lib/cricket/impact-score";
import type { Player } from "@/types/player";
import type { PlayerRole } from "@/types/cricket";

import PlayerForm from "./PlayerForm";

interface PlayersClientProps {
    initialPlayers: Player[];
}

const roleLabels: Record<PlayerRole, string> = {
    BATSMAN: "Batsman",
    BOWLER: "Bowler",
    ALL_ROUNDER: "All-rounder",
    WICKETKEEPER: "Wicketkeeper",
};

export default function PlayersClient({
    initialPlayers,
}: PlayersClientProps) {
    const [players, setPlayers] = useState(initialPlayers);
    const [formOpen, setFormOpen] = useState(false);
    const [editingPlayer, setEditingPlayer] =
        useState<Player | null>(null);
    const [deletingId, setDeletingId] = useState<string | null>(
        null,
    );

    const statistics = useMemo(() => {
        return players.reduce(
            (summary, player) => {
                summary.runs += player.totalRuns;
                summary.wickets += player.totalWickets;
                return summary;
            },
            {
                runs: 0,
                wickets: 0,
            },
        );
    }, [players]);

    function openCreateForm() {
        setEditingPlayer(null);
        setFormOpen(true);
    }

    function openEditForm(player: Player) {
        setEditingPlayer(player);
        setFormOpen(true);
    }

    function handlePlayerSaved(player: Player) {
        if (editingPlayer) {
            setPlayers((current) =>
                current.map((item) =>
                    item.id === player.id ? player : item,
                ),
            );
        } else {
            setPlayers((current) => [player, ...current]);
        }

        setEditingPlayer(null);
        setFormOpen(false);
    }

    async function deletePlayer(id: string) {
        const confirmed = window.confirm(
            "Are you sure you want to delete this player?",
        );

        if (!confirmed) {
            return;
        }

        try {
            setDeletingId(id);

            const response = await fetch(`/api/players/${id}`, {
                method: "DELETE",
            });

            const result = await response.json();

            if (!response.ok) {
                toast.error(result.message ?? "Failed to delete player");
                return;
            }

            setPlayers((current) =>
                current.filter((player) => player.id !== id),
            );

            toast.success("Player deleted successfully");
        } catch {
            toast.error("Unable to delete player");
        } finally {
            setDeletingId(null);
        }
    }

    return (
        <>
            <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                <div>
                    <p className="mb-1 text-sm font-medium text-neutral-500">
                        Team management
                    </p>

                    <h1 className="text-3xl font-bold tracking-tight text-neutral-950">
                        Players
                    </h1>

                    <p className="mt-2 text-sm text-neutral-500">
                        Manage players and track their cricket statistics.
                    </p>
                </div>

                <button
                    onClick={openCreateForm}
                    className="rounded-xl bg-neutral-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-neutral-800"
                >
                    + Add player
                </button>
            </div>

            <div className="mb-8 grid gap-4 sm:grid-cols-3">
                <StatCard label="Total players" value={players.length} />
                <StatCard
                    label="Total runs"
                    value={statistics.runs.toLocaleString()}
                />
                <StatCard
                    label="Total wickets"
                    value={statistics.wickets.toLocaleString()}
                />
            </div>

            <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white">
                <div className="border-b border-neutral-100 px-6 py-5">
                    <h2 className="font-semibold text-neutral-950">
                        Player roster
                    </h2>

                    <p className="mt-1 text-sm text-neutral-500">
                        {players.length}{" "}
                        {players.length === 1 ? "player" : "players"}
                    </p>
                </div>

                {players.length === 0 ? (
                    <div className="px-6 py-16 text-center">
                        <h3 className="font-semibold text-neutral-900">
                            No players yet
                        </h3>

                        <p className="mt-2 text-sm text-neutral-500">
                            Add your first player to start building the roster.
                        </p>

                        <button
                            onClick={openCreateForm}
                            className="mt-5 rounded-xl bg-neutral-950 px-5 py-2.5 text-sm font-medium text-white"
                        >
                            Add player
                        </button>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b border-neutral-100 bg-neutral-50/70 text-xs uppercase tracking-wide text-neutral-500">
                                    <th className="px-6 py-4 font-medium">Player</th>
                                    <th className="px-6 py-4 font-medium">Role</th>
                                    <th className="px-6 py-4 font-medium">Matches</th>
                                    <th className="px-6 py-4 font-medium">Runs</th>
                                    <th className="px-6 py-4 font-medium">Wickets</th>
                                    <th className="px-6 py-4 font-medium">
                                        Impact score
                                    </th>
                                    <th className="px-6 py-4 font-medium">
                                        Base price
                                    </th>
                                    <th className="px-6 py-4 text-right font-medium">
                                        Actions
                                    </th>
                                </tr>
                            </thead>

                            <tbody className="divide-y divide-neutral-100">
                                {players.map((player) => {
                                    const impactScore = calculateImpactScore({
                                        role: player.role,
                                        totalRuns: player.totalRuns,
                                        totalWickets: player.totalWickets,
                                        matchesPlayed: player.matchesPlayed,
                                    });

                                    return (
                                        <tr
                                            key={player.id}
                                            className="transition hover:bg-neutral-50/60"
                                        >
                                            <td className="px-6 py-4">
                                                <p className="font-medium text-neutral-950">
                                                    {player.name}
                                                </p>
                                            </td>

                                            <td className="px-6 py-4">
                                                <RoleBadge role={player.role} />
                                            </td>

                                            <td className="px-6 py-4 text-sm text-neutral-600">
                                                {player.matchesPlayed}
                                            </td>

                                            <td className="px-6 py-4 text-sm font-medium text-neutral-800">
                                                {player.totalRuns.toLocaleString()}
                                            </td>

                                            <td className="px-6 py-4 text-sm font-medium text-neutral-800">
                                                {player.totalWickets}
                                            </td>

                                            <td className="px-6 py-4">
                                                <span className="font-semibold text-neutral-950">
                                                    {impactScore.toFixed(1)}
                                                </span>
                                            </td>

                                            <td className="px-6 py-4 text-sm text-neutral-600">
                                                Rs. {player.basePrice.toLocaleString()}
                                            </td>

                                            <td className="px-6 py-4">
                                                <div className="flex justify-end gap-2">
                                                    <button
                                                        onClick={() => openEditForm(player)}
                                                        className="rounded-lg border border-neutral-200 px-3 py-1.5 text-xs font-medium text-neutral-700 transition hover:bg-neutral-50"
                                                    >
                                                        Edit
                                                    </button>

                                                    <button
                                                        onClick={() => deletePlayer(player.id)}
                                                        disabled={deletingId === player.id}
                                                        className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 transition hover:bg-red-50 disabled:opacity-50"
                                                    >
                                                        {deletingId === player.id
                                                            ? "Deleting..."
                                                            : "Delete"}
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {formOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
                    <div className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
                        <div className="flex items-start justify-between border-b border-neutral-100 px-6 py-5">
                            <div>
                                <h2 className="text-xl font-semibold text-neutral-950">
                                    {editingPlayer ? "Edit player" : "Add player"}
                                </h2>

                                <p className="mt-1 text-sm text-neutral-500">
                                    {editingPlayer
                                        ? "Update player details and statistics."
                                        : "Add a new player to your cricket roster."}
                                </p>
                            </div>

                            <button
                                onClick={() => setFormOpen(false)}
                                className="text-xl text-neutral-400 transition hover:text-neutral-900"
                                aria-label="Close"
                            >
                                ×
                            </button>
                        </div>

                        <div className="p-6">
                            <PlayerForm
                                player={editingPlayer}
                                onSuccess={handlePlayerSaved}
                                onCancel={() => {
                                    setFormOpen(false);
                                    setEditingPlayer(null);
                                }}
                            />
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

function StatCard({
    label,
    value,
}: {
    label: string;
    value: string | number;
}) {
    return (
        <div className="rounded-2xl border border-neutral-200 bg-white p-5">
            <p className="text-sm font-medium text-neutral-500">{label}</p>

            <p className="mt-2 text-3xl font-bold tracking-tight text-neutral-950">
                {value}
            </p>
        </div>
    );
}

function RoleBadge({ role }: { role: PlayerRole }) {
    return (
        <span className="inline-flex rounded-full bg-neutral-100 px-2.5 py-1 text-xs font-medium text-neutral-700">
            {roleLabels[role]}
        </span>
    );
}