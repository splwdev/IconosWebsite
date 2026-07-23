# Iconos Group — Website

Next.js 15 + Supabase + Cloudflare Pages rebuild of iconos-group.com.

## Current status

This is the **theme management slice only** — the app shell, auth, database
schema, and the "preview → publish" brand-theme feature. It does not yet
include the full 20-page content site (services, blog, contact form,
testimonials) — that's next.

What works right now:
- Sign in to `/admin` with a Microsoft 365 account (Entra ID SSO via Supabase Auth)
- `/admin/themes` — list, create, duplicate, edit, preview and publish the
  3 brand concepts from the visual identity deck
- Preview is private to the signed-in admin (cookie-based); the public
  homepage only ever shows the currently published theme
- WCAG AA contrast is enforced before a theme can be published
- Every publish is logged to `theme_publish_log` (who, when, which theme)

## Stack

- Next.js 15 (App Router, Server Components + Server Actions)
- Supabase (Postgres, Auth, Row Level Security)
- Tailwind CSS (theme tokens resolve to CSS variables at request time)
- Cloudflare Pages (target hosting — not yet configured, see Deployment below)

## Getting started

```bash
npm install
cp .env.example .env.local   # fill in real values, see below
```

### 1. Supabase project

1. Create a project at https://supabase.com.
2. Run the migration: `supabase db push` (or paste
   `supabase/migrations/0001_theme_management.sql` into the SQL Editor).
3. Run `supabase/seed.sql` to load the 3 brand concepts as draft themes.
4. Copy **Project URL** and **anon public key** into `.env.local`.

### 2. Microsoft Entra ID SSO

Supabase Auth's `azure` provider handles this:

1. In Azure Portal → Entra ID → App registrations → New registration.
   Restrict to **this organisation's directory only** (single tenant) —
   do not allow any Microsoft account to sign in.
2. Add a redirect URI:
   `https://<your-project-ref>.supabase.co/auth/v1/callback`
3. Under Certificates & secrets, create a client secret.
4. In Supabase Dashboard → Authentication → Providers → Azure: paste the
   Application (client) ID, client secret, and your Azure **tenant ID**
   (this is what actually restricts sign-in to Iconos's own M365 tenant —
   the app registration setting alone is not sufficient).
5. Set the Supabase Auth redirect URL allow-list to include
   `${NEXT_PUBLIC_SITE_URL}/auth/callback`.

### 3. Grant yourself admin access

Sign in once via `/admin/login` (you'll be bounced back with
`not_authorized` — expected, you're not in `staff_users` yet). Then in the
Supabase SQL Editor:

```sql
insert into public.staff_users (user_id, email, role)
select id, email, 'admin' from auth.users where email = 'you@iconos-group.com';
```

Sign in again — you're in.

### 4. Run it

```bash
npm run dev
```

Visit `http://localhost:3000` (public site) and
`http://localhost:3000/admin/themes` (admin).

## Environment variables

See `.env.example` for the full list and where each value comes from.
`SUPABASE_SERVICE_ROLE_KEY` is not currently used by any code path in this
slice — the theme feature relies entirely on RLS + the `staff_users`
allow-list, not an elevated server key. Keep it out of the browser bundle
regardless.

## Architecture notes

- **Why theme tokens aren't just Tailwind config**: the brand needs to be
  changeable by non-developers at runtime (launch decision now, refresh in
  12–18 months), not at build time. Tokens live in Postgres, get resolved
  server-side per request in `src/app/layout.tsx`, and are written out as
  CSS custom properties that `tailwind.config.ts` points every colour/font
  utility at.
- **Why preview uses a cookie, not a query param**: keeps the preview URL
  identical to the real page (so staff review the actual site, not a
  parallel preview route), and it's `httpOnly` so it can't be read or set
  by client-side script.
- **Why publish is a Postgres function, not a plain UPDATE**: the "exactly
  one published theme" invariant (enforced by a partial unique index) needs
  the archive-old + publish-new + audit-log write to happen atomically, and
  the authorization check (`staff_users` membership) needs to be
  server-enforced even though the caller only needs `authenticated`, not an
  elevated key.

## Outstanding / next up

- Full content site: homepage (from the approved concept), Who We Are, What
  We Do (6 practice area pages), How We Work (Subscription / VDPO tiers /
  Ad Hoc), Clients, Work With Us, Blog, Contact
- Blog CMS (posts table, RLS, staff-authored via `/admin`)
- Contact form → `legal@iconos-group.com`, with Cloudflare Turnstile
- Testimonials data model + admin management
- Legal pages (Privacy, Complaints, Cookie, Terms, Disclaimer) — client is
  reviewing/updating existing wording before reuse
- Google Analytics / Cloudflare Analytics wired up (currently broken on the
  live site per the client questionnaire)
- Cloudflare Pages deployment + GitHub Actions CI/CD
- Confirm domain registrar / DNS ownership (client to chase via Purple
  Marketing Communications)
