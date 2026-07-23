-- Seeds the three brand concepts from the Launch Studio visual identity deck
-- as draft themes, ready to preview/publish from /admin/themes.
-- Run after 0001_theme_management.sql on a fresh local/dev database.

insert into public.themes (name, slug, status, tokens, notes) values
(
  'Concept 1 — Neutral',
  'concept-1',
  'draft',
  '{
    "font_display": "Outfit",
    "font_body": "Outfit",
    "colors": {
      "dark": "#262323",
      "darker": "#111111",
      "accent": "#262323",
      "accent_soft": "#C4B8AB",
      "cream": "#F3F1EE",
      "white": "#FFFFFF"
    },
    "radius": "pill"
  }'::jsonb,
  'From Launch Studio visual identity V2, page 3-8. No accent colour — monochrome buttons.'
),
(
  'Concept 2 — Burgundy',
  'concept-2',
  'draft',
  '{
    "font_display": "Jost",
    "font_body": "Jost",
    "colors": {
      "dark": "#262323",
      "darker": "#111111",
      "accent": "#772035",
      "accent_soft": "#e7cfd5",
      "cream": "#F3F1EE",
      "white": "#FFFFFF"
    },
    "radius": "pill"
  }'::jsonb,
  'From Launch Studio visual identity V2, page 9-14.'
),
(
  'Concept 3 — Sage',
  'concept-3',
  'draft',
  '{
    "font_display": "Host Grotesk",
    "font_body": "Host Grotesk",
    "colors": {
      "dark": "#262323",
      "darker": "#111111",
      "accent": "#4f8a91",
      "accent_soft": "#BCDBDD",
      "cream": "#F3F1EE",
      "white": "#FFFFFF"
    },
    "radius": "pill"
  }'::jsonb,
  'From Launch Studio visual identity V2, page 15-20.'
);

-- To grant yourself admin access after signing in once via Entra ID SSO locally:
-- insert into public.staff_users (user_id, email, role)
-- values ('<your-auth-users-uuid>', 'you@iconos-group.com', 'admin');
