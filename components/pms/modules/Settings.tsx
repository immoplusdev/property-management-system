"use client";
import React, { useState } from "react";
import Link from "next/link";
import { PMSHeader } from "../PMSHeader";
import { SectionHead, Icon, toastPromise, Button, Skeleton, Input } from "../shared";
import { useHotelSettings, useUpdateHotelSettings } from "@/lib/hooks/pms/useSettings";
import { useRoomTypes, useUpdateRoomType } from "@/lib/hooks/pms/useRoomTypes";
import type { HotelSettings } from "@/lib/api/pms/settings.actions";
import { useHotel } from "@/lib/pms/HotelContext";
import { SETTINGS_NAV, type SettingsSection } from "@/lib/pms/settingsNav";

export function Settings({ section }: { section: SettingsSection }) {
  const hotel = useHotel();

  // ── Hotel settings (section: hotel) ─────────────────────────────────────────
  const hotelQ     = useHotelSettings();
  const updateHotel = useUpdateHotelSettings();
  const roomTypesQ = useRoomTypes(section === "rooms");
  const updateRoomType = useUpdateRoomType();
  const [editingRoomTypeId, setEditingRoomTypeId] = useState<string | null>(null);
  const [roomTypePrice, setRoomTypePrice] = useState("");
  // Only the user's edits are stored; the displayed form is derived by merging
  // them over the fetched data at render time (no setState-in-effect sync).
  const [edits, setEdits] = useState<Partial<HotelSettings>>({});

  const form: Partial<HotelSettings> = {
    name:    edits.name    ?? hotelQ.data?.name    ?? "",
    address: edits.address ?? hotelQ.data?.address ?? "",
    phone:   edits.phone   ?? hotelQ.data?.phone   ?? "",
    email:   edits.email   ?? hotelQ.data?.email   ?? "",
  };

  function setField(key: keyof HotelSettings, value: string) {
    setEdits(e => ({ ...e, [key]: value }));
  }

  async function handleSaveHotel() {
    try {
      const payload = section === "payments"
        ? { paymentMethods: edits.paymentMethods ?? hotelQ.data?.paymentMethods ?? [] }
        : form;
      await toastPromise(updateHotel.mutateAsync(payload), {
        loading: "Sauvegarde…",
        success: "Paramètres sauvegardés",
        error: (e) => (e as Error)?.message || "Erreur lors de la sauvegarde",
      });
      setEdits({}); // re-sync to fresh server data
    } catch { /* toast déjà affiché */ }
  }

  // ── Notification settings (saves via dedicated endpoint) ──────────────────
  const isSaving = updateHotel.isPending || updateRoomType.isPending;

  async function saveRoomTypePrice(id: string) {
    const amount = Number(roomTypePrice);
    if (!Number.isFinite(amount) || amount < 0) return;
    try {
      await toastPromise(updateRoomType.mutateAsync({ id, payload: { basePrice: amount } }), {
        loading: "Mise à jour du tarif…",
        success: "Tarif mis à jour",
        error: error => (error as Error)?.message || "Erreur lors de la mise à jour",
      });
      setEditingRoomTypeId(null);
    } catch { /* toast déjà affiché */ }
  }

  return (
    <div className="animate-pms-fade-up">
      <PMSHeader
        title="Paramètres"
        sub={hotelQ.data?.name ?? "Configuration · Immo Plus PMS"}
        search={false}
        actions={
          ["hotel", "payments"].includes(section) && <Button
            variant="primary"
            size="sm"
            disabled={isSaving}
            onClick={handleSaveHotel}
          >
            <Icon name="check" size={14} /> {isSaving ? "Sauvegarde…" : "Sauvegarder"}
          </Button>
        }
      />

      <div className="grid gap-0" style={{ gridTemplateColumns: "220px 1fr" }}>
        {/* Nav */}
        <div className="pr-4 border-r border-border-soft">
          <nav className="grid gap-0.5">
            {SETTINGS_NAV.map(n => (
              <Link
                key={n.id}
                href={`/pms/${hotel}/settings/${n.id}`}
                className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-[10px] text-[13px] font-medium text-left ${section===n.id ? "bg-primary-50 text-primary" : "text-ink-2 hover:bg-surface-2"}`}
              >
                <Icon name={n.icon} size={15} color={section===n.id ? "var(--color-primary)" : "var(--color-ink-3)"} />
                {n.label}
              </Link>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="pl-6">
          {/* ── Hotel identity ── */}
          {section === "hotel" && (
            <div className="grid gap-4">
              <SectionHead icon="bed" title="Identité de l'hôtel" />
              {hotelQ.isLoading ? (
                <div className="grid gap-3">
                  {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-12" />)}
                </div>
              ) : (
                <div className="grid gap-3">
                  <Input label="Nom de l'établissement"  value={form.name    ?? ""} onChange={e => setField("name",    e.target.value)} />
                  <Input label="Adresse"                  value={form.address ?? ""} onChange={e => setField("address", e.target.value)} />
                  <Input label="Téléphone"                value={form.phone   ?? ""} onChange={e => setField("phone",   e.target.value)} type="tel" />
                  <Input label="Email"                    value={form.email   ?? ""} onChange={e => setField("email",   e.target.value)} type="email" />
                  {hotelQ.data && (
                    <>
                      <Input label="Heure d'arrivée (check-in)"  value={hotelQ.data.checkInTime}  disabled />
                      <Input label="Heure de départ (check-out)" value={hotelQ.data.checkOutTime} disabled />
                    </>
                  )}
                </div>
              )}
            </div>
          )}

          {/* ── Room types ── */}
          {section === "rooms" && (
            <div>
              <SectionHead icon="list" title="Types de chambre" sub="Configurez les tarifs et services inclus par type" />
              {roomTypesQ.isLoading ? <Skeleton className="h-40 mt-3.5" /> : roomTypesQ.isError ? (
                <div role="alert" className="mt-3.5 text-sm text-danger">{(roomTypesQ.error as Error).message}</div>
              ) : roomTypesQ.data?.length ? <div className="grid gap-3 mt-3.5">
                {roomTypesQ.data.map(t => (
                  <div key={t.code} className="px-5.5 py-4.5 border border-border rounded-[14px] bg-surface flex items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <div className="w-7.5 h-7.5 rounded-lg bg-primary-50 grid place-items-center text-primary font-bold text-[11px]">{t.code}</div>
                        <div className="font-semibold">{t.name}</div>
                        <div className="text-[11.5px] text-ink-3">{t.roomCount} chambres</div>
                      </div>
                      <div className="flex gap-1.5 flex-wrap mt-1">
                        {(t.amenities ?? []).map(a => (
                          <span key={a} className="text-[11px] px-2 py-0.5 rounded-full bg-surface-2 text-ink-3">{a}</span>
                        ))}
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      {editingRoomTypeId === t.id ? (
                        <div className="flex items-center gap-2">
                          <Input aria-label={`Tarif ${t.name}`} type="number" min="0" value={roomTypePrice} onChange={event => setRoomTypePrice(event.target.value)} />
                          <Button variant="primary" size="sm" disabled={updateRoomType.isPending} onClick={() => t.id && saveRoomTypePrice(t.id)}>Enregistrer</Button>
                          <Button variant="ghost" size="sm" onClick={() => setEditingRoomTypeId(null)}>Annuler</Button>
                        </div>
                      ) : <>
                        <div className="font-bold text-[16px]">{t.basePrice.toLocaleString("fr-FR")}</div>
                        <div className="text-[11px] text-ink-3">{t.currency} / nuit</div>
                        <Button variant="ghost" size="sm" className="mt-2" disabled={!t.id} onClick={() => { setEditingRoomTypeId(t.id ?? null); setRoomTypePrice(String(t.basePrice)); }}><Icon name="edit" size={12} /> Modifier</Button>
                      </>}
                    </div>
                  </div>
                ))}
              </div> : <div className="mt-3.5 text-sm text-ink-3">Aucun type de chambre configuré.</div>}
            </div>
          )}

          {/* ── Payments ── */}
          {section === "payments" && (
            <div>
              <SectionHead icon="creditCard" title="Méthodes de paiement" sub="Méthodes enregistrées par l'hôtel" />
              {hotelQ.isLoading ? <Skeleton className="h-24 mt-3.5" /> : hotelQ.isError ? (
                <div role="alert" className="mt-3.5 text-sm text-danger">{(hotelQ.error as Error).message}</div>
              ) : (
                <div className="grid gap-2.5 mt-3.5">
                  {[
                    { id: "wave", label: "Wave" },
                    { id: "orange_money", label: "Orange Money" },
                    { id: "mtn_momo", label: "MTN Money" },
                    { id: "moov_money", label: "Moov Money" },
                    { id: "cash", label: "Espèces" },
                    { id: "credit_card", label: "Carte bancaire" },
                  ].map(method => {
                    const methods = edits.paymentMethods ?? hotelQ.data?.paymentMethods ?? [];
                    return <label key={method.id} className="flex items-center justify-between px-4 py-3.5 border border-border rounded-xl">
                      <span className="font-medium text-[13px]">{method.label}</span>
                      <input type="checkbox" checked={methods.includes(method.id)} onChange={event => setEdits(current => ({
                        ...current,
                        paymentMethods: event.target.checked
                          ? [...methods, method.id]
                          : methods.filter(item => item !== method.id),
                      }))} />
                    </label>;
                  })}
                </div>
              )}
            </div>
          )}

          {/* ── Notifications ── */}
          {section === "notifs" && (
            <div>
              <SectionHead icon="bell" title="Notifications" sub="Préférences serveur" />
              <p className="mt-3.5 text-sm text-ink-3">L'API PMS expose la modification des préférences, mais aucun endpoint de lecture documenté. Les interrupteurs sont masqués pour éviter d'afficher ou d'écraser des valeurs non vérifiées.</p>
            </div>
          )}

          {/* ── App features ── */}
          {section === "app" && (
            <div>
              <SectionHead icon="sparkles" title="App Immo Plus — Fonctionnalités clients" sub="Contrôlez l'expérience client dans l'app" />
              <p className="mt-3.5 text-sm text-ink-3">La configuration de ces fonctionnalités n'est pas disponible dans l'API PMS. Aucun réglage simulé n'est affiché.</p>
            </div>
          )}

          {/* ── Channels ── */}
          {section === "channels" && (
            <div>
              <SectionHead icon="barChart" title="Canaux de distribution" sub="Gérez vos connectivités OTA" />
              <p className="mt-3.5 text-sm text-ink-3">Aucune intégration OTA n'est configurée par l'API PMS actuellement.</p>
            </div>
          )}

          {/* ── Fallback for unimplemented sections ── */}
          {!["hotel","rooms","payments","notifs","app","channels"].includes(section) && (
            <div className="py-16 text-center text-ink-3">
              <Icon name="sparkles" size={28} color="var(--color-ink-4)" />
              <div className="mt-3 font-medium">Section bientôt disponible</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
