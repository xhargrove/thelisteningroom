import type { ReactNode } from "react";

export function SectionCard({
  id,
  title,
  description,
  children,
}: {
  id: string;
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <section
      id={id}
      className="panel scroll-mt-24"
    >
      <div className="border-b border-white/10 px-4 py-4 sm:px-6">
        <h2 className="text-lg font-semibold text-white">{title}</h2>
        {description ? <p className="mt-1 text-sm text-zinc-400">{description}</p> : null}
      </div>
      <div className="p-4 sm:p-6">{children}</div>
    </section>
  );
}
