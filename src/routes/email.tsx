import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { Wand2 } from "lucide-react";
import { toast } from "sonner";
import { generateEmail } from "@/lib/ai.functions";
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

type Tone = "Formal" | "Professional" | "Friendly" | "Persuasive";
type Recipient = "Client" | "Manager" | "Team Member" | "Supplier";

export const Route = createFileRoute("/email")({
  head: () => ({
    meta: [
      { title: "Email Generator — Atlas" },
      { name: "description", content: "Generate professional emails by purpose, recipient, and tone." },
    ],
  }),
  component: EmailPage,
});

function EmailPage() {
  const fn = useServerFn(generateEmail);
  const [purpose, setPurpose] = useState("");
  const [recipient, setRecipient] = useState<Recipient>("Client");
  const [tone, setTone] = useState<Tone>("Professional");
  const [senderName, setSenderName] = useState("");
  const [extraContext, setExtraContext] = useState("");

  const m = useMutation({
    mutationFn: () =>
      fn({ data: { purpose, recipient, tone, senderName: senderName || undefined, extraContext: extraContext || undefined } }),
    onError: (e: Error) => toast.error(e.message || "Generation failed"),
  });

  return (
    <ToolShell
      eyebrow="Smart Email Generator"
      title="Draft an email that lands well"
      description="Tell Atlas the purpose, recipient, and tone. You get a subject line, body, call to action, and closing."
      input={
        <form
          className="flex flex-col gap-4"
          onSubmit={(e) => {
            e.preventDefault();
            if (purpose.trim().length < 3) {
              toast.error("Add a short purpose first.");
              return;
            }
            m.mutate();
          }}
        >
          <div className="grid gap-2">
            <Label htmlFor="purpose">Purpose of the email</Label>
            <Textarea
              id="purpose"
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              placeholder="e.g. Follow up on the Q3 proposal sent last Tuesday and ask for a decision by Friday."
              rows={4}
              required
            />
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label>Recipient</Label>
              <Select value={recipient} onValueChange={(v) => setRecipient(v as Recipient)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Client">Client</SelectItem>
                  <SelectItem value="Manager">Manager</SelectItem>
                  <SelectItem value="Team Member">Team Member</SelectItem>
                  <SelectItem value="Supplier">Supplier</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>Tone</Label>
              <Select value={tone} onValueChange={(v) => setTone(v as Tone)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Formal">Formal</SelectItem>
                  <SelectItem value="Professional">Professional</SelectItem>
                  <SelectItem value="Friendly">Friendly</SelectItem>
                  <SelectItem value="Persuasive">Persuasive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="sender">Your name (optional)</Label>
            <Input id="sender" value={senderName} onChange={(e) => setSenderName(e.target.value)} placeholder="Jordan Lee" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="extra">Extra context (optional)</Label>
            <Textarea
              id="extra"
              value={extraContext}
              onChange={(e) => setExtraContext(e.target.value)}
              placeholder="Anything else relevant — prior history, constraints, must-include details."
              rows={3}
            />
          </div>
          <Button type="submit" disabled={m.isPending} className="self-start">
            <Wand2 /> {m.isPending ? "Generating…" : "Generate email"}
          </Button>
          <p className="text-xs text-muted-foreground">
            Atlas asks for any missing details by marking placeholders like [DATE].
          </p>
        </form>
      }
      output={
        <ToolOutput
          text={m.data?.text ?? ""}
          isLoading={m.isPending}
          filename="atlas-email.md"
          placeholder="Fill in the purpose, recipient, and tone — your email will appear here."
        />
      }
    />
  );
}