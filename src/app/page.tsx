"use client";

import * as React from "react";
import { YouTubeBackground } from "@/components/YouTubeBackground";
import { TimerGlassCard } from "@/components/TimerGlassCard";
import { SettingsDrawer } from "@/components/SettingsDrawer";
import { DEFAULT_SETTINGS, type PomodoroSettings } from "@/lib/pomodoro";
import { loadPersistedState, savePersistedState } from "@/lib/storage";
import { parseYouTubeInput, type YouTubeParsedInput } from "@/lib/youtube";

export default function Home() {
  const [settingsOpen, setSettingsOpen] = React.useState(false);
  const [settings, setSettings] = React.useState<PomodoroSettings>(DEFAULT_SETTINGS);
  const [youtubeInput, setYoutubeInput] = React.useState("Xh4BNbxpI8");

  // Provide a safe default for server-side rendering
  const [youtubeMedia, setYoutubeMedia] = React.useState<YouTubeParsedInput>({
    type: "video",
    id: "Xh4BNbxpI8",
  });

  React.useEffect(() => {
    const persisted = loadPersistedState();
    setSettings(persisted.settings);
    const parsedMedia = parseYouTubeInput(persisted.youtubeVideoId) || {
      type: "video",
      id: persisted.youtubeVideoId,
    };
    setYoutubeMedia(parsedMedia);
    setYoutubeInput(persisted.youtubeVideoId);
  }, []);

  React.useEffect(() => {
    savePersistedState({ settings, youtubeVideoId: youtubeMedia.id });
  }, [settings, youtubeMedia]);

  return (
    <div className="relative min-h-dvh">
      <YouTubeBackground media={youtubeMedia} />

      <main className="mx-auto flex min-h-dvh max-w-5xl items-center justify-center px-6 py-10">
        <TimerGlassCard settings={settings} onOpenSettings={() => setSettingsOpen(true)} />
      </main>

      <SettingsDrawer
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        settings={settings}
        youtubeInput={youtubeInput}
        onChange={({ settings: nextSettings, youtubeInput: nextInput, youtubeMedia: nextMedia }) => {
          setSettings(nextSettings);
          setYoutubeInput(nextInput);
          if (nextMedia) setYoutubeMedia(nextMedia);
        }}
      />
    </div>
  );
}
