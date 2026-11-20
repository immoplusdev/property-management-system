"use client";
import React, { useState } from "react";
import Link from "next/link";
import { PMSHeader } from "../PMSHeader";
import { SectionHead, Icon, toastPromise, Button, Skeleton, Input } from "../shared";
import { useHotelSettings, useUpdateHotelSettings, useHotelHours, useUpdateHotelHours, useNotificationSettings, useUpdateNotificationSettings } from "@/lib/hooks/pms/useSettings";
import type { HotelSettings } from "@/lib/api/pms/settings.actions";
import { useHotel } from "@/lib/pms/HotelContext";
import { SETTINGS_NAV, type SettingsSection } from "@/lib/pms/settingsNav";
import { useBillingInvoices, useBillingUsage, usePmsCommissions } from "@/lib/hooks/pms/useBilling";
import { formatFCFA, formatDate } from "../data";
import { BillingInvoiceCard } from "./BillingInvoiceCard";
import { IntegrationsPanel } from "./IntegrationsPanel";
import { RoomTypeSettings } from "./RoomTypeSettings";
import { ImportSettings } from "./ImportSettings";

export function Settings({ section }: { section: SettingsSection }) {
  const hotel = useHotel();

  // ── Hotel settings (section: hotel) ─────────────────────────────────────────
  const hotelQ     = useHotelSettings();
  const updateHotel = useUpdateHotelSettings();
  const hoursQ = useHotelHours();
  const updateHours = useUpdateHotelHours();
  const notificationsQ = useNotificationSettings();
  const billingUsageQ = useBillingUsage(section === "billing");
  const billingInvoicesQ = useBillingInvoices(section === "billing");
  const commissionsQ = usePmsCommissions(section === "billing");
  const updateNotifications = useUpdateNotificationSettings();
  // Only the user's edits are stored; the displayed form is derived by merging
  // them over the fetched data at render time (no setState-in-effect sync).
  const [edits, setEdits] = useState<Partial<HotelSettings>>({});
  const [hourEdits, setHourEdits] = useState<{ checkInTime?: string; checkOutTime?: string }>({});
  const [notificationEdits, setNotificationEdits] = useState<{ whatsappBusinessNumber?: string; smsEnabled?: boolean; emailEnabled?: boolean }>({});

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

  async function saveHours() {
    if (!Object.keys(hourEdits).length) return;
    try {
      await toastPromise(updateHours.mutateAsync(hourEdits), { loading: "Sauvegarde des horaires…", success: "Horaires enregistrés", error: e => (e as Error).message });
      setHourEdits({});
    } catch { /* toast déjà affiché */ }
  }

  async function saveNotifications() {
    if (!Object.keys(notificationEdits).length) return;
    try {
      await toastPromise(updateNotifications.mutateAsync(notificationEdits), { loading: "Sauvegarde des notifications…", success: "Notifications enregistrées", error: e => (e as Error).message });
      setNotificationEdits({});
    } catch { /* toast déjà affiché */ }
  }

  // ── Notification settings (saves via dedicated endpoint) ──────────────────
  const isSaving = updateHotel.isPending || updateHours.isPending || updateNotifications.isPending;

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
                  <SectionHead icon="clock" title="Horaires d'accueil" />
                  {hoursQ.isError && <div role="alert" className="text-sm text-danger">{(hoursQ.error as Error).message}</div>}
                  <Input label="Heure d'arrivée (check-in)" type="time" value={hourEdits.checkInTime ?? hoursQ.data?.checkInTime ?? ""} onChange={e => setHourEdits(current => ({ ...current, checkInTime: e.target.value }))} />
                  <Input label="Heure de départ (check-out)" type="time" value={hourEdits.checkOutTime ?? hoursQ.data?.checkOutTime ?? ""} onChange={e => setHourEdits(current => ({ ...current, checkOutTime: e.target.value }))} />
                  <Button variant="primary" size="sm" disabled={isSaving || !Object.keys(hourEdits).length} onClick={saveHours}>Enregistrer les horaires</Button>
                </div>
              )}
            </div>
          )}

          {section === "rooms" && <RoomTypeSettings section="rooms" />}
          {section === "rates" && <RoomTypeSettings section="rates" />}
          {section === "imports" && <ImportSettings />}

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
                    { id: "mtn", label: "MTN Money" },
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
              {notificationsQ.isLoading ? <Skeleton className="h-32 mt-3.5" /> : notificationsQ.isError ? (
                <div role="alert" className="mt-3.5 text-sm text-danger">{(notificationsQ.error as Error).message}</div>
              ) : <div className="grid gap-4 mt-3.5">
                <Input label="Numéro WhatsApp Business" type="tel" value={notificationEdits.whatsappBusinessNumber ?? notificationsQ.data?.whatsappBusinessNumber ?? ""} onChange={e => setNotificationEdits(current => ({ ...current, whatsappBusinessNumber: e.target.value }))} />
                {([ ["smsEnabled", "Notifications SMS"], ["emailEnabled", "Notifications email"] ] as const).map(([key, label]) => (
                  <label key={key} className="flex items-center justify-between px-4 py-3 border border-border rounded-xl text-sm"><span>{label}</span><input type="checkbox" checked={notificationEdits[key] ?? notificationsQ.data?.[key] ?? false} onChange={e => setNotificationEdits(current => ({ ...current, [key]: e.target.checked }))} /></label>
                ))}
                <Button variant="primary" size="sm" disabled={isSaving || !Object.keys(notificationEdits).length} onClick={saveNotifications}>Enregistrer les notifications</Button>
              </div>}
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
            <IntegrationsPanel />
          )}

          {section === "team" && <div><SectionHead icon="users" title="Équipe & accès" /><p className="mt-3.5 text-sm text-ink-3">Gérez les invitations et les accès du personnel.</p><Link href={`/pms/${hotel}/staff`} className="inline-block mt-3 text-primary font-medium text-sm">Ouvrir le personnel →</Link></div>}

          {section === "billing" && (
            <div className="grid gap-5">
              <SectionHead icon="fileText" title="Facturation Immo Plus" sub="Consommation et factures de votre hôtel" />
              {(billingUsageQ.isError || billingInvoicesQ.isError) && <div role="alert" className="text-sm text-danger">{(billingUsageQ.error as Error | null)?.message ?? (billingInvoicesQ.error as Error | null)?.message}</div>}
              {billingUsageQ.isLoading ? <Skeleton className="h-24" /> : billingUsageQ.data && <div className="grid grid-cols-3 gap-3">
                <div className="p-4 border border-border rounded-xl"><div className="text-xs text-ink-3">Clients actifs · {billingUsageQ.data.period}</div><strong className="text-xl">{billingUsageQ.data.metrics.activeClients.raw}</strong></div>
                <div className="p-4 border border-border rounded-xl"><div className="text-xs text-ink-3">Séjours terminés</div><strong className="text-xl">{billingUsageQ.data.metrics.completedStays.raw}</strong></div>
                <div className="p-4 border border-border rounded-xl"><div className="text-xs text-ink-3">Abonnement HT</div><strong className="text-xl">{formatFCFA(billingUsageQ.data.subscriptionHt)}</strong></div>
              </div>}
              <SectionHead icon="list" title="Factures" />
              {billingInvoicesQ.isLoading ? <Skeleton className="h-32" /> : billingInvoicesQ.data?.data.length ? <div className="grid gap-2">
                {billingInvoicesQ.data.data.map(invoice => <BillingInvoiceCard key={invoice.invoiceId} invoice={invoice} />)}
              </div> : <p className="text-sm text-ink-3">Aucune facture émise.</p>}
              <SectionHead icon="moneyBill" title="Commissions" sub={commissionsQ.data?.period ?? "Mois en cours"} />
              {commissionsQ.isLoading ? <Skeleton className="h-24" /> : commissionsQ.isError ? <div role="alert" className="text-sm text-danger">{(commissionsQ.error as Error).message}</div> : commissionsQ.data?.data.length ? <div className="grid gap-2">
                {commissionsQ.data.data.map(commission => <div key={commission.commissionId} className="flex justify-between gap-3 p-3 border border-border rounded-lg text-sm"><div><strong>Réservation {commission.reservationId.slice(0, 8)}</strong><div className="text-xs text-ink-3">{commission.source} · {commission.ratePercent}% · {commission.status}</div></div><div className="text-right"><strong>{formatFCFA(commission.amountHt)}</strong><div className="text-xs text-ink-3">Avoirs {formatFCFA(commission.creditedHt)}</div></div></div>)}
                <div className="text-right text-sm font-semibold">Total : {formatFCFA(commissionsQ.data.totalHt)}</div>
              </div> : <p className="text-sm text-ink-3">Aucune commission ce mois.</p>}
            </div>
          )}

          {/* ── Fallback for unimplemented sections ── */}
          {!["hotel","rooms","rates","imports","payments","notifs","app","channels","billing","team"].includes(section) && (
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
