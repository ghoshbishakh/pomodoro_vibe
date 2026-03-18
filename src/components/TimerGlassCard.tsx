"use client";

import * as React from "react";
import { usePomodoro } from "@/hooks/usePomodoro";
import {
  DEFAULT_SETTINGS,
  formatClock,
  type PomodoroPhase,
  type PomodoroSettings,
} from "@/lib/pomodoro";

type Props = {
  settings?: PomodoroSettings;
  onOpenSettings?: () => void;
};

function phaseLabel(phase: PomodoroPhase) {
  if (phase === "focus") return "Focus";
  if (phase === "break") return "Break";
  return "Long break";
}

export function TimerGlassCard({ settings = DEFAULT_SETTINGS, onOpenSettings }: Props) {
  const { state, progress, start, pause, reset, skip } = usePomodoro(settings);

  React.useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const tag = target?.tagName?.toLowerCase();
      const isTyping =
        tag === "input" ||
        tag === "textarea" ||
        tag === "select" ||
        target?.getAttribute("contenteditable") === "true";
      if (isTyping) return;

      if (e.key === " " || e.code === "Space") {
        e.preventDefault();
        if (state.isRunning) pause();
        else start();
        return;
      }
      if (e.key === "r" || e.key === "R") {
        reset();
        return;
      }
      if (e.key === "n" || e.key === "N") {
        skip();
        return;
      }
      if ((e.key === "s" || e.key === "S") && onOpenSettings) {
        onOpenSettings();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onOpenSettings, pause, reset, skip, start, state.isRunning]);

  const ring = React.useMemo(() => {
    const radius = 92;
    const circumference = 2 * Math.PI * radius;
    const clamped = Math.min(1, Math.max(0, progress));
    const dashOffset = circumference * (1 - clamped);
    return { radius, circumference, dashOffset };
  }, [progress]);

  const primaryAction = state.isRunning ? pause : start;
  const primaryLabel = state.isRunning ? "Pause" : "Start";

  return (
    <section className="w-full max-w-xl rounded-3xl border border-white/15 bg-white/10 p-8 shadow-2xl backdrop-blur-2xl">
      <header className="flex items-start justify-between gap-4">
        <div>
          <div className="text-xs font-medium tracking-[0.25em] text-white/70">
            {phaseLabel(state.phase).toUpperCase()}
          </div>
          <div className="mt-2 text-sm text-white/60">
            Session {state.completedFocusSessions + (state.phase === "focus" ? 1 : 0)}
          </div>
        </div>

        <button
          type="button"
          onClick={onOpenSettings}
          className="rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm font-medium text-white/80 hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white/30"
        >
          Settings
        </button>
      </header>

      <div className="mt-8 flex items-center justify-center">
        <div className="relative">
          <svg width="220" height="220" viewBox="0 0 220 220" className="block">
            <defs>
              <linearGradient id="ring" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="rgba(255,255,255,0.9)" />
                <stop offset="100%" stopColor="rgba(255,255,255,0.25)" />
              </linearGradient>
            </defs>
            <circle
              cx="110"
              cy="110"
              r={ring.radius}
              fill="none"
              stroke="rgba(255,255,255,0.12)"
              strokeWidth="12"
            />
            <circle
              cx="110"
              cy="110"
              r={ring.radius}
              fill="none"
              stroke="url(#ring)"
              strokeWidth="12"
              strokeLinecap="round"
              strokeDasharray={ring.circumference}
              strokeDashoffset={ring.dashOffset}
              transform="rotate(-90 110 110)"
            />
          </svg>

          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
            <div className="text-6xl font-semibold tabular-nums tracking-tight text-white">
              {formatClock(state.secondsLeft)}
            </div>
            <div className="mt-2 text-sm text-white/60">
              {Math.round(progress * 100)}% complete
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <button
          type="button"
          onClick={primaryAction}
          className="col-span-2 rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-black hover:bg-white/90 focus:outline-none focus:ring-2 focus:ring-white/40 sm:col-span-2"
        >
          {primaryLabel}
        </button>

        <button
          type="button"
          onClick={reset}
          className="rounded-2xl border border-white/15 bg-white/5 px-5 py-3 text-sm font-semibold text-white/90 hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white/30"
        >
          Reset
        </button>

        <button
          type="button"
          onClick={skip}
          className="rounded-2xl border border-white/15 bg-white/5 px-5 py-3 text-sm font-semibold text-white/90 hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white/30"
        >
          Skip
        </button>
      </div>
    </section>
  );
}

