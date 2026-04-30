"use client";

import { useActionState, useEffect, useRef } from "react";
import { subscribeEmail } from "@/app/actions/email-signup";
import { EMAIL_ROLE_OPTIONS } from "@/lib/email-signup/roles";
import type { EmailSignupState } from "@/lib/email-signup/types";

const initialState: EmailSignupState = {
  success: false,
  error: null,
  fieldErrors: {},
};

export function EmailSignupForm() {
  const [state, formAction, isPending] = useActionState(subscribeEmail, initialState);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.success) {
      formRef.current?.reset();
    }
  }, [state.success]);

  return (
    <section
      className="border-t border-accent-dim/25 bg-night-elevated/80 py-14 sm:py-16"
      aria-labelledby="email-signup-heading"
    >
      <div className="mx-auto max-w-md px-4 sm:px-6">
        <h2
          id="email-signup-heading"
          className="text-center text-2xl font-bold tracking-tight text-white sm:text-3xl"
        >
          Stay in the loop
        </h2>
        <p className="mt-2 text-center text-sm text-zinc-400">
          Get updates on mixes, events, and nights at The Listening Room.
        </p>

        <form
          ref={formRef}
          action={formAction}
          className="mt-8 space-y-5"
          noValidate
        >
          {state.success ? (
            <p
              className="rounded-lg border border-accent/40 bg-accent/10 px-4 py-3 text-center text-sm font-medium text-accent"
              role="status"
              aria-live="polite"
            >
              You&apos;re on the list. See you in the room.
            </p>
          ) : null}

          {state.error ? (
            <p
              className="rounded-lg border border-red-500/40 bg-red-950/40 px-4 py-3 text-center text-sm text-red-200"
              role="alert"
              aria-live="assertive"
            >
              {state.error}
            </p>
          ) : null}

          <div>
            <label htmlFor="signup-name" className="block text-sm font-medium text-zinc-300">
              Name
            </label>
            <input
              id="signup-name"
              name="name"
              type="text"
              autoComplete="name"
              required
              disabled={isPending}
              aria-invalid={Boolean(state.fieldErrors.name)}
              aria-describedby={state.fieldErrors.name ? "signup-name-error" : undefined}
              className="mt-2 w-full rounded-lg border border-accent-dim/30 bg-night-card px-4 py-3 text-white placeholder:text-zinc-600 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent disabled:opacity-50"
              placeholder="Your name"
            />
            {state.fieldErrors.name ? (
              <p id="signup-name-error" className="mt-1.5 text-sm text-red-400">
                {state.fieldErrors.name}
              </p>
            ) : null}
          </div>

          <div>
            <label htmlFor="signup-email" className="block text-sm font-medium text-zinc-300">
              Email
            </label>
            <input
              id="signup-email"
              name="email"
              type="email"
              autoComplete="email"
              inputMode="email"
              required
              disabled={isPending}
              aria-invalid={Boolean(state.fieldErrors.email)}
              aria-describedby={state.fieldErrors.email ? "signup-email-error" : undefined}
              className="mt-2 w-full rounded-lg border border-accent-dim/30 bg-night-card px-4 py-3 text-white placeholder:text-zinc-600 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent disabled:opacity-50"
              placeholder="you@example.com"
            />
            {state.fieldErrors.email ? (
              <p id="signup-email-error" className="mt-1.5 text-sm text-red-400">
                {state.fieldErrors.email}
              </p>
            ) : null}
          </div>

          <div>
            <label htmlFor="signup-role" className="block text-sm font-medium text-zinc-300">
              Role
            </label>
            <select
              id="signup-role"
              name="role"
              required
              disabled={isPending}
              defaultValue=""
              aria-invalid={Boolean(state.fieldErrors.role)}
              aria-describedby={state.fieldErrors.role ? "signup-role-error" : undefined}
              className="mt-2 w-full rounded-lg border border-accent-dim/30 bg-night-card px-4 py-3 text-white focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent disabled:opacity-50"
            >
              <option value="" disabled>
                Select one
              </option>
              {EMAIL_ROLE_OPTIONS.map((opt) => (
                <option key={opt} value={opt} className="bg-night-card">
                  {opt}
                </option>
              ))}
            </select>
            {state.fieldErrors.role ? (
              <p id="signup-role-error" className="mt-1.5 text-sm text-red-400">
                {state.fieldErrors.role}
              </p>
            ) : null}
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="w-full rounded-lg bg-accent px-6 py-3 text-sm font-semibold text-black transition hover:bg-yellow-300 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isPending ? "Signing up…" : "Sign up"}
          </button>
        </form>
      </div>
    </section>
  );
}
