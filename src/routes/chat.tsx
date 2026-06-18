import { createFileRoute } from "@tanstack/react-router";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import { Plus, MessageSquare, Compass } from "lucide-react";
import { toast } from "sonner";
import {
  Conversation,
  ConversationContent,
  ConversationEmptyState,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation";
import { Message, MessageContent } from "@/components/ai-elements/message";
import {
  PromptInput,
  PromptInputTextarea,
  PromptInputFooter,
  PromptInputSubmit,
} from "@/components/ai-elements/prompt-input";
import { Shimmer } from "@/components/ai-elements/shimmer";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/chat")({
  head: () => ({
    meta: [
      { title: "Atlas Chatbot — Workplace AI" },
      { name: "description", content: "Ask Atlas anything workplace-related: drafts, plans, summaries, guidance." },
    ],
  }),
  component: ChatPage,
});

const STORAGE_KEY = "atlas:chat:messages:v1";
const transport = new DefaultChatTransport({ api: "/api/chat" });

function loadInitial(): UIMessage[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as UIMessage[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function ChatPage() {
  const [initial] = useState<UIMessage[]>(loadInitial);
  const [chatId, setChatId] = useState(() => `chat-${Date.now()}`);

  return <Chat key={chatId} initialMessages={initial} chatId={chatId} onNew={() => setChatId(`chat-${Date.now()}`)} />;
}

function Chat({
  initialMessages,
  chatId,
  onNew,
}: {
  initialMessages: UIMessage[];
  chatId: string;
  onNew: () => void;
}) {
  const [input, setInput] = useState("");

  const { messages, sendMessage, status, setMessages, stop } = useChat({
    id: chatId,
    messages: initialMessages,
    transport,
    onError: (e) => toast.error(e.message || "Something went wrong"),
  });

  // Persist messages
  useEffect(() => {
    if (status === "streaming" || status === "submitted") return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
    } catch {
      // ignore quota errors
    }
  }, [messages, status]);


  const handleNew = () => {
    if (messages.length && !confirm("Start a new conversation? This clears the current chat.")) return;
    window.localStorage.removeItem(STORAGE_KEY);
    setMessages([]);
    onNew();
  };

  const isLoading = status === "submitted" || status === "streaming";

  return (
    <div className="mx-auto flex h-[calc(100vh-3.5rem)] w-full max-w-4xl flex-col">
      <header className="flex items-center justify-between border-b px-4 py-3 sm:px-6">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <Compass className="h-4 w-4" />
          </div>
          <div>
            <h1 className="font-display text-lg font-semibold leading-none">Atlas Chatbot</h1>
            <p className="text-xs text-muted-foreground">Your workplace AI assistant</p>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={handleNew}>
          <Plus /> New conversation
        </Button>
      </header>

      <Conversation className="flex-1">
        <ConversationContent>
          {messages.length === 0 ? (
            <ConversationEmptyState
              icon={<MessageSquare className="h-8 w-8" />}
              title="How can Atlas help today?"
              description="Ask for an email draft, a plan, a summary, or guidance on a workplace question."
            />
          ) : (
            messages.map((message) => {
              const text = message.parts
                .map((p) => (p.type === "text" ? p.text : ""))
                .join("");
              return (
                <Message key={message.id} from={message.role}>
                  <MessageContent>
                    {message.role === "assistant" ? (
                      <div className="prose-output text-sm">
                        <ReactMarkdown>{text}</ReactMarkdown>
                      </div>
                    ) : (
                      <span className="whitespace-pre-wrap text-sm">{text}</span>
                    )}
                  </MessageContent>
                </Message>
              );
            })
          )}
          {status === "submitted" && (
            <Message from="assistant">
              <MessageContent>
                <Shimmer>Thinking…</Shimmer>
              </MessageContent>
            </Message>
          )}
        </ConversationContent>
        <ConversationScrollButton />
      </Conversation>

      <div className="border-t bg-background p-3 sm:p-4">
        <PromptInput
          onSubmit={async ({ text }) => {
            const trimmed = text.trim();
            if (!trimmed || isLoading) return;
            setInput("");
            await sendMessage({ text: trimmed });
          }}
        >
          <PromptInputTextarea
            name="message"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask Atlas anything workplace-related…"
            autoFocus
          />
          <PromptInputFooter className="justify-end">
            <PromptInputSubmit
              status={status}
              onStop={stop}
              disabled={!input.trim() && !isLoading}
            />
          </PromptInputFooter>
        </PromptInput>
        <p className="mt-2 text-center text-[11px] text-muted-foreground">
          AI-generated content should be reviewed by a human before being used for important decisions.
        </p>
      </div>
    </div>
  );
}