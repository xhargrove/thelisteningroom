import type { Metadata } from "next";
import { SubmitMixForm } from "@/components/submit-mix/submit-mix-form";
import { hasSupabasePublicConfig } from "@/lib/supabase/env";

export const metadata: Metadata = {
  title: "Submit mix",
};

export default function SubmitMixPage() {
  if (!hasSupabasePublicConfig()) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6 sm:py-16">
        <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">Submit a mix</h1>
        <p className="mt-3 text-zinc-300">
          Add <code className="rounded-lg bg-white/10 px-1.5 py-0.5 text-sm text-zinc-200">NEXT_PUBLIC_SUPABASE_URL</code> and{" "}
          <code className="rounded-lg bg-white/10 px-1.5 py-0.5 text-sm text-zinc-200">NEXT_PUBLIC_SUPABASE_ANON_KEY</code> to
          your environment so submissions can be saved.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6 sm:py-16">
      <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">Submit a mix</h1>
      <p className="mt-3 text-zinc-300">
        Send your set for review. Submissions go to the team queue; approved mixes can appear on the homepage.
      </p>

      <SubmitMixForm />
    </div>
  );
}
