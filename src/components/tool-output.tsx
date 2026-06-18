import { useState } from "react";
import ReactMarkdown from "react-markdown";
import { Copy, Check, Download, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export function ToolOutput({
  text,
  isLoading,
  filename = "atlas-output.md",
  placeholder = "Your AI-generated result will appear here.",
}: {
  text: string;
  isLoading?: boolean;
  filename?: string;
  placeholder?: string;
}) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success("Copied to clipboard");
    setTimeout(() => setCopied(false), 1500);
  };

  const download = () => {
    const blob = new Blob([text], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex h-full min-h-[420px] flex-col rounded-xl border bg-card">
      <div className="flex items-center justify-between border-b px-4 py-2.5">
        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          {isLoading ? (
            <>
              <Loader2 className="h-3.5 w-3.5 animate-spin" /> Generating…
            </>
          ) : (
            <span>Result</span>
          )}
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="sm" onClick={copy} disabled={!text}>
            {copied ? <Check /> : <Copy />} Copy
          </Button>
          <Button variant="ghost" size="sm" onClick={download} disabled={!text}>
            <Download /> Export
          </Button>
        </div>
      </div>
      <div className="flex-1 overflow-auto px-6 py-5">
        {text ? (
          <div className="prose-output text-sm text-foreground">
            <ReactMarkdown>{text}</ReactMarkdown>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">{placeholder}</p>
        )}
      </div>
    </div>
  );
}