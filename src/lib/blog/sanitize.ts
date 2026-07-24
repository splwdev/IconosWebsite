import DOMPurify from "isomorphic-dompurify";

// Deliberately matches only what src/components/admin/rich-text-editor.tsx's
// toolbar (and StarterKit's default keyboard shortcuts) can actually
// produce. Anything else — <script>, event handler attributes, iframes,
// arbitrary data: URIs — is stripped, regardless of where the HTML
// originated (this runs on every save, not just ones from our own editor).
const ALLOWED_TAGS = [
  "p", "strong", "em", "s", "code", "pre",
  "h2", "h3", "ul", "ol", "li", "blockquote",
  "a", "br", "hr",
];
const ALLOWED_ATTR = ["href", "rel", "target"];

export function sanitizePostBody(html: string): string {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS,
    ALLOWED_ATTR,
    ALLOW_DATA_ATTR: false,
  });
}