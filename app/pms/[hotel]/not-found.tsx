import Link from "next/link";

export default function PmsNotFound() {
  return (
    <div className="flex flex-col items-center justify-center text-center gap-3 py-24">
      <h2 className="text-[18px] font-semibold text-ink m-0">Page introuvable</h2>
      <p className="text-[14px] text-ink-3 m-0 max-w-[420px]">
        Cette page n&apos;existe pas dans le PMS. Vérifiez le lien ou revenez au tableau de bord.
      </p>
      <Link
        href="/pms"
        className="mt-2 inline-flex items-center justify-center h-10 px-5 rounded-full bg-primary text-white font-semibold text-[13.5px] cursor-pointer transition-colors hover:bg-primary-600"
      >
        Retour au tableau de bord
      </Link>
    </div>
  );
}
