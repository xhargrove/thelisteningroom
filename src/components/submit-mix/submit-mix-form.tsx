"use client";

import { useActionState, useEffect, useRef } from "react";
import { submitDjMix } from "@/app/actions/submit-mix";
import type { MixSubmitState } from "@/lib/mix-submit/types";

const initialState: MixSubmitState = {
  success: false,
  error: null,
  fieldErrors: {},
};

export function SubmitMixForm() {
  const [state, formAction, isPending] = useActionState(submitDjMix, initialState);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.success) {
      formRef.current?.reset();
    }
  }, [state.success]);

  return (
    <form ref={formRef} action={formAction} className="mt-10 space-y-6" noValidate aria-label="Submit a DJ mix">
      {state.success ? (
        <p
          className="rounded-lg border border-accent/40 bg-accent/10 px-4 py-3 text-center text-sm font-medium text-accent"
          role="status"
          aria-live="polite"
        >
          Thanks — your mix is in the queue. We&apos;ll review it and may feature it on the site.
        </p>
      ) : null}

      {state.error ? (
        <p className="rounded-lg border border-red-500/40 bg-red-950/40 px-4 py-3 text-sm text-red-200" role="alert">
          {state.error}
        </p>
      ) : null}

      <div>
        <label htmlFor="dj_name" className="block text-sm font-medium text-zinc-300">
          Artist / DJ name
        </label>
        <input
          id="dj_name"
          name="dj_name"
          type="text"
          autoComplete="nickname"
          required
          disabled={isPending}
          aria-invalid={Boolean(state.fieldErrors.dj_name)}
          aria-describedby={state.fieldErrors.dj_name ? "dj_name-error" : undefined}
          className="mt-2 w-full rounded-lg border border-accent-dim/30 bg-night-card px-4 py-3 text-white placeholder:text-zinc-600 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent disabled:opacity-50"
          placeholder="Your name"
        />
        {state.fieldErrors.dj_name ? (
          <p id="dj_name-error" className="mt-1 text-sm text-red-300">
            {state.fieldErrors.dj_name}
          </p>
        ) : null}
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-zinc-300">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          disabled={isPending}
          aria-invalid={Boolean(state.fieldErrors.email)}
          aria-describedby={state.fieldErrors.email ? "email-error" : undefined}
          className="mt-2 w-full rounded-lg border border-accent-dim/30 bg-night-card px-4 py-3 text-white placeholder:text-zinc-600 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent disabled:opacity-50"
          placeholder="you@example.com"
        />
        {state.fieldErrors.email ? (
          <p id="email-error" className="mt-1 text-sm text-red-300">
            {state.fieldErrors.email}
          </p>
        ) : null}
      </div>

      <div>
        <label htmlFor="mix_title" className="block text-sm font-medium text-zinc-300">
          Mix title
        </label>
        <input
          id="mix_title"
          name="mix_title"
          type="text"
          autoComplete="off"
          required
          disabled={isPending}
          aria-invalid={Boolean(state.fieldErrors.mix_title)}
          aria-describedby={state.fieldErrors.mix_title ? "mix_title-error" : undefined}
          className="mt-2 w-full rounded-lg border border-accent-dim/30 bg-night-card px-4 py-3 text-white placeholder:text-zinc-600 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent disabled:opacity-50"
          placeholder="Session title"
        />
        {state.fieldErrors.mix_title ? (
          <p id="mix_title-error" className="mt-1 text-sm text-red-300">
            {state.fieldErrors.mix_title}
          </p>
        ) : null}
      </div>

      <div>
        <label htmlFor="mix_link" className="block text-sm font-medium text-zinc-300">
          Link to your mix <span className="font-normal text-zinc-500">(SoundCloud, Mixcloud, etc.)</span>
        </label>
        <input
          id="mix_link"
          name="mix_link"
          type="url"
          inputMode="url"
          disabled={isPending}
          aria-invalid={Boolean(state.fieldErrors.mix_link)}
          aria-describedby={state.fieldErrors.mix_link ? "mix_link-error" : undefined}
          className="mt-2 w-full rounded-lg border border-accent-dim/30 bg-night-card px-4 py-3 text-white placeholder:text-zinc-600 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent disabled:opacity-50"
          placeholder="https://"
        />
        {state.fieldErrors.mix_link ? (
          <p id="mix_link-error" className="mt-1 text-sm text-red-300">
            {state.fieldErrors.mix_link}
          </p>
        ) : null}
      </div>

      <div>
        <label htmlFor="platform" className="block text-sm font-medium text-zinc-300">
          Platform <span className="font-normal text-zinc-500">(optional)</span>
        </label>
        <input
          id="platform"
          name="platform"
          type="text"
          autoComplete="off"
          disabled={isPending}
          aria-invalid={Boolean(state.fieldErrors.platform)}
          className="mt-2 w-full rounded-lg border border-accent-dim/30 bg-night-card px-4 py-3 text-white placeholder:text-zinc-600 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent disabled:opacity-50"
          placeholder="e.g. SoundCloud"
        />
        {state.fieldErrors.platform ? (
          <p className="mt-1 text-sm text-red-300">{state.fieldErrors.platform}</p>
        ) : null}
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <label htmlFor="city" className="block text-sm font-medium text-zinc-300">
            City <span className="font-normal text-zinc-500">(optional)</span>
          </label>
          <input
            id="city"
            name="city"
            type="text"
            autoComplete="address-level2"
            disabled={isPending}
            className="mt-2 w-full rounded-lg border border-accent-dim/30 bg-night-card px-4 py-3 text-white placeholder:text-zinc-600 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent disabled:opacity-50"
            placeholder="Where you rep"
          />
          {state.fieldErrors.city ? (
            <p className="mt-1 text-sm text-red-300">{state.fieldErrors.city}</p>
          ) : null}
        </div>
        <div>
          <label htmlFor="instagram" className="block text-sm font-medium text-zinc-300">
            Instagram <span className="font-normal text-zinc-500">(optional)</span>
          </label>
          <input
            id="instagram"
            name="instagram"
            type="text"
            autoComplete="off"
            disabled={isPending}
            className="mt-2 w-full rounded-lg border border-accent-dim/30 bg-night-card px-4 py-3 text-white placeholder:text-zinc-600 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent disabled:opacity-50"
            placeholder="@handle or profile URL"
          />
          {state.fieldErrors.instagram ? (
            <p className="mt-1 text-sm text-red-300">{state.fieldErrors.instagram}</p>
          ) : null}
        </div>
      </div>

      <div>
        <label htmlFor="notes" className="block text-sm font-medium text-zinc-300">
          Notes <span className="font-normal text-zinc-500">(optional)</span>
        </label>
        <textarea
          id="notes"
          name="notes"
          rows={4}
          disabled={isPending}
          className="mt-2 w-full resize-y rounded-lg border border-accent-dim/30 bg-night-card px-4 py-3 text-white placeholder:text-zinc-600 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent disabled:opacity-50"
          placeholder="Genre, BPM, anything we should know"
        />
        {state.fieldErrors.notes ? (
          <p className="mt-1 text-sm text-red-300">{state.fieldErrors.notes}</p>
        ) : null}
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="w-full rounded-lg bg-accent px-6 py-3 text-sm font-semibold text-black transition hover:bg-yellow-300 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto sm:min-w-[180px]"
      >
        {isPending ? "Submitting…" : "Submit mix"}
      </button>
    </form>
  );
}
