import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { Wand2 } from "lucide-react";
import { toast } from "sonner";
import { summarizeMeeting } from "@/lib/ai.functions";
import { ToolShell } from "@/components/tool-shell";
import { ToolOutput } from "@/components/tool-output";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const SAMPLE = `Q3 Launch sync — attendees: Priya, Marcus, Lena, Tom.
- Marcus walked through landing page redesign; agreed to ship light-mode only on launch.
- Lena raised concern about API rate limits; will benchmark by Thursday.
- Decision: delay paid ads until conversion tracking is verified.
- Action: Tom to send updated copy to legal by Wed; Priya to confirm pricing tier names by Mon.`;

export const Route = createFileRoute("/meeting")({
  head: () => ({
    meta: [
      { title: "Meeting Summarizer — Atlas" },
      { name: "description", content: "Turn raw meeting notes into a structured summary with decisions and action items." },
    ],
  }),
  component: MeetingPage,
});

function MeetingPage() {
  const fn = useServerFn(summarizeMeeting);
  const [notes, setNotes] = useState("");

  const m = useMutation({
    mutationFn: () => fn({ data: { notes } }),
    onError: (e: Error) => toast.error(e.message || "Summarization failed"),
  });

  return (
    <ToolShell
      eyebrow="Meeting Notes Summarizer"
      title="From messy notes to a clean record"
      description="Paste your notes and get an executive summary, decisions, action items with owners and deadlines, and open questions."
      input={
        <form
          className="flex flex-col gap-4"
          onSubmit={(e) => {
            e.preventDefault();
            if (notes.trim().length < 20) {
              toast.error("Add at least a few lines of notes.");
              return;
            }
            m.mutate();
          }}
        >
          <div className="grid gap-2">
            <Label htmlFor="notes">Meeting notes</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Paste raw notes, transcript snippets, or bullets from the meeting…"
              rows={14}
              className="font-mono text-xs"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <Button type="submit" disabled={m.isPending}>
              <Wand2 /> {m.isPending ? "Summarizing…" : "Summarize meeting"}
            </Button>
            <Button type="button" variant="ghost" onClick={() => setNotes(SAMPLE)}>
              Try a sample
            </Button>
          </div>
        </form>
      }
      output={
        <ToolOutput
          text={m.data?.text ?? ""}
          isLoading={m.isPending}
          filename="atlas-meeting-summary.md"
          placeholder="Paste meeting notes to see a structured summary with action items."
        />
      }
    />
  );
}