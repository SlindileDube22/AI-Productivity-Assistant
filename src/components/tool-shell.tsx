import type { ReactNode } from "react";

export function ToolShell({
  eyebrow,
  title,
  description,
  input,
  output,
}: {
  eyebrow: string;
  title: string;
  description: string;
  input: ReactNode;
  output: ReactNode;
}) {
  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 p-4 sm:p-6 lg:p-8">
      <header className="flex flex-col gap-1.5">
        <span className="text-xs font-medium uppercase tracking-wider text-primary">{eyebrow}</span>
        <h1 className="font-display text-3xl font-semibold tracking-tight">{title}</h1>
        <p className="max-w-2xl text-sm text-muted-foreground">{description}</p>
      </header>
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
        <div className="rounded-xl border bg-card p-5">{input}</div>
        {output}
      </div>
    </div>
  );
}