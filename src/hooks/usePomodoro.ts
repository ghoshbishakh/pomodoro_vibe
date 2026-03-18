"use client";

import * as React from "react";
import {
  getInitialState,
  formatClock,
  pomodoroReducer,
  type PomodoroSettings,
  phaseTotalSeconds,
} from "@/lib/pomodoro";

export function usePomodoro(settings: PomodoroSettings) {
  const settingsRef = React.useRef(settings);
  React.useEffect(() => {
    settingsRef.current = settings;
  }, [settings]);

  const [state, dispatch] = React.useReducer(
    pomodoroReducer,
    settings,
    getInitialState
  );

  // Keep secondsLeft consistent when settings change.
  React.useEffect(() => {
    dispatch({ type: "applySettings", settings });
  }, [settings]);

  React.useEffect(() => {
    if (!state.isRunning) return;
    const id = window.setInterval(() => {
      dispatch({ type: "tick", settings: settingsRef.current });
    }, 1000);
    return () => window.clearInterval(id);
  }, [state.isRunning]);

  React.useEffect(() => {
    const phase =
      state.phase === "focus"
        ? "Focus"
        : state.phase === "break"
          ? "Break"
          : "Long break";
    document.title = `${formatClock(state.secondsLeft)} • ${phase} • Pomodoro`;
  }, [state.phase, state.secondsLeft]);

  const totalSeconds = phaseTotalSeconds(settings, state.phase);
  const progress = totalSeconds > 0 ? 1 - state.secondsLeft / totalSeconds : 0;

  const actions = React.useMemo(
    () => ({
      start: () => dispatch({ type: "start" }),
      pause: () => dispatch({ type: "pause" }),
      reset: () => dispatch({ type: "reset", settings: settingsRef.current }),
      skip: () => dispatch({ type: "skip", settings: settingsRef.current }),
      setRunning: (running: boolean) =>
        dispatch({ type: running ? "start" : "pause" }),
    }),
    []
  );

  return { state, totalSeconds, progress, ...actions };
}

