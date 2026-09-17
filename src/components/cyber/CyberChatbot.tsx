import {
  Bot,
  X,
  Send,
  Sparkles,
  Maximize2,
  Minimize2,
  Trash2,
  Copy,
  Check,
  Shield,
  RefreshCw,
  Terminal,
} from "lucide-react";
import { useState, useRef, useEffect } from "react";
import Markdown from "react-markdown";
import { toast } from "sonner";

import { askCyberChatbot, type ChatBotResponse } from "@/lib/threats.functions";

interface Message {
  id: string;
  role: "user" | "assistant";
  text: string;
  timestamp: string;
  source?: string;
  suggestedFollowups?: string[];
}

const INITIAL_PROMPTS = [
  "🚨 How to contain active ransomware?",
  "🛡️ Virtual patch guidance for zero-days",
  "🔍 Analyze suspicious IP or hash",
  "📋 NIST Incident Response steps",
  "⚡ What are today's critical CVEs?",
];

export function CyberChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      text: `👋 **CyberGuard SOC AI Online.**

I am your tier-3 cyber intelligence assistant. Ask me to:
- Formulate emergency containment steps for active ransomware or intrusions
- Investigate CVEs, exploit payloads, and virtual patching rules
- Triage suspicious IPs, domains, and malware hashes
- Translate CISA/NVD alerts into immediate mitigation actions

*How can I assist your defense team today?*`,
      timestamp: "Just now",
      source: "local_soc_engine",
      suggestedFollowups: INITIAL_PROMPTS.slice(0, 3),
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen, messages]);

  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || input).trim();
    if (!query || loading) return;

    const userMsg: Message = {
      id: `usr-${Date.now()}`,
      role: "user",
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const historyPayload = messages
        .filter((m) => m.id !== "welcome")
        .slice(-6)
        .map((m) => ({
          role: m.role === "user" ? ("user" as const) : ("model" as const),
          text: m.text,
        }));

      const res: ChatBotResponse = await askCyberChatbot({
        data: {
          message: query,
          history: historyPayload,
        },
      });

      const assistantMsg: Message = {
        id: `ai-${Date.now()}`,
        role: "assistant",
        text: res.answer,
        timestamp: res.timestamp,
        source: res.source,
        suggestedFollowups: res.suggestedFollowups,
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          role: "assistant",
          text: "⚠️ **SOC Assistant Connection Timeout.** Please verify your network telemetry or try again in a few seconds.",
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          source: "local_soc_engine",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast.success("Intelligence advisory copied to clipboard");
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleClear = () => {
    setMessages([
      {
        id: "welcome-cleared",
        role: "assistant",
        text: "Session cleared. Ready for fresh incident investigation.",
        timestamp: "Now",
        source: "local_soc_engine",
        suggestedFollowups: INITIAL_PROMPTS.slice(0, 3),
      },
    ]);
  };

  return (
    <>
      {/* Floating Launcher Button */}
      <div className="fixed bottom-20 md:bottom-6 right-4 md:right-6 z-40">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={`flex items-center gap-2 rounded-full border border-primary/40 bg-card/95 px-3.5 py-2.5 text-xs font-mono font-semibold text-foreground shadow-xl backdrop-blur-md transition-all hover:scale-105 hover:border-primary cursor-pointer ${
            isOpen ? "ring-2 ring-primary bg-primary/10" : ""
          }`}
          aria-label="Open CyberGuard SOC AI Chatbot"
        >
          <span className="relative flex size-6 items-center justify-center rounded-full bg-primary/20 text-primary">
            <Bot className="size-4" />
            <span className="absolute -top-0.5 -right-0.5 size-2 rounded-full bg-emerald-500 animate-pulse" />
          </span>
          <span className="font-display tracking-wide hidden sm:inline">SOC AI</span>
          <span className="rounded bg-primary/15 px-1.5 py-0.5 text-[0.62rem] text-primary label-mono">
            {isOpen ? "Close" : "Chat"}
          </span>
        </button>
      </div>

      {/* Chat Window Panel */}
      {isOpen && (
        <div
          className={`fixed z-50 flex flex-col border border-border bg-card/98 shadow-2xl backdrop-blur-xl transition-all duration-200 ${
            isExpanded
              ? "inset-4 md:inset-10 rounded-xl"
              : "bottom-24 md:bottom-20 right-2 md:right-6 w-[calc(100vw-1rem)] md:w-[480px] h-[580px] max-h-[82vh] rounded-xl"
          }`}
        >
          {/* Chat Header */}
          <div className="flex items-center justify-between border-b border-border/80 px-4 py-3 bg-secondary/40 rounded-t-xl shrink-0">
            <div className="flex items-center gap-2.5">
              <span className="flex size-7 items-center justify-center rounded-md bg-primary/20 text-primary">
                <Shield className="size-4" />
              </span>
              <div>
                <div className="flex items-center gap-2 font-display text-sm font-bold text-foreground">
                  <span>CyberGuard SOC Sentinel</span>
                  <span className="rounded bg-emerald-500/20 px-1.5 py-0.2 font-mono text-[0.62rem] text-emerald-400 font-semibold">
                    ONLINE
                  </span>
                </div>
                <div className="text-[0.68rem] text-muted-foreground font-mono flex items-center gap-1">
                  <Terminal className="size-3 text-primary" />
                  <span>Tier-3 Incident Responder (Gemini & Fallback)</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={handleClear}
                className="rounded p-1 text-muted-foreground hover:bg-secondary hover:text-foreground cursor-pointer"
                title="Clear Chat History"
              >
                <Trash2 className="size-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setIsExpanded(!isExpanded)}
                className="hidden sm:inline-flex rounded p-1 text-muted-foreground hover:bg-secondary hover:text-foreground cursor-pointer"
                title={isExpanded ? "Minimize" : "Expand"}
              >
                {isExpanded ? (
                  <Minimize2 className="size-3.5" />
                ) : (
                  <Maximize2 className="size-3.5" />
                )}
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="rounded p-1 text-muted-foreground hover:bg-secondary hover:text-foreground cursor-pointer"
                title="Close Window"
              >
                <X className="size-4" />
              </button>
            </div>
          </div>

          {/* Messages Container */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs font-sans">
            {messages.map((msg) => {
              const isUser = msg.role === "user";
              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isUser ? "items-end" : "items-start"}`}
                >
                  <div
                    className={`relative max-w-[92%] rounded-lg p-3 leading-relaxed ${
                      isUser
                        ? "bg-primary text-primary-foreground font-medium rounded-br-none"
                        : "bg-secondary/70 text-foreground border border-border rounded-bl-none"
                    }`}
                  >
                    {!isUser && (
                      <div className="flex items-center justify-between pb-1 mb-1 border-b border-border/40 text-[0.65rem] text-muted-foreground font-mono">
                        <span className="flex items-center gap-1 text-primary font-bold">
                          <Bot className="size-3" />
                          <span>SOC INTEL</span>
                        </span>
                        <div className="flex items-center gap-2">
                          <span>{msg.timestamp}</span>
                          <button
                            type="button"
                            onClick={() => handleCopy(msg.id, msg.text)}
                            className="text-muted-foreground hover:text-foreground cursor-pointer"
                            title="Copy advisory"
                          >
                            {copiedId === msg.id ? (
                              <Check className="size-3 text-emerald-400" />
                            ) : (
                              <Copy className="size-3" />
                            )}
                          </button>
                        </div>
                      </div>
                    )}

                    <div className="prose prose-invert prose-xs max-w-none break-words leading-normal">
                      <Markdown>{msg.text}</Markdown>
                    </div>

                    {isUser && (
                      <div className="mt-1 text-[0.62rem] text-primary-foreground/75 text-right font-mono">
                        {msg.timestamp}
                      </div>
                    )}
                  </div>

                  {/* Suggested Followups */}
                  {!isUser && msg.suggestedFollowups && msg.suggestedFollowups.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1.5 max-w-[95%]">
                      {msg.suggestedFollowups.map((chip) => (
                        <button
                          key={chip}
                          type="button"
                          onClick={() => handleSendMessage(chip)}
                          className="rounded-full border border-border/80 bg-background/80 px-2.5 py-1 text-[0.68rem] text-muted-foreground hover:border-primary/60 hover:text-foreground hover:bg-secondary transition-colors cursor-pointer text-left"
                        >
                          {chip}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}

            {loading && (
              <div className="flex items-center gap-2 rounded-lg bg-secondary/50 p-3 border border-border w-fit text-xs text-muted-foreground font-mono">
                <RefreshCw className="size-3 animate-spin text-primary" />
                <span>Querying threat databases & formulating advisory...</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompts Shelf */}
          {messages.length <= 2 && (
            <div className="px-4 py-1.5 border-t border-border/50 bg-background/50 flex flex-wrap gap-1.5 shrink-0">
              <span className="text-[0.65rem] text-muted-foreground label-mono self-center">
                Quick Prompts:
              </span>
              {INITIAL_PROMPTS.slice(0, 3).map((prompt) => (
                <button
                  key={prompt}
                  type="button"
                  onClick={() => handleSendMessage(prompt)}
                  className="rounded border border-border bg-card px-2 py-0.5 text-[0.68rem] text-muted-foreground hover:text-foreground hover:bg-secondary cursor-pointer"
                >
                  {prompt}
                </button>
              ))}
            </div>
          )}

          {/* Input Box */}
          <div className="border-t border-border p-3 bg-card rounded-b-xl shrink-0">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-center gap-2"
            >
              <input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about CVEs, ransomware containment, or IOCs..."
                className="flex-1 rounded-md border border-input bg-background px-3 py-2 text-xs sm:text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-primary transition-colors"
                disabled={loading}
              />
              <button
                type="submit"
                disabled={!input.trim() || loading}
                className="inline-flex size-9 items-center justify-center rounded-md bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors cursor-pointer shrink-0"
                title="Send Message"
              >
                <Send className="size-4" />
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
