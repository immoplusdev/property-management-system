"use client";
import React, { useState } from "react";
import { Button, SectionHead, toastPromise } from "../shared";
import type { Guest } from "../data";
import { useUpdateGuest } from "@/lib/hooks/pms/useGuests";
import { useRouter } from "next/navigation";

export function GuestPreferences({ client }: { client: Guest }) {
  const update = useUpdateGuest();
  const router = useRouter();
  const [draft, setDraft] = useState<string | null>(null);
  const value = draft ?? (client.preferences ?? []).join(", ");

  async function save() {
    const preferences = [...new Set(value.split(",").map(item => item.trim()).filter(Boolean))];
    if (preferences.length > 30) return;
    try {
      await toastPromise(update.mutateAsync({ id: client.id, payload: { preferences } }), {
        loading: "Enregistrement des préférences…", success: "Préférences enregistrées", error: error => (error as Error).message,
      });
      setDraft(null);
      router.refresh();
    } catch { /* toast déjà affiché */ }
  }

  return <div className="grid gap-2">
    <SectionHead icon="star" title="Préférences" />
    <label className="text-xs text-ink-3">Séparez les préférences par une virgule. Laissez vide pour les effacer.</label>
    <textarea className="w-full p-3 border border-border rounded-lg bg-surface text-sm" rows={3} value={value} onChange={event => setDraft(event.target.value)} />
    {value.split(",").filter(item => item.trim()).length > 30 && <div role="alert" className="text-xs text-danger">Maximum 30 préférences.</div>}
    <Button variant="primary" size="sm" disabled={update.isPending || draft === null || value.split(",").filter(item => item.trim()).length > 30} onClick={save}>Enregistrer les préférences</Button>
  </div>;
}
