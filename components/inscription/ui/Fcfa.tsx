interface FcfaProps {
  value: number | string;
}

export function Fcfa({ value }: FcfaProps) {
  return (
    <span className="text-num">
      {Number(value).toLocaleString("fr-FR")}
      {" "}
      <span className="fcfa-unit">FCFA</span>
    </span>
  );
}
