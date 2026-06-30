import Image from "next/image";

interface LogoProps {
  size?: "sm" | "md" | "lg";
  showHover?: boolean;
}

export function Logo({ size = "md", showHover = true }: LogoProps) {
  const sizeMap = {
    sm: { width: 36, height: 36, container: "w-9 h-9" },
    md: { width: 40, height: 40, container: "w-10 h-10" },
    lg: { width: 54, height: 54, container: "w-13.5 h-13.5" },
  };

  const config = sizeMap[size];

  return (
    <div
      className={`${config.container} rounded-full overflow-hidden grid place-items-center bg-primary  ${showHover ? "transition-transform duration-200 hover:scale-105" : ""}`}
      title="Immo Plus App"
    >
      <Image
        src="/logo-immoplus.png"
        alt="Logo Immo Plus"
        width={config.width}
        height={config.height}
        className="w-full h-full object-cover"
      />
    </div>
  );
}
