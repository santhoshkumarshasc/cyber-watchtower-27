import { useState } from "react";
import { Bot, Volume2, Sparkles, ChevronDown, Mic } from "lucide-react";
import { CyberAIAgent } from "./CyberAIAgent";
import { GeminiLiveVoice } from "./GeminiLiveVoice";

export function GlobalAIAssistantWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [isLiveVoiceOpen, setIsLiveVoiceOpen] = useState(false);

  return (
    <>
      {/* Real-time Gemini Live Voice Full Interactive Modal */}
      <GeminiLiveVoice isOpen={isLiveVoiceOpen} onClose={() => setIsLiveVoiceOpen(false)} />

      <div className="fixed bottom-3 right-3 sm:bottom-6 sm:right-6 z-40 flex flex-col items-end">
        {/* Floating Active AI Window */}
        {isOpen && (
          <div className="mb-2 w-[94vw] sm:w-[420px] md:w-[460px] max-w-[96vw] animate-in slide-in-from-bottom-5 duration-200">
            <div className="relative shadow-2xl rounded-2xl overflow-hidden border border-border bg-card">
              {/* Widget Top Bar */}
              <div className="flex items-center justify-between border-b border-border bg-secondary/80 px-3 py-2 sm:px-4 sm:py-2.5 backdrop-blur-md">
                <div className="flex items-center gap-2">
                  <div className="relative flex size-7 items-center justify-center rounded-lg bg-primary/20 text-primary border border-primary/40">
                    <Bot className="size-4" />
                    <span className="absolute -bottom-0.5 -right-0.5 size-2 rounded-full bg-emerald-500 ring-2 ring-card animate-pulse" />
                  </div>
                  <div>
                    <span className="font-bold text-xs text-foreground block leading-tight">
                      CyberGuard SOC Copilot
                    </span>
                    <span className="text-[0.62rem] text-muted-foreground font-mono">
                      Voice &amp; Chat Live Support
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  {/* Real-time Gemini Live Mode Button */}
                  <button
                    type="button"
                    onClick={() => {
                      setIsOpen(false);
                      setIsLiveVoiceOpen(true);
                    }}
                    className="inline-flex items-center gap-1 rounded-md bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 text-white px-2.5 py-1 text-[0.68rem] font-bold shadow-xs hover:opacity-90 transition-opacity cursor-pointer animate-pulse"
                    title="Start Real-Time Gemini Live Voice Session"
                  >
                    <Mic className="size-3" />
                    <span>Gemini Live</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="size-7 rounded-md border border-border bg-card text-muted-foreground hover:text-foreground flex items-center justify-center transition-colors cursor-pointer"
                    title="Minimize AI Assistant"
                  >
                    <ChevronDown className="size-4" />
                  </button>
                </div>
              </div>

              {/* AI Agent Core Interface */}
              <CyberAIAgent compact className="border-none rounded-none h-[420px] sm:h-[480px]" />
            </div>
          </div>
        )}

        {/* Floating Trigger Buttons */}
        {!isOpen && (
          <div className="flex items-center gap-2">
            {/* Direct Gemini Live Voice Pill Button */}
            <button
              type="button"
              onClick={() => setIsLiveVoiceOpen(true)}
              className="hidden sm:inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 px-3.5 py-2 text-xs font-bold text-white shadow-xl hover:scale-105 active:scale-95 transition-all cursor-pointer ring-2 ring-emerald-500/30"
              title="Launch Gemini Live Real-Time Voice"
            >
              <Mic className="size-3.5 animate-pulse" />
              <span>Gemini Live</span>
            </button>

            {/* Main AI Agent Trigger Button */}
            <button
              type="button"
              onClick={() => setIsOpen(true)}
              className="group relative flex items-center gap-2 rounded-full bg-primary px-3.5 sm:px-4 py-2 sm:py-2.5 text-xs font-bold text-primary-foreground shadow-xl hover:bg-primary/90 hover:scale-105 active:scale-95 transition-all cursor-pointer ring-4 ring-primary/20"
            >
              <div className="relative flex items-center justify-center">
                <Bot className="size-4 sm:size-4.5" />
                <span className="absolute -top-1 -right-1 size-2 rounded-full bg-emerald-400 animate-pulse" />
              </div>
              <span className="tracking-wide">AI Agent</span>
              <span className="rounded-full bg-primary-foreground/20 px-1.5 py-0.2 text-[0.62rem] sm:text-[0.65rem] font-mono flex items-center gap-1">
                <Volume2 className="size-2.5 sm:size-3" /> Voice
              </span>
            </button>
          </div>
        )}
      </div>
    </>
  );
}
