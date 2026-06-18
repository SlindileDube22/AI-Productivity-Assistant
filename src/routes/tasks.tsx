import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { Wand2 } from "lucide-react";
import { toast } from "sonner";
import { planTasks } from "@/lib/ai.functions";
import { ToolShell } from "@/components/tool-shell";
import { ToolOutput } from "@/components/tool-output";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const Route = createFileRoute("/tasks")({
  head: () => ({
    meta: [
      { title: "Task Planner — Atlas" },
      { name: "description", content: "Prioritize tasks with the Eisenhower matrix and time-block your day or week." },
    ],
  }),
  component: TaskPage,
});

function TaskPage() {
  const fn = useServerFn(planTasks);
  const [tasks, setTasks] = useState("");
  const [horizon, setHorizon] = useState<"day" | "week">("day");
  const [hours, setHours] = useState("");

  const m = useMutation({
    mutationFn: () => fn({ data: { tasks, horizon, workingHours: hours || undefined } }),
    onError: (e: Error) => toast.error(e.message || "Planning failed"),
  });

  return (
    <ToolShell
      eyebrow="AI Task Planner"
      title="A calm plan for a noisy day"
      description="Drop in your tasks. Atlas scores each one on the Eisenhower matrix and lays out a realistic schedule using time blocks."
      input={
        <form
          className="flex flex-col gap-4"
          onSubmit={(e) => {
            e.preventDefault();
            if (tasks.trim().length < 5) {
              toast.error("Add at least one task.");
              return;
            }
            m.mutate();
          }}
        >
          <div className="grid gap-2">
            <Label htmlFor="tasks">Tasks</Label>
            <Textarea
              id="tasks"
              value={tasks}
              onChange={(e) => setTasks(e.target.value)}
              placeholder={"One per line. e.g.\nReply to client renewal email\nPrep slides for Thursday review\nReview Q3 OKRs draft"}
              rows={10}
              className="font-mono text-xs"
            />
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label>Plan horizon</Label>
              <Select value={horizon} onValueChange={(v) => setHorizon(v as "day" | "week")}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="day">Today</SelectItem>
                  <SelectItem value="week">This week</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="hours">Working hours (optional)</Label>
              <Input id="hours" value={hours} onChange={(e) => setHours(e.target.value)} placeholder="e.g. 9:00 – 17:30" />
            </div>
          </div>
          <Button type="submit" disabled={m.isPending} className="self-start">
            <Wand2 /> {m.isPending ? "Planning…" : "Build my plan"}
          </Button>
        </form>
      }
      output={
        <ToolOutput
          text={m.data?.text ?? ""}
          isLoading={m.isPending}
          filename="atlas-plan.md"
          placeholder="Add your tasks to see a prioritized, time-blocked plan."
        />
      }
    />
  );
}