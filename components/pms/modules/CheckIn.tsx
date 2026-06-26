"use client";
import React, { useState } from "react";
import { PMSHeader } from "../PMSHeader";
import { SectionHead, Pill, showToast, Icon } from "../shared";
import {
  ARRIVALS_TODAY, DEPARTURES_TODAY, APP_PROFILES,
  ROOMS_PMS, ROOM_TYPES_PMS,
  formatFCFA, formatDate, type Booking,
} from "../data";

// ── Stepper ──────────────────────────────────────────────────────────────────
function Stepper({ step, steps }: { step: number; steps: string[] }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 0, marginBottom: 24 }}>
      {steps.map((label, i) => (
        <React.Fragment key={i}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
            <div style={{
              width: 32, height: 32, borderRadius: "50%",
              background: i < step ? "var(--success)" : i === step ? "var(--text)" : "var(--border)",
              color: i <= step ? "#fff" : "var(--text-3)",
              display: "grid", placeItems: "center",
              fontWeight: 700, fontSize: 13,
              transition: "background .2s",
            }}>
              {i < step ? <Icon name="check" size={15} /> : i + 1}
            </div>
            <div style={{ fontSize: 10.5, fontWeight: i === step ? 700 : 500, color: i === step ? "var(--text)" : "var(--text-3)", textAlign: "center", whiteSpace: "nowrap" }}>
              {label}
            </div>
          </div>
          {i < steps.length - 1 && (
            <div style={{ flex: 1, height: 2, background: i < step ? "var(--success)" : "var(--border)", margin: "0 8px", marginBottom: 18, transition: "background .2s" }} />
          )}
        </React.Fragment>
      ))}
    </div>
  );
}

// ── CheckIn Flow ──────────────────────────────────────────────────────────────
const CI_STEPS = ["Identité & vérification", "Solde & paiement", "Remise des clés"];

function CheckInFlow({ booking, onClose }: { booking: Booking; onClose: () => void }) {
  const [step, setStep] = useState(0);
  const [payMethod, setPayMethod] = useState("wave");
  const profile = APP_PROFILES[booking.ref];
  const balance = booking.amount - booking.paid;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" style={{ maxWidth: 680 }} onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div style={{ padding: "20px 24px 14px", background: "var(--text)", color: "#fff", position: "relative" }}>
          <button className="btn-icon" style={{ position: "absolute", top: 16, right: 16, background: "rgba(255,255,255,0.15)", color: "#fff", borderColor: "rgba(255,255,255,0.2)" }} onClick={onClose}>
            <Icon name="x" size={16} />
          </button>
          <div style={{ fontSize: 11, opacity: 0.8, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase" }}>Check-in</div>
          <div style={{ fontSize: 20, fontWeight: 800, marginTop: 2 }}>{booking.guest}</div>
          <div style={{ fontSize: 12, opacity: 0.85, marginTop: 2 }}>
            {booking.ref} · Chambre {booking.room} ({booking.roomType}) · {booking.nights} nuit{booking.nights > 1 ? "s" : ""}
          </div>
        </div>

        <div className="modal-body">
          <Stepper step={step} steps={CI_STEPS} />

          {/* ── Step 0: Identité ── */}
          {step === 0 && (
            <div>
              {profile ? (
                <>
                  {/* App profile card */}
                  <div style={{ padding: 16, background: "var(--success-bg)", borderRadius: 14, border: "1px solid var(--success)", marginBottom: 18 }}>
                    <div className="row-flex" style={{ marginBottom: 10 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div style={{ width: 36, height: 36, borderRadius: 10, background: "var(--success)", color: "#fff", display: "grid", placeItems: "center" }}>
                          <Icon name="check" size={18} />
                        </div>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: 14 }}>Profil Immo Plus complet à {profile.complete}%</div>
                          <div className="text-xs text-muted">Check-in anticipé via app · données pré-remplies</div>
                        </div>
                      </div>
                      <span style={{ fontSize: 10.5, fontWeight: 700, padding: "2px 8px", borderRadius: 99, background: profile.complete === 100 ? "var(--success-bg)" : "var(--warn-bg)", color: profile.complete === 100 ? "var(--success)" : "var(--warn)" }}>App {profile.complete}%</span>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8, fontSize: 12 }}>
                      {([
                        ["CNI scannée",    profile.cniScanned],
                        ["CNI vérifiée",   profile.cniVerified],
                        ["Photo uploadée", profile.photoUploaded],
                        ["Préférences",    profile.preferencesSet],
                        ["Mode arrivée",   true],
                        ["Motif séjour",   true],
                      ] as [string, boolean][]).map(([label, ok]) => (
                        <div key={label} style={{ display: "flex", alignItems: "center", gap: 6, color: ok ? "var(--success)" : "var(--warn)" }}>
                          <Icon name={ok ? "check" : "x"} size={13} />
                          <span style={{ color: "var(--text-2)" }}>{label}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* CNI display */}
                  <div className="preflight-card" style={{ marginBottom: 14 }}>
                    <div className="preflight-grid">
                      <div>
                        <SectionHead icon="user" title="Pièce d'identité scannée" />
                        <div style={{ background: "var(--bg-2)", border: "2px dashed var(--border-strong)", borderRadius: 12, padding: "32px 0", textAlign: "center", color: "var(--text-3)", marginBottom: 10 }}>
                          <Icon name="user" size={32} color="var(--border-strong)" />
                          <div style={{ fontSize: 11, marginTop: 8 }}>Photo CNI uploadée</div>
                          <div style={{ fontSize: 10, marginTop: 4, color: "var(--text-3)" }}>Vérifiée · {profile.cniVerified ? "✓ Authentique" : "⚠ À vérifier"}</div>
                        </div>
                      </div>
                      <div>
                        <SectionHead icon="fileText" title="Données extraites" />
                        <div style={{ display: "grid", gap: 8 }}>
                          {([
                            ["Nom complet", booking.guest],
                            ["Mode arrivée", profile.arrivalMode],
                            ["Motif séjour", profile.purpose],
                            ["Heure prévue", profile.checkInTimePref ?? "—"],
                          ] as [string, string][]).map(([label, val]) => (
                            <div key={label} style={{ display: "grid", gridTemplateColumns: "1fr 1.4fr", gap: 8, fontSize: 12 }}>
                              <span style={{ color: "var(--text-3)" }}>{label}</span>
                              <strong>{val}</strong>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                /* Walk-in with no app profile */
                <div>
                  <div style={{ padding: 14, background: "var(--warn-bg)", borderRadius: 12, border: "1px solid var(--warn)", marginBottom: 16, display: "flex", alignItems: "center", gap: 12 }}>
                    <Icon name="info" size={18} color="var(--warn)" />
                    <div style={{ fontSize: 13 }}>
                      <strong>Pas de profil app détecté.</strong> Veuillez scanner la pièce d&apos;identité manuellement.
                    </div>
                  </div>
                  <div className="grid-2">
                    <div>
                      <label className="field-label">Pièce d&apos;identité</label>
                      <select className="input" defaultValue="cni">
                        <option value="cni">CNI</option>
                        <option value="passport">Passeport</option>
                        <option value="sejour">Titre de séjour</option>
                      </select>
                    </div>
                    <div>
                      <label className="field-label">Numéro</label>
                      <input className="input" placeholder="CI001234567" />
                    </div>
                    <div>
                      <label className="field-label">Motif du séjour</label>
                      <select className="input" defaultValue="">
                        <option value="" disabled>Sélectionner…</option>
                        <option>Affaires</option>
                        <option>Tourisme</option>
                        <option>Transit</option>
                        <option>Famille</option>
                      </select>
                    </div>
                    <div>
                      <label className="field-label">Mode d&apos;arrivée</label>
                      <select className="input" defaultValue="">
                        <option value="" disabled>Sélectionner…</option>
                        <option>Taxi</option>
                        <option>Voiture personnelle</option>
                        <option>Navette aéroport</option>
                        <option>Voiture de fonction</option>
                      </select>
                    </div>
                  </div>
                  <div style={{ marginTop: 14 }}>
                    <label className="label">Scanner CNI</label>
                    <div style={{
                      border: "2px dashed var(--border-strong)", borderRadius: 12,
                      padding: "28px 0", textAlign: "center", cursor: "pointer",
                      background: "var(--surface-soft)", color: "var(--text-3)",
                    }}>
                      <Icon name="fileText" size={28} color="var(--border-strong)" />
                      <div style={{ fontSize: 12, marginTop: 8 }}>Cliquez pour scanner ou glissez-déposez</div>
                    </div>
                  </div>
                </div>
              )}

              <button className="btn btn-primary" style={{ width: "100%", marginTop: 16, padding: "12px 0", fontSize: 14 }} onClick={() => setStep(1)}>
                Identité vérifiée · Continuer <Icon name="arrowRight" size={15} />
              </button>
            </div>
          )}

          {/* ── Step 1: Solde & paiement ── */}
          {step === 1 && (
            <div>
              {/* Solde résumé */}
              <div style={{
                padding: 18, background: "var(--text)", color: "#fff", borderRadius: 14, marginBottom: 18,
                display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14,
              }}>
                <div>
                  <div style={{ fontSize: 10, opacity: 0.8, textTransform: "uppercase", letterSpacing: "0.05em" }}>Total séjour</div>
                  <div style={{ fontSize: 20, fontWeight: 800, marginTop: 4 }}>{formatFCFA(booking.amount)}</div>
                </div>
                <div>
                  <div style={{ fontSize: 10, opacity: 0.8, textTransform: "uppercase", letterSpacing: "0.05em" }}>Déjà payé</div>
                  <div style={{ fontSize: 20, fontWeight: 800, marginTop: 4, color: "#A8FFCB" }}>{formatFCFA(booking.paid)}</div>
                </div>
                <div>
                  <div style={{ fontSize: 10, opacity: 0.8, textTransform: "uppercase", letterSpacing: "0.05em" }}>Solde dû</div>
                  <div style={{ fontSize: 22, fontWeight: 800, marginTop: 4, color: balance > 0 ? "#FFD57E" : "#A8FFCB" }}>
                    {formatFCFA(balance)}
                  </div>
                </div>
              </div>

              {balance === 0 ? (
                <div style={{ padding: 14, background: "var(--success-bg)", borderRadius: 12, border: "1px solid var(--success)", display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
                  <Icon name="check" size={20} color="var(--success)" />
                  <div><strong>Paiement intégral reçu.</strong> Aucun solde à encaisser.</div>
                </div>
              ) : (
                <>
                  <div style={{ marginBottom: 14 }}>
                    <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 12 }}>Mode de paiement</div>
                    <div className="grid-2">
                      {([
                        ["wave",  "Wave",            "#1A73E8", "💙"],
                        ["om",    "Orange Money",    "#FF6600", "🧡"],
                        ["mtn",   "MTN MoMo",        "#FFCC00", "💛"],
                        ["card",  "Carte bancaire",  "#2C2C2C", "💳"],
                        ["cash",  "Espèces",         "#00A84F", "💵"],
                      ] as [string, string, string, string][]).map(([id, label, color, emoji]) => (
                        <div
                          key={id}
                          className={"radio-card" + (payMethod === id ? " checked" : "")}
                          onClick={() => setPayMethod(id)}
                        >
                          <div className="rc-mark" />
                          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                            <div style={{
                              width: 36, height: 36, borderRadius: 9, background: color + "18",
                              display: "grid", placeItems: "center", fontSize: 18, flexShrink: 0,
                            }}>{emoji}</div>
                            <div>
                              <div style={{ fontWeight: 700, fontSize: 13 }}>{label}</div>
                              <div className="text-xs text-muted">{id === "card" ? "Visa / Mastercard" : id === "cash" ? "Reçu à imprimer" : "Paiement mobile"}</div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div style={{ padding: 14, background: "var(--primary-50)", borderRadius: 12, border: "1px solid var(--primary-100)", fontSize: 12.5, marginBottom: 14 }}>
                    <strong>Montant à encaisser :</strong>{" "}
                    <span style={{ fontSize: 16, fontWeight: 800, color: "var(--primary)" }}>{formatFCFA(balance)}</span>
                    {" "}via <strong>{payMethod === "wave" ? "Wave" : payMethod === "om" ? "Orange Money" : payMethod === "mtn" ? "MTN MoMo" : payMethod === "card" ? "Carte bancaire" : "Espèces"}</strong>
                  </div>
                </>
              )}

              <div style={{ display: "flex", gap: 10 }}>
                <button className="btn btn-ghost" style={{ flex: 1 }} onClick={() => setStep(0)}>
                  <Icon name="arrowLeft" size={14} /> Retour
                </button>
                <button
                  className="btn btn-primary"
                  style={{ flex: 2, padding: "12px 0", fontSize: 14 }}
                  onClick={() => { showToast("Paiement encaissé · " + formatFCFA(balance), "check"); setStep(2); }}
                >
                  {balance === 0 ? "Continuer" : "Confirmer paiement"} <Icon name="arrowRight" size={15} />
                </button>
              </div>
            </div>
          )}

          {/* ── Step 2: Remise des clés ── */}
          {step === 2 && (
            <div style={{ textAlign: "center", paddingTop: 8 }}>
              <div style={{ fontSize: 52, lineHeight: 1 }}>🎉</div>
              <div style={{ fontSize: 24, fontWeight: 800, marginTop: 16, marginBottom: 8 }}>Check-in confirmé !</div>
              <div style={{ fontSize: 13.5, color: "var(--text-2)", marginBottom: 28, lineHeight: 1.6 }}>
                {booking.guest} est maintenant enregistré en chambre <strong>{booking.room}</strong>.<br />
                Remettez les clés et souhaitez-lui la bienvenue.
              </div>
              <div style={{
                display: "inline-block", padding: "20px 32px",
                background: "var(--text)", color: "#fff", borderRadius: 16, marginBottom: 24,
              }}>
                <div style={{ fontSize: 11, opacity: 0.75, textTransform: "uppercase", letterSpacing: "0.08em" }}>Chambre</div>
                <div style={{ fontSize: 48, fontWeight: 900, letterSpacing: "-0.02em", lineHeight: 1 }}>{booking.room}</div>
                <div style={{ fontSize: 12, opacity: 0.85, marginTop: 4 }}>{booking.roomType} · {booking.nights} nuit{booking.nights > 1 ? "s" : ""}</div>
              </div>
              <div className="grid-2" style={{ textAlign: "left", marginBottom: 20 }}>
                <div className="kpi" style={{ padding: 14 }}>
                  <div className="kpi-label">Check-out prévu</div>
                  <div className="kpi-value" style={{ fontSize: 18 }}>{formatDate(booking.checkout)}</div>
                </div>
                <div className="kpi" style={{ padding: 14 }}>
                  <div className="kpi-label">Paiement</div>
                  <div className="kpi-value" style={{ fontSize: 18, color: "var(--success)" }}>✓ Réglé</div>
                </div>
              </div>
              <div style={{ display: "flex", gap: 10 }}>
                <button className="btn btn-ghost" style={{ flex: 1 }} onClick={() => showToast("Reçu imprimé", "check")}>
                  <Icon name="download" size={14} /> Imprimer reçu
                </button>
                <button className="btn btn-ghost" style={{ flex: 1 }} onClick={() => showToast("Message de bienvenue envoyé", "check")}>
                  <Icon name="send" size={14} /> WhatsApp bienvenue
                </button>
                <button className="btn btn-primary" style={{ flex: 1.5 }} onClick={onClose}>
                  <Icon name="check" size={14} /> Terminer
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── CheckOut Flow ─────────────────────────────────────────────────────────────
function CheckOutFlow({ booking, onClose }: { booking: Booking; onClose: () => void }) {
  const [step, setStep] = useState(0);
  const CO_STEPS = ["Services & minibar", "Facture finale", "Départ"];

  const extras = [
    { label: "Restaurant Le Baobab · Dîner",         amount: 22500 },
    { label: "Minibar · Eau + boissons",              amount: 4500  },
    { label: "Transfert aéroport",                    amount: 15000 },
    { label: "Spa · Massage 60min",                   amount: 25000 },
  ];
  const extrasTotal = extras.reduce((s, e) => s + e.amount, 0);
  const grandTotal  = booking.amount + extrasTotal;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" style={{ maxWidth: 680 }} onClick={e => e.stopPropagation()}>
        <div style={{ padding: "20px 24px 14px", background: "#FF8C42", color: "#fff", position: "relative" }}>
          <button className="btn-icon" style={{ position: "absolute", top: 16, right: 16, background: "rgba(255,255,255,0.15)", color: "#fff", borderColor: "rgba(255,255,255,0.2)" }} onClick={onClose}>
            <Icon name="x" size={16} />
          </button>
          <div style={{ fontSize: 11, opacity: 0.8, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase" }}>Check-out</div>
          <div style={{ fontSize: 20, fontWeight: 800, marginTop: 2 }}>{booking.guest}</div>
          <div style={{ fontSize: 12, opacity: 0.85, marginTop: 2 }}>
            {booking.ref} · Chambre {booking.room} · {booking.nights} nuit{booking.nights > 1 ? "s" : ""}
          </div>
        </div>

        <div className="modal-body">
          <Stepper step={step} steps={CO_STEPS} />

          {/* ── Step 0: Services ── */}
          {step === 0 && (
            <div>
              <SectionHead icon="fileText" title="Services depuis l'app Immo Plus" sub="Remontés automatiquement" />
              <div style={{ display: "grid", gap: 8, marginBottom: 16 }}>
                {extras.map((e, i) => (
                  <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 14px", border: "1px solid var(--border)", borderRadius: 10, fontSize: 13 }}>
                    <div>{e.label}</div>
                    <div style={{ fontWeight: 700, color: "var(--primary)" }}>{formatFCFA(e.amount)}</div>
                  </div>
                ))}
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "12px 14px", background: "var(--surface-soft)", borderRadius: 10, marginBottom: 16 }}>
                <strong>Total extras</strong>
                <strong style={{ color: "var(--primary)" }}>{formatFCFA(extrasTotal)}</strong>
              </div>
              <button className="btn btn-primary" style={{ width: "100%" }} onClick={() => setStep(1)}>
                Voir facture finale <Icon name="arrowRight" size={14} />
              </button>
            </div>
          )}

          {/* ── Step 1: Facture finale ── */}
          {step === 1 && (
            <div>
              <SectionHead icon="fileText" title="Facture finale" sub={booking.ref} />
              <table className="tbl" style={{ marginBottom: 16 }}>
                <thead>
                  <tr>
                    <th>Désignation</th>
                    <th style={{ textAlign: "right" }}>Montant</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Hébergement · {booking.nights} nuit{booking.nights > 1 ? "s" : ""} · {booking.roomType}</td>
                    <td style={{ textAlign: "right", fontWeight: 600 }}>{formatFCFA(booking.amount)}</td>
                  </tr>
                  {extras.map((e, i) => (
                    <tr key={i}>
                      <td style={{ paddingLeft: 16, color: "var(--text-2)", fontSize: 12 }}>{e.label}</td>
                      <td style={{ textAlign: "right", fontSize: 12 }}>{formatFCFA(e.amount)}</td>
                    </tr>
                  ))}
                  <tr style={{ background: "var(--surface-soft)" }}>
                    <td><strong>Total général</strong></td>
                    <td style={{ textAlign: "right" }}><strong style={{ color: "var(--primary)", fontSize: 16 }}>{formatFCFA(grandTotal)}</strong></td>
                  </tr>
                  <tr>
                    <td style={{ color: "var(--text-3)" }}>Déjà réglé</td>
                    <td style={{ textAlign: "right", color: "var(--success)", fontWeight: 700 }}>−{formatFCFA(booking.paid)}</td>
                  </tr>
                  <tr style={{ background: "var(--warn-bg)" }}>
                    <td><strong>Solde final</strong></td>
                    <td style={{ textAlign: "right" }}>
                      <strong style={{ color: "var(--warn)", fontSize: 15 }}>{formatFCFA(grandTotal - booking.paid)}</strong>
                    </td>
                  </tr>
                </tbody>
              </table>
              <div style={{ display: "flex", gap: 10 }}>
                <button className="btn btn-ghost" style={{ flex: 1 }} onClick={() => setStep(0)}>
                  <Icon name="arrowLeft" size={14} /> Retour
                </button>
                <button className="btn btn-ghost" style={{ flex: 1 }} onClick={() => showToast("Facture envoyée par email", "check")}>
                  <Icon name="mail" size={14} /> Envoyer par email
                </button>
                <button className="btn btn-primary" style={{ flex: 1.5 }} onClick={() => { showToast("Paiement solde confirmé", "check"); setStep(2); }}>
                  Encaisser solde <Icon name="arrowRight" size={14} />
                </button>
              </div>
            </div>
          )}

          {/* ── Step 2: Départ ── */}
          {step === 2 && (
            <div style={{ textAlign: "center", paddingTop: 8 }}>
              <div style={{ fontSize: 52, lineHeight: 1 }}>👋</div>
              <div style={{ fontSize: 24, fontWeight: 800, marginTop: 16, marginBottom: 8 }}>Bon voyage !</div>
              <div style={{ fontSize: 13.5, color: "var(--text-2)", marginBottom: 24, lineHeight: 1.6 }}>
                {booking.guest} a quitté la chambre <strong>{booking.room}</strong>.<br />
                La chambre sera transmise au planning ménage.
              </div>
              <div className="grid-2" style={{ textAlign: "left", marginBottom: 20 }}>
                <div className="kpi" style={{ padding: 14 }}>
                  <div className="kpi-label">Total facturé</div>
                  <div className="kpi-value" style={{ fontSize: 16 }}>{formatFCFA(grandTotal)}</div>
                </div>
                <div className="kpi" style={{ padding: 14 }}>
                  <div className="kpi-label">Chambre</div>
                  <div className="kpi-value" style={{ fontSize: 16, color: "var(--warn)" }}>→ Ménage</div>
                </div>
              </div>
              <div style={{ display: "flex", gap: 10 }}>
                <button className="btn btn-ghost" style={{ flex: 1 }} onClick={() => showToast("Facture téléchargée", "check")}>
                  <Icon name="download" size={14} /> Facture PDF
                </button>
                <button className="btn btn-primary" style={{ flex: 1.5 }} onClick={onClose}>
                  <Icon name="check" size={14} /> Terminer
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Walk-in Form ──────────────────────────────────────────────────────────────
function WalkInForm({ onClose }: { onClose: () => void }) {
  const [roomType, setRoomType] = useState("STD");
  const [nights,   setNights]   = useState(1);
  const freeRooms = ROOMS_PMS.filter(r => r.status === "libre" && r.type === roomType);
  const selectedType = ROOM_TYPES_PMS.find(t => t.code === roomType);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" style={{ maxWidth: 640 }} onClick={e => e.stopPropagation()}>
        <div style={{ padding: "20px 24px 14px", background: "var(--text)", color: "#fff", position: "relative" }}>
          <button className="btn-icon" style={{ position: "absolute", top: 16, right: 16, background: "rgba(255,255,255,0.15)", color: "#fff", borderColor: "rgba(255,255,255,0.2)" }} onClick={onClose}>
            <Icon name="x" size={16} />
          </button>
          <div style={{ fontSize: 11, opacity: 0.8, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase" }}>Walk-in</div>
          <div style={{ fontSize: 20, fontWeight: 800, marginTop: 2 }}>Nouvelle réservation directe</div>
        </div>

        <div className="modal-body">
          <SectionHead icon="user" title="Informations client" />
          <div className="grid-2" style={{ marginBottom: 18 }}>
            <div>
              <label className="field-label">Nom complet</label>
              <input className="input" placeholder="Kouamé Yao" />
            </div>
            <div>
              <label className="field-label">Téléphone</label>
              <input className="input" placeholder="+225 07 11 23 45 67" />
            </div>
            <div>
              <label className="field-label">Type de pièce</label>
              <select className="input" defaultValue="cni">
                <option value="cni">CNI</option>
                <option value="passport">Passeport</option>
              </select>
            </div>
            <div>
              <label className="field-label">Numéro</label>
              <input className="input" placeholder="CI001234567" />
            </div>
          </div>

          <SectionHead icon="bed" title="Type de chambre" />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10, marginBottom: 18 }}>
            {ROOM_TYPES_PMS.map(t => (
              <div
                key={t.code}
                className={"radio-card" + (roomType === t.code ? " checked" : "")}
                onClick={() => setRoomType(t.code)}
                style={{ padding: "12px 10px" }}
              >
                <div className="rc-mark" />
                <div style={{ fontSize: 11, fontWeight: 700, marginBottom: 2 }}>{t.name}</div>
                <div style={{ fontSize: 12, color: "var(--primary)", fontWeight: 700 }}>{(t.price / 1000).toFixed(0)}k / nuit</div>
              </div>
            ))}
          </div>

          {freeRooms.length > 0 ? (
            <div style={{ marginBottom: 14 }}>
              <label className="label">Chambre disponible</label>
              <select className="input">
                {freeRooms.map(r => (
                  <option key={r.num} value={r.num}>Chambre {r.num} · Étage {r.floor}</option>
                ))}
              </select>
            </div>
          ) : (
            <div style={{ padding: 12, background: "var(--warn-bg)", borderRadius: 10, fontSize: 12.5, marginBottom: 14 }}>
              <Icon name="info" size={13} color="var(--warn)" /> Aucune chambre {selectedType?.name} disponible en ce moment.
            </div>
          )}

          <div className="grid-2" style={{ marginBottom: 18 }}>
            <div>
              <label className="field-label">Nombre de nuits</label>
              <input className="input" type="number" min={1} max={30} value={nights} onChange={e => setNights(Number(e.target.value))} />
            </div>
            <div>
              <label className="field-label">Check-out prévu</label>
              <input className="input" type="date" />
            </div>
          </div>

          {/* Tarification */}
          {selectedType && (
            <div style={{ padding: 16, background: "var(--text)", color: "#fff", borderRadius: 14, marginBottom: 18 }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
                <div>
                  <div style={{ fontSize: 10, opacity: 0.75, textTransform: "uppercase", letterSpacing: "0.05em" }}>Tarif / nuit</div>
                  <div style={{ fontSize: 16, fontWeight: 800, marginTop: 4 }}>{formatFCFA(selectedType.price)}</div>
                </div>
                <div>
                  <div style={{ fontSize: 10, opacity: 0.75, textTransform: "uppercase", letterSpacing: "0.05em" }}>Nuits</div>
                  <div style={{ fontSize: 16, fontWeight: 800, marginTop: 4 }}>{nights}</div>
                </div>
                <div>
                  <div style={{ fontSize: 10, opacity: 0.75, textTransform: "uppercase", letterSpacing: "0.05em" }}>Total</div>
                  <div style={{ fontSize: 18, fontWeight: 900, marginTop: 4, color: "#A8FFCB" }}>{formatFCFA(selectedType.price * nights)}</div>
                </div>
              </div>
            </div>
          )}

          <SectionHead icon="creditCard" title="Acompte" />
          <div className="grid-2" style={{ marginBottom: 8 }}>
            <div>
              <label className="field-label">Montant acompte</label>
              <input className="input" placeholder="50%" defaultValue={selectedType ? String(Math.round(selectedType.price * nights * 0.5)) : ""} />
            </div>
            <div>
              <label className="field-label">Mode de paiement</label>
              <select className="input" defaultValue="wave">
                <option value="wave">Wave</option>
                <option value="om">Orange Money</option>
                <option value="mtn">MTN MoMo</option>
                <option value="card">Carte bancaire</option>
                <option value="cash">Espèces</option>
              </select>
            </div>
          </div>
        </div>

        <div className="modal-foot">
          <button className="btn btn-ghost" onClick={onClose}>Annuler</button>
          <button className="btn btn-primary" onClick={() => { onClose(); showToast("Réservation walk-in créée", "check"); }}>
            <Icon name="check" size={14} /> Confirmer réservation
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main CheckIn module ───────────────────────────────────────────────────────
export function CheckIn() {
  const [activeTab,   setActiveTab]   = useState<"arrivals" | "departures">("arrivals");
  const [ciBooking,   setCiBooking]   = useState<Booking | null>(null);
  const [coBooking,   setCoBooking]   = useState<Booking | null>(null);
  const [showWalkIn,  setShowWalkIn]  = useState(false);

  const arrivals   = ARRIVALS_TODAY;
  const departures = DEPARTURES_TODAY;

  const appComplete    = arrivals.filter(b => (APP_PROFILES[b.ref]?.complete ?? 0) === 100).length;
  const pendingPayment = arrivals.filter(b => b.paid < b.amount).length;

  return (
    <div className="fade-in">
      <PMSHeader
        title="Check-in / Check-out"
        sub={`${arrivals.length} arrivées · ${departures.length} départs · aujourd'hui`}
        actions={
          <button className="btn btn-primary btn-sm" onClick={() => setShowWalkIn(true)}>
            <Icon name="plus" size={14} /> Walk-in
          </button>
        }
      />

      {/* ── KPI row ── */}
      <div className="kpi-grid" style={{ gridTemplateColumns: "repeat(4, 1fr)", marginBottom: 22 }}>
        <div className="kpi">
          <div className="kpi-top">
            <div className="kpi-icon" style={{ background: "var(--success-bg)", color: "var(--success)" }}><Icon name="arrowRight" size={18} /></div>
          </div>
          <div className="kpi-value">{arrivals.length}</div>
          <div className="kpi-label">Arrivées aujourd&apos;hui</div>
          <div className="kpi-sub">{arrivals.filter(b => APP_PROFILES[b.ref]).length} ont fait le check-in app</div>
        </div>
        <div className="kpi">
          <div className="kpi-top">
            <div className="kpi-icon" style={{ background: "var(--warn-bg)", color: "var(--warn)" }}><Icon name="arrowLeft" size={18} /></div>
          </div>
          <div className="kpi-value">{departures.length}</div>
          <div className="kpi-label">Départs aujourd&apos;hui</div>
          <div className="kpi-sub">Check-out à effectuer</div>
        </div>
        <div className="kpi">
          <div className="kpi-top">
            <div className="kpi-icon" style={{ background: "var(--primary-50)", color: "var(--primary)" }}><Icon name="sparkles" size={18} /></div>
            <span className="kpi-trend up">App</span>
          </div>
          <div className="kpi-value">{appComplete}</div>
          <div className="kpi-label">Profils app complets</div>
          <div className="kpi-sub">Sur {arrivals.length} arrivées · check-in rapide</div>
        </div>
        <div className="kpi">
          <div className="kpi-top">
            <div className="kpi-icon" style={{ background: "var(--amber-bg)", color: "var(--amber)" }}><Icon name="moneyBill" size={18} /></div>
            {pendingPayment > 0 && <span className="kpi-trend down" style={{ background: "var(--warn-bg)", color: "var(--warn)" }}>Attention</span>}
          </div>
          <div className="kpi-value">{pendingPayment}</div>
          <div className="kpi-label">Soldes en attente</div>
          <div className="kpi-sub">Acomptes partiels à compléter</div>
        </div>
      </div>

      {/* ── Tabs ── */}
      <div className="card" style={{ padding: "6px 8px", marginBottom: 14 }}>
        <div className="tabs">
          <div className={"tab" + (activeTab === "arrivals" ? " active" : "")} onClick={() => setActiveTab("arrivals")}>
            Arrivées <span className="chip-count" style={{ marginLeft: 6 }}>{arrivals.length}</span>
          </div>
          <div className={"tab" + (activeTab === "departures" ? " active" : "")} onClick={() => setActiveTab("departures")}>
            Départs <span className="chip-count" style={{ marginLeft: 6 }}>{departures.length}</span>
          </div>
        </div>
      </div>

      {/* ── Arrivals ── */}
      {activeTab === "arrivals" && (
        <div style={{ display: "grid", gap: 10 }}>
          {arrivals.map(b => {
            const profile = APP_PROFILES[b.ref];
            const balance = b.amount - b.paid;
            return (
              <div key={b.id} className="preflight-card">
                <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 14, alignItems: "flex-start" }}>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6, flexWrap: "wrap" }}>
                      <span style={{ fontWeight: 700, fontSize: 15 }}>{b.guest}</span>
                      {profile && <span style={{ fontSize: 10.5, fontWeight: 700, padding: "2px 8px", borderRadius: 99, background: profile.complete === 100 ? "var(--success-bg)" : "var(--warn-bg)", color: profile.complete === 100 ? "var(--success)" : "var(--warn)" }}>App {profile.complete}%</span>}
                      <Pill kind={b.status === "confirmed" ? "primary" : "success"} dot>
                        {b.status === "confirmed" ? "Confirmé" : "Enregistré"}
                      </Pill>
                    </div>
                    <div className="text-xs text-muted">
                      {b.ref} · Ch. {b.room} · {b.roomType} · {b.nights} nuit{b.nights > 1 ? "s" : ""} · via {b.source}
                    </div>
                    {profile && (
                      <div className="preflight-grid" style={{ marginTop: 10 }}>
                        {([
                          ["CNI scan",  profile.cniScanned,   "check", "x"],
                          ["Vérifié",   profile.cniVerified,  "check", "x"],
                          ["Photo",     profile.photoUploaded,"check", "x"],
                          ["Préfs",     profile.preferencesSet,"check","x"],
                        ] as [string, boolean, string, string][]).map(([label, ok, y, n]) => (
                          <div key={label} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11.5 }}>
                            <Icon name={ok ? y : n} size={12} color={ok ? "var(--success)" : "var(--warn)"} />
                            <span style={{ color: "var(--text-2)" }}>{label}</span>
                          </div>
                        ))}
                        {profile.checkInTimePref && (
                          <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11.5 }}>
                            <Icon name="clock" size={12} color="var(--primary)" />
                            <span style={{ color: "var(--text-2)" }}>Arrivée {profile.checkInTimePref}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8, alignItems: "flex-end" }}>
                    {balance > 0 && (
                      <div style={{ textAlign: "right" }}>
                        <div className="text-xs text-muted">Solde dû</div>
                        <div style={{ fontWeight: 800, fontSize: 15, color: "var(--warn)" }}>{formatFCFA(balance)}</div>
                      </div>
                    )}
                    <button
                      className="btn btn-primary"
                      style={{ minWidth: 130 }}
                      onClick={() => setCiBooking(b)}
                    >
                      <Icon name="check" size={13} /> Check-in
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
          {arrivals.length === 0 && (
            <div className="empty">
              <div className="e-icon"><Icon name="calendar" size={24} /></div>
              <div className="e-title">Aucune arrivée prévue aujourd&apos;hui</div>
            </div>
          )}
        </div>
      )}

      {/* ── Departures ── */}
      {activeTab === "departures" && (
        <div style={{ display: "grid", gap: 10 }}>
          {departures.map(b => {
            const profile = APP_PROFILES[b.ref];
            return (
              <div key={b.id} className="preflight-card">
                <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 14, alignItems: "center" }}>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6, flexWrap: "wrap" }}>
                      <span style={{ fontWeight: 700, fontSize: 15 }}>{b.guest}</span>
                      {profile && <span style={{ fontSize: 10.5, fontWeight: 700, padding: "2px 8px", borderRadius: 99, background: profile.complete === 100 ? "var(--success-bg)" : "var(--warn-bg)", color: profile.complete === 100 ? "var(--success)" : "var(--warn)" }}>App {profile.complete}%</span>}
                      <Pill kind="warn" dot>Départ</Pill>
                    </div>
                    <div className="text-xs text-muted">
                      {b.ref} · Ch. {b.room} · {b.roomType} · {b.nights} nuit{b.nights > 1 ? "s" : ""} · {b.source}
                    </div>
                    <div style={{ marginTop: 6, fontWeight: 700, color: "var(--primary)", fontSize: 13 }}>
                      {formatFCFA(b.amount)} · {b.paid === b.amount ? "Réglé ✓" : `Solde : ${formatFCFA(b.amount - b.paid)}`}
                    </div>
                  </div>
                  <button
                    className="btn btn-ghost"
                    style={{ minWidth: 130, borderColor: "#FF8C42", color: "#FF8C42" }}
                    onClick={() => setCoBooking(b)}
                  >
                    <Icon name="arrowRight" size={13} /> Check-out
                  </button>
                </div>
              </div>
            );
          })}
          {departures.length === 0 && (
            <div className="empty">
              <div className="e-icon"><Icon name="calendar" size={24} /></div>
              <div className="e-title">Aucun départ prévu aujourd&apos;hui</div>
            </div>
          )}
        </div>
      )}

      {/* Modals */}
      {ciBooking  && <CheckInFlow  booking={ciBooking}  onClose={() => setCiBooking(null)}  />}
      {coBooking  && <CheckOutFlow booking={coBooking}  onClose={() => setCoBooking(null)}  />}
      {showWalkIn && <WalkInForm                        onClose={() => setShowWalkIn(false)} />}
    </div>
  );
}
