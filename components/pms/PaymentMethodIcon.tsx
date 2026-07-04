import Image from "next/image";
import { Wallet } from "iconsax-react";
import { cn } from "@/lib/utils/cn";

interface PaymentMethodIconProps {
  method: "wave" | "om" | "mtn" | "card" | "cash";
  size?: "sm" | "md" | "lg";
  label?: boolean;
}

const sizeMap = {
  sm: { container: "w-6 h-6", fontSize: "text-[9px]" },
  md: { container: "w-8 h-8", fontSize: "text-[10px]" },
  lg: { container: "w-10 h-10", fontSize: "text-[11px]" },
};

type MethodConfig = {
  label: string;
  image?: string;
  icon?: boolean;
  bg?: string;
  color?: string;
};

const methodConfig: Record<"wave" | "om" | "mtn" | "card" | "cash", MethodConfig> = {
  wave: { label: "Wave", image: "/wave.png" },
  om: { label: "Orange Money", image: "/om.png" },
  mtn: { label: "Moov", image: "/moov.png" },
  card: { label: "Carte", bg: "var(--color-primary)", color: "var(--color-surface)" },
  cash: { label: "Espèces", icon: true, bg: "var(--color-success)", color: "var(--color-surface)" },
};

export function PaymentMethodIcon({ method, size = "md", label }: PaymentMethodIconProps) {
  const config = sizeMap[size];
  const methodInfo = methodConfig[method];

  if ("image" in methodInfo && methodInfo.image) {
    return (
      <div className={cn("relative shrink-0", config.container)} title={methodInfo.label}>
        <Image
          src={methodInfo.image}
          alt={methodInfo.label}
          fill
          className="object-contain"
          sizes={size === "sm" ? "24px" : size === "md" ? "32px" : "40px"}
        />
        {label && <span className="text-[10px] font-medium mt-1">{methodInfo.label}</span>}
      </div>
    );
  }

  if ("icon" in methodInfo && methodInfo.icon) {
    return (
      <div
        className={cn(
          "rounded-[6px] grid place-items-center shrink-0",
          config.container
        )}
        style={{ background: methodInfo.bg, color: methodInfo.color }}
        title={methodInfo.label}
      >
        <Wallet size={size === "sm" ? 14 : size === "md" ? 16 : 20} />
        {label && <span className="text-[10px] font-medium mt-1">{methodInfo.label}</span>}
      </div>
    );
  }

  // Fallback for card (text badge)
  return (
    <div
      className={cn(
        "rounded-[6px] grid place-items-center font-bold shrink-0",
        config.container,
        config.fontSize
      )}
      style={{ background: methodInfo.bg ?? "var(--color-border-strong)", color: methodInfo.color ?? "var(--color-ink)" }}
      title={methodInfo.label}
    >
      {method.toUpperCase().slice(0, 2)}
      {label && <span className="text-[10px] font-medium mt-1">{methodInfo.label}</span>}
    </div>
  );
}
