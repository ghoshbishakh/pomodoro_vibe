"use client";

import * as React from "react";

type Props = {
  videoId: string;
  className?: string;
};

export function YouTubeBackground({ videoId, className }: Props) {
  // Browsers block autoplay-with-sound, so we start muted (via URL param),
  // then toggle audio without reloading using the YouTube IFrame Player API.
  const [muted, setMuted] = React.useState(true);
  const mutedRef = React.useRef(muted);
  const playerRef = React.useRef<unknown>(null);
  const reactId = React.useId();
  // `useId()` may include `:` which is awkward for DOM APIs; keep a stable, safe id.
  const iframeId = React.useMemo(() => `yt-${reactId.replaceAll(":", "")}`, [reactId]);

  // YouTube requires `playlist=<videoId>` for looping a single video.
  const src = React.useMemo(() => {
    const params = new URLSearchParams({
      autoplay: "1",
      mute: "1",
      controls: "0",
      rel: "0",
      playsinline: "1",
      loop: "1",
      playlist: videoId,
      modestbranding: "1",
      iv_load_policy: "3",
      disablekb: "1",
      enablejsapi: "1",
    });
    return `https://www.youtube-nocookie.com/embed/${encodeURIComponent(
      videoId
    )}?${params.toString()}`;
  }, [videoId]);

  React.useEffect(() => {
    mutedRef.current = muted;
  }, [muted]);

  React.useEffect(() => {
    let cancelled = false;

    const ensureYouTubeApi = async () => {
      if (typeof window === "undefined") return;
      const w = window as unknown as {
        YT?: { Player?: new (id: string, opts: unknown) => unknown };
        onYouTubeIframeAPIReady?: () => void;
      };

      if (w.YT?.Player) return;

      const existing = document.querySelector<HTMLScriptElement>(
        'script[data-yt-iframe-api="true"]'
      );

      await new Promise<void>((resolve) => {
        const prev = w.onYouTubeIframeAPIReady;
        w.onYouTubeIframeAPIReady = () => {
          prev?.();
          resolve();
        };

        // If the script isn't present, inject it. If it is present but not yet ready,
        // we still wait for `onYouTubeIframeAPIReady` to fire.
        if (!existing) {
          const s = document.createElement("script");
          s.src = "https://www.youtube.com/iframe_api";
          s.async = true;
          s.dataset.ytIframeApi = "true";
          document.head.appendChild(s);
        }

        // Fallback: if the API is already ready but the global callback already fired
        // before we attached (rare), poll briefly and resolve.
        const start = Date.now();
        const tick = () => {
          const ww = window as unknown as { YT?: { Player?: unknown } };
          if (ww.YT?.Player) return resolve();
          if (Date.now() - start > 4000) return resolve();
          window.setTimeout(tick, 50);
        };
        tick();
      });
    };

    const init = async () => {
      await ensureYouTubeApi();
      if (cancelled) return;

      const w = window as unknown as {
        YT?: { Player?: new (id: string, opts: unknown) => unknown };
      };
      const PlayerCtor = w.YT?.Player;
      if (!PlayerCtor) {
        // If the script tag existed but finished loading after our first await,
        // retry a few times without reloading the iframe.
        window.setTimeout(() => {
          if (!cancelled) init();
        }, 50);
        return;
      }

      // Recreate player when videoId changes. This will restart (expected) only on video change.
      playerRef.current = new PlayerCtor(iframeId, {
        events: {
          onReady: () => {
            // Keep initial state consistent with our UI.
            const p = playerRef.current as unknown as {
              mute?: () => void;
              unMute?: () => void;
            };
            if (mutedRef.current) p.mute?.();
            else p.unMute?.();
          },
        },
      });
    };

    init();
    return () => {
      cancelled = true;
      const p = playerRef.current as unknown as { destroy?: () => void };
      p?.destroy?.();
      playerRef.current = null;
    };
  }, [iframeId, videoId]);

  React.useEffect(() => {
    const p = playerRef.current as unknown as { mute?: () => void; unMute?: () => void };
    if (!p) return;
    if (muted) p.mute?.();
    else p.unMute?.();
  }, [muted]);

  return (
    <>
      {/* Keep video behind the app UI */}
      <div className={["fixed inset-0 -z-10 overflow-hidden", className].join(" ")}>
        <div className="absolute inset-0 bg-black" />

        {/* Cover-like responsive embed */}
        <iframe
          className="absolute left-1/2 top-1/2 h-[135vh] w-[240vh] -translate-x-1/2 -translate-y-1/2 pointer-events-none"
          id={iframeId}
          src={src}
          title="Background video"
          allow="autoplay; encrypted-media; picture-in-picture"
          referrerPolicy="strict-origin-when-cross-origin"
          allowFullScreen={false}
        />

        {/* Readability overlays */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/35 to-black/70" />
        <div className="absolute inset-0 [background:radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.35)_55%,rgba(0,0,0,0.7)_100%)]" />
      </div>

      {/* Control must be above main UI layers to be clickable */}
      <div className="fixed bottom-4 right-4 z-50 pointer-events-auto">
        <button
          type="button"
          onClick={() => setMuted((v) => !v)}
          className="rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-medium text-white/90 backdrop-blur hover:bg-white/15 focus:outline-none focus:ring-2 focus:ring-white/30"
        >
          {muted ? "Unmute" : "Mute"}
        </button>
      </div>
    </>
  );
}

