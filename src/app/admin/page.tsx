import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AdminLogoutButton } from "@/components/admin/admin-logout-button";
import { DashboardNav } from "@/components/admin/dashboard-nav";
import { DashboardStats } from "@/components/admin/dashboard-stats";
import { DashboardTables } from "@/components/admin/dashboard-tables";
import { isAdminUser } from "@/lib/auth/is-admin";
import { loadAdminDashboard } from "@/lib/admin/load-dashboard";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseServiceRoleClient } from "@/lib/supabase/service";

export const metadata: Metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

function AdminDeployHint() {
  const sha = process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7);
  const env = process.env.VERCEL_ENV;
  if (!sha) {
    return (
      <p className="rounded-lg border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-zinc-400">
        <span className="font-medium text-zinc-200">Local dev.</span> Production shows a 7-character{" "}
        <strong className="text-zinc-100">build id</strong> here so you can confirm Vercel matches Git (
        <code className="text-zinc-300">git rev-parse --short HEAD</code>).
      </p>
    );
  }
  return (
    <p className="rounded-lg border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-zinc-400">
      <span className="font-medium text-zinc-200">Deployed build {sha}</span>
      {env ? (
        <>
          {" "}
          <span className="text-zinc-500">({env})</span>
        </>
      ) : null}
      . If the admin tables look read-only, compare this id to your latest GitHub commit; redeploy from
      Vercel if it is behind.
    </p>
  );
}

export default async function AdminPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || !isAdminUser(user)) {
    redirect("/admin/login");
  }

  const adminDb = createSupabaseServiceRoleClient();
  const dashboard = await loadAdminDashboard(adminDb);

  const muxUploadEnabled = Boolean(
    process.env.MUX_TOKEN_ID?.trim() && process.env.MUX_TOKEN_SECRET?.trim(),
  );

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
      <div className="flex flex-col gap-4 border-b border-white/10 pb-8 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">Dashboard</h1>
          <p className="mt-2 text-sm text-zinc-400">{user.email}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            <a
              href="/admin/export/emails"
              className="ui-btn-ghost inline-flex items-center px-3 py-1.5"
            >
              Export emails CSV
            </a>
            <a
              href="/admin/export/mixes"
              className="ui-btn-ghost inline-flex items-center px-3 py-1.5"
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
        <p className="text-sm leading-relaxed text-zinc-400">
          Manager tables are wide: scroll horizontally (trackpad swipe or shift + mouse wheel) to reach
          every column, including <span className="text-zinc-200">Save</span>. Editable cells use light
          (zinc) input fields.
        </p>
        <AdminDeployHint />
      </div>

      <DashboardTables data={dashboard} muxUploadEnabled={muxUploadEnabled} />
    </div>
  );
}
