"use client";

import { useActionState, useEffect, useRef } from "react";
import { submitDjMix } from "@/app/actions/submit-mix";
import type { MixSubmitState } from "@/lib/mix-submit/types";

const initialState: MixSubmitState = {
  success: false,
  error: null,
  fieldErrors: {},
};

const labelClass = "mb-2 block text-sm font-semibold text-white";
const fieldClass =
  "w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3.5 text-white placeholder:text-zinc-600 focus:border-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-500/25 disabled:cursor-not-allowed disabled:opacity-50";

export function SubmitMixForm() {
  const [state, formAction, isPending] = useActionState(submitDjMix, initialState);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.success) {
      formRef.current?.reset();
    }
  }, [state.success]);

  return (
    <form ref={formRef} action={formAction} className="space-y-6" noValidate aria-label="Submit a DJ mix">
      {state.success ? (
        <div
          className="flex flex-col items-center space-y-4 rounded-2xl border border-emerald-500/30 bg-emerald-950/20 px-4 py-8 text-center sm:px-6"
          role="status"
          aria-live="polite"
        >
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-zinc-600 to-zinc-800 shadow-lg shadow-black/30">
            <svg
              className="h-8 w-8 text-white"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              aria-hidden
            >
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-white sm:text-3xl">Mix submitted!</h2>
          <p className="max-w-md text-sm text-zinc-300 sm:text-base">
            Thanks — your mix is in the queue. We&apos;ll review it and may feature it on the site. You can submit
            another set below.
          </p>
        </div>
      ) : null}

      {state.error ? (
        <p className="rounded-lg border border-red-500/40 bg-red-950/40 px-4 py-3 text-sm text-red-200" role="alert">
          {state.error}
        </p>
      ) : null}

      <div>
        <label htmlFor="dj_name" className={labelClass}>
          Artist / DJ name <span className="text-red-400">*</span>
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
          className={fieldClass}
          placeholder="Your name"
        />
        {state.fieldErrors.dj_name ? (
          <p id="dj_name-error" className="mt-1 text-sm text-red-300">
            {state.fieldErrors.dj_name}
          </p>
        ) : null}
      </div>

      <div>
        <label htmlFor="email" className={labelClass}>
          Email <span className="text-red-400">*</span>
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
          className={fieldClass}
          placeholder="you@example.com"
        />
        {state.fieldErrors.email ? (
          <p id="email-error" className="mt-1 text-sm text-red-300">
            {state.fieldErrors.email}
          </p>
        ) : null}
      </div>

      <div>
        <label htmlFor="mix_title" className={labelClass}>
          Mix title <span className="text-red-400">*</span>
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
          className={fieldClass}
          placeholder="e.g. Friday night vibes"
        />
        {state.fieldErrors.mix_title ? (
          <p id="mix_title-error" className="mt-1 text-sm text-red-300">
            {state.fieldErrors.mix_title}
          </p>
        ) : null}
      </div>

      <div>
        <label htmlFor="mix_link" className={labelClass}>
          Link to your mix <span className="font-normal text-zinc-500">(optional but recommended)</span>
        </label>
        <input
          id="mix_link"
          name="mix_link"
          type="url"
          inputMode="url"
          disabled={isPending}
          aria-invalid={Boolean(state.fieldErrors.mix_link)}
          aria-describedby={state.fieldErrors.mix_link ? "mix_link-error" : undefined}
          className={fieldClass}
          placeholder="https://soundcloud.com/…"
        />
        <p className="mt-2 text-xs text-zinc-500">SoundCloud, Mixcloud, YouTube, or other https link</p>
        {state.fieldErrors.mix_link ? (
          <p id="mix_link-error" className="mt-1 text-sm text-red-300">
            {state.fieldErrors.mix_link}
          </p>
        ) : null}
      </div>

      <div>
        <label htmlFor="platform" className={labelClass}>
          Platform <span className="font-normal text-zinc-500">(optional)</span>
        </label>
        <input
          id="platform"
          name="platform"
          type="text"
          autoComplete="off"
          disabled={isPending}
          aria-invalid={Boolean(state.fieldErrors.platform)}
          className={fieldClass}
          placeholder="e.g. SoundCloud"
        />
        {state.fieldErrors.platform ? (
          <p className="mt-1 text-sm text-red-300">{state.fieldErrors.platform}</p>
        ) : null}
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <label htmlFor="city" className={labelClass}>
            City <span className="font-normal text-zinc-500">(optional)</span>
          </label>
          <input
            id="city"
            name="city"
            type="text"
            autoComplete="address-level2"
            disabled={isPending}
            className={fieldClass}
            placeholder="Atlanta"
          />
          {state.fieldErrors.city ? (
            <p className="mt-1 text-sm text-red-300">{state.fieldErrors.city}</p>
          ) : null}
        </div>
        <div>
          <label htmlFor="instagram" className={labelClass}>
            Instagram <span className="font-normal text-zinc-500">(optional)</span>
          </label>
          <input
            id="instagram"
            name="instagram"
            type="text"
            autoComplete="off"
            disabled={isPending}
            className={fieldClass}
            placeholder="@handle or profile URL"
          />
          {state.fieldErrors.instagram ? (
            <p className="mt-1 text-sm text-red-300">{state.fieldErrors.instagram}</p>
          ) : null}
        </div>
      </div>

      <div>
        <label htmlFor="notes" className={labelClass}>
          Notes <span className="font-normal text-zinc-500">(optional)</span>
        </label>
        <textarea
          id="notes"
          name="notes"
          rows={4}
          disabled={isPending}
          className={`${fieldClass} resize-none`}
          placeholder="Genre, BPM, track list, anything we should know"
        />
        {state.fieldErrors.notes ? (
          <p className="mt-1 text-sm text-red-300">{state.fieldErrors.notes}</p>
        ) : null}
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="group inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-zinc-600 to-zinc-800 px-6 py-4 text-sm font-semibold text-white shadow-lg shadow-black/20 transition hover:from-zinc-500 hover:to-zinc-700 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-60"
      >
        <svg
          className="h-5 w-5 shrink-0 transition-transform group-hover:translate-x-0.5"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          aria-hidden
        >
          <line x1="22" y1="2" x2="11" y2="13" />
          <polygon points="22 2 15 22 11 13 2 9 22 2" />
        </svg>
        {isPending ? "Submitting…" : "Submit mix"}
      </button>

      <p className="text-center text-xs text-zinc-500">
        By submitting, you confirm the information is accurate and the mix is yours to share.
      </p>
    </form>
  );
}
