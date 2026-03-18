export function parseYouTubeVideoId(input: string): string | null {
  const raw = input.trim();
  if (!raw) return null;

  // If it's already an 11-char video id.
  if (/^[a-zA-Z0-9_-]{11}$/.test(raw)) return raw;

  // Accept common URL variants.
  try {
    const url = new URL(raw);
    const host = url.hostname.replace(/^www\./, "");

    // youtu.be/<id>
    if (host === "youtu.be") {
      const id = url.pathname.split("/").filter(Boolean)[0] ?? "";
      return /^[a-zA-Z0-9_-]{11}$/.test(id) ? id : null;
    }

    // youtube.com/watch?v=<id>
    if (host.endsWith("youtube.com")) {
      const v = url.searchParams.get("v");
      if (v && /^[a-zA-Z0-9_-]{11}$/.test(v)) return v;

      // youtube.com/embed/<id>
      const pathParts = url.pathname.split("/").filter(Boolean);
      const embedIdx = pathParts.indexOf("embed");
      if (embedIdx >= 0) {
        const id = pathParts[embedIdx + 1] ?? "";
        return /^[a-zA-Z0-9_-]{11}$/.test(id) ? id : null;
      }

      // youtube.com/shorts/<id>
      const shortsIdx = pathParts.indexOf("shorts");
      if (shortsIdx >= 0) {
        const id = pathParts[shortsIdx + 1] ?? "";
        return /^[a-zA-Z0-9_-]{11}$/.test(id) ? id : null;
      }
    }
  } catch {
    // Not a valid URL; fall through.
  }

  // Sometimes users paste something like: "...v=ID&..."
  const match = raw.match(/(?:v=|\/embed\/|youtu\.be\/|\/shorts\/)([a-zA-Z0-9_-]{11})/);
  return match?.[1] ?? null;
}

