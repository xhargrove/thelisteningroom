"use client";

import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { formatAuthSignInError } from "@/lib/auth/format-auth-sign-in-error";
import { isAdminUser } from "@/lib/auth/is-admin";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

export function AdminLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextPath = searchParams.get("next") ?? "/admin";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setPending(true);

    const supabase = createSupabaseBrowserClient();

    const { data, error: signError } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (signError) {
      setError(formatAuthSignInError(signError));
      setPending(false);
      return;
    }

    if (!data.user || !isAdminUser(data.user)) {
      await supabase.auth.signOut();
      const configured = Boolean(process.env.NEXT_PUBLIC_ADMIN_EMAIL?.trim());
      setError(
        configured
          ? "This account does not have admin access. Use the same email as NEXT_PUBLIC_ADMIN_EMAIL, or set App Metadata role to admin for this user in Supabase."
          : "This account does not have admin access. Set NEXT_PUBLIC_ADMIN_EMAIL to your sign-in email in .env (and Vercel for production), restart the dev server, then sign in again—or set role \"admin\" under App Metadata in Supabase.",
      );
      setPending(false);
      return;
    }

    router.replace(nextPath.startsWith("/") ? nextPath : "/admin");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="mt-8 space-y-5">
      {searchParams.get("error") === "forbidden" ? (
        <p
          className="rounded-lg border border-amber-500/30 bg-amber-950/30 px-4 py-3 text-sm text-amber-100"
          role="alert"
        >
          Admin access only. Sign in with the configured admin email or an account with admin role.
        </p>
      ) : null}

      {error ? (
        <p className="rounded-lg border border-red-500/30 bg-red-950/30 px-4 py-3 text-sm text-red-200" role="alert">
          {error}
        </p>
      ) : null}

      <div>
        <label htmlFor="admin-email" className="block text-sm font-medium text-zinc-300">
          Email
        </label>
        <input
          id="admin-email"
          name="email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          disabled={pending}
          className="mt-2 w-full rounded-lg border border-accent-dim/30 bg-night-card px-4 py-3 text-white placeholder:text-zinc-600 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent disabled:opacity-50"
        />
      </div>

      <div>
        <label htmlFor="admin-password" className="block text-sm font-medium text-zinc-300">
          Password
        </label>
        <input
          id="admin-password"
          name="password"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          disabled={pending}
          className="mt-2 w-full rounded-lg border border-accent-dim/30 bg-night-card px-4 py-3 text-white placeholder:text-zinc-600 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent disabled:opacity-50"
        />
      </div>

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-lg bg-accent px-4 py-3 text-sm font-semibold text-black transition hover:bg-yellow-300 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
