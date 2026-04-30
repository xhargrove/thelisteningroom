import type { ReactNode } from "react";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

export function PageShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-night">
      <SiteHeader />
      <main className="flex-1 pt-2 sm:pt-3">{children}</main>
      <SiteFooter />
    </div>
  );
}
