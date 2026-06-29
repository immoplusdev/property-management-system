"use client";
import React, { useState } from "react";
import { PMSHeader } from "../PMSHeader";
import { SectionHead, Icon, showToast, Button } from "../shared";

const NAV = [
  { id:"hotel",    label:"Hôtel & identité",     icon:"bed"        },
  { id:"rooms",    label:"Types de chambre",      icon:"list"       },
  { id:"rates",    label:"Tarifs & saisons",      icon:"moneyBill"  },
  { id:"channels", label:"Canaux de diffusion",   icon:"barChart"   },
  { id:"payments", label:"Paiements",             icon:"creditCard" },
  { id:"team",     label:"Équipe & accès",        icon:"users"      },
  { id:"app",      label:"App Immo Plus",         icon:"sparkles"   },
  { id:"notifs",   label:"Notifications",         icon:"bell"       },
  { id:"billing",  label:"Facturation Immo Plus", icon:"fileText"   },
];

function Toggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!value)}
      className={`relative w-10 h-5.5 rounded-full transition-colors duration-220 focus:outline-none ${value ? "bg-primary" : "bg-border"}`}
    >
      <div className={`absolute top-0.75 left-0.75 w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-220 ${value ? "translate-x-4.5" : ""}`} />
    </button>
  );
}

export function Settings() {
  const [section, setSection] = useState("hotel");

  const [toggles, setToggles] = useState({
    instantBook:    true,
    appReservation: true,
    autoConfirm:    false,
    miniBar:        true,
    laundry:        true,
    roomService:    true,
    reviewReply:    true,
    pushNotif:      true,
    smsNotif:       true,
    emailReport:    false,
    waveActive:     true,
    omActive:       true,
    mtnActive:      true,
    cardActive:     false,
    bookingActive:  true,
    airbnbActive:   false,
  });

  const toggle = (key: keyof typeof toggles) =>
    setToggles(t => ({ ...t, [key]: !t[key] }));

  return (
    <div className="animate-pms-fade-up">
      <PMSHeader
        title="Paramètres"
        sub="Configuration de Résidence Lagune Bleue · Immo Plus PMS"
        search={false}
        actions={
          <Button variant="primary" size="sm" onClick={() => showToast("Paramètres sauvegardés", "check")}>
            <Icon name="check" size={14} /> Sauvegarder
          </Button>
        }
      />

      <div className="grid gap-0" style={{ gridTemplateColumns: "220px 1fr" }}>
        {/* Nav */}
        <div className="pr-4 border-r border-border-soft">
          <nav className="grid gap-0.5">
            {NAV.map(n => (
              <button
                key={n.id}
                className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-[10px] text-[13px] font-medium text-left ${section===n.id ? "bg-primary-50 text-primary" : "text-ink-2 hover:bg-surface-2"}`}
                onClick={() => setSection(n.id)}
              >
                <Icon name={n.icon} size={15} color={section===n.id ? "var(--color-primary)" : "var(--color-ink-3)"} />
                {n.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="pl-6">
          {section === "hotel" && (
            <div className="grid gap-4">
              <SectionHead icon="bed" title="Identité de l'hôtel" />
              <div className="grid gap-3">
                <Field label="Nom de l'établissement"  defaultValue="Résidence Lagune Bleue"          />
                <Field label="Adresse"                  defaultValue="Plateau, Abidjan, Côte d'Ivoire" />
                <Field label="Téléphone"                defaultValue="+225 27 22 XX XX XX"             />
                <Field label="Email"                    defaultValue="contact@lagune-bleue.ci"         />
                <Field label="Nombre de chambres"       defaultValue="48" type="number"                />
              </div>
              <div>
                <label className="text-[12px] font-medium text-ink-2 mb-1.5 block">Description courte (feed Immo Plus)</label>
                <textarea className="w-full bg-surface border border-border rounded-[10px] px-3 py-2.5 text-[13.5px] outline-none focus:border-primary resize-vertical min-h-20"
                  defaultValue="Résidence calme et moderne au cœur du Plateau, à deux pas de la mer. Petit-déjeuner inclus sur demande." />
              </div>
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

          {section === "rooms" && (
            <div>
              <SectionHead icon="list" title="Types de chambre" sub="Configurez les tarifs et services inclus par type" />
              <div className="grid gap-3 mt-3.5">
                {[
                  { code:"STD",  name:"Standard",       price:25000,  count:18, amenities:["Wifi","Clim","TV"]                          },
                  { code:"SUP",  name:"Supérieure",     price:45000,  count:16, amenities:["Wifi","Clim","TV","Minifridge"]              },
                  { code:"SJR",  name:"Suite Junior",   price:75000,  count:10, amenities:["Wifi","Clim","TV","Minibar","Balcon"]        },
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

          {section === "payments" && (
            <div>
              <SectionHead icon="creditCard" title="Méthodes de paiement" sub="Activez ou désactivez les options disponibles pour vos clients" />
              <div className="grid gap-2.5 mt-3.5">
                {([
                  { key:"waveActive", label:"Wave",           color:"#1BA1F2", note:"Commission 0.5%"  },
                  { key:"omActive",   label:"Orange Money",   color:"#FF7900", note:"Commission 0.6%"  },
                  { key:"mtnActive",  label:"MTN Money",      color:"#FFCC00", note:"Commission 0.6%"  },
                  { key:"cardActive", label:"Carte bancaire", color:"#2744DE", note:"Commission 1.5%"  },
                ] as { key: keyof typeof toggles; label: string; color: string; note: string }[]).map(p => (
                  <div key={p.key} className="flex items-center justify-between px-4 py-3.5 border border-border rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-6 rounded-md inline-grid place-items-center font-bold text-[10px] uppercase" style={{ background: p.color, color: p.key==="mtnActive" ? "#111" : "#fff" }}>{p.label.slice(0,4)}</div>
                      <div>
                        <div className="font-medium text-[13px]">{p.label}</div>
                        <div className="text-[11px] text-ink-3">{p.note}</div>
                      </div>
                    </div>
                    <Toggle value={toggles[p.key]} onChange={() => toggle(p.key)} />
                  </div>
                ))}
              </div>
            </div>
          )}

          {section === "notifs" && (
            <div>
              <SectionHead icon="bell" title="Notifications" sub="Choisissez quand et comment vous êtes alerté" />
              <div className="grid gap-2.5 mt-3.5">
                {([
                  { key:"pushNotif",   label:"Notifications push",       note:"Via l'app Immo Plus manager"  },
                  { key:"smsNotif",    label:"Alertes SMS",               note:"Pour arrivées et paiements"   },
                  { key:"emailReport", label:"Rapport journalier email",  note:"Envoyé chaque soir à 20h"     },
                  { key:"reviewReply", label:"Alerte nouveaux avis",      note:"Dès qu'un avis est publié"    },
                ] as { key: keyof typeof toggles; label: string; note: string }[]).map(n => (
                  <div key={n.key} className="flex items-center justify-between px-4 py-3.5 border border-border rounded-xl">
                    <div>
                      <div className="font-medium text-[13px]">{n.label}</div>
                      <div className="text-[11px] text-ink-3">{n.note}</div>
                    </div>
                    <Toggle value={toggles[n.key]} onChange={() => toggle(n.key)} />
                  </div>
                ))}
              </div>
            </div>
          )}

          {section === "app" && (
            <div>
              <SectionHead icon="sparkles" title="App Immo Plus — Fonctionnalités clients" sub="Contrôlez l'expérience client dans l'app" />
              <div className="grid gap-2.5 mt-3.5">
                {([
                  { key:"instantBook",    label:"Réservation instantanée",    note:"Sans validation manuelle"        },
                  { key:"appReservation", label:"Réservation via app",         note:"Clients app peuvent réserver"    },
                  { key:"autoConfirm",    label:"Confirmation automatique",    note:"Dès que le paiement est reçu"    },
                  { key:"miniBar",        label:"Commande mini-bar",           note:"Via l'app depuis la chambre"     },
                  { key:"laundry",        label:"Service blanchisserie",       note:"Demande via app"                 },
                  { key:"roomService",    label:"Room service",                note:"Commandes repas via app"         },
                ] as { key: keyof typeof toggles; label: string; note: string }[]).map(f => (
                  <div key={f.key} className="flex items-center justify-between px-4 py-3.5 border border-border rounded-xl">
                    <div>
                      <div className="font-medium text-[13px]">{f.label}</div>
                      <div className="text-[11px] text-ink-3">{f.note}</div>
                    </div>
                    <Toggle value={toggles[f.key]} onChange={() => toggle(f.key)} />
                  </div>
                ))}
              </div>
            </div>
          )}

          {section === "channels" && (
            <div>
              <SectionHead icon="barChart" title="Canaux de distribution" sub="Gérez vos connectivités OTA" />
              <div className="grid gap-3 mt-3.5">
                {([
                  { key:"bookingActive", label:"Booking.com", note:"Connexion active · 24h de délai de synchro" },
                  { key:"airbnbActive",  label:"Airbnb",      note:"Non connecté · configurez votre API key"    },
                ] as { key: keyof typeof toggles; label: string; note: string }[]).map(c => (
                  <div key={c.key} className="flex items-start justify-between px-4 py-4 border border-border rounded-[14px]">
                    <div className="flex items-center gap-3">
                      <div className={`w-9.5 h-9.5 rounded-[10px] grid place-items-center font-bold text-white text-[12px] ${c.key==="bookingActive" ? "bg-[#003580]" : "bg-[#FF5A5F]"}`}>
                        {c.key==="bookingActive" ? "BK" : "AB"}
                      </div>
                      <div>
                        <div className="font-semibold text-[13.5px]">{c.label}</div>
                        <div className="text-[11.5px] text-ink-3 mt-0.5">{c.note}</div>
                      </div>
                    </div>
                    <Toggle value={toggles[c.key]} onChange={() => toggle(c.key)} />
                  </div>
                ))}
              </div>
            </div>
          )}

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

function Field({ label, defaultValue, type = "text" }: { label: string; defaultValue: string; type?: string }) {
  return (
    <div>
      <label className="text-[12px] font-medium text-ink-2 mb-1.5 block">{label}</label>
      <input type={type} defaultValue={defaultValue} className="w-full h-10.5 bg-surface border border-border rounded-[10px] px-3 text-[13.5px] text-ink outline-none focus:border-primary" />
    </div>
  );
}
