"use client";
import React, { useState } from "react";
import { PMSHeader } from "../PMSHeader";
import { SectionHead, Pill, Icon } from "../shared";
import { formatFCFA } from "../data";

const NAV_SECTIONS = [
  { id: "general",       icon: "building",    label: "Général" },
  { id: "hours",         icon: "clock",       label: "Horaires check-in / out" },
  { id: "payments",      icon: "creditCard",  label: "Paiements" },
  { id: "notifications", icon: "bell",        label: "Notifications" },
  { id: "team",          icon: "users",       label: "Équipe & rôles" },
  { id: "integrations",  icon: "layers",      label: "Intégrations" },
  { id: "billing",       icon: "moneyBill",   label: "Facturation Immo Plus" },
];

export function Settings() {
  const [section, setSection] = useState("general");
  return (
    <div className="fade-in">
      <PMSHeader title="Paramètres" sub="Configuration de votre établissement" search={false} />
      <div className="settings-grid">
        <div className="card" style={{ padding: 8 }}>
          <div className="settings-nav">
            {NAV_SECTIONS.map(s => (
              <div
                key={s.id}
                className={"settings-nav-item" + (section === s.id ? " active" : "")}
                onClick={() => setSection(s.id)}
              >
                <Icon name={s.icon} size={15} /> {s.label}
              </div>
            ))}
          </div>
        </div>
        <div>
          {section === "general"       && <GeneralSettings />}
          {section === "hours"         && <HoursSettings />}
          {section === "payments"      && <PaymentSettings />}
          {section === "notifications" && <NotifSettings />}
          {section === "team"          && <TeamSettings />}
          {section === "integrations"  && <Integrations />}
          {section === "billing"       && <BillingSettings />}
        </div>
      </div>
    </div>
  );
}

function Toggle({ on, onClick }: { on: boolean; onClick: () => void }) {
  return <div className={"toggle" + (on ? " on" : "")} onClick={onClick} />;
}

function GeneralSettings() {
  return (
    <div>
      <div className="card">
        <SectionHead icon="building" title="Informations de l'établissement" />
        <div className="grid-2">
          <div className="field">
            <label className="field-label">Nom</label>
            <input className="input" defaultValue="Résidence Lagune Bleue" />
          </div>
          <div className="field">
            <label className="field-label">Type</label>
            <input className="input" defaultValue="Hôtel 4 étoiles" />
          </div>
          <div className="field" style={{ gridColumn: "span 2" }}>
            <label className="field-label">Adresse</label>
            <input className="input" defaultValue="Boulevard Lagunaire, Cocody, Abidjan" />
          </div>
          <div className="field">
            <label className="field-label">Téléphone réception</label>
            <input className="input" defaultValue="+225 27 22 48 75 60" />
          </div>
          <div className="field">
            <label className="field-label">Email contact</label>
            <input className="input" type="email" defaultValue="contact@residence-lagune.ci" />
          </div>
        </div>
      </div>
      <div className="card">
        <SectionHead icon="settings" title="Préférences générales" />
        <div className="row">
          <div>
            <div style={{ fontWeight: 600, fontSize: 14 }}>Devise par défaut</div>
            <div className="text-xs text-muted">Utilisée dans toute l&apos;app et les factures</div>
          </div>
          <select className="select" defaultValue="FCFA" style={{ width: 200 }}>
            <option>FCFA (XOF)</option>
            <option>EUR (€)</option>
            <option>USD ($)</option>
          </select>
        </div>
        <div className="row">
          <div>
            <div style={{ fontWeight: 600, fontSize: 14 }}>Fuseau horaire</div>
            <div className="text-xs text-muted">Abidjan, GMT+0</div>
          </div>
          <select className="select" defaultValue="Abidjan" style={{ width: 200 }}>
            <option>Abidjan (GMT+0)</option>
            <option>Dakar (GMT+0)</option>
            <option>Paris (GMT+2)</option>
          </select>
        </div>
        <div className="row">
          <div>
            <div style={{ fontWeight: 600, fontSize: 14 }}>Langue de l&apos;interface</div>
            <div className="text-xs text-muted">Pour vous et votre équipe</div>
          </div>
          <select className="select" defaultValue="FR" style={{ width: 200 }}>
            <option>Français</option>
            <option>English</option>
          </select>
        </div>
      </div>
    </div>
  );
}

function HoursSettings() {
  const [earlyIn,   setEarlyIn]   = useState(true);
  const [lateOut,   setLateOut]   = useState(true);
  const [autoOut,   setAutoOut]   = useState(false);
  const [h24,       setH24]       = useState(true);
  const [nightCode, setNightCode] = useState(true);
  return (
    <div>
      <div className="card">
        <SectionHead icon="clock" title="Horaires d'arrivée et de départ" />
        <div className="grid-2">
          <div className="field">
            <label className="field-label">Check-in officiel à partir de</label>
            <input className="input" type="time" defaultValue="14:00" />
          </div>
          <div className="field">
            <label className="field-label">Check-out officiel jusqu&apos;à</label>
            <input className="input" type="time" defaultValue="12:00" />
          </div>
        </div>
        <div className="divider" />
        <div className="row">
          <div>
            <div style={{ fontWeight: 600, fontSize: 14 }}>Check-in anticipé</div>
            <div className="text-xs text-muted">Avant 14h00 — selon disponibilité</div>
          </div>
          <div className="row-flex">
            <Toggle on={earlyIn} onClick={() => setEarlyIn(!earlyIn)} />
            <select className="select" style={{ width: 160 }}>
              <option>Gratuit</option>
              <option>+ 10 000 FCFA</option>
              <option>+ 50% nuit</option>
            </select>
          </div>
        </div>
        <div className="row">
          <div>
            <div style={{ fontWeight: 600, fontSize: 14 }}>Check-out tardif</div>
            <div className="text-xs text-muted">Après 12h00 — selon disponibilité</div>
          </div>
          <div className="row-flex">
            <Toggle on={lateOut} onClick={() => setLateOut(!lateOut)} />
            <select className="select" style={{ width: 160 }}>
              <option>Gratuit jusqu&apos;à 14h</option>
              <option>+ 10 000 FCFA</option>
              <option>+ 50% nuit</option>
            </select>
          </div>
        </div>
        <div className="row">
          <div>
            <div style={{ fontWeight: 600, fontSize: 14 }}>Auto check-out à l&apos;heure limite</div>
            <div className="text-xs text-muted">Marquer la chambre disponible automatiquement après l&apos;heure de départ</div>
          </div>
          <Toggle on={autoOut} onClick={() => setAutoOut(!autoOut)} />
        </div>
      </div>
      <div className="card">
        <SectionHead icon="users" title="Réception" />
        <div className="row">
          <div>
            <div style={{ fontWeight: 600, fontSize: 14 }}>Réception 24h/24</div>
            <div className="text-xs text-muted">Un agent est toujours présent</div>
          </div>
          <Toggle on={h24} onClick={() => setH24(!h24)} />
        </div>
        <div className="row">
          <div>
            <div style={{ fontWeight: 600, fontSize: 14 }}>Code d&apos;accès nuit</div>
            <div className="text-xs text-muted">Envoyé en WhatsApp aux clients arrivant après 22h</div>
          </div>
          <div className="row-flex">
            <Toggle on={nightCode} onClick={() => setNightCode(!nightCode)} />
            <code style={{ background: "var(--bg-2)", padding: "4px 10px", borderRadius: 6, fontFamily: "var(--mono)", fontSize: 12 }}>0473</code>
          </div>
        </div>
      </div>
    </div>
  );
}

function PaymentSettings() {
  const [states, setStates] = useState<Record<string, boolean>>({
    wave: true, om: true, mtn: true, card: true, cash: true,
  });
  const toggle = (id: string) => setStates(s => ({ ...s, [id]: !s[id] }));

  const payments = [
    { id: "wave", name: "Wave",           desc: "Numéro marchand : +225 07 58 42 33 19", color: "#1BA1F2", icon: "📱", fee: "0%"   },
    { id: "om",   name: "Orange Money",   desc: "Compte marchand actif",                 color: "#FF7900", icon: "🟧", fee: "1%"   },
    { id: "mtn",  name: "MTN Money",      desc: "Compte marchand actif",                 color: "#FFCC00", icon: "🟨", fee: "1,5%" },
    { id: "card", name: "Carte bancaire", desc: "Via Stripe + Wave Money",               color: "#2744DE", icon: "💳", fee: "2,5%" },
    { id: "cash", name: "Espèces",        desc: "Encaissement direct à la réception",    color: "#16A26B", icon: "💵", fee: "0%"   },
  ];

  return (
    <div>
      <div className="card">
        <SectionHead
          icon="creditCard"
          title="Modes de paiement acceptés"
          sub="Configuration des modes affichés au check-in et dans l'app"
        />
        {payments.map(p => (
          <div key={p.id} className="row">
            <div className="row-flex">
              <div style={{ width: 44, height: 32, borderRadius: 8, background: p.color, color: p.id === "mtn" ? "#000" : "#fff", display: "grid", placeItems: "center", fontSize: 18 }}>
                {p.icon}
              </div>
              <div>
                <div style={{ fontWeight: 600, fontSize: 14 }}>{p.name}</div>
                <div className="text-xs text-muted">{p.desc}</div>
              </div>
            </div>
            <div className="row-flex">
              <span className="text-sm text-muted">Frais {p.fee}</span>
              <button className="btn btn-ghost btn-sm"><Icon name="settings" size={13} /> Configurer</button>
              <Toggle on={states[p.id]} onClick={() => toggle(p.id)} />
            </div>
          </div>
        ))}
      </div>
      <div className="card">
        <SectionHead icon="moneyBill" title="Politique d'acompte" />
        <div className="grid-2">
          <div className="field">
            <label className="field-label">Acompte par défaut</label>
            <select className="select" defaultValue="30%">
              <option>0% (paiement intégral à l&apos;arrivée)</option>
              <option>30%</option>
              <option>50%</option>
              <option>100% (pré-paiement total)</option>
            </select>
          </div>
          <div className="field">
            <label className="field-label">Délai max pour régler le solde</label>
            <select className="select" defaultValue="checkin">
              <option value="checkin">Au check-in</option>
              <option>24h avant arrivée</option>
              <option>48h avant arrivée</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}

function NotifSettings() {
  const [clients, setClients] = useState([
    { e: "Confirmation de réservation",       c: ["WhatsApp", "SMS"],   on: true  },
    { e: "Rappel J-1 (avant arrivée)",        c: ["WhatsApp"],           on: true  },
    { e: "Lien check-in en ligne (J-1)",      c: ["WhatsApp"],           on: true  },
    { e: "Reçu de paiement",                  c: ["WhatsApp", "Email"],  on: true  },
    { e: "Demande d'avis (J+1 après départ)", c: ["WhatsApp"],           on: false },
    { e: "Promotion anniversaire",            c: ["WhatsApp"],           on: false },
  ]);
  return (
    <div>
      <div className="card" style={{ background: "var(--text)", color: "#fff", borderColor: "transparent" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ width: 50, height: 50, borderRadius: 12, background: "rgba(255,255,255,0.2)", display: "grid", placeItems: "center", fontSize: 24 }}>💬</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 11, opacity: 0.85, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em" }}>Canal principal</div>
            <div style={{ fontSize: 18, fontWeight: 700 }}>WhatsApp Business</div>
            <div style={{ fontSize: 12, opacity: 0.9 }}>Connecté au +225 27 22 48 75 60 · 1 247 messages envoyés ce mois</div>
          </div>
          <button className="btn" style={{ background: "rgba(255,255,255,0.2)", color: "#fff" }}><Icon name="settings" size={14} /> Gérer</button>
        </div>
      </div>
      <div className="card">
        <SectionHead icon="bell" title="Notifications clients automatiques" />
        {clients.map((n, i) => (
          <div key={i} className="row">
            <div className="row-flex" style={{ flex: 1 }}>
              <div style={{ width: 8, height: 8, borderRadius: 4, background: n.on ? "var(--success)" : "var(--text-4)", flexShrink: 0 }} />
              <div>
                <div style={{ fontWeight: 600, fontSize: 13.5 }}>{n.e}</div>
                <div className="text-xs text-muted">{n.c.join(" + ")}</div>
              </div>
            </div>
            <div className="row-flex">
              <button className="btn btn-text btn-sm">Modèle</button>
              <div
                className={"toggle" + (n.on ? " on" : "")}
                onClick={() => setClients(ns => ns.map((x, j) => j === i ? { ...x, on: !x.on } : x))}
              />
            </div>
          </div>
        ))}
      </div>
      <div className="card">
        <SectionHead icon="users" title="Notifications équipe" />
        {[
          { l: "Nouvelle réservation reçue",  s: "Toast + notification push",          on: true },
          { l: "Annulation",                  s: "Email au gérant",                    on: true },
          { l: "Avis client laissé",          s: "Surtout si moins de 4 étoiles",     on: true },
        ].map((n, i) => (
          <div key={i} className="row">
            <div>
              <div style={{ fontWeight: 600, fontSize: 14 }}>{n.l}</div>
              <div className="text-xs text-muted">{n.s}</div>
            </div>
            <div className={"toggle" + (n.on ? " on" : "")} onClick={() => {}} />
          </div>
        ))}
      </div>
    </div>
  );
}

function TeamSettings() {
  const team = [
    { name: "Aïcha Diabaté",  role: "Gérante",      perms: "Tout",                                    last: "À l'instant",   av: 1 },
    { name: "Mariam Yoboué",  role: "Réception",    perms: "PMS + Clients + Finances (lecture)",      last: "Il y a 12 min", av: 2 },
    { name: "Aminata Koffi",  role: "Housekeeping", perms: "Chambres + Tâches uniquement",            last: "Il y a 1h",     av: 4 },
    { name: "Jean-Marc Brou", role: "Technique",    perms: "Chambres (HS) uniquement",                last: "Hier",          av: 3 },
    { name: "Claude Akwaba",  role: "Comptable",    perms: "Finances + Exports",                      last: "Il y a 3 jours",av: 5 },
  ];
  return (
    <div className="card">
      <SectionHead
        icon="users"
        title="Équipe & rôles"
        right={<button className="btn btn-primary btn-sm"><Icon name="plus" size={13} /> Inviter</button>}
      />
      <table className="tbl">
        <thead>
          <tr>
            <th>Membre</th>
            <th>Rôle</th>
            <th>Permissions</th>
            <th>Dernière connexion</th>
            <th>Statut</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {team.map((m, i) => (
            <tr key={i}>
              <td>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div className={"av av-" + m.av} style={{ width: 32, height: 32, fontSize: 12 }}>
                    {m.name.split(" ").map(x => x[0]).join("").slice(0, 2)}
                  </div>
                  <div style={{ fontWeight: 600 }}>{m.name}</div>
                </div>
              </td>
              <td><Pill kind="primary">{m.role}</Pill></td>
              <td className="text-sm text-muted">{m.perms}</td>
              <td className="text-sm">{m.last}</td>
              <td><Pill kind="success" dot>Actif</Pill></td>
              <td><button className="btn-icon"><Icon name="edit" size={13} /></button></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Integrations() {
  const list = [
    { n: "Booking.com",     d: "Sync calendrier et tarifs",     on: true,  c: "#003580", i: "B" },
    { n: "Airbnb",          d: "Channel manager",               on: false, c: "#FF5A5F", i: "A" },
    { n: "Google Business", d: "Visibilité local search",       on: true,  c: "#4285F4", i: "G" },
    { n: "TripAdvisor",     d: "Reviews et statistiques",       on: false, c: "#00AF87", i: "T" },
    { n: "QuickBooks",      d: "Export comptable automatique",  on: false, c: "#2CA01C", i: "Q" },
    { n: "WhatsApp API",    d: "Notifications & confirmations", on: true,  c: "#25D366", i: "W" },
  ];
  return (
    <div className="card">
      <SectionHead icon="layers" title="Intégrations" sub="Connectez Immo Plus à vos outils existants" />
      <div className="grid-2">
        {list.map((p, i) => (
          <div key={i} className="row" style={{ margin: 0 }}>
            <div className="row-flex">
              <div style={{ width: 40, height: 40, borderRadius: 10, background: p.c, color: "#fff", display: "grid", placeItems: "center", fontSize: 16, fontWeight: 800 }}>{p.i}</div>
              <div>
                <div style={{ fontWeight: 600, fontSize: 14 }}>{p.n}</div>
                <div className="text-xs text-muted">{p.d}</div>
              </div>
            </div>
            {p.on
              ? <Pill kind="success" dot>Connecté</Pill>
              : <button className="btn btn-soft btn-sm">Connecter</button>}
          </div>
        ))}
      </div>
    </div>
  );
}

function BillingSettings() {
  const invoices: [string, number, number][] = [
    ["Avril 2026",   12540000, 1003200],
    ["Mars 2026",    11820000, 945600],
    ["Février 2026", 9450000,  756000],
    ["Janvier 2026", 8230000,  658400],
  ];
  return (
    <div>
      <div className="card" style={{ background: "var(--text)", color: "#fff", borderColor: "transparent" }}>
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 20 }}>
          <div>
            <div style={{ fontSize: 11, opacity: 0.85, fontWeight: 600, letterSpacing: "0.04em", textTransform: "uppercase" }}>Formule actuelle</div>
            <div style={{ fontSize: 28, fontWeight: 800, marginTop: 4 }}>Immo Plus Pro · Hôtel</div>
            <div style={{ fontSize: 13, opacity: 0.9, marginTop: 6 }}>Commission 8% par réservation · 0 frais fixes · Support WhatsApp dédié</div>
          </div>
          <button className="btn" style={{ background: "rgba(255,255,255,0.2)", color: "#fff" }}>Comparer les formules</button>
        </div>
      </div>
      <div className="card">
        <SectionHead icon="moneyBill" title="Compte de virement" />
        <div className="row">
          <div className="row-flex">
            <div style={{ width: 44, height: 30, borderRadius: 6, background: "#1BA1F2", color: "#fff", display: "grid", placeItems: "center", fontSize: 14, fontWeight: 700 }}>W</div>
            <div>
              <div style={{ fontWeight: 600, fontSize: 14 }}>Wave Business · +225 07 58 42 33 19</div>
              <div className="text-xs text-muted">Aïcha Diabaté · vérifié</div>
            </div>
          </div>
          <Pill kind="success" dot>Compte principal</Pill>
        </div>
        <button className="btn btn-soft btn-sm" style={{ marginTop: 10 }}><Icon name="plus" size={13} /> Ajouter un compte secondaire</button>
      </div>
      <div className="card">
        <SectionHead icon="fileText" title="Factures Immo Plus" />
        <table className="tbl">
          <thead>
            <tr><th>Mois</th><th>Volume résa</th><th>Commission</th><th>Statut</th><th></th></tr>
          </thead>
          <tbody>
            {invoices.map(([m, v, c], i) => (
              <tr key={i}>
                <td style={{ fontWeight: 600 }}>{m}</td>
                <td className="text-num">{formatFCFA(v)}</td>
                <td className="text-num" style={{ fontWeight: 700, color: "var(--primary)" }}>{formatFCFA(c)}</td>
                <td><Pill kind="success" dot>Payée</Pill></td>
                <td><button className="btn-icon"><Icon name="download" size={13} /></button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
