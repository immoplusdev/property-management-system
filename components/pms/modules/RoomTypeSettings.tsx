"use client";

import { useState } from "react";
import { Button, Input, SectionHead, Skeleton, toastPromise } from "../shared";
import { useCreateRoomType, useRoomTypes, useUpdateRoomType } from "@/lib/hooks/pms/useRoomTypes";
import type { RoomTypeDto } from "@/lib/api/pms/room-types.actions";

type Season = { fromDate: string; toDate: string; price: string };

function RateEditor({ roomType }: { roomType: RoomTypeDto }) {
  const update = useUpdateRoomType();
  const [editing, setEditing] = useState(false);
  const [basePrice, setBasePrice] = useState(String(roomType.basePrice));
  const [weekendPrice, setWeekendPrice] = useState(roomType.weekendPrice == null ? "" : String(roomType.weekendPrice));
  const [longStayPrice, setLongStayPrice] = useState(roomType.longStayPrice == null ? "" : String(roomType.longStayPrice));
  const [longStayMinNights, setLongStayMinNights] = useState(String(roomType.longStayMinNights ?? 7));
  const [seasons, setSeasons] = useState<Season[]>(roomType.seasonalRates.map(rate => ({ ...rate, price: String(rate.price) })));
  const [error, setError] = useState("");

  function reset() {
    setBasePrice(String(roomType.basePrice));
    setWeekendPrice(roomType.weekendPrice == null ? "" : String(roomType.weekendPrice));
    setLongStayPrice(roomType.longStayPrice == null ? "" : String(roomType.longStayPrice));
    setLongStayMinNights(String(roomType.longStayMinNights ?? 7));
    setSeasons(roomType.seasonalRates.map(rate => ({ ...rate, price: String(rate.price) })));
    setError("");
    setEditing(false);
  }

  async function save() {
    const base = Number(basePrice);
    const weekend = weekendPrice ? Number(weekendPrice) : null;
    const longStay = longStayPrice ? Number(longStayPrice) : null;
    const minimum = Number(longStayMinNights);
    if (!Number.isInteger(base) || base <= 0 ||
      (weekend !== null && (!Number.isInteger(weekend) || weekend <= 0)) ||
      (longStay !== null && (!Number.isInteger(longStay) || longStay <= 0)) ||
      !Number.isInteger(minimum) || minimum < 2 || minimum > 90 ||
      seasons.some(s => !s.fromDate || !s.toDate || s.fromDate > s.toDate || !Number.isInteger(Number(s.price)) || Number(s.price) <= 0)) {
      setError("Vérifiez les montants, les dates et le minimum du long séjour (2 à 90 nuits).");
      return;
    }
    const ordered = [...seasons].sort((a, b) => a.fromDate.localeCompare(b.fromDate));
    if (ordered.some((s, index) => index > 0 && ordered[index - 1].toDate >= s.fromDate)) {
      setError("Les périodes saisonnières ne doivent pas se chevaucher.");
      return;
    }
    setError("");
    try {
      await toastPromise(update.mutateAsync({ id: roomType.id, payload: {
        basePrice: base, weekendPrice: weekend, longStayPrice: longStay,
        longStayMinNights: minimum,
        seasonalRates: seasons.map(s => ({ fromDate: s.fromDate, toDate: s.toDate, price: Number(s.price) })),
      } }), { loading: "Enregistrement des tarifs…", success: "Tarifs enregistrés", error: e => (e as Error).message });
      setEditing(false);
    } catch { /* toast affiché */ }
  }

  return <div className="p-4 border border-border rounded-xl grid gap-3">
    <div className="flex items-start justify-between gap-4">
      <div><strong>{roomType.name}</strong><div className="text-xs text-ink-3">{roomType.roomCount} chambres · {roomType.maxOccupancy} personnes maximum</div></div>
      {!editing && <Button variant="ghost" size="sm" onClick={() => setEditing(true)}>Modifier</Button>}
    </div>
    {editing ? <>
      <div className="grid gap-3 md:grid-cols-2">
        <Input label="Tarif de base (FCFA / nuit)" type="number" min="1" value={basePrice} onChange={e => setBasePrice(e.target.value)} />
        <Input label="Tarif week-end (facultatif)" type="number" min="1" value={weekendPrice} onChange={e => setWeekendPrice(e.target.value)} />
        <Input label="Tarif long séjour (facultatif)" type="number" min="1" value={longStayPrice} onChange={e => setLongStayPrice(e.target.value)} />
        <Input label="Long séjour à partir de (nuits)" type="number" min="2" max="90" value={longStayMinNights} onChange={e => setLongStayMinNights(e.target.value)} />
      </div>
      <div className="text-sm font-semibold">Périodes saisonnières</div>
      {seasons.map((season, index) => <div key={index} className="grid gap-2 md:grid-cols-[1fr_1fr_1fr_auto] items-end">
        <Input label="Du" type="date" value={season.fromDate} onChange={e => setSeasons(current => current.map((s, i) => i === index ? { ...s, fromDate: e.target.value } : s))} />
        <Input label="Au (inclus)" type="date" value={season.toDate} onChange={e => setSeasons(current => current.map((s, i) => i === index ? { ...s, toDate: e.target.value } : s))} />
        <Input label="Prix (FCFA)" type="number" min="1" value={season.price} onChange={e => setSeasons(current => current.map((s, i) => i === index ? { ...s, price: e.target.value } : s))} />
        <Button variant="ghost" size="sm" onClick={() => setSeasons(current => current.filter((_, i) => i !== index))}>Retirer</Button>
      </div>)}
      <Button variant="ghost" size="sm" onClick={() => setSeasons(current => [...current, { fromDate: "", toDate: "", price: "" }])}>Ajouter une période</Button>
      {error && <p role="alert" className="text-sm text-danger">{error}</p>}
      <div className="flex gap-2"><Button variant="primary" size="sm" disabled={update.isPending} onClick={save}>Enregistrer les tarifs</Button><Button variant="ghost" size="sm" onClick={reset}>Annuler</Button></div>
    </> : <div className="text-sm text-ink-2">
      <span className="font-semibold">{roomType.basePrice.toLocaleString("fr-FR")} FCFA / nuit</span>
      {roomType.weekendPrice != null && <span> · Week-end {roomType.weekendPrice.toLocaleString("fr-FR")} FCFA</span>}
      {roomType.longStayPrice != null && <span> · Long séjour {roomType.longStayPrice.toLocaleString("fr-FR")} FCFA dès {roomType.longStayMinNights} nuits</span>}
      {roomType.seasonalRates.length > 0 && <ul className="mt-2 grid gap-1">{roomType.seasonalRates.map(rate => <li key={rate.id ?? `${rate.fromDate}-${rate.toDate}`}>{rate.fromDate} au {rate.toDate} : {rate.price.toLocaleString("fr-FR")} FCFA</li>)}</ul>}
    </div>}
  </div>;
}

export function RoomTypeSettings({ section }: { section: "rooms" | "rates" }) {
  const query = useRoomTypes();
  const create = useCreateRoomType();
  const [adding, setAdding] = useState(false);
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [occupancy, setOccupancy] = useState("2");
  const [price, setPrice] = useState("");
  const [error, setError] = useState("");

  async function saveNew() {
    const maxOccupancy = Number(occupancy);
    const basePrice = Number(price);
    if (!/^[A-Z0-9_]{2,20}$/.test(code) || name.trim().length < 2 || !Number.isInteger(maxOccupancy) || maxOccupancy < 1 || maxOccupancy > 20 || !Number.isInteger(basePrice) || basePrice <= 0) {
      setError("Code : 2 à 20 lettres majuscules, chiffres ou _. Nom, capacité et tarif positif requis.");
      return;
    }
    setError("");
    try {
      await toastPromise(create.mutateAsync({ code, name: name.trim(), maxOccupancy, basePrice }), { loading: "Création du type…", success: "Type de chambre créé", error: e => (e as Error).message });
      setAdding(false); setCode(""); setName(""); setOccupancy("2"); setPrice("");
    } catch { /* toast affiché */ }
  }

  return <div className="grid gap-3">
    <SectionHead icon={section === "rooms" ? "list" : "moneyBill"} title={section === "rooms" ? "Types de chambre" : "Tarifs des chambres"} sub={section === "rooms" ? "Catégories et capacité" : "Tarifs de base, week-end, long séjour et saisons"} />
    {section === "rooms" && <>
      <Button variant="primary" size="sm" onClick={() => setAdding(value => !value)}>{adding ? "Fermer" : "Ajouter un type de chambre"}</Button>
      {adding && <div className="p-4 border border-border rounded-xl grid gap-3">
        <div className="grid gap-3 md:grid-cols-2">
          <Input label="Code" value={code} maxLength={20} onChange={e => setCode(e.target.value.toUpperCase())} />
          <Input label="Nom" value={name} onChange={e => setName(e.target.value)} />
          <Input label="Capacité maximale" type="number" min="1" max="20" value={occupancy} onChange={e => setOccupancy(e.target.value)} />
          <Input label="Tarif de base (FCFA / nuit)" type="number" min="1" value={price} onChange={e => setPrice(e.target.value)} />
        </div>
        {error && <p role="alert" className="text-sm text-danger">{error}</p>}
        <Button variant="primary" size="sm" disabled={create.isPending} onClick={saveNew}>Créer le type</Button>
      </div>}
    </>}
    {query.isLoading ? <Skeleton className="h-32" /> : query.isError ? <p role="alert" className="text-sm text-danger">{(query.error as Error).message}</p> : query.data?.length ? query.data.map(type => section === "rates" ? <RateEditor key={type.id} roomType={type} /> : <div key={type.id} className="p-4 border border-border rounded-xl flex items-start justify-between gap-4"><div><strong>{type.name}</strong> <span className="text-xs text-ink-3">({type.code})</span><div className="text-xs text-ink-3">{type.roomCount} chambres · {type.maxOccupancy} personnes maximum</div>{type.amenities.length > 0 && <div className="text-xs text-ink-3 mt-1">{type.amenities.join(" · ")}</div>}</div><span className="text-sm font-semibold">{type.basePrice.toLocaleString("fr-FR")} FCFA / nuit</span></div>) : <p className="text-sm text-ink-3">Aucun type de chambre configuré.</p>}
  </div>;
}
