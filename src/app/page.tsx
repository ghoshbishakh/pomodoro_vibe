"use client";

import * as React from "react";
import { YouTubeBackground } from "@/components/YouTubeBackground";
import { TimerGlassCard } from "@/components/TimerGlassCard";
import { SettingsDrawer } from "@/components/SettingsDrawer";
import { DEFAULT_SETTINGS, type PomodoroSettings } from "@/lib/pomodoro";
import { loadPersistedState, savePersistedState } from "@/lib/storage";

export default function Home() {
  const [settingsOpen, setSettingsOpen] = React.useState(false);
  const [settings, setSettings] = React.useState<PomodoroSettings>(DEFAULT_SETTINGS);
  const [youtubeInput, setYoutubeInput] = React.useState("Xh4BNbxpI8");
  const [youtubeVideoId, setYoutubeVideoId] = React.useState("Xh4BNbxpI8");

  React.useEffect(() => {
    const persisted = loadPersistedState();
    setSettings(persisted.settings);
    setYoutubeVideoId(persisted.youtubeVideoId);
    setYoutubeInput(persisted.youtubeVideoId);
  }, []);

  React.useEffect(() => {
    savePersistedState({ settings, youtubeVideoId });
  }, [settings, youtubeVideoId]);

  return (
    <div className="relative min-h-dvh">
      <YouTubeBackground videoId={youtubeVideoId} />

      <main className="mx-auto flex min-h-dvh max-w-5xl items-center justify-center px-6 py-10">
        <TimerGlassCard settings={settings} onOpenSettings={() => setSettingsOpen(true)} />
      </main>

      <SettingsDrawer
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        settings={settings}
        youtubeInput={youtubeInput}
        onChange={({ settings: nextSettings, youtubeInput: nextInput, youtubeVideoId: nextVideoId }) => {
          setSettings(nextSettings);
          setYoutubeInput(nextInput);
          if (nextVideoId) setYoutubeVideoId(nextVideoId);
        }}
      />
    </div>
  );
}
