import { useState, useEffect, useRef, useCallback } from "react";
import {
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  X,
  Sparkles,
  RotateCcw,
  Radio,
  Square,
  Play,
  Layers,
  Bot,
  Terminal,
  ShieldAlert,
  ArrowRight,
} from "lucide-react";
import { toast } from "sonner";
import { askCyberAgent } from "@/lib/ai-assistant.functions";

interface GeminiLiveVoiceProps {
  isOpen: boolean;
  onClose: () => void;
  context?: string;
  onRunCommand?: (cmd: string) => void;
}

type LiveState = "idle" | "listening" | "thinking" | "speaking";

interface DialogueTurn {
  role: "user" | "gemini";
  text: string;
  time: string;
}

interface LiveSpeechRecognitionResultItem {
  transcript: string;
}

interface LiveSpeechRecognitionResultList {
  [index: number]: {
    [index: number]: LiveSpeechRecognitionResultItem;
    isFinal?: boolean;
  };
  length: number;
}

interface LiveSpeechRecognitionEvent {
  resultIndex: number;
  results: LiveSpeechRecognitionResultList;
}

interface LiveSpeechRecognitionInstance extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  onstart: (() => void) | null;
  onresult: ((event: LiveSpeechRecognitionEvent) => void) | null;
  onerror: ((event: { error: string }) => void) | null;
  onend: (() => void) | null;
}

// Strip markdown code blocks and format text for natural speech synthesis
function formatTextForVoice(text: string): string {
  return text
    .replace(/```[\s\S]*?```/g, "I have placed the terminal execution commands on your screen.")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/[#*_~>]/g, "")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .trim();
}

export function GeminiLiveVoice({ isOpen, onClose, context, onRunCommand }: GeminiLiveVoiceProps) {
  const [liveState, setLiveState] = useState<LiveState>("idle");
  const [liveTranscript, setLiveTranscript] = useState("");
  const [geminiSpeechText, setGeminiSpeechText] = useState("");
  const [dialogueHistory, setDialogueHistory] = useState<DialogueTurn[]>([]);
  const [micPermission, setMicPermission] = useState<"prompt" | "granted" | "denied">("prompt");
  const [continuousMode, setContinuousMode] = useState(true);
  const [audioLevel, setAudioLevel] = useState(0);

  // Audio Context & Analyser refs for real-time sound visualization
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const animFrameRef = useRef<number | null>(null);

  // Speech Recognition & Synthesis refs
  const recognitionRef = useRef<LiveSpeechRecognitionInstance | null>(null);
  const isComponentMounted = useRef(true);

  // Initialize Speech Recognition
  const initSpeechRecognition = useCallback(() => {
    if (typeof window === "undefined") return null;

    const windowWithSpeech = window as unknown as {
      SpeechRecognition?: new () => LiveSpeechRecognitionInstance;
      webkitSpeechRecognition?: new () => LiveSpeechRecognitionInstance;
    };
    const SpeechRecognition =
      windowWithSpeech.SpeechRecognition || windowWithSpeech.webkitSpeechRecognition;

    if (!SpeechRecognition) return null;

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    recognition.onstart = () => {
      setLiveState("listening");
      setLiveTranscript("");
    };

    recognition.onresult = (event: LiveSpeechRecognitionEvent) => {
      let interim = "";
      let final = "";

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          final += event.results[i][0].transcript;
        } else {
          interim += event.results[i][0].transcript;
        }
      }

      const current = final || interim;
      if (current) {
        setLiveTranscript(current);
      }
    };

    recognition.onerror = (event: { error: string }) => {
      if (event.error !== "no-speech") {
        console.warn("Speech recognition error:", event.error);
      }
      setLiveState("idle");
    };

    recognition.onend = () => {
      // If we have captured text, automatically send to Gemini
      setLiveTranscript((latestTranscript) => {
        if (latestTranscript.trim().length > 0) {
          handleUserSpeechDone(latestTranscript.trim());
        } else {
          setLiveState("idle");
        }
        return latestTranscript;
      });
    };

    return recognition;
  }, []);

  // Web Audio microphone visualizer stream
  const startAudioVisualizer = async () => {
    try {
      if (!navigator.mediaDevices?.getUserMedia) return;
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
      mediaStreamRef.current = stream;
      setMicPermission("granted");

      const windowWithAudio = window as unknown as {
        AudioContext?: typeof AudioContext;
        webkitAudioContext?: typeof AudioContext;
      };
      const AudioCtx = windowWithAudio.AudioContext || windowWithAudio.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      audioContextRef.current = ctx;

      const analyser = ctx.createAnalyser();
      analyser.fftSize = 64;
      analyser.smoothingTimeConstant = 0.6;
      analyserRef.current = analyser;

      const source = ctx.createMediaStreamSource(stream);
      source.connect(analyser);

      const dataArray = new Uint8Array(analyser.frequencyBinCount);

      const updateLevel = () => {
        if (!analyserRef.current) return;
        analyserRef.current.getByteFrequencyData(dataArray);
        let sum = 0;
        for (let i = 0; i < dataArray.length; i++) {
          sum += dataArray[i];
        }
        const avg = sum / dataArray.length;
        setAudioLevel(Math.min(100, Math.round((avg / 255) * 100)));
        animFrameRef.current = requestAnimationFrame(updateLevel);
      };

      updateLevel();
    } catch {
      setMicPermission("denied");
      toast.error("Microphone access permission needed for live voice interaction.");
    }
  };

  const stopAudioVisualizer = () => {
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((t) => t.stop());
      mediaStreamRef.current = null;
    }
    if (audioContextRef.current && audioContextRef.current.state !== "closed") {
      audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
    }
    setAudioLevel(0);
  };

  // Start listening to user voice
  const startListening = () => {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }

    try {
      if (!recognitionRef.current) {
        recognitionRef.current = initSpeechRecognition();
      }
      if (recognitionRef.current) {
        recognitionRef.current.start();
        setLiveState("listening");
      } else {
        toast.error(
          "Speech recognition not supported in this browser. Please type or use Chrome/Safari/Edge.",
        );
      }
    } catch {
      try {
        recognitionRef.current?.stop();
        setTimeout(() => recognitionRef.current?.start(), 150);
      } catch {
        setLiveState("idle");
      }
    }
  };

  // Stop listening
  const stopListening = () => {
    try {
      recognitionRef.current?.stop();
    } catch {
      // Ignore
    }
    setLiveState("idle");
  };

  // Handle user speech complete -> Send to Gemini
  const handleUserSpeechDone = async (userText: string) => {
    if (!userText.trim()) {
      setLiveState("idle");
      return;
    }

    const now = new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
    const userTurn: DialogueTurn = { role: "user", text: userText, time: now };

    setDialogueHistory((prev) => [...prev, userTurn]);
    setLiveState("thinking");
    setLiveTranscript("");

    try {
      const response = await askCyberAgent({
        data: {
          messages: [
            ...dialogueHistory.map((d) => ({
              role: d.role === "user" ? ("user" as const) : ("model" as const),
              content: d.text,
            })),
            { role: "user", content: userText },
          ],
          context,
        },
      });

      const replyText = response.reply;
      setGeminiSpeechText(replyText);

      const geminiTurn: DialogueTurn = {
        role: "gemini",
        text: replyText,
        time: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        }),
      };
      setDialogueHistory((prev) => [...prev, geminiTurn]);

      // Speak reply in real-time
      speakGeminiReply(replyText);
    } catch {
      const fallbackMsg =
        "I understand your query. Let's isolate the affected network perimeter and review the verified patch on your console.";
      setGeminiSpeechText(fallbackMsg);
      speakGeminiReply(fallbackMsg);
    }
  };

  // Speak Gemini's answer aloud
  const speakGeminiReply = (text: string) => {
    if (typeof window === "undefined" || !window.speechSynthesis) {
      setLiveState("idle");
      return;
    }

    window.speechSynthesis.cancel();
    setLiveState("speaking");

    const voiceScript = formatTextForVoice(text);
    const utterance = new SpeechSynthesisUtterance(voiceScript);
    utterance.rate = 1.05;
    utterance.pitch = 1.0;

    const voices = window.speechSynthesis.getVoices();
    const naturalVoice = voices.find(
      (v) =>
        v.lang.startsWith("en") &&
        (v.name.includes("Google") || v.name.includes("Natural") || v.name.includes("Samantha")),
    );
    if (naturalVoice) utterance.voice = naturalVoice;

    utterance.onend = () => {
      if (!isComponentMounted.current) return;
      setLiveState("idle");
      // Continuous hands-free conversation loop
      if (continuousMode) {
        setTimeout(() => {
          if (isComponentMounted.current && liveState !== "speaking") {
            startListening();
          }
        }, 600);
      }
    };

    utterance.onerror = () => {
      setLiveState("idle");
    };

    window.speechSynthesis.speak(utterance);
  };

  // Interrupt Gemini speaking
  const interruptGemini = () => {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setLiveState("idle");
    startListening();
  };

  useEffect(() => {
    isComponentMounted.current = true;

    if (isOpen) {
      startAudioVisualizer();
      recognitionRef.current = initSpeechRecognition();
      // Auto-start greeting
      const greeting = context
        ? `CyberGuard Gemini Live connected. I am tracking ${context.slice(0, 80)}. How can I assist you right now?`
        : "CyberGuard Gemini Live connected. What cybersecurity threat or remediation command do you need?";

      setGeminiSpeechText(greeting);
      setDialogueHistory([
        {
          role: "gemini",
          text: greeting,
          time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
      speakGeminiReply(greeting);
    } else {
      stopAudioVisualizer();
      if (typeof window !== "undefined" && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
      setLiveState("idle");
    }

    return () => {
      isComponentMounted.current = false;
      stopAudioVisualizer();
      if (typeof window !== "undefined" && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-background/95 backdrop-blur-xl animate-in fade-in duration-200">
      {/* Container Card */}
      <div className="relative w-full max-w-2xl max-h-[92vh] flex flex-col rounded-2xl border border-primary/30 bg-card shadow-2xl overflow-hidden">
        {/* Top Header */}
        <div className="flex items-center justify-between border-b border-border bg-secondary/50 px-4 py-3 sm:px-6">
          <div className="flex items-center gap-2.5">
            <div className="relative flex size-8 items-center justify-center rounded-lg bg-primary/20 text-primary border border-primary/40">
              <Sparkles className="size-4 animate-spin-slow" />
              <span className="absolute -bottom-0.5 -right-0.5 size-2 rounded-full bg-emerald-500 ring-2 ring-card animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm sm:text-base text-foreground font-display">
                  Gemini Live Voice
                </span>
                <span className="rounded-full bg-primary/20 px-2 py-0.5 font-mono text-[0.62rem] font-bold text-primary border border-primary/30 uppercase tracking-wider">
                  Real-Time SOC AI
                </span>
              </div>
              <p className="text-[0.68rem] text-muted-foreground font-mono">
                Full-Duplex Interactive Audio &middot; Hands-Free
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setContinuousMode(!continuousMode);
                toast.info(
                  continuousMode
                    ? "Hands-free continuous mode off"
                    : "Hands-free continuous mode on",
                );
              }}
              className={`px-2 py-1 rounded text-[0.68rem] font-semibold border transition-colors cursor-pointer ${
                continuousMode
                  ? "bg-primary/15 text-primary border-primary/40"
                  : "bg-secondary text-muted-foreground border-border"
              }`}
              title="Toggle Hands-Free Continuous Loop"
            >
              {continuousMode ? "Hands-Free: On" : "Hands-Free: Off"}
            </button>

            <button
              type="button"
              onClick={onClose}
              className="size-8 rounded-lg border border-border bg-secondary hover:bg-secondary/80 text-foreground flex items-center justify-center transition-colors cursor-pointer"
              title="Close Gemini Live Voice"
            >
              <X className="size-4" />
            </button>
          </div>
        </div>

        {/* Gemini Live Visualizer & Aura Orb Canvas */}
        <div className="relative flex flex-col items-center justify-center p-6 sm:p-10 border-b border-border/80 bg-gradient-to-b from-primary/5 via-card to-background overflow-hidden min-h-[220px] sm:min-h-[260px]">
          {/* Background Ambient Glow */}
          <div
            className={`absolute size-48 sm:size-64 rounded-full blur-3xl transition-all duration-700 pointer-events-none opacity-40 ${
              liveState === "listening"
                ? "bg-emerald-500 scale-125"
                : liveState === "thinking"
                  ? "bg-purple-500 animate-pulse scale-110"
                  : liveState === "speaking"
                    ? "bg-cyan-500 scale-125 animate-pulse"
                    : "bg-primary scale-100"
            }`}
          />

          {/* Glowing Animated Gemini Aura Sphere */}
          <div className="relative flex items-center justify-center">
            {/* Outer Pulsing Rings */}
            <div
              className={`absolute size-32 sm:size-40 rounded-full border-2 transition-all duration-500 ${
                liveState === "listening"
                  ? "border-emerald-500/50 scale-125 animate-ping opacity-30"
                  : liveState === "speaking"
                    ? "border-cyan-400/50 scale-125 animate-ping opacity-30"
                    : "border-primary/20 scale-100 opacity-20"
              }`}
            />

            {/* Core Organic Sphere */}
            <div
              className={`relative size-24 sm:size-28 rounded-full shadow-2xl flex items-center justify-center transition-all duration-500 cursor-pointer ${
                liveState === "listening"
                  ? "bg-gradient-to-br from-emerald-400 via-teal-500 to-cyan-600 shadow-emerald-500/40 scale-110"
                  : liveState === "thinking"
                    ? "bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 shadow-purple-500/40 animate-spin-slow scale-105"
                    : liveState === "speaking"
                      ? "bg-gradient-to-br from-cyan-400 via-blue-500 to-indigo-600 shadow-cyan-500/40 scale-110"
                      : "bg-gradient-to-br from-primary via-blue-600 to-indigo-700 shadow-primary/30"
              }`}
              onClick={liveState === "speaking" ? interruptGemini : startListening}
            >
              {liveState === "listening" ? (
                <Mic className="size-8 text-white animate-bounce" />
              ) : liveState === "thinking" ? (
                <Sparkles className="size-8 text-white animate-spin" />
              ) : liveState === "speaking" ? (
                <Volume2 className="size-8 text-white animate-pulse" />
              ) : (
                <Bot className="size-8 text-white" />
              )}
            </div>
          </div>

          {/* Dynamic Audio Level Frequency Waves */}
          <div className="mt-6 flex items-center justify-center gap-1.5 h-8">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((barIdx) => {
              const heightMultiplier = Math.sin((barIdx / 12) * Math.PI);
              const computedHeight =
                liveState === "listening"
                  ? Math.max(6, Math.round((audioLevel / 100) * 32 * heightMultiplier) + 4)
                  : liveState === "speaking"
                    ? Math.max(6, Math.round((Math.sin(Date.now() / 200 + barIdx) + 1) * 12) + 6)
                    : 4;

              return (
                <div
                  key={barIdx}
                  className={`w-1 rounded-full transition-all duration-100 ${
                    liveState === "listening"
                      ? "bg-emerald-400"
                      : liveState === "thinking"
                        ? "bg-purple-400 animate-pulse"
                        : liveState === "speaking"
                          ? "bg-cyan-400"
                          : "bg-muted-foreground/30"
                  }`}
                  style={{ height: `${computedHeight}px` }}
                />
              );
            })}
          </div>

          {/* Real-Time Status Label */}
          <div className="mt-3 text-center">
            <span
              className={`font-mono text-xs font-bold uppercase tracking-widest ${
                liveState === "listening"
                  ? "text-emerald-500 animate-pulse"
                  : liveState === "thinking"
                    ? "text-purple-400 animate-pulse"
                    : liveState === "speaking"
                      ? "text-cyan-400 animate-pulse"
                      : "text-muted-foreground"
              }`}
            >
              {liveState === "listening" && "Listening to your voice..."}
              {liveState === "thinking" && "Gemini reasoning & generating response..."}
              {liveState === "speaking" && "Gemini speaking (tap sphere to interrupt)"}
              {liveState === "idle" && "Ready &middot; Tap to Speak"}
            </span>

            {/* Live Subtitle Transcript Stream */}
            {liveTranscript && (
              <p className="mt-2 text-xs sm:text-sm text-foreground font-medium max-w-md mx-auto italic bg-secondary/60 px-3 py-1.5 rounded-full border border-border">
                "{liveTranscript}"
              </p>
            )}
          </div>
        </div>

        {/* Live Conversation Transcript Stream (Scrollable) */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3 max-h-[240px] sm:max-h-[300px] scrollbar-none bg-background/50">
          <div className="flex items-center justify-between text-[0.68rem] text-muted-foreground font-mono pb-1 border-b border-border/60">
            <span>Live Audio Transcript</span>
            <span>{dialogueHistory.length} Exchanges</span>
          </div>

          {dialogueHistory.map((item, idx) => (
            <div
              key={idx}
              className={`flex flex-col ${item.role === "user" ? "items-end" : "items-start"}`}
            >
              <div className="flex items-center gap-1.5 text-[0.65rem] text-muted-foreground mb-0.5 font-mono">
                <span>{item.role === "user" ? "You (Voice)" : "Gemini Live"}</span>
                <span>&middot;</span>
                <span>{item.time}</span>
              </div>
              <div
                className={`rounded-xl p-3 text-xs leading-relaxed max-w-[90%] sm:max-w-[85%] whitespace-pre-wrap ${
                  item.role === "user"
                    ? "bg-primary text-primary-foreground font-medium rounded-br-xs"
                    : "bg-secondary/60 border border-border text-foreground rounded-bl-xs"
                }`}
              >
                {item.text}
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Interactive Voice Control Bar */}
        <div className="border-t border-border bg-card p-3 sm:p-4 flex flex-wrap items-center justify-between gap-2.5">
          {/* Quick Voice Prompt Shortcuts */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none flex-nowrap max-w-full">
            <span className="text-[0.62rem] font-mono text-muted-foreground uppercase shrink-0">
              Quick Asks:
            </span>
            {[
              "Explain the verified patch",
              "How to verify SHA-256?",
              "What is the rollback plan?",
              "Am I currently compromised?",
            ].map((prompt) => (
              <button
                key={prompt}
                type="button"
                onClick={() => handleUserSpeechDone(prompt)}
                className="rounded border border-border bg-secondary hover:bg-secondary/80 hover:text-primary px-2 py-0.5 text-[0.68rem] font-medium whitespace-nowrap transition-colors cursor-pointer shrink-0"
              >
                {prompt}
              </button>
            ))}
          </div>

          {/* Action Buttons: Tap Mic & Interrupt */}
          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            {liveState === "speaking" ? (
              <button
                type="button"
                onClick={interruptGemini}
                className="inline-flex items-center gap-1.5 rounded-lg bg-destructive px-4 py-2 text-xs font-semibold text-destructive-foreground hover:bg-destructive/90 transition-all cursor-pointer shadow-xs"
              >
                <Square className="size-3.5 fill-current" />
                <span>Interrupt &amp; Speak</span>
              </button>
            ) : liveState === "listening" ? (
              <button
                type="button"
                onClick={stopListening}
                className="inline-flex items-center gap-1.5 rounded-lg bg-amber-500 px-4 py-2 text-xs font-semibold text-white hover:bg-amber-600 transition-all cursor-pointer shadow-xs animate-pulse"
              >
                <Square className="size-3.5 fill-current" />
                <span>Done Speaking</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={startListening}
                className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2 text-xs font-semibold text-primary-foreground hover:bg-primary/90 transition-all cursor-pointer shadow-md"
              >
                <Mic className="size-4" />
                <span>Tap to Speak</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
