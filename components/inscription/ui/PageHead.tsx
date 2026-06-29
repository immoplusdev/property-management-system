interface PageHeadProps {
  eyebrow: string;
  title: string;
  desc?: string;
}

/** Step header: eyebrow (with leading rule), balanced title, descriptive lede. */
export function PageHead({ eyebrow, title, desc }: PageHeadProps) {
  return (
    <div className="mb-9">
      <div className="flex items-center gap-3 text-[10px] font-bold tracking-[0.18em] uppercase text-ink-3 mb-4.5 before:content-[''] before:w-5 before:h-px before:bg-primary before:rounded-px before:shrink-0">
        {eyebrow}
      </div>
      <h1 className="text-[38px] font-extrabold tracking-[-0.048em] leading-[1.05] m-0 mb-3 text-ink text-balance">
        {title}
      </h1>
      {desc && <p className="text-[14px] text-ink-3 leading-[1.7] max-w-[560px] m-0 text-pretty">{desc}</p>}
    </div>
  );
}
