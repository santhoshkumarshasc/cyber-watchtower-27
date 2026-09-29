import { useState, useEffect, useRef } from "react";
import {
  Bot,
  Send,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Sparkles,
  Copy,
  Check,
  RotateCcw,
  Terminal,
  ShieldCheck,
  AlertTriangle,
  Play,
  Square,
  Wrench,
  Loader2,
  HelpCircle,
} from "lucide-react";
import { toast } from "sonner";
import { askCyberAgent, type AgentChatMessage } from "@/lib/ai-assistant.functions";

interface CyberAIAgentProps {
  context?: string;
  initialPrompt?: string;
  compact?: boolean;
  onCommandRun?: (cmd: string) => void;
  className?: string;
}

interface SpeechRecognitionEvent {
  results: {
    [index: number]: {
      [index: number]: {
        transcript: string;
      };
    };
  };
}

interface SpeechRecognitionInstance extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  onstart: (() => void) | null;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: { error: string }) => void) | null;
  onend: (() => void) | null;
}

// Clean markdown and symbols before speech synthesis
function cleanTextForSpeech(text: string): string {
  return text
    .replace(
      /```[\s\S]*?```/g,
      "Code block omitted from voice. Please review the terminal snippet on screen.",
    )
    .replace(/`([^`]+)`/g, "$1")
    .replace(/[#*_~>]/g, "")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .trim();
}

export function CyberAIAgent({
  context,
  initialPrompt,
  compact = false,
  onCommandRun,
  className = "",
}: CyberAIAgentProps) {
  const [messages, setMessages] = useState<AgentChatMessage[]>([
    {
      id: "welcome-1",
      role: "model",
      content: context
        ? `🛡️ **CyberGuard SOC AI Agent online.**\n\nI have loaded incident context for **${context.slice(0, 100)}**.\n\nAsk me how to safely verify the SHA-256 checksum, execute the remediation commands, configure rollback safety, or diagnose active compromise.`
        : "🛡️ **CyberGuard Frontline SOC AI Agent online.**\n\nAsk me anything regarding active CVEs, zero-day threat containment, package download verification, terminal hardening commands, or emergency incident triage. Voice and chat are active.",
    },
  ]);

  const [input, setInput] = useState(initialPrompt || "");
  const [isLoading, setIsLoading] = useState(false);
  const [copiedCmd, setCopiedCmd] = useState<string | null>(null);

  // Voice Input (Speech-to-Text) state
  const [isListening, setIsListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);

  // Voice Output (Text-to-Speech) state
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [activeSpeechId, setActiveSpeechId] = useState<string | null>(null);
  const [autoVoice, setAutoVoice] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize Speech Recognition
  useEffect(() => {
    if (typeof window !== "undefined") {
      const windowWithSpeech = window as unknown as {
        SpeechRecognition?: new () => SpeechRecognitionInstance;
        webkitSpeechRecognition?: new () => SpeechRecognitionInstance;
      };
      const SpeechRecognition =
        windowWithSpeech.SpeechRecognition || windowWithSpeech.webkitSpeechRecognition;

      if (SpeechRecognition) {
        setSpeechSupported(true);
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = "en-US";

        recognition.onstart = () => {
          setIsListening(true);
          toast.info("🎙️ Listening... Speak your cybersecurity question");
        };

        recognition.onresult = (event: SpeechRecognitionEvent) => {
          const transcript = event.results[0]?.[0]?.transcript;
          if (transcript) {
            setInput((prev) => (prev ? `${prev} ${transcript}` : transcript));
            toast.success(`Heard: "${transcript}"`);
          }
        };

        recognition.onerror = (event: { error: string }) => {
          setIsListening(false);
          if (event.error !== "no-speech") {
            toast.error(`Microphone error: ${event.error}`);
          }
        };

        recognition.onend = () => {
          setIsListening(false);
        };

        recognitionRef.current = recognition;
      }
    }

    return () => {
      if (typeof window !== "undefined" && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // Scroll to bottom on messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const toggleListening = () => {
    if (!speechSupported || !recognitionRef.current) {
      toast.error(
        "Speech recognition is not supported in this browser environment. Please type your message.",
      );
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.start();
      } catch {
        recognitionRef.current.stop();
        setTimeout(() => recognitionRef.current.start(), 200);
      }
    }
  };

  const speakText = (text: string, messageId: string) => {
    if (typeof window === "undefined" || !window.speechSynthesis) {
      toast.error("Text-to-speech is not supported in this browser.");
      return;
    }

    if (isSpeaking && activeSpeechId === messageId) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      setActiveSpeechId(null);
      return;
    }

    window.speechSynthesis.cancel();
    const cleanSpeech = cleanTextForSpeech(text);
    const utterance = new SpeechSynthesisUtterance(cleanSpeech);
    utterance.rate = 1.05;
    utterance.pitch = 1.0;

    // Pick best English voice if available
    const voices = window.speechSynthesis.getVoices();
    const preferredVoice = voices.find(
      (v) =>
        v.lang.startsWith("en") &&
        (v.name.includes("Natural") || v.name.includes("Google") || v.name.includes("Samantha")),
    );
    if (preferredVoice) utterance.voice = preferredVoice;

    utterance.onstart = () => {
      setIsSpeaking(true);
      setActiveSpeechId(messageId);
    };

    utterance.onend = () => {
      setIsSpeaking(false);
      setActiveSpeechId(null);
    };

    utterance.onerror = () => {
      setIsSpeaking(false);
      setActiveSpeechId(null);
    };

    window.speechSynthesis.speak(utterance);
  };

  const handleSend = async (customText?: string) => {
    const textToSend = customText || input;
    if (!textToSend.trim() || isLoading) return;

    const userMessage: AgentChatMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content: textToSend.trim(),
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput("");
    setIsLoading(true);

    try {
      const response = await askCyberAgent({
        data: {
          messages: newMessages.map((m) => ({ role: m.role, content: m.content })),
          context,
        },
      });

      const modelMessageId = `model-${Date.now()}`;
      const modelMessage: AgentChatMessage = {
        id: modelMessageId,
        role: "model",
        content: response.reply,
      };

      setMessages((prev) => [...prev, modelMessage]);

      if (autoVoice) {
        speakText(response.reply, modelMessageId);
      }
    } catch {
      const fallbackReply = `⚠️ **SOC Connection Alert**: Running in local fallback mode.\n\nTo troubleshoot: verify network firewall settings or review standard mitigation commands on screen.\n\n\`\`\`bash\n# Audit active network status\nss -tulpn | grep -E "(:80|:443|:22)"\n\`\`\``;
      setMessages((prev) => [
        ...prev,
        {
          id: `model-${Date.now()}`,
          role: "model",
          content: fallbackReply,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const copyCommand = (cmd: string) => {
    navigator.clipboard.writeText(cmd);
    setCopiedCmd(cmd);
    toast.success("Command copied to clipboard");
    setTimeout(() => setCopiedCmd(null), 2000);
  };

  const quickPrompts = context
    ? [
        "How do I verify the SHA-256 checksum?",
        "What are the safe rollback steps?",
        "Explain this emergency 1-liner fix",
        "How to verify the patch worked?",
      ]
    : [
        "How to verify downloaded package SHA-256?",
        "Fix XZ backdoor (CVE-2024-3094)",
        "Mitigate Log4Shell immediately",
        "Safe service rollback command",
      ];

  return (
    <div
      className={`flex flex-col rounded-xl border border-border bg-card shadow-sm overflow-hidden ${
        compact ? "h-[450px]" : "h-[540px] sm:h-[600px]"
      } ${className}`}
    >
      {/* Agent Top Header */}
      <div className="flex items-center justify-between border-b border-border bg-secondary/30 px-3.5 py-2.5 sm:px-4">
        <div className="flex items-center gap-2">
          <div className="relative flex size-8 items-center justify-center rounded-lg bg-primary/15 text-primary border border-primary/30">
            <Bot className="size-4.5" />
            <span className="absolute -bottom-0.5 -right-0.5 size-2.5 rounded-full bg-emerald-500 ring-2 ring-card" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-xs sm:text-sm text-foreground">
                CyberGuard AI Agent
              </span>
              <span className="rounded bg-primary/20 text-primary border border-primary/30 px-1.5 py-0.2 font-mono text-[0.62rem] font-bold">
                SOC Copilot
              </span>
            </div>
            <p className="text-[0.68rem] text-muted-foreground flex items-center gap-1">
              <span>Voice &amp; Chat Enabled</span>
              {isSpeaking && (
                <span className="text-primary font-mono font-semibold flex items-center gap-1 animate-pulse">
                  · Speaking
                </span>
              )}
            </p>
          </div>
        </div>

        {/* Voice Controls & Toggles */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => {
              setAutoVoice(!autoVoice);
              toast.info(
                autoVoice ? "Auto-voice narration disabled" : "Auto-voice narration enabled",
              );
            }}
            className={`p-1.5 rounded-md border text-xs transition-colors cursor-pointer flex items-center gap-1 ${
              autoVoice
                ? "bg-primary/15 text-primary border-primary/40 font-semibold"
                : "border-border text-muted-foreground hover:bg-secondary"
            }`}
            title={autoVoice ? "Mute automatic voice" : "Enable automatic voice readout"}
          >
            {autoVoice ? <Volume2 className="size-3.5" /> : <VolumeX className="size-3.5" />}
            <span className="hidden sm:inline text-[0.68rem]">
              {autoVoice ? "Voice On" : "Voice Off"}
            </span>
          </button>

          {isSpeaking && (
            <button
              type="button"
              onClick={() => {
                if (typeof window !== "undefined" && window.speechSynthesis) {
                  window.speechSynthesis.cancel();
                  setIsSpeaking(false);
                  setActiveSpeechId(null);
                }
              }}
              className="p-1.5 rounded-md bg-destructive/15 text-destructive border border-destructive/30 hover:bg-destructive/25 transition-colors cursor-pointer"
              title="Stop Speaking"
            >
              <Square className="size-3.5 fill-current" />
            </button>
          )}

          <button
            type="button"
            onClick={() => {
              setMessages([
                {
                  id: "welcome-reset",
                  role: "model",
                  content: "Conversation cleared. Ready for your cybersecurity query.",
                },
              ]);
              if (typeof window !== "undefined" && window.speechSynthesis) {
                window.speechSynthesis.cancel();
              }
              setIsSpeaking(false);
            }}
            className="p-1.5 rounded-md border border-border text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
            title="Clear Chat History"
          >
            <RotateCcw className="size-3.5" />
          </button>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-3.5 sm:p-4 space-y-3.5 scrollbar-none">
        {messages.map((msg) => {
          const isUser = msg.role === "user";
          const isThisSpeaking = isSpeaking && activeSpeechId === msg.id;

          // Extract any commands inside markdown code blocks
          const commandMatches: string[] = [];
          const codeBlockRegex = /```(?:bash|sh|zsh)?\n([\s\S]*?)```/g;
          let match;
          while ((match = codeBlockRegex.exec(msg.content)) !== null) {
            commandMatches.push(match[1].trim());
          }

          return (
            <div
              key={msg.id}
              className={`flex gap-2.5 ${isUser ? "justify-end" : "justify-start"} animate-in fade-in duration-200`}
            >
              {!isUser && (
                <div className="flex size-7 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary border border-primary/20 mt-0.5">
                  <Bot className="size-3.5" />
                </div>
              )}

              <div
                className={`max-w-[88%] sm:max-w-[82%] rounded-xl p-3 text-xs leading-relaxed space-y-2 ${
                  isUser
                    ? "bg-primary text-primary-foreground font-medium rounded-br-xs"
                    : "bg-secondary/40 border border-border text-foreground rounded-bl-xs"
                }`}
              >
                {/* Speech audio banner if playing */}
                {!isUser && isThisSpeaking && (
                  <div className="flex items-center gap-1.5 text-primary pb-1 border-b border-border/70 font-mono text-[0.68rem] font-bold">
                    <span className="flex gap-0.5 items-end h-3">
                      <span className="w-0.5 h-2 bg-primary animate-bounce" />
                      <span className="w-0.5 h-3 bg-primary animate-bounce delay-100" />
                      <span className="w-0.5 h-1.5 bg-primary animate-bounce delay-200" />
                    </span>
                    <span>Voice Agent Speaking...</span>
                  </div>
                )}

                {/* Message Content formatted cleanly */}
                <div className="whitespace-pre-wrap font-sans text-xs break-words">
                  {msg.content}
                </div>

                {/* Extracted 1-Click Run/Copy Action Chips */}
                {!isUser && commandMatches.length > 0 && (
                  <div className="pt-2 border-t border-border/60 space-y-1.5">
                    <span className="label-mono text-[0.62rem] text-muted-foreground uppercase flex items-center gap-1">
                      <Terminal className="size-3 text-primary" /> Extracted Terminal Actions:
                    </span>
                    {commandMatches.map((cmd, cIdx) => (
                      <div
                        key={cIdx}
                        className="flex items-center justify-between gap-2 rounded bg-background p-1.5 font-mono text-[0.68rem] text-foreground border border-border/80"
                      >
                        <span className="truncate max-w-[240px] sm:max-w-md">
                          {cmd.split("\n")[0]}
                        </span>
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            type="button"
                            onClick={() => copyCommand(cmd)}
                            className="p-1 rounded hover:bg-secondary text-primary transition-colors cursor-pointer"
                            title="Copy Command"
                          >
                            {copiedCmd === cmd ? (
                              <Check className="size-3" />
                            ) : (
                              <Copy className="size-3" />
                            )}
                          </button>
                          {onCommandRun && (
                            <button
                              type="button"
                              onClick={() => onCommandRun(cmd)}
                              className="px-1.5 py-0.5 rounded bg-primary text-primary-foreground font-semibold text-[0.6rem] hover:bg-primary/90 transition-colors"
                            >
                              Run
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Voice narration button on model messages */}
                {!isUser && (
                  <div className="flex items-center justify-between pt-1 border-t border-border/50 text-[0.65rem] text-muted-foreground">
                    <button
                      type="button"
                      onClick={() => speakText(msg.content, msg.id)}
                      className="inline-flex items-center gap-1 text-primary hover:underline font-mono cursor-pointer"
                    >
                      {isThisSpeaking ? (
                        <>
                          <Square className="size-2.5 fill-current" />
                          <span>Stop Voice</span>
                        </>
                      ) : (
                        <>
                          <Play className="size-2.5 fill-current" />
                          <span>Listen to Voice Advice</span>
                        </>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(msg.content);
                        toast.success("Advice copied to clipboard");
                      }}
                      className="hover:text-foreground text-[0.65rem] flex items-center gap-1"
                    >
                      <Copy className="size-2.5" />
                      <span>Copy</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {/* Loading Spinner Indicator */}
        {isLoading && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground bg-secondary/30 p-3 rounded-lg border border-border/60 max-w-[280px]">
            <Loader2 className="size-4 animate-spin text-primary shrink-0" />
            <span className="font-mono text-[0.72rem]">
              CyberGuard AI analyzing incident vector...
            </span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Quick Prompt Chips */}
      <div className="border-t border-border/70 bg-secondary/20 px-3 py-2 overflow-x-auto scrollbar-none flex items-center gap-1.5 max-w-full">
        <span className="text-[0.65rem] font-mono text-muted-foreground uppercase shrink-0 flex items-center gap-1">
          <Sparkles className="size-2.5 text-primary" /> Suggestions:
        </span>
        {quickPrompts.map((prompt) => (
          <button
            key={prompt}
            type="button"
            onClick={() => handleSend(prompt)}
            className="rounded border border-border/80 bg-card hover:bg-secondary hover:text-primary px-2 py-0.5 text-[0.68rem] text-foreground font-medium whitespace-nowrap transition-colors cursor-pointer shrink-0"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Input Bar with Voice (Mic) & Send Controls */}
      <div className="border-t border-border bg-card p-2.5 sm:p-3">
        <div className="flex items-center gap-2">
          {/* Voice Microphone Input Button */}
          <button
            type="button"
            onClick={toggleListening}
            className={`p-2 rounded-lg border transition-all cursor-pointer shrink-0 ${
              isListening
                ? "bg-destructive text-destructive-foreground border-destructive animate-pulse ring-2 ring-destructive/30"
                : "border-border bg-secondary text-muted-foreground hover:text-foreground hover:bg-secondary/80"
            }`}
            title={isListening ? "Stop listening" : "Click to speak with Voice"}
          >
            {isListening ? <Mic className="size-4" /> : <MicOff className="size-4" />}
          </button>

          {/* Text Input Field */}
          <div className="relative flex-1">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder={
                isListening
                  ? "Listening to voice input..."
                  : "Ask AI Agent: command syntax, SHA-256 verification, rollback..."
              }
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground outline-none focus:border-primary font-sans"
            />
          </div>

          {/* Send Button */}
          <button
            type="button"
            disabled={!input.trim() || isLoading}
            onClick={() => handleSend()}
            className="inline-flex items-center justify-center rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-all cursor-pointer shadow-xs shrink-0"
          >
            {isLoading ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
          </button>
        </div>
      </div>
    </div>
  );
}
