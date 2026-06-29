interface FcfaProps {
  value: number | string;
}

export function Fcfa({ value }: FcfaProps) {
  return (
    <span className="font-bold tabular-nums">
      {Number(value).toLocaleString("fr-FR")}
      {" "}
      <span className="text-[0.7em] text-ink-3 font-semibold">FCFA</span>
    </span>
  );
}
