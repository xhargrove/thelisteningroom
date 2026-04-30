import type { Metadata } from "next";
import { Suspense } from "react";
import { AdminLoginForm } from "@/components/admin/admin-login-form";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Admin login",
  robots: { index: false, follow: false },
};

function LoginFormFallback() {
  return (
    <div className="mt-8 h-64 animate-pulse rounded-lg bg-night-elevated/80" aria-hidden />
  );
}

export default function AdminLoginPage() {
  return (
    <div className="mx-auto max-w-md px-4 py-16 sm:px-6 sm:py-24">
      <p className="text-center text-xs font-semibold uppercase tracking-[0.2em] text-accent-muted">
        Staff
      </p>
      <h1 className="mt-2 text-center text-2xl font-bold tracking-tight text-white sm:text-3xl">
        Admin sign in
      </h1>
      <p className="mt-2 text-center text-sm text-zinc-500">
        The Listening Room — authorized users only.
      </p>

      <Suspense fallback={<LoginFormFallback />}>
        <AdminLoginForm />
      </Suspense>

      <p className="mt-8 text-center text-sm text-zinc-600">
        <Link href="/" className="text-zinc-400 hover:text-accent">
          ← Back to site
        </Link>
      </p>
    </div>
  );
}
