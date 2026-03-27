export type YouTubeParsedInput = { type: "video" | "playlist"; id: string };

export function parseYouTubeInput(input: string): YouTubeParsedInput | null {
  const raw = input.trim();
  if (!raw) return null;

  // If it's already an 11-char video id.
  if (/^[a-zA-Z0-9_-]{11}$/.test(raw)) return { type: "video", id: raw };

  // If it's a playlist ID (e.g. PL..., OL..., RD...). Playlist IDs typically start with certain prefixes and are 16-34 chars.
  // We'll accept any alphanumeric/dash string starting with PL, OL, RD, LL, FL, UU.
  if (/^(?:PL|OL|RD|LL|FL|UU)[a-zA-Z0-9_-]{10,}$/.test(raw)) {
    return { type: "playlist", id: raw };
  }

  // Accept common URL variants.
  try {
    const url = new URL(raw);
    const host = url.hostname.replace(/^www\./, "");

    if (host === "youtu.be" || host.endsWith("youtube.com")) {
      // Check for playlist parameter first
      const list = url.searchParams.get("list");
      if (list && /^[a-zA-Z0-9_-]{10,}$/.test(list)) {
        return { type: "playlist", id: list };
      }
    }

    // youtu.be/<id>
    if (host === "youtu.be") {
      const id = url.pathname.split("/").filter(Boolean)[0] ?? "";
      return /^[a-zA-Z0-9_-]{11}$/.test(id) ? { type: "video", id } : null;
    }

    // youtube.com/watch?v=<id>
    if (host.endsWith("youtube.com")) {
      const v = url.searchParams.get("v");
      if (v && /^[a-zA-Z0-9_-]{11}$/.test(v)) return { type: "video", id: v };

      // youtube.com/embed/<id>
      const pathParts = url.pathname.split("/").filter(Boolean);
      const embedIdx = pathParts.indexOf("embed");
      if (embedIdx >= 0) {
        const id = pathParts[embedIdx + 1] ?? "";
        if (id === "videoseries") {
           // handled by list parameter check above
        } else if (/^[a-zA-Z0-9_-]{11}$/.test(id)) {
           return { type: "video", id };
        }
      }

      // youtube.com/shorts/<id>
      const shortsIdx = pathParts.indexOf("shorts");
      if (shortsIdx >= 0) {
        const id = pathParts[shortsIdx + 1] ?? "";
        return /^[a-zA-Z0-9_-]{11}$/.test(id) ? { type: "video", id } : null;
      }
    }
  } catch {
    // Not a valid URL; fall through.
  }

  // Regex fallback for list=...
  const listMatch = raw.match(/[?&]list=([a-zA-Z0-9_-]{10,})/);
  if (listMatch) return { type: "playlist", id: listMatch[1]! };

  // Sometimes users paste something like: "...v=ID&..."
  const match = raw.match(/(?:v=|\/embed\/|youtu\.be\/|\/shorts\/)([a-zA-Z0-9_-]{11})/);
  return match?.[1] ? { type: "video", id: match[1] } : null;
}

