import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AdminLogoutButton } from "@/components/admin/admin-logout-button";
import { DashboardNav } from "@/components/admin/dashboard-nav";
import { DashboardStats } from "@/components/admin/dashboard-stats";
import { DashboardTables } from "@/components/admin/dashboard-tables";
import { isAdminUser } from "@/lib/auth/is-admin";
import { loadAdminDashboard } from "@/lib/admin/load-dashboard";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || !isAdminUser(user)) {
    redirect("/admin/login");
  }

  const dashboard = await loadAdminDashboard(supabase);

  const muxUploadEnabled = Boolean(
    process.env.MUX_TOKEN_ID?.trim() && process.env.MUX_TOKEN_SECRET?.trim(),
  );

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
      <div className="flex flex-col gap-4 border-b border-accent-dim/20 pb-8 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">Dashboard</h1>
          <p className="mt-2 text-sm text-zinc-500">{user.email}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            <a
              href="/admin/export/emails"
              className="inline-flex items-center rounded-md border border-accent-dim/40 px-3 py-1.5 text-sm font-medium text-zinc-200 transition hover:border-accent/60 hover:text-white"
            >
              Export emails CSV
            </a>
            <a
              href="/admin/export/mixes"
              className="inline-flex items-center rounded-md border border-accent-dim/40 px-3 py-1.5 text-sm font-medium text-zinc-200 transition hover:border-accent/60 hover:text-white"
            >
              Export mixes CSV
            </a>
          </div>
        </div>
        <AdminLogoutButton />
      </div>

      {dashboard.loadError ? (
        <p className="mt-6 rounded-lg border border-amber-500/30 bg-amber-950/25 px-4 py-3 text-sm text-amber-100">
          {dashboard.loadError}
        </p>
      ) : null}

      <div className="mt-8 space-y-6">
        <DashboardStats stats={dashboard.stats} />
        <DashboardNav />
      </div>

      <DashboardTables data={dashboard} muxUploadEnabled={muxUploadEnabled} />
    </div>
  );
}
