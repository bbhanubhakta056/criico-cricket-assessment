"use client";

import { FormEvent, useState } from "react";
import { toast } from "sonner";

import { PLAYER_ROLES, type PlayerRole } from "@/types/cricket";
import type { Player, PlayerFormData } from "@/types/player";

interface PlayerFormProps {
    player?: Player | null;
    onSuccess: (player: Player) => void;
    onCancel: () => void;
}

const roleLabels: Record<PlayerRole, string> = {
    BATSMAN: "Batsman",
    BOWLER: "Bowler",
    ALL_ROUNDER: "All-rounder",
    WICKETKEEPER: "Wicketkeeper",
};

export default function PlayerForm({
    player,
    onSuccess,
    onCancel,
}: PlayerFormProps) {
    const [formData, setFormData] = useState<PlayerFormData>({
        name: player?.name ?? "",
        role: player?.role ?? "BATSMAN",
        basePrice: player?.basePrice ?? 0,
        matchesPlayed: player?.matchesPlayed ?? 0,
        totalRuns: player?.totalRuns ?? 0,
        totalWickets: player?.totalWickets ?? 0,
    });

    const [isSubmitting, setIsSubmitting] = useState(false);

    function updateField<K extends keyof PlayerFormData>(
        field: K,
        value: PlayerFormData[K],
    ) {
        setFormData((current) => ({
            ...current,
            [field]: value,
        }));
    }

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        // Explicit assessment requirement:
        // negative total runs must show a UI toast.
        if (formData.totalRuns < 0) {
            toast.error("Total runs cannot be negative");
            return;
        }

        if (formData.matchesPlayed < 0) {
            toast.error("Matches played cannot be negative");
            return;
        }

        if (formData.totalWickets < 0) {
            toast.error("Total wickets cannot be negative");
            return;
        }

        if (formData.basePrice < 0) {
            toast.error("Base price cannot be negative");
            return;
        }

        try {
            setIsSubmitting(true);

            const url = player
                ? `/api/players/${player.id}`
                : "/api/players";

            const response = await fetch(url, {
                method: player ? "PUT" : "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(formData),
            });

            const result = await response.json();

            if (!response.ok) {
                toast.error(result.message ?? "Something went wrong");
                return;
            }

            toast.success(
                player
                    ? "Player updated successfully"
                    : "Player created successfully",
            );

            onSuccess({
                ...result.data,
                basePrice: Number(result.data.basePrice),
            });
        } catch {
            toast.error("Unable to save player");
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-5">
            <div>
                <label className="mb-2 block text-sm font-medium text-neutral-700">
                    Player name
                </label>

                <input
                    required
                    value={formData.name}
                    onChange={(event) =>
                        updateField("name", event.target.value)
                    }
                    placeholder="e.g. Rohit Sharma"
                    className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-neutral-400"
                />
            </div>

            <div>
                <label className="mb-2 block text-sm font-medium text-neutral-700">
                    Role
                </label>

                <select
                    value={formData.role}
                    onChange={(event) =>
                        updateField("role", event.target.value as PlayerRole)
                    }
                    className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-neutral-400"
                >
                    {PLAYER_ROLES.map((role) => (
                        <option key={role} value={role}>
                            {roleLabels[role]}
                        </option>
                    ))}
                </select>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
                <NumberField
                    label="Base price"
                    value={formData.basePrice}
                    onChange={(value) => updateField("basePrice", value)}
                />

                <NumberField
                    label="Matches played"
                    value={formData.matchesPlayed}
                    onChange={(value) =>
                        updateField("matchesPlayed", value)
                    }
                />

                <NumberField
                    label="Total runs"
                    value={formData.totalRuns}
                    allowNegative
                    onChange={(value) => updateField("totalRuns", value)}
                />

                <NumberField
                    label="Total wickets"
                    value={formData.totalWickets}
                    onChange={(value) =>
                        updateField("totalWickets", value)
                    }
                />
            </div>

            <div className="flex justify-end gap-3 border-t border-neutral-100 pt-5">
                <button
                    type="button"
                    onClick={onCancel}
                    disabled={isSubmitting}
                    className="rounded-xl border border-neutral-200 px-5 py-2.5 text-sm font-medium text-neutral-700 transition hover:bg-neutral-50 disabled:opacity-50"
                >
                    Cancel
                </button>

                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="rounded-xl bg-neutral-950 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-50"
                >
                    {isSubmitting
                        ? "Saving..."
                        : player
                            ? "Update player"
                            : "Add player"}
                </button>
            </div>
        </form>
    );
}

function NumberField({
    label,
    value,
    onChange,
    allowNegative = false,
}: {
    label: string;
    value: number;
    onChange: (value: number) => void;
    allowNegative?: boolean;
}) {
    return (
        <div>
            <label className="mb-2 block text-sm font-medium text-neutral-700">
                {label}
            </label>

            <input
                type="number"
                value={value}
                min={allowNegative ? undefined : 0}
                onChange={(event) =>
                    onChange(Number(event.target.value))
                }
                className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-neutral-400"
            />
        </div>
    );
}