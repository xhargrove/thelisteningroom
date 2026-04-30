import type { Metadata } from "next";
import { SubmitMixForm } from "@/components/submit-mix/submit-mix-form";
import { SubmitMixSidebar } from "@/components/submit-mix/submit-mix-sidebar";
import { hasSupabasePublicConfig } from "@/lib/supabase/env";

export const metadata: Metadata = {
  title: "Submit mix",
};

export default function SubmitMixPage() {
  if (!hasSupabasePublicConfig()) {
    return (
      <div className="relative min-h-[60vh] overflow-hidden pt-12 sm:pt-16 lg:pt-20">
        <div
          className="pointer-events-none absolute inset-0 bg-gradient-to-b from-accent-secondary/5 via-accent/5 to-transparent"
          aria-hidden
        />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-2 lg:items-start">
            <SubmitMixSidebar />
            <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-night-card/80 to-night-elevated/50 p-8 lg:p-10">
              <h2 className="text-xl font-semibold text-white">Configuration required</h2>
              <p className="mt-3 text-sm leading-relaxed text-zinc-400">
                Add{" "}
                <code className="rounded-lg bg-white/10 px-1.5 py-0.5 text-zinc-200">
                  NEXT_PUBLIC_SUPABASE_URL
                </code>{" "}
                and{" "}
                <code className="rounded-lg bg-white/10 px-1.5 py-0.5 text-zinc-200">
                  NEXT_PUBLIC_SUPABASE_ANON_KEY
                </code>{" "}
                to your environment so submissions can be saved.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-[70vh] overflow-hidden pt-12 sm:pt-16 lg:pt-20">
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-b from-accent-secondary/5 via-accent/5 to-transparent"
        aria-hidden
      />
      <div className="relative mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-2 lg:items-start">
          <SubmitMixSidebar />
          <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-night-card/80 to-night-elevated/50 p-8 lg:p-10">
            <SubmitMixForm />
          </div>
        </div>
      </div>
    </div>
  );
}
