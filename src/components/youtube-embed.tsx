import { extractYouTubeId } from "@/lib/content/youtube";
 
export function YouTubeEmbed({ url, title }: { url: string; title?: string }) {
  const videoId = extractYouTubeId(url);
  if (!videoId) return null;
 
  return (
    <div className="relative aspect-video w-full overflow-hidden rounded-2xl bg-black">
      <iframe
        src={`https://www.youtube-nocookie.com/embed/${videoId}`}
        title={title || "Embedded video"}
        className="absolute inset-0 h-full w-full"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
        loading="lazy"
      />
    </div>
  );
}