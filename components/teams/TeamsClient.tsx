"use client";

import { useEffect, useState } from "react";
import {
    Edit3,
    Plus,
    Shield,
    Trash2,
    Users,
    X,
} from "lucide-react";
import { toast } from "sonner";

import TeamForm from "@/components/teams/TeamForm";
import type { Player } from "@/types/player";
import type { Team } from "@/types/team";

interface TeamsClientProps {
    initialTeams: Team[];
}

export default function TeamsClient({
    initialTeams,
}: TeamsClientProps) {
    const [teams, setTeams] = useState<Team[]>(initialTeams);
    const [players, setPlayers] = useState<Player[]>([]);
    const [isLoadingPlayers, setIsLoadingPlayers] = useState(true);

    const [showForm, setShowForm] = useState(false);
    const [editingTeam, setEditingTeam] = useState<Team | null>(null);

    useEffect(() => {
        async function loadPlayers() {
            try {
                const response = await fetch("/api/players");

                if (!response.ok) {
                    throw new Error("Failed to load players");
                }

                const data = await response.json();
                setPlayers(data.data);
            } catch {
                toast.error("Unable to load players.");
            } finally {
                setIsLoadingPlayers(false);
            }
        }

        loadPlayers();
    }, []);

    function handleCreate() {
        setEditingTeam(null);
        setShowForm(true);
    }

    function handleEdit(team: Team) {
        setEditingTeam(team);
        setShowForm(true);
    }

    function handleSuccess(team: Team) {
        setTeams((current) => {
            const exists = current.some((item) => item.id === team.id);

            if (exists) {
                return current.map((item) =>
                    item.id === team.id ? team : item,
                );
            }

            return [team, ...current];
        });

        setShowForm(false);
        setEditingTeam(null);
    }

    async function handleDelete(team: Team) {
        const confirmed = window.confirm(
            `Delete "${team.name}"? This cannot be undone.`,
        );

        if (!confirmed) {
            return;
        }

        try {
            const response = await fetch(`/api/teams/${team.id}`, {
                method: "DELETE",
            });

            const data = await response.json();

            if (!response.ok) {
                toast.error(data.message ?? "Unable to delete team.");
                return;
            }

            setTeams((current) =>
                current.filter((item) => item.id !== team.id),
            );

            toast.success("Team deleted successfully.");
        } catch {
            toast.error("Something went wrong. Please try again.");
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                <div>
                    <p className="text-sm font-medium text-gray-500">
                        Team Management
                    </p>

                    <h1 className="mt-1 text-2xl font-semibold tracking-tight text-gray-950">
                        Teams
                    </h1>

                    <p className="mt-1 text-sm text-gray-500">
                        Create teams and assign players for match management.
                    </p>
                </div>

                <button
                    type="button"
                    onClick={handleCreate}
                    className="inline-flex items-center justify-center gap-2 rounded-lg bg-black px-4 py-2.5 text-sm font-medium text-white transition hover:bg-gray-800"
                >
                    <Plus className="h-4 w-4" />
                    Add Team
                </button>
            </div>

            {teams.length === 0 ? (
                <div className="rounded-xl border border-dashed border-gray-300 bg-white px-6 py-16 text-center">
                    <Shield className="mx-auto h-10 w-10 text-gray-400" />

                    <h2 className="mt-4 text-lg font-semibold text-gray-900">
                        No teams yet
                    </h2>

                    <p className="mx-auto mt-2 max-w-md text-sm text-gray-500">
                        Create your first team and assign players to get ready
                        for match recording.
                    </p>

                    <button
                        type="button"
                        onClick={handleCreate}
                        className="mt-5 inline-flex items-center gap-2 rounded-lg bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
                    >
                        <Plus className="h-4 w-4" />
                        Create Team
                    </button>
                </div>
            ) : (
                <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                    {teams.map((team) => (
                        <div
                            key={team.id}
                            className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm"
                        >
                            <div className="flex items-start justify-between gap-4">
                                <div className="min-w-0">
                                    <div className="flex items-center gap-2">
                                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gray-100">
                                            <Shield className="h-4 w-4 text-gray-700" />
                                        </div>

                                        <h2 className="truncate font-semibold text-gray-950">
                                            {team.name}
                                        </h2>
                                    </div>
                                </div>

                                <div className="flex shrink-0 items-center gap-1">
                                    <button
                                        type="button"
                                        onClick={() => handleEdit(team)}
                                        className="rounded-lg p-2 text-gray-500 transition hover:bg-gray-100 hover:text-gray-900"
                                        aria-label={`Edit ${team.name}`}
                                    >
                                        <Edit3 className="h-4 w-4" />
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => handleDelete(team)}
                                        className="rounded-lg p-2 text-gray-500 transition hover:bg-red-50 hover:text-red-600"
                                        aria-label={`Delete ${team.name}`}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>

                            <div className="mt-5 flex items-center gap-2 text-sm text-gray-500">
                                <Users className="h-4 w-4" />
                                {team.players.length}{" "}
                                {team.players.length === 1 ? "player" : "players"}
                            </div>

                            {team.players.length > 0 ? (
                                <div className="mt-4 space-y-2">
                                    {team.players.slice(0, 5).map((player) => (
                                        <div
                                            key={player.id}
                                            className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2"
                                        >
                                            <span className="text-sm font-medium text-gray-800">
                                                {player.name}
                                            </span>

                                            <span className="text-xs text-gray-500">
                                                {player.role.replaceAll("_", " ")}
                                            </span>
                                        </div>
                                    ))}

                                    {team.players.length > 5 && (
                                        <p className="pt-1 text-xs text-gray-500">
                                            +{team.players.length - 5} more
                                        </p>
                                    )}
                                </div>
                            ) : (
                                <p className="mt-4 text-sm text-gray-400">
                                    No players assigned.
                                </p>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {showForm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
                    <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl">
                        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
                            <div>
                                <h2 className="font-semibold text-gray-950">
                                    {editingTeam ? "Edit Team" : "Create Team"}
                                </h2>

                                <p className="mt-0.5 text-xs text-gray-500">
                                    {editingTeam
                                        ? "Update team details and players."
                                        : "Create a team and assign players."}
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={() => {
                                    setShowForm(false);
                                    setEditingTeam(null);
                                }}
                                className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-900"
                                aria-label="Close"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <div className="p-6">
                            {isLoadingPlayers ? (
                                <div className="py-10 text-center text-sm text-gray-500">
                                    Loading players...
                                </div>
                            ) : (
                                <TeamForm
                                    team={editingTeam}
                                    players={players}
                                    onSuccess={handleSuccess}
                                    onCancel={() => {
                                        setShowForm(false);
                                        setEditingTeam(null);
                                    }}
                                />
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}