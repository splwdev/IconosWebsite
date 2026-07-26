/**
 * Extracts a YouTube video ID from any of the common URL shapes people
 * actually paste in: watch?v=, youtu.be short links, already-an-embed-url,
 * and shorts. Returns null for anything that isn't a recognisable YouTube
 * URL, which callers use to reject invalid input rather than silently
 * rendering a broken embed.
 */
export function extractYouTubeId(url: string): string | null {
  let parsed: URL;
  try {
    parsed = new URL(url.trim());
  } catch {
    return null;
  }
 
  const host = parsed.hostname.replace(/^www\./, "");
 
  if (host === "youtu.be") {
    const id = parsed.pathname.slice(1).split("/")[0];
    return id || null;
  }
 
  if (host === "youtube.com" || host === "m.youtube.com" || host === "youtube-nocookie.com") {
    if (parsed.pathname === "/watch") {
      return parsed.searchParams.get("v");
    }
    const embedMatch = parsed.pathname.match(/^\/(embed|shorts)\/([^/]+)/);
    if (embedMatch) {
      return embedMatch[2] ?? null;
    }
  }
 
  return null;
}
 
export function isValidYouTubeUrl(url: string): boolean {
  return extractYouTubeId(url) !== null;
}