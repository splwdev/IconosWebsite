# Iconos Group — Website

Next.js 15 + Supabase + Cloudflare Pages rebuild of iconos-group.com.

## Current status

What works right now:
- Sign in to `/admin` with a Microsoft 365 account (Entra ID SSO via Supabase Auth)
- `/admin/themes` — brand theme management: preview any theme on the live
  site privately, publish site-wide, full audit log
- `/admin/posts` — blog CMS: write in Markdown, upload a featured image,
  save as draft, publish/unpublish. Public `/blog` and `/blog/[slug]` read
  only genuinely published posts (enforced by RLS, not just UI hiding)
- Contact form: Cloudflare Turnstile verification, email delivery via
  Resend, and every submission stored in `contact_submissions` as an audit
  trail regardless of email outcome
- Full public content site: homepage + all pages from the questionnaire's
  approved sitemap (Who We Are, What We Do ×6, How We Work ×3, Clients,
  Work With Us, Contact, Blog, 5 legal pages)
- Contact form UI with validation (not yet wired to email delivery)
- WCAG AA contrast enforced before a theme can be published
- Every theme publish is logged (who, when, which theme)

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

### 5. Contact form: Turnstile + Resend

1. **Turnstile**: Cloudflare Dashboard → Turnstile → Add widget → domain
   `iconos-group.com` (and `localhost` for dev) → copy the **Site Key** into
   `NEXT_PUBLIC_TURNSTILE_SITE_KEY` and the **Secret Key** into
   `TURNSTILE_SECRET_KEY`.
2. **Resend**: create an account, verify the `iconos-group.com` sending
   domain (SPF/DKIM records — Resend gives you the exact DNS to add), then
   put an API key into `RESEND_API_KEY`.
3. Without these set, the app still works in dev — Turnstile shows a visible
   "not configured" notice instead of blocking the form, and unsent emails
   are logged to the server console — but **both must be set before
   production**, or real enquiries will silently not reach
   legal@iconos-group.com.

## Admin routing note

`/admin/login` intentionally sits outside the `(protected)` route group
(`src/app/admin/(protected)/`) so it never inherits the authenticated admin
nav/chrome. If you add new admin pages, put them inside `(protected)/` —
and regardless of where you put them, double-check `middleware.ts`'s
`isAdminRoute` matcher still covers the new route, since that (not the
layout) is what actually enforces the auth + staff check.

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

- Testimonials data model + admin management (currently a static array)
- Legal pages (Privacy, Complaints, Cookie, Terms, Disclaimer) — client is
  reviewing/updating existing wording before reuse; placeholders are live
- Google Analytics / Cloudflare Analytics wired up (currently broken on the
  live site per the client questionnaire)
- Cloudflare Pages deployment + GitHub Actions CI/CD
- Confirm domain registrar / DNS ownership (client to chase via Purple
  Marketing Communications)
- Client to pick a brand theme concept in `/admin/themes` and publish it
