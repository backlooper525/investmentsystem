"use client";

import { useState } from "react";

export default function AIAnalyst() {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700"
      >
        ✦ AI Analyst
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="flex h-[600px] w-full max-w-2xl flex-col rounded-xl border border-slate-700 bg-slate-900 shadow-2xl">

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
            <div className="flex-1 overflow-y-auto p-5">
              <div className="max-w-[80%] rounded-lg bg-slate-800 p-3 text-sm text-slate-300">
                Hello! I'm your AI Analyst. How can I help?
              </div>
            </div>

            {/* Input */}
            <div className="border-t border-slate-700 p-4">
              <div className="flex gap-2">
                <input
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Ask the AI Analyst..."
                  className="flex-1 rounded-lg border border-slate-700 bg-slate-800 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500 focus:border-slate-500"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      // Backend connection will go here
                    }
                  }}
                />

                <button
                  className="rounded-lg bg-blue-600 px-5 py-2 text-sm font-medium text-white hover:bg-blue-500"
                >
                  Send
                </button>
              </div>
            </div>

          </div>
        </div>
      )}
    </>
  );
}