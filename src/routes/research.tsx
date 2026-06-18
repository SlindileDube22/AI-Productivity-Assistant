import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { Wand2 } from "lucide-react";
import { toast } from "sonner";
import { researchSummary } from "@/lib/ai.functions";
import { ToolShell } from "@/components/tool-shell";
import { ToolOutput } from "@/components/tool-output";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";

export const Route = createFileRoute("/research")({
  head: () => ({
    meta: [
      { title: "Research Assistant — Atlas" },
      { name: "description", content: "Distill an article, report, or topic into insights, risks, and opportunities." },
    ],
  }),
  component: ResearchPage,
});

function ResearchPage() {
  const fn = useServerFn(researchSummary);
  const [source, setSource] = useState("");
  const [audience, setAudience] = useState("");

  const m = useMutation({
    mutationFn: () => fn({ data: { source, audience: audience || undefined } }),
    onError: (e: Error) => toast.error(e.message || "Research failed"),
  });

  return (
    <ToolShell
      eyebrow="AI Research Assistant"
      title="A briefing you can actually read"
      description="Paste an article, report excerpt, or topic. Atlas returns a plain-language summary, key insights, recommendations, risks, and opportunities."
      input={
        <form
          className="flex flex-col gap-4"
          onSubmit={(e) => {
            e.preventDefault();
            if (source.trim().length < 10) {
              toast.error("Add some source material or a topic.");
              return;
            }
            m.mutate();
          }}
        >
          <div className="grid gap-2">
            <Label htmlFor="source">Source material or topic</Label>
            <Textarea
              id="source"
              value={source}
              onChange={(e) => setSource(e.target.value)}
              placeholder="Paste the article, report, or describe the topic you want a briefing on…"
              rows={14}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="audience">Target audience (optional)</Label>
            <Input
              id="audience"
              value={audience}
              onChange={(e) => setAudience(e.target.value)}
              placeholder="e.g. non-technical leadership team"
            />
          </div>
          <Button type="submit" disabled={m.isPending} className="self-start">
            <Wand2 /> {m.isPending ? "Analyzing…" : "Generate briefing"}
          </Button>
          <p className="text-xs text-muted-foreground">
            Atlas only uses the source you paste. If something isn't in the text, it will say so under "Limitations".
          </p>
        </form>
      }
      output={
        <ToolOutput
          text={m.data?.text ?? ""}
          isLoading={m.isPending}
          filename="atlas-briefing.md"
          placeholder="Paste source material to see a structured briefing."
        />
      }
    />
  );
}