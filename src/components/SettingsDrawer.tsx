"use client";

import * as React from "react";
import { clampSettings, type PomodoroSettings } from "@/lib/pomodoro";
import { parseYouTubeInput, type YouTubeParsedInput } from "@/lib/youtube";

type Props = {
  open: boolean;
  onClose: () => void;
  settings: PomodoroSettings;
  youtubeInput: string;
  onChange: (next: { settings: PomodoroSettings; youtubeInput: string; youtubeMedia: YouTubeParsedInput | null }) => void;
};

function Field({
  label,
  value,
  onChange,
  min,
  max,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  min: number;
  max: number;
}) {
  return (
    <label className="grid gap-2">
      <div className="text-sm font-medium text-white/80">{label}</div>
      <input
        type="number"
        inputMode="numeric"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="h-11 rounded-2xl border border-white/15 bg-white/5 px-4 text-white outline-none placeholder:text-white/30 focus:ring-2 focus:ring-white/25"
      />
    </label>
  );
}

export function SettingsDrawer({
  open,
  onClose,
  settings,
  youtubeInput,
  onChange,
}: Props) {
  const parsedMedia = React.useMemo(() => parseYouTubeInput(youtubeInput), [youtubeInput]);

  React.useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  const applySettings = (partial: Partial<PomodoroSettings>) => {
    const next = clampSettings({ ...settings, ...partial });
    onChange({ settings: next, youtubeInput, youtubeMedia: parsedMedia });
  };

  return (
    <div className="fixed inset-0 z-50">
      <button
        type="button"
        onClick={onClose}
        className="absolute inset-0 bg-black/60"
        aria-label="Close settings"
      />

      <div className="pointer-events-none absolute inset-0 flex items-end justify-center p-4 sm:items-center">
        <div className="pointer-events-auto w-full max-w-xl rounded-3xl border border-white/15 bg-white/10 p-6 shadow-2xl backdrop-blur-2xl">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-white">Settings</h2>
              <p className="mt-1 text-sm text-white/60">
                Customize your timer and background video. Changes save automatically.
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm font-medium text-white/80 hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white/30"
            >
              Done
            </button>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field
              label="Focus (minutes)"
              value={settings.focusMinutes}
              min={1}
              max={180}
              onChange={(v) => applySettings({ focusMinutes: v })}
            />
            <Field
              label="Break (minutes)"
              value={settings.breakMinutes}
              min={1}
              max={60}
              onChange={(v) => applySettings({ breakMinutes: v })}
            />
            <Field
              label="Long break (minutes)"
              value={settings.longBreakMinutes}
              min={1}
              max={90}
              onChange={(v) => applySettings({ longBreakMinutes: v })}
            />
            <Field
              label="Rounds per long break"
              value={settings.roundsPerLongBreak}
              min={1}
              max={12}
              onChange={(v) => applySettings({ roundsPerLongBreak: v })}
            />
          </div>

          <div className="mt-6 grid gap-2">
            <label className="text-sm font-medium text-white/80">
              YouTube background (URL, Video ID, or Playlist ID)
            </label>
            <input
              type="text"
              value={youtubeInput}
              onChange={(e) =>
                onChange({
                  settings,
                  youtubeInput: e.target.value,
                  youtubeMedia: parseYouTubeInput(e.target.value),
                })
              }
              placeholder="Paste a YouTube link, video id, or playlist id"
              className="h-11 rounded-2xl border border-white/15 bg-white/5 px-4 text-white outline-none placeholder:text-white/30 focus:ring-2 focus:ring-white/25"
            />
            <div className="text-xs text-white/60">
              {parsedMedia ? (
                <span>
                  Looks good. {parsedMedia.type === "playlist" ? "Playlist ID" : "Video ID"}:{" "}
                  <span className="font-mono text-white/80">{parsedMedia.id}</span>
                </span>
              ) : (
                <span>Enter a valid YouTube URL, video ID, or playlist ID.</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

