import sanitizeHtml from "sanitize-html";
 
// Deliberately matches only what src/components/admin/rich-text-editor.tsx's
// toolbar (and StarterKit's default keyboard shortcuts) can actually
// produce. Anything else — <script>, event handler attributes, iframes,
// arbitrary data: URIs — is stripped, regardless of where the HTML
// originated (this runs on every save, not just ones from our own editor).
//
// Uses sanitize-html rather than DOMPurify: DOMPurify requires a real DOM
// (jsdom, on the server), and jsdom reads real files off disk at runtime
// (e.g. its default stylesheet) — something Cloudflare Workers' runtime
// cannot do at all. sanitize-html parses HTML as a string, with no DOM or
// filesystem dependency, and runs correctly in Workers.
const ALLOWED_TAGS = [
  "p", "strong", "em", "s", "code", "pre",
  "h2", "h3", "ul", "ol", "li", "blockquote",
  "a", "br", "hr",
];
 
export function sanitizePostBody(html: string): string {
  return sanitizeHtml(html, {
    allowedTags: ALLOWED_TAGS,
    allowedAttributes: {
      // href/rel/target only ever make sense on <a> — scoping them here is
      // slightly stricter than the old flat ALLOWED_ATTR list, which would
      // have permitted them on any allowed tag.
      a: ["href", "rel", "target"],
    },
    // Explicitly restrict link schemes — blocks javascript:/data: URLs and
    // similar, same protection DOMPurify provided by default.
    allowedSchemes: ["http", "https", "mailto"],
    disallowedTagsMode: "discard",
  });
}