import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Mail,
  NotebookText,
  ListChecks,
  Lightbulb,
  MessageSquare,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  Clock,
} from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Atlas — Workplace AI Assistant" },
      {
        name: "description",
        content: "One calm workspace for the everyday writing, planning, and research that fills your week.",
      },
    ],
  }),
  component: Dashboard,
});

const tiles = [
  { to: "/email", title: "Email Generator", desc: "Draft a professional email by purpose, recipient, and tone.", icon: Mail },
  { to: "/meeting", title: "Meeting Summarizer", desc: "Turn raw notes into a summary, decisions, and action items.", icon: NotebookText },
  { to: "/tasks", title: "Task Planner", desc: "Prioritize with the Eisenhower matrix and time-block your day.", icon: ListChecks },
  { to: "/research", title: "Research Assistant", desc: "Distill an article or report into insights, risks, and next steps.", icon: Lightbulb },
  { to: "/chat", title: "Chatbot Assistant", desc: "Ask anything workplace-related — drafts, plans, ideas, guidance.", icon: MessageSquare },
] as const;

function Dashboard() {
  return (
    <div className="mx-auto w-full max-w-7xl p-4 sm:p-6 lg:p-10">
      <section className="relative overflow-hidden rounded-2xl border bg-gradient-to-br from-primary/8 via-card to-accent/40 p-8 lg:p-12">
        <div className="max-w-2xl">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
            <Sparkles className="h-3 w-3" /> Atlas Workplace AI
          </span>
          <h1 className="mt-4 font-display text-4xl font-semibold tracking-tight sm:text-5xl">
            Give yourself back an hour, every day.
          </h1>
          <p className="mt-3 text-base text-muted-foreground sm:text-lg">
            Atlas turns your messy notes, half-formed ideas, and crowded inbox into clean drafts,
            clear plans, and useful summaries — without the AI hype.
          </p>
          <div className="mt-6 flex flex-wrap gap-2">
            <Link to="/email" className="inline-flex items-center gap-1.5 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
              Draft an email <ArrowRight className="h-4 w-4" />
            </Link>
            <Link to="/chat" className="inline-flex items-center gap-1.5 rounded-md border bg-background px-4 py-2 text-sm font-medium hover:bg-accent">
              Open chatbot
            </Link>
          </div>
        </div>
      </section>

      <section className="mt-10">
        <h2 className="font-display text-xl font-semibold tracking-tight">Workspace</h2>
        <p className="text-sm text-muted-foreground">Five focused tools, one consistent interface.</p>
        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {tiles.map((t) => (
            <Link key={t.to} to={t.to} className="group flex flex-col gap-3 rounded-xl border bg-card p-5 transition hover:border-primary/40 hover:shadow-sm">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <t.icon className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-display text-lg font-semibold">{t.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{t.desc}</p>
              </div>
              <span className="mt-auto inline-flex items-center text-sm font-medium text-primary opacity-0 transition group-hover:opacity-100">
                Open <ArrowRight className="ml-1 h-3.5 w-3.5" />
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Feature icon={Clock} title="Built for the work week" body="For office admins, team leads, PMs, remote workers, and people new to the workplace." />
        <Feature icon={ShieldCheck} title="Responsible by default" body="Outputs include disclaimers and uncertainty notes. Atlas never invents facts to fill gaps." />
        <Feature icon={Sparkles} title="Structured outputs" body="Every tool returns a clear, copy-ready format — subject lines, action items, time blocks, insights." />
      </section>
    </div>
  );
}

function Feature({ icon: Icon, title, body }: { icon: typeof Clock; title: string; body: string }) {
  return (
    <div className="rounded-xl border bg-card p-5">
      <div className="flex h-9 w-9 items-center justify-center rounded-md bg-accent text-accent-foreground">
        <Icon className="h-4 w-4" />
      </div>
      <h3 className="mt-3 font-display text-base font-semibold">{title}</h3>
      <p className="mt-1 text-sm text-muted-foreground">{body}</p>
    </div>
  );
}