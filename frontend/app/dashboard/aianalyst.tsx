"use client";

import { useEffect, useRef, useState } from "react";
import { clientApiFetch, ApiError } from "@/lib/api";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

interface ChatResponse {
  message: string;
}

export default function AIAnalyst() {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isSending]);

  async function handleSend() {
    const trimmed = message.trim();
    if (!trimmed || isSending) return;

    setMessages((prev) => [...prev, { role: "user", content: trimmed }]);
    setMessage("");
    setError(null);
    setIsSending(true);

    try {
      const res = await clientApiFetch<ChatResponse>("/ai/chat", {
        method: "POST",
        body: JSON.stringify({ message: trimmed }),
      });

      setMessages((prev) => [...prev, { role: "assistant", content: res.message }]);
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : "Something went wrong. Please try again.";
      setError(msg);
    } finally {
      setIsSending(false);
    }
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="analyst-btn group relative flex items-center gap-2 overflow-hidden rounded-full px-5 py-2.5 text-sm font-semibold text-white transition-transform duration-300 hover:-translate-y-0.5 hover:scale-105"
      >
        <span className="sparkle relative z-10 text-base">✦</span>
        <span className="relative z-10">AI Analyst</span>
        <span className="shine pointer-events-none absolute inset-0 z-0" />

        <style jsx>{`
          .analyst-btn {
            background: linear-gradient(120deg, #2563eb, #7c3aed, #2563eb);
            background-size: 200% 200%;
            animation:
              analyst-gradient 4s ease infinite,
              analyst-glow 2.5s ease-in-out infinite;
          }
          @keyframes analyst-gradient {
            0%,
            100% {
              background-position: 0% 50%;
            }
            50% {
              background-position: 100% 50%;
            }
          }
          @keyframes analyst-glow {
            0%,
            100% {
              box-shadow:
                0 0 10px rgba(99, 102, 241, 0.45),
                0 0 0 1px rgba(255, 255, 255, 0.08) inset;
            }
            50% {
              box-shadow:
                0 0 22px rgba(129, 140, 248, 0.75),
                0 0 0 1px rgba(255, 255, 255, 0.15) inset;
            }
          }
          .sparkle {
            display: inline-block;
            animation: sparkle-pulse 2s ease-in-out infinite;
          }
          @keyframes sparkle-pulse {
            0%,
            100% {
              transform: scale(1) rotate(0deg);
              opacity: 0.85;
            }
            50% {
              transform: scale(1.25) rotate(15deg);
              opacity: 1;
            }
          }
          .analyst-btn:hover .sparkle {
            animation: spin 0.9s linear infinite;
          }
          @keyframes spin {
            from {
              transform: rotate(0deg);
            }
            to {
              transform: rotate(360deg);
            }
          }
          .shine {
            background: linear-gradient(
              115deg,
              transparent 30%,
              rgba(255, 255, 255, 0.4) 45%,
              transparent 60%
            );
            transform: translateX(-130%);
            transition: transform 0.7s ease;
          }
          .analyst-btn:hover .shine {
            transform: translateX(130%);
          }
        `}</style>
      </button>

      {open && (
        <div className="fixed bottom-6 right-6 z-50 flex h-[560px] w-full max-w-sm flex-col rounded-xl border border-slate-700 bg-slate-900 shadow-2xl">

            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-700 px-5 py-4">
              <div>
                <h2 className="font-semibold text-white">
                  ✦ AI Analyst
                </h2>
                <p className="text-xs text-slate-400">
                  Ask questions about your investments
                </p>
              </div>

              <button
                onClick={() => setOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-5 space-y-3">
              {messages.length === 0 && (
                <div className="max-w-[80%] rounded-lg bg-slate-800 p-3 text-sm text-slate-300">
                  Hello! I'm your AI Analyst. How can I help?
                </div>
              )}

              {messages.map((m, i) => (
                <div
                  key={i}
                  className={`max-w-[80%] rounded-lg p-3 text-sm ${
                    m.role === "user"
                      ? "ml-auto bg-blue-600 text-white"
                      : "bg-slate-800 text-slate-300"
                  }`}
                >
                  {m.content}
                </div>
              ))}

              {isSending && (
                <div className="max-w-[80%] rounded-lg bg-slate-800 p-3 text-sm text-slate-400">
                  Thinking…
                </div>
              )}

              {error && (
                <div className="max-w-[80%] rounded-lg border border-red-800 bg-red-950 p-3 text-sm text-red-300">
                  {error}
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="border-t border-slate-700 p-4">
              <div className="flex gap-2">
                <input
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Ask the AI Analyst..."
                  disabled={isSending}
                  className="flex-1 rounded-lg border border-slate-700 bg-slate-800 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500 focus:border-slate-500 disabled:opacity-50"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                />

                <button
                  onClick={handleSend}
                  disabled={isSending || !message.trim()}
                  className="rounded-lg bg-blue-600 px-5 py-2 text-sm font-medium text-white hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSending ? "Sending…" : "Send"}
                </button>
              </div>
            </div>
        </div>
      )}
    </>
  );
}
