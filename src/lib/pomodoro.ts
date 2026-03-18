export type PomodoroPhase = "focus" | "break" | "longBreak";

export type PomodoroSettings = {
  focusMinutes: number;
  breakMinutes: number;
  longBreakMinutes: number;
  roundsPerLongBreak: number;
};

export const DEFAULT_SETTINGS: PomodoroSettings = {
  focusMinutes: 25,
  breakMinutes: 5,
  longBreakMinutes: 15,
  roundsPerLongBreak: 4,
};

export type PomodoroState = {
  phase: PomodoroPhase;
  completedFocusSessions: number;
  secondsLeft: number;
  isRunning: boolean;
};

export type PomodoroAction =
  | { type: "start" }
  | { type: "pause" }
  | { type: "reset"; settings: PomodoroSettings }
  | { type: "skip"; settings: PomodoroSettings }
  | { type: "tick"; settings: PomodoroSettings }
  | { type: "applySettings"; settings: PomodoroSettings };

export function clampSettings(s: PomodoroSettings): PomodoroSettings {
  const toInt = (n: number) => (Number.isFinite(n) ? Math.trunc(n) : 0);
  const clamp = (n: number, min: number, max: number) =>
    Math.min(max, Math.max(min, n));

  return {
    focusMinutes: clamp(toInt(s.focusMinutes), 1, 180),
    breakMinutes: clamp(toInt(s.breakMinutes), 1, 60),
    longBreakMinutes: clamp(toInt(s.longBreakMinutes), 1, 90),
    roundsPerLongBreak: clamp(toInt(s.roundsPerLongBreak), 1, 12),
  };
}

export function phaseTotalSeconds(
  settings: PomodoroSettings,
  phase: PomodoroPhase
): number {
  const s = clampSettings(settings);
  if (phase === "focus") return s.focusMinutes * 60;
  if (phase === "break") return s.breakMinutes * 60;
  return s.longBreakMinutes * 60;
}

export function getInitialState(settings: PomodoroSettings): PomodoroState {
  return {
    phase: "focus",
    completedFocusSessions: 0,
    secondsLeft: phaseTotalSeconds(settings, "focus"),
    isRunning: false,
  };
}

function getNextPhaseAfterFocus(settings: PomodoroSettings, completedFocus: number) {
  const s = clampSettings(settings);
  if (completedFocus % s.roundsPerLongBreak === 0) return "longBreak" as const;
  return "break" as const;
}

function advancePhase(state: PomodoroState, settings: PomodoroSettings): PomodoroState {
  if (state.phase === "focus") {
    const completed = state.completedFocusSessions + 1;
    const nextPhase = getNextPhaseAfterFocus(settings, completed);
    return {
      ...state,
      phase: nextPhase,
      completedFocusSessions: completed,
      secondsLeft: phaseTotalSeconds(settings, nextPhase),
    };
  }

  // break / longBreak -> focus
  return {
    ...state,
    phase: "focus",
    secondsLeft: phaseTotalSeconds(settings, "focus"),
  };
}

export function pomodoroReducer(
  state: PomodoroState,
  action: PomodoroAction
): PomodoroState {
  switch (action.type) {
    case "start":
      return { ...state, isRunning: true };
    case "pause":
      return { ...state, isRunning: false };
    case "reset":
      return getInitialState(action.settings);
    case "skip":
      return advancePhase({ ...state, isRunning: false }, action.settings);
    case "applySettings": {
      const total = phaseTotalSeconds(action.settings, state.phase);
      const nextSecondsLeft = Math.min(state.secondsLeft, total);
      return { ...state, secondsLeft: nextSecondsLeft };
    }
    case "tick": {
      if (!state.isRunning) return state;
      if (state.secondsLeft > 1) {
        return { ...state, secondsLeft: state.secondsLeft - 1 };
      }
      // Transition at the end of the second and continue running.
      const advanced = advancePhase({ ...state, secondsLeft: 0 }, action.settings);
      return { ...advanced, isRunning: true };
    }
    default:
      return state;
  }
}

export function formatClock(seconds: number): string {
  const s = Math.max(0, Math.floor(seconds));
  const mm = Math.floor(s / 60);
  const ss = s % 60;
  return `${String(mm).padStart(2, "0")}:${String(ss).padStart(2, "0")}`;
}

