"use client";

import { useEffect, useRef, useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { chatService } from "@/lib/chat";
import { useDocumentStore } from "@/lib/stores/useDocumentStore";
import { ChatMessage } from "@/types/chat";
import { Send, Sparkles, FileText, Loader2, MessageSquare, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

function MessageBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === "user";
  return (
    <div className={cn("flex gap-2.5", isUser ? "justify-end" : "justify-start")}>
      {!isUser && (
        <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full mt-0.5" style={{ background: "var(--primary-muted)" }}>
          <Sparkles className="h-3 w-3" style={{ color: "var(--primary)" }} />
        </div>
      )}
      <div className="max-w-[80%] space-y-1.5">
        <div
          className="rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed"
          style={isUser
            ? { background: "var(--primary)", color: "white", borderBottomRightRadius: "4px" }
            : { background: "var(--surface-elevated)", color: "var(--foreground)", borderBottomLeftRadius: "4px" }
          }
        >
          {message.content}
        </div>
        {message.sources && message.sources.length > 0 && (
          <div className="flex flex-wrap gap-1.5 px-1">
            {message.sources.map((s) => (
              <span key={s.id} className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs border" style={{ background: "var(--surface)", borderColor: "var(--border)", color: "var(--foreground-muted)" }}>
                <FileText className="h-2.5 w-2.5" />{s.filename}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

const suggestions = [
  "What are the main technical skills?",
  "Summarize this document",
  "What is the candidate's experience?",
];

export default function ChatPage() {
  const { documents } = useDocumentStore();
  const embedded = documents.filter((d) => d.is_embedded);

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedDocId, setSelectedDocId] = useState("all");
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;
    const question = input.trim();
    setInput("");

    const userMsg: ChatMessage = { id: crypto.randomUUID(), role: "user", content: question, timestamp: new Date() };
    setMessages((p) => [...p, userMsg]);
    setLoading(true);

    try {
      const res = selectedDocId === "all"
        ? await chatService.chatWithAll(question)
        : await chatService.chatWithDocument(question, selectedDocId);

      setMessages((p) => [...p, { id: crypto.randomUUID(), role: "assistant", content: res.answer, sources: res.sources, timestamp: new Date() }]);
    } catch {
      setMessages((p) => [...p, { id: crypto.randomUUID(), role: "assistant", content: "Something went wrong. Please try again.", timestamp: new Date() }]);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  return (
    <DashboardLayout title="Chat">
      <div className="max-w-3xl mx-auto flex flex-col" style={{ height: "calc(100vh - 6rem)" }}>

        {/* Document selector */}
        <div className="flex items-center gap-2.5 mb-4 flex-wrap">
          <span className="text-xs" style={{ color: "var(--foreground-muted)" }}>Chatting with:</span>
          <div className="relative">
            <select
              value={selectedDocId}
              onChange={(e) => setSelectedDocId(e.target.value)}
              className="appearance-none rounded-lg border pl-3 pr-8 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-[var(--primary)] cursor-pointer"
              style={{ background: "var(--surface)", borderColor: "var(--border-strong)", color: "var(--foreground)" }}
            >
              <option value="all">All embedded documents</option>
              {embedded.map((doc) => (
                <option key={doc.id} value={doc.id}>{doc.original_filename}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-3 w-3 pointer-events-none" style={{ color: "var(--foreground-muted)" }} />
          </div>
          {embedded.length === 0 && (
            <p className="text-xs" style={{ color: "var(--warning)" }}>
              No embedded docs — go to Documents and run &ldquo;Generate embedding&rdquo;
            </p>
          )}
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto space-y-3 pr-1">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full" style={{ background: "var(--primary-muted)" }}>
                <MessageSquare className="h-5 w-5" style={{ color: "var(--primary)" }} />
              </div>
              <div>
                <p className="text-sm font-medium" style={{ color: "var(--foreground)" }}>Ask anything about your documents</p>
                <p className="text-xs mt-0.5" style={{ color: "var(--foreground-muted)" }}>
                  {selectedDocId === "all" ? "Searching across all embedded documents" : `Focused on: ${embedded.find((d) => d.id === selectedDocId)?.original_filename}`}
                </p>
              </div>
              <div className="flex flex-wrap justify-center gap-2">
                {suggestions.map((s) => (
                  <button
                    key={s}
                    onClick={() => setInput(s)}
                    className="rounded-full border px-3 py-1.5 text-xs transition-colors hover:bg-[var(--surface-elevated)]"
                    style={{ borderColor: "var(--border-strong)", color: "var(--foreground-muted)" }}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            messages.map((msg) => <MessageBubble key={msg.id} message={msg} />)
          )}

          {loading && (
            <div className="flex gap-2.5 justify-start">
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full" style={{ background: "var(--primary-muted)" }}>
                <Sparkles className="h-3 w-3" style={{ color: "var(--primary)" }} />
              </div>
              <div className="rounded-2xl px-3.5 py-2.5" style={{ background: "var(--surface-elevated)", borderBottomLeftRadius: "4px" }}>
                <Loader2 className="h-3.5 w-3.5 animate-spin" style={{ color: "var(--foreground-muted)" }} />
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="mt-3">
          <div
            className="flex items-center gap-2 rounded-xl border px-3 py-2 focus-within:ring-2 focus-within:ring-[var(--primary)] transition-shadow"
            style={{ background: "var(--surface)", borderColor: "var(--border-strong)" }}
          >
            <input
              ref={inputRef} type="text" value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
              placeholder="Ask a question about your documents..."
              className="flex-1 bg-transparent text-sm focus:outline-none"
              style={{ color: "var(--foreground)" }}
              disabled={loading}
            />
            <button
              onClick={handleSend}
              disabled={loading || !input.trim()}
              className="flex h-7 w-7 items-center justify-center rounded-lg disabled:opacity-40 transition-opacity shrink-0"
              style={{ background: "var(--primary)" }}
            >
              <Send className="h-3.5 w-3.5 text-white" />
            </button>
          </div>
          <p className="text-xs text-center mt-1.5" style={{ color: "var(--foreground-subtle)" }}>
            Enter to send · answers grounded in your documents
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
}
