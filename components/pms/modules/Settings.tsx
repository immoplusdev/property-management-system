"use client";
import React, { useState } from "react";
import Link from "next/link";
import { PMSHeader } from "../PMSHeader";
import { SectionHead, Icon, toastPromise, Button, Skeleton, Switch, Input } from "../shared";
import { useHotelSettings, useUpdateHotelSettings, useUpdateNotificationSettings } from "@/lib/hooks/pms/useSettings";
import type { HotelSettings } from "@/lib/api/pms/settings.actions";
import { useHotel } from "@/lib/pms/HotelContext";
import { SETTINGS_NAV, type SettingsSection } from "@/lib/pms/settingsNav";

export function Settings({ section }: { section: SettingsSection }) {
  const hotel = useHotel();

  // ── Hotel settings (section: hotel) ─────────────────────────────────────────
  const hotelQ     = useHotelSettings();
  const updateHotel = useUpdateHotelSettings();
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
      await toastPromise(updateHotel.mutateAsync(form), {
        loading: "Sauvegarde…",
        success: "Paramètres sauvegardés",
        error: (e) => (e as Error)?.message || "Erreur lors de la sauvegarde",
      });
      setEdits({}); // re-sync to fresh server data
    } catch { /* toast déjà affiché */ }
  }

  // ── Notification settings (saves via dedicated endpoint) ──────────────────
  const updateNotifs = useUpdateNotificationSettings();
  const [notifSettings, setNotifSettings] = useState({
    smsEnabled:              true,
    emailEnabled:            true,
    whatsappBusinessNumber:  "",
  });

  async function handleSaveNotifs() {
    try {
      await toastPromise(
        updateNotifs.mutateAsync({
          smsEnabled:             notifSettings.smsEnabled,
          emailEnabled:           notifSettings.emailEnabled,
          whatsappBusinessNumber: notifSettings.whatsappBusinessNumber || undefined,
        }),
        {
          loading: "Sauvegarde…",
          success: "Notifications sauvegardées",
          error: (e) => (e as Error)?.message || "Erreur lors de la sauvegarde",
        },
      );
    } catch { /* toast déjà affiché */ }
  }

  // ── Local toggles for sections not yet covered by API ───────────────────────
  const [localToggles, setLocalToggles] = useState({
    instantBook:    true,
    appReservation: true,
    autoConfirm:    false,
    miniBar:        true,
    laundry:        true,
    roomService:    true,
    waveActive:     true,
    omActive:       true,
    mtnActive:      true,
    cardActive:     false,
    bookingActive:  true,
    airbnbActive:   false,
  });
  const toggleLocal = (key: keyof typeof localToggles) =>
    setLocalToggles(t => ({ ...t, [key]: !t[key] }));

  const isSaving = updateHotel.isPending || updateNotifs.isPending;

  return (
    <div className="animate-pms-fade-up">
      <PMSHeader
        title="Paramètres"
        sub={hotelQ.data?.name ?? "Configuration · Immo Plus PMS"}
        search={false}
        actions={
          <Button
            variant="primary"
            size="sm"
            disabled={isSaving}
            onClick={section === "notifs" ? handleSaveNotifs : handleSaveHotel}
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
              <div>
                <label className="text-[12px] font-medium text-ink-2 mb-1.5 block">Photo de couverture</label>
                <div className="h-40 bg-surface-2 border-2 border-dashed border-border rounded-xl grid place-items-center text-ink-3 cursor-pointer hover:border-primary hover:text-primary transition-colors">
                  <div className="text-center">
                    <Icon name="download" size={24} />
                    <div className="text-[13px] mt-2">Glissez une image ou cliquez</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── Room types (static, read-only for now) ── */}
          {section === "rooms" && (
            <div>
              <SectionHead icon="list" title="Types de chambre" sub="Configurez les tarifs et services inclus par type" />
              <div className="grid gap-3 mt-3.5">
                {[
                  { code:"STD",  name:"Standard",       price:25000,  count:18, amenities:["Wifi","Clim","TV"]                           },
                  { code:"SUP",  name:"Supérieure",     price:45000,  count:16, amenities:["Wifi","Clim","TV","Minifridge"]               },
                  { code:"SJR",  name:"Suite Junior",   price:75000,  count:10, amenities:["Wifi","Clim","TV","Minibar","Balcon"]         },
                  { code:"PRES", name:"Présidentielle", price:150000, count:4,  amenities:["Wifi","Clim","TV","Minibar","Balcon","Jacuzzi"]},
                ].map(t => (
                  <div key={t.code} className="px-5.5 py-4.5 border border-border rounded-[14px] bg-surface flex items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <div className="w-7.5 h-7.5 rounded-lg bg-primary-50 grid place-items-center text-primary font-bold text-[11px]">{t.code}</div>
                        <div className="font-semibold">{t.name}</div>
                        <div className="text-[11.5px] text-ink-3">{t.count} chambres</div>
                      </div>
                      <div className="flex gap-1.5 flex-wrap mt-1">
                        {t.amenities.map(a => (
                          <span key={a} className="text-[11px] px-2 py-0.5 rounded-full bg-surface-2 text-ink-3">{a}</span>
                        ))}
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="font-bold text-[16px]">{t.price.toLocaleString("fr-FR")}</div>
                      <div className="text-[11px] text-ink-3">FCFA / nuit</div>
                      <Button variant="ghost" size="sm" className="mt-2"><Icon name="edit" size={12} /> Modifier</Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── Payments ── */}
          {section === "payments" && (
            <div>
              <SectionHead icon="creditCard" title="Méthodes de paiement" sub="Activez ou désactivez les options disponibles pour vos clients" />
              <div className="grid gap-2.5 mt-3.5">
                {([
                  { key:"waveActive", label:"Wave",           color:"var(--color-pay-wave)", note:"Commission 0.5%"  },
                  { key:"omActive",   label:"Orange Money",   color:"var(--color-pay-om)",   note:"Commission 0.6%"  },
                  { key:"mtnActive",  label:"MTN Money",      color:"var(--color-pay-mtn)",  note:"Commission 0.6%"  },
                  { key:"cardActive", label:"Carte bancaire", color:"var(--color-primary)",  note:"Commission 1.5%"  },
                ] as { key: keyof typeof localToggles; label: string; color: string; note: string }[]).map(p => (
                  <div key={p.key} className="flex items-center justify-between px-4 py-3.5 border border-border rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-6 rounded-md inline-grid place-items-center font-bold text-[10px] uppercase" style={{ background: p.color, color: p.key==="mtnActive" ? "var(--color-ink)" : "var(--color-surface)" }}>
                        {p.label.slice(0,4)}
                      </div>
                      <div>
                        <div className="font-medium text-[13px]">{p.label}</div>
                        <div className="text-[11px] text-ink-3">{p.note}</div>
                      </div>
                    </div>
                    <Switch on={localToggles[p.key]} onChange={() => toggleLocal(p.key)} />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── Notifications ── */}
          {section === "notifs" && (
            <div>
              <SectionHead icon="bell" title="Notifications" sub="Choisissez comment vous êtes alerté" />
              <div className="grid gap-2.5 mt-3.5">
                <div className="flex items-center justify-between px-4 py-3.5 border border-border rounded-xl">
                  <div>
                    <div className="font-medium text-[13px]">Notifications Email</div>
                    <div className="text-[11px] text-ink-3">Recevez les alertes importantes par email</div>
                  </div>
                  <Switch
                    on={notifSettings.emailEnabled}
                    onChange={v => setNotifSettings(s => ({ ...s, emailEnabled: v }))}
                  />
                </div>
                <div className="flex items-center justify-between px-4 py-3.5 border border-border rounded-xl">
                  <div>
                    <div className="font-medium text-[13px]">Notifications SMS / WhatsApp</div>
                    <div className="text-[11px] text-ink-3">Recevez les alertes via WhatsApp Business</div>
                  </div>
                  <Switch
                    on={notifSettings.smsEnabled}
                    onChange={v => setNotifSettings(s => ({ ...s, smsEnabled: v }))}
                  />
                </div>
                {notifSettings.smsEnabled && (
                  <Input
                    label="Numéro WhatsApp Business"
                    value={notifSettings.whatsappBusinessNumber}
                    onChange={e => setNotifSettings(s => ({ ...s, whatsappBusinessNumber: e.target.value }))}
                    type="tel"
                  />
                )}
              </div>
            </div>
          )}

          {/* ── App features ── */}
          {section === "app" && (
            <div>
              <SectionHead icon="sparkles" title="App Immo Plus — Fonctionnalités clients" sub="Contrôlez l'expérience client dans l'app" />
              <div className="grid gap-2.5 mt-3.5">
                {([
                  { key:"instantBook",    label:"Réservation instantanée",  note:"Sans validation manuelle"     },
                  { key:"appReservation", label:"Réservation via app",       note:"Clients app peuvent réserver" },
                  { key:"autoConfirm",    label:"Confirmation automatique",  note:"Dès que le paiement est reçu" },
                  { key:"miniBar",        label:"Commande mini-bar",         note:"Via l'app depuis la chambre"  },
                  { key:"laundry",        label:"Service blanchisserie",     note:"Demande via app"              },
                  { key:"roomService",    label:"Room service",              note:"Commandes repas via app"      },
                ] as { key: keyof typeof localToggles; label: string; note: string }[]).map(f => (
                  <div key={f.key} className="flex items-center justify-between px-4 py-3.5 border border-border rounded-xl">
                    <div>
                      <div className="font-medium text-[13px]">{f.label}</div>
                      <div className="text-[11px] text-ink-3">{f.note}</div>
                    </div>
                    <Switch on={localToggles[f.key]} onChange={() => toggleLocal(f.key)} />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── Channels ── */}
          {section === "channels" && (
            <div>
              <SectionHead icon="barChart" title="Canaux de distribution" sub="Gérez vos connectivités OTA" />
              <div className="grid gap-3 mt-3.5">
                {([
                  { key:"bookingActive", label:"Booking.com", note:"Connexion active · 24h de délai de synchro" },
                  { key:"airbnbActive",  label:"Airbnb",      note:"Non connecté · configurez votre API key"    },
                ] as { key: keyof typeof localToggles; label: string; note: string }[]).map(c => (
                  <div key={c.key} className="flex items-start justify-between px-4 py-4 border border-border rounded-[14px]">
                    <div className="flex items-center gap-3">
                      <div className={`w-9.5 h-9.5 rounded-[10px] grid place-items-center font-bold text-white text-[12px] ${c.key==="bookingActive" ? "bg-ota-booking" : "bg-ota-airbnb"}`}>
                        {c.key==="bookingActive" ? "BK" : "AB"}
                      </div>
                      <div>
                        <div className="font-semibold text-[13.5px]">{c.label}</div>
                        <div className="text-[11.5px] text-ink-3 mt-0.5">{c.note}</div>
                      </div>
                    </div>
                    <Switch on={localToggles[c.key]} onChange={() => toggleLocal(c.key)} />
                  </div>
                ))}
              </div>
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
