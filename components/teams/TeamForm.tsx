"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import type { Player } from "@/types/player";
import type { Team, TeamFormData } from "@/types/team";

interface TeamFormProps {
    team?: Team | null;
    players: Player[];
    onSuccess: (team: Team) => void;
    onCancel: () => void;
}

export default function TeamForm({
    team,
    players,
    onSuccess,
    onCancel,
}: TeamFormProps) {
    const [name, setName] = useState(team?.name ?? "");
    const [selectedPlayerIds, setSelectedPlayerIds] = useState<string[]>(
        team?.players.map((player) => player.id) ?? [],
    );
    const [isSubmitting, setIsSubmitting] = useState(false);

    const isEditing = Boolean(team);

    useEffect(() => {
        setName(team?.name ?? "");
        setSelectedPlayerIds(
            team?.players.map((player) => player.id) ?? [],
        );
    }, [team]);

    function togglePlayer(playerId: string) {
        setSelectedPlayerIds((current) =>
            current.includes(playerId)
                ? current.filter((id) => id !== playerId)
                : [...current, playerId],
        );
    }

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();

        const trimmedName = name.trim();

        if (trimmedName.length < 2) {
            toast.error("Team name must be at least 2 characters.");
            return;
        }

        const payload: TeamFormData = {
            name: trimmedName,
            playerIds: selectedPlayerIds,
        };

        setIsSubmitting(true);

        try {
            const response = await fetch(
                isEditing ? `/api/teams/${team?.id}` : "/api/teams",
                {
                    method: isEditing ? "PUT" : "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(payload),
                },
            );

            const data = await response.json();

            if (!response.ok) {
                toast.error(data.message ?? "Unable to save team.");
                return;
            }

            toast.success(
                isEditing
                    ? "Team updated successfully."
                    : "Team created successfully.",
            );

            onSuccess(data);
        } catch {
            toast.error("Something went wrong. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-5">
            <div>
                <label
                    htmlFor="team-name"
                    className="mb-2 block text-sm font-medium text-gray-700"
                >
                    Team Name
                </label>

                <input
                    id="team-name"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    placeholder="e.g. Kathmandu Kings"
                    className="w-full rounded-lg border border-gray-300 px-3 py-2.5 outline-none transition focus:border-black"
                />
            </div>

            <div>
                <div className="mb-2 flex items-center justify-between">
                    <label className="text-sm font-medium text-gray-700">
                        Players
                    </label>

                    <span className="text-xs text-gray-500">
                        {selectedPlayerIds.length} selected
                    </span>
                </div>

                {players.length === 0 ? (
                    <div className="rounded-lg border border-dashed border-gray-300 p-6 text-center text-sm text-gray-500">
                        No players available. Create players first.
                    </div>
                ) : (
                    <div className="max-h-64 space-y-2 overflow-y-auto rounded-lg border border-gray-200 p-2">
                        {players.map((player) => {
                            const selected = selectedPlayerIds.includes(player.id);

                            return (
                                <label
                                    key={player.id}
                                    className={`flex cursor-pointer items-center justify-between rounded-lg px-3 py-2.5 transition ${selected
                                            ? "bg-gray-100"
                                            : "hover:bg-gray-50"
                                        }`}
                                >
                                    <div>
                                        <p className="text-sm font-medium text-gray-900">
                                            {player.name}
                                        </p>

                                        <p className="text-xs text-gray-500">
                                            {player.role.replaceAll("_", " ")}
                                        </p>
                                    </div>

                                    <input
                                        type="checkbox"
                                        checked={selected}
                                        onChange={() => togglePlayer(player.id)}
                                        className="h-4 w-4"
                                    />
                                </label>
                            );
                        })}
                    </div>
                )}
            </div>

            <div className="flex justify-end gap-3">
                <button
                    type="button"
                    onClick={onCancel}
                    disabled={isSubmitting}
                    className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:opacity-50"
                >
                    Cancel
                </button>

                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="inline-flex items-center gap-2 rounded-lg bg-black px-4 py-2 text-sm font-medium text-white transition hover:bg-gray-800 disabled:opacity-50"
                >
                    {isSubmitting && (
                        <Loader2 className="h-4 w-4 animate-spin" />
                    )}

                    {isEditing ? "Update Team" : "Create Team"}
                </button>
            </div>
        </form>
    );
}