import Link from "next/link";

export default function Home() {
  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#F6F5F1", fontFamily: "-apple-system, BlinkMacSystemFont, sans-serif" }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ width: 60, height: 60, borderRadius: 16, background: "#2744DE", color: "#fff", display: "grid", placeItems: "center", fontSize: 22, fontWeight: 700, margin: "0 auto 20px" }}>i+</div>
        <div style={{ fontSize: 28, fontWeight: 700, letterSpacing: "-0.02em", color: "#11110F" }}>Immo Plus PMS</div>
        <div style={{ fontSize: 14, color: "#87867E", marginTop: 6, marginBottom: 32 }}>Property Management System · Côte d&apos;Ivoire</div>
        <Link
          href="/inscription"
          style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            background: "#2744DE", color: "#fff",
            padding: "12px 24px", borderRadius: 12,
            fontSize: 14, fontWeight: 600,
            textDecoration: "none",
          }}
        >
          Inscription hôtelier →
        </Link>
      </div>
    </div>
  );
}
