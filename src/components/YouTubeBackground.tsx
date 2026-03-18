"use client";

import * as React from "react";

type Props = {
  videoId: string;
  className?: string;
};

export function YouTubeBackground({ videoId, className }: Props) {
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
    });
    return `https://www.youtube-nocookie.com/embed/${encodeURIComponent(
      videoId
    )}?${params.toString()}`;
  }, [videoId]);

  return (
    <div className={["fixed inset-0 -z-10 overflow-hidden", className].join(" ")}>
      <div className="absolute inset-0 bg-black" />

      {/* Cover-like responsive embed */}
      <iframe
        className="absolute left-1/2 top-1/2 h-[135vh] w-[240vh] -translate-x-1/2 -translate-y-1/2"
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
  );
}

