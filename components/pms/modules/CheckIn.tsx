"use client";
import React, { useState } from "react";
import { PMSHeader } from "../PMSHeader";
import { SectionHead, Icon, showToast, Button } from "../shared";
import { Pill } from "@/components/ui/Pill";
import { Modal } from "@/components/ui/Modal";
import { BOOKINGS, ROOMS_PMS, formatFCFA, formatDate, type Booking } from "../data";

const AV_COLORS = ["#E89060","#6FB5A8","#7B8DFF","#B57BE6","#F5C572","#6FCC92","#FF8585","#6FB5DD"];

const STEPS_IN  = ["Identification","Chambre","Paiement","Confirmation"];
const STEPS_OUT = ["Vérification","Règlement","Départ"];

type StepTarget = "checkin" | "checkout" | "walkin";

export function CheckIn() {
  const [mode, setMode]     = useState<StepTarget>("checkin");
  const [step, setStep]     = useState(0);
  const [walkin, setWalkin] = useState(false);

  const STEPS = mode === "checkout" ? STEPS_OUT : STEPS_IN;

  const arrivals   = BOOKINGS.filter(b => b.status === "confirmed").slice(0, 5);
  const departures = BOOKINGS.filter(b => b.status === "checking-out").slice(0, 5);
  const availRooms = ROOMS_PMS.filter(r => r.status === "libre").slice(0, 8);

  return (
    <div className="animate-pms-fade-up">
      <PMSHeader
        title="Check-in / Check-out"
        sub="Gérez les arrivées, départs et walk-ins depuis cette interface unifiée"
        search={false}
        actions={
          <>
            <div className="flex gap-0.5 bg-surface-2 p-0.75 rounded-[9px]">
              {(["checkin","checkout","walkin"] as StepTarget[]).map(m => (
                <button
                  key={m}
                  className={`px-3 py-1.5 rounded-[7px] text-[12.5px] font-medium ${mode===m ? "bg-surface text-ink border border-border shadow-xs" : "text-ink-2"}`}
                  onClick={() => { setMode(m); setStep(0); }}
                >
                  {m==="checkin" ? "Arrivées" : m==="checkout" ? "Départs" : "Walk-in"}
                </button>
              ))}
            </div>
          </>
        }
      />

      <div className="grid gap-4.5" style={{ gridTemplateColumns: "1fr 380px" }}>
        {/* ── Left: stepper / walk-in ── */}
        <div>
          {mode === "walkin" && (
            <div className="bg-primary text-white rounded-[18px] p-5.5 mb-4 relative overflow-hidden">
              <div className="absolute -right-8 -top-8 w-32 h-32 rounded-full bg-white/10" />
              <div className="relative">
                <div className="font-bold text-[18px] tracking-[-0.02em]">Nouveau walk-in</div>
                <div className="text-[13px] opacity-85 mt-1 mb-4">Créez une réservation instantanée sans référence préalable</div>
                <Button variant="ghost" className="bg-white text-primary border-0 font-semibold" onClick={() => setWalkin(true)}>
                  <Icon name="plus" size={15} /> Créer walk-in
                </Button>
              </div>
            </div>
          )}

          {mode !== "walkin" && (
            <div className="bg-surface border border-border rounded-[18px] p-5.5 mb-4">
              {/* Step bar */}
              <div className="flex items-center gap-0 mb-6">
                {STEPS.map((s, i) => (
                  <React.Fragment key={s}>
                    <button
                      className="flex items-center gap-2 cursor-pointer"
                      onClick={() => i <= step && setStep(i)}
                    >
                      <div className={`w-7.5 h-7.5 rounded-full grid place-items-center text-[12px] font-bold shrink-0 transition-colors ${i < step ? "bg-success text-white" : i === step ? "bg-primary text-white" : "bg-surface-2 text-ink-3"}`}>
                        {i < step ? <Icon name="check" size={13} /> : i + 1}
                      </div>
                      <span className={`text-[12.5px] font-medium whitespace-nowrap ${i === step ? "text-ink" : "text-ink-3"}`}>{s}</span>
                    </button>
                    {i < STEPS.length - 1 && (
                      <div className={`flex-1 h-px mx-2 min-w-4 ${i < step ? "bg-success" : "bg-border"}`} />
                    )}
                  </React.Fragment>
                ))}
              </div>

              {/* Check-in steps */}
              {mode === "checkin" && (
                <>
                  {step === 0 && (
                    <div>
                      <SectionHead icon="user" title="Identification du client" sub="Entrez le nom ou la référence de réservation" />
                      <div className="h-12 bg-surface border border-border rounded-[10px] px-4 flex items-center gap-3 mt-4 focus-within:border-primary">
                        <Icon name="eye" size={16} color="var(--color-ink-3)" />
                        <input className="flex-1 text-[14px] outline-none bg-transparent placeholder:text-ink-4" placeholder="Nom, prénom ou référence RES-2026-…" />
                      </div>
                      <div className="mt-3.5 grid gap-2">
                        {arrivals.map(b => (
                          <div key={b.id} className="flex items-center gap-3 px-4 py-3 rounded-xl border border-border hover:border-primary cursor-pointer transition-all duration-120" onClick={() => setStep(1)}>
                            <div className="w-9.5 h-9.5 rounded-full inline-grid place-items-center text-white font-semibold text-[13px] shrink-0"
                              style={{ background: AV_COLORS[b.guest.charCodeAt(0) % 8] }}>
                              {b.guest.split(" ").map((x: string) => x[0]).join("").slice(0,2)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="font-semibold text-[13.5px]">{b.guest}</div>
                              <div className="text-[11.5px] text-ink-3">{b.ref} · {b.roomType} · {b.nights} nuit{b.nights>1?"s":""}</div>
                            </div>
                            <div className="text-right">
                              <div className="text-[12.5px] font-semibold">{formatFCFA(b.amount)}</div>
                              <Pill kind={b.paid >= b.amount ? "success" : "warn"} dot>{b.paid >= b.amount ? "Payé" : "Acompte"}</Pill>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {step === 1 && (
                    <div>
                      <SectionHead icon="bed" title="Attribution de chambre" sub="Sélectionnez une chambre disponible" />
                      <div className="grid gap-2.5 mt-4" style={{ gridTemplateColumns: "repeat(auto-fill,minmax(120px,1fr))" }}>
                        {availRooms.map(r => (
                          <div key={r.num} className="rounded-xl p-3.5 border-2 border-dashed border-border hover:border-primary cursor-pointer text-center transition-all duration-120 group" onClick={() => setStep(2)}>
                            <div className="text-[22px] font-semibold tracking-[-0.03em] group-hover:text-primary">{r.num}</div>
                            <div className="text-[11px] text-ink-3 mt-0.5">{r.type} · Ét.{r.floor}</div>
                            <div className="mt-1.5 text-[10.5px] font-semibold text-success">Disponible</div>
                          </div>
                        ))}
                      </div>
                      <div className="flex justify-between mt-5.5">
                        <Button variant="ghost" onClick={() => setStep(0)}><Icon name="chevronLeft" size={14} /> Retour</Button>
                        <Button variant="primary" onClick={() => setStep(2)}>Continuer <Icon name="chevronRight" size={14} /></Button>
                      </div>
                    </div>
                  )}
                  {step === 2 && (
                    <div>
                      <SectionHead icon="creditCard" title="Paiement & solde" sub="Vérifiez et encaissez le solde restant" />
                      <div className="mt-4 grid gap-2.5">
                        {[
                          { label:"Montant total",     value:"135 000 FCFA", color:"var(--color-ink)"     },
                          { label:"Acompte versé",     value:"67 500 FCFA",  color:"var(--color-success)" },
                          { label:"Solde à encaisser", value:"67 500 FCFA",  color:"var(--color-warn)"    },
                        ].map(r => (
                          <div key={r.label} className="flex items-center justify-between px-4 py-3.5 border border-border rounded-[10px]">
                            <span className="text-ink-2 text-[13px]">{r.label}</span>
                            <strong style={{ color: r.color }}>{r.value}</strong>
                          </div>
                        ))}
                      </div>
                      <div className="mt-4">
                        <div className="text-[12px] font-semibold mb-2.5 text-ink-2">Mode de paiement du solde</div>
                        <div className="flex gap-2 flex-wrap">
                          {["Wave","Orange Money","MTN Money","Espèces"].map(m => (
                            <button key={m} className="px-3 py-2 rounded-[9px] border border-border text-[12.5px] hover:border-primary hover:text-primary">{m}</button>
                          ))}
                        </div>
                      </div>
                      <div className="flex justify-between mt-5.5">
                        <Button variant="ghost" onClick={() => setStep(1)}><Icon name="chevronLeft" size={14} /> Retour</Button>
                        <Button variant="primary" onClick={() => setStep(3)}>Encaisser & Continuer <Icon name="chevronRight" size={14} /></Button>
                      </div>
                    </div>
                  )}
                  {step === 3 && (
                    <div className="text-center py-8">
                      <div className="w-16 h-16 rounded-full bg-success/10 grid place-items-center mx-auto mb-4">
                        <Icon name="check" size={32} color="var(--color-success)" />
                      </div>
                      <div className="text-[22px] font-bold tracking-[-0.02em] mb-2">Check-in confirmé</div>
                      <div className="text-[14px] text-ink-2 mb-5.5">Chambre 205 attribuée · Clé remise · Reçu SMS envoyé</div>
                      <div className="flex gap-2 justify-center">
                        <Button variant="ghost" onClick={() => setStep(0)}><Icon name="printer" size={14} /> Imprimer fiche</Button>
                        <Button variant="primary" onClick={() => { setStep(0); showToast("Nouveau check-in prêt", "check"); }}>
                          Nouveau check-in
                        </Button>
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* Check-out steps */}
              {mode === "checkout" && (
                <>
                  {step === 0 && (
                    <div>
                      <SectionHead icon="arrowLeft" title="Sélectionnez le client" sub="Départs du jour" />
                      <div className="mt-3.5 grid gap-2">
                        {departures.map(b => (
                          <div key={b.id} className="flex items-center gap-3 px-4 py-3 rounded-xl border border-border hover:border-primary cursor-pointer transition-all duration-120" onClick={() => setStep(1)}>
                            <div className="w-9.5 h-9.5 rounded-full inline-grid place-items-center text-white font-semibold text-[13px] shrink-0"
                              style={{ background: AV_COLORS[b.guest.charCodeAt(0) % 8] }}>
                              {b.guest.split(" ").map((x: string) => x[0]).join("").slice(0,2)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="font-semibold text-[13.5px]">{b.guest}</div>
                              <div className="text-[11.5px] text-ink-3">Ch. {b.room} · {b.nights} nuit{b.nights>1?"s":""} · {formatDate(b.checkout)}</div>
                            </div>
                            <Icon name="chevronRight" size={14} color="var(--color-ink-3)" />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {step === 1 && (
                    <div>
                      <SectionHead icon="list" title="Vérification de la chambre" sub="Extras, mini-bar, dommages éventuels" />
                      <div className="mt-4 grid gap-2">
                        {[
                          { label:"Mini-bar",      note:"2 boissons consommées", extra:"3 500 FCFA" },
                          { label:"Blanchisserie", note:"3 pièces",              extra:"5 000 FCFA" },
                          { label:"Room service",  note:"Aucune commande",       extra: null         },
                        ].map(item => (
                          <div key={item.label} className="flex items-center justify-between px-4 py-3.5 border border-border rounded-[10px]">
                            <div>
                              <div className="font-medium text-[13px]">{item.label}</div>
                              <div className="text-[11.5px] text-ink-3">{item.note}</div>
                            </div>
                            {item.extra
                              ? <strong className="text-[13px]" style={{ color:"var(--color-warn)" }}>{item.extra}</strong>
                              : <Pill kind="success" dot>Rien</Pill>}
                          </div>
                        ))}
                      </div>
                      <div className="flex justify-between mt-5.5">
                        <Button variant="ghost" onClick={() => setStep(0)}><Icon name="chevronLeft" size={14} /> Retour</Button>
                        <Button variant="primary" onClick={() => setStep(2)}>Facturer extras <Icon name="chevronRight" size={14} /></Button>
                      </div>
                    </div>
                  )}
                  {step === 2 && (
                    <div className="text-center py-8">
                      <div className="w-16 h-16 rounded-full bg-success/10 grid place-items-center mx-auto mb-4">
                        <Icon name="check" size={32} color="var(--color-success)" />
                      </div>
                      <div className="text-[22px] font-bold tracking-[-0.02em] mb-2">Départ confirmé</div>
                      <div className="text-[14px] text-ink-2 mb-5.5">Chambre libérée · Facture envoyée par SMS · Avis app demandé</div>
                      <Button variant="primary" onClick={() => { setStep(0); showToast("Départ enregistré", "check"); }}>
                        Nouveau départ
                      </Button>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* Side-by-side arrivals/departures for walkin view */}
          {mode === "walkin" && (
            <div className="grid grid-cols-2 gap-3.5">
              <div className="bg-surface border border-border rounded-[18px] p-5.5">
                <SectionHead icon="arrowRight" title="Arrivées du jour" sub={`${arrivals.length} réservations`} />
                {arrivals.map(b => (
                  <ArrivalRow key={b.id} b={b} color={AV_COLORS[b.guest.charCodeAt(0) % 8]} />
                ))}
              </div>
              <div className="bg-surface border border-border rounded-[18px] p-5.5">
                <SectionHead icon="arrowLeft" title="Départs du jour" sub={`${departures.length} réservations`} />
                {departures.map(b => (
                  <ArrivalRow key={b.id} b={b} color={AV_COLORS[b.guest.charCodeAt(0) % 8]} />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ── Right sidebar ── */}
        <div className="grid gap-3.5 content-start">
          <div className="bg-surface border border-border rounded-[18px] p-5.5">
            <SectionHead icon="barChart" title="Aujourd'hui" sub="Vue d'ensemble" />
            <div className="grid gap-2.5 mt-1">
              {[
                { label:"Arrivées prévues",     value:arrivals.length,   bg:"var(--color-primary-50)", cl:"var(--color-primary)" },
                { label:"Départs prévus",       value:departures.length, bg:"var(--color-warn-bg)",    cl:"var(--color-warn)"    },
                { label:"Walk-ins du jour",     value:3,                 bg:"var(--color-teal-bg)",    cl:"var(--color-teal)"    },
                { label:"Chambres disponibles", value:availRooms.length, bg:"var(--color-success-bg)", cl:"var(--color-success)" },
              ].map(s => (
                <div key={s.label} className="flex items-center justify-between px-3.5 py-3 rounded-[10px]" style={{ background: s.bg }}>
                  <span className="text-[12.5px] font-medium" style={{ color: s.cl }}>{s.label}</span>
                  <strong className="text-[18px] tracking-[-0.02em]" style={{ color: s.cl }}>{s.value}</strong>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-surface border border-border rounded-[18px] p-5.5">
            <SectionHead icon="list" title="Départs à venir" sub="Dans les 2 prochaines heures" />
            {departures.slice(0, 3).map(b => (
              <div key={b.id} className="flex items-center gap-2.5 py-2.5 border-b border-border-soft last:border-b-0">
                <div className="w-1.75 h-1.75 rounded-full shrink-0" style={{ background: "var(--color-warn)" }} />
                <div className="flex-1 min-w-0">
                  <div className="text-[12.5px] font-medium leading-tight truncate">{b.guest}</div>
                  <div className="text-[11px] text-ink-3">Ch. {b.room || "—"} · {formatDate(b.checkout)}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-surface border border-border rounded-[18px] p-5.5">
            <SectionHead icon="sparkles" title="Raccourcis" />
            <div className="grid gap-2">
              {[
                { icon:"printer",  label:"Imprimer liste arrivées" },
                { icon:"send",     label:"SMS rappel clients"       },
                { icon:"download", label:"Rapport journée PDF"      },
              ].map(a => (
                <Button key={a.label} variant="soft" size="sm" className="justify-start" onClick={() => showToast(a.label, "check")}>
                  <Icon name={a.icon} size={14} /> {a.label}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Walk-in modal */}
      {walkin && (
        <Modal
          open
          onClose={() => setWalkin(false)}
          title="Nouveau Walk-in"
          footer={
            <>
              <Button variant="ghost" onClick={() => setWalkin(false)}>Annuler</Button>
              <Button variant="primary" onClick={() => { setWalkin(false); showToast("Walk-in enregistré", "check"); }}>
                <Icon name="check" size={14} /> Confirmer
              </Button>
            </>
          }
        >
          <div className="grid gap-3">
            {[
              { label:"Nom complet",     ph:"Ex: Kouamé Aya Bernadette", type:"text"   },
              { label:"Téléphone",       ph:"+225 07 XX XX XX XX",       type:"tel"    },
              { label:"Nombre de nuits", ph:"1",                         type:"number" },
            ].map(f => (
              <div key={f.label}>
                <label className="text-[12px] font-medium text-ink-2 mb-1.5 block">{f.label}</label>
                <input type={f.type} placeholder={f.ph} className="w-full h-10.5 bg-surface border border-border rounded-[9px] px-3 text-[13.5px] text-ink outline-none focus:border-primary placeholder:text-ink-4" />
              </div>
            ))}
            <div>
              <label className="text-[12px] font-medium text-ink-2 mb-1.5 block">Chambre</label>
              <div className="grid gap-1.5" style={{ gridTemplateColumns: "repeat(4,1fr)" }}>
                {availRooms.slice(0, 8).map(r => (
                  <button key={r.num} className="px-2.5 py-2 rounded-[9px] border border-dashed border-border text-[12.5px] hover:border-primary hover:text-primary font-semibold">{r.num}</button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-[12px] font-medium text-ink-2 mb-1.5 block">Paiement</label>
              <div className="flex gap-2 flex-wrap">
                {["Wave","Orange Money","MTN Money","Espèces","Carte"].map(m => (
                  <button key={m} className="px-3 py-1.5 rounded-[9px] border border-border text-[12.5px] hover:border-primary hover:text-primary">{m}</button>
                ))}
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

function ArrivalRow({ b, color }: { b: Booking; color: string }) {
  return (
    <div className="flex items-center gap-2.5 py-2.5 border-b border-border-soft last:border-b-0">
      <div className="w-7.5 h-7.5 rounded-full inline-grid place-items-center text-white font-semibold text-[11px] shrink-0"
        style={{ background: color }}>
        {b.guest.split(" ").map((x: string) => x[0]).join("").slice(0,2)}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-[12.5px] font-medium leading-tight truncate">{b.guest}</div>
        <div className="text-[11px] text-ink-3">{b.roomType} · {b.nights} nuit{b.nights>1?"s":""}</div>
      </div>
      <Pill kind={b.paid >= b.amount ? "success" : "warn"} dot>
        {b.paid >= b.amount ? "Soldé" : "Solde"}
      </Pill>
    </div>
  );
}
