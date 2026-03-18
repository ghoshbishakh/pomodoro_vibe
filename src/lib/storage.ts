import { clampSettings, DEFAULT_SETTINGS, type PomodoroSettings } from "@/lib/pomodoro";

export type PersistedState = {
  settings: PomodoroSettings;
  youtubeVideoId: string;
};

const STORAGE_KEY = "pomodoro_vibe:v1";

const DEFAULT_PERSISTED: PersistedState = {
  settings: DEFAULT_SETTINGS,
  youtubeVideoId: "jfKfPfyJRdk",
};

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

export function loadPersistedState(): PersistedState {
  if (typeof window === "undefined") return DEFAULT_PERSISTED;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_PERSISTED;
    const parsed: unknown = JSON.parse(raw);
    if (!isObject(parsed)) return DEFAULT_PERSISTED;

    const settingsRaw = parsed.settings;
    const youtubeVideoIdRaw = parsed.youtubeVideoId;

    const settings =
      isObject(settingsRaw)
        ? clampSettings({
            focusMinutes: Number(settingsRaw.focusMinutes),
            breakMinutes: Number(settingsRaw.breakMinutes),
            longBreakMinutes: Number(settingsRaw.longBreakMinutes),
            roundsPerLongBreak: Number(settingsRaw.roundsPerLongBreak),
          })
        : DEFAULT_SETTINGS;

    const youtubeVideoId =
      typeof youtubeVideoIdRaw === "string" && youtubeVideoIdRaw.trim()
        ? youtubeVideoIdRaw.trim()
        : DEFAULT_PERSISTED.youtubeVideoId;

    return { settings, youtubeVideoId };
  } catch {
    return DEFAULT_PERSISTED;
  }
}

export function savePersistedState(next: PersistedState) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // ignore quota / private mode failures
  }
}

