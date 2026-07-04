"use client";
import React, { useEffect } from "react";
import { usePathname } from "next/navigation";
import { PMSSidebar } from "./PMSSidebar";
import { ToastProvider } from "./shared";
import { usePmsSocket } from "@/lib/hooks/pms/usePmsSocket";
import type { UserDto } from "@/lib/api/generated/model";

export function PMSShell({ user, hotelName, children }: { user: UserDto | null; hotelName: string; children: React.ReactNode }) {
  const pathname = usePathname();

  usePmsSocket();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [pathname]);

  return (
    <ToastProvider>
      <div className="flex min-h-screen bg-surface text-ink font-sans antialiased tracking-[-0.006em] font-features-['ss01','cv11']">
        <PMSSidebar user={user} hotelName={hotelName} />
        <main className="flex-1 min-w-0 px-9 pt-7 pb-15">
          {children}
        </main>
      </div>
    </ToastProvider>
  );
}
