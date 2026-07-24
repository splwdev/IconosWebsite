# Iconos Group Website — Project Status

Paste this at the start of a new chat to pick up where we left off.

## Project
Rebuild of www.iconos-group.com for Iconos Group (SRA-regulated commercial
legal consultancy). Stack: Next.js 15.5.21 (App Router), Supabase
(Postgres/Auth/Storage), Tailwind, target hosting Cloudflare Pages (not yet
deployed).

## Key references
- **Local repo**: `C:\dev\iconos-group`
- **GitHub**: https://github.com/splwdev/IconosWebsite
- **Supabase project**: `iconos-group-website`, ref `zwndvgsllqpnntbtbtah`,
  region `eu-west-2` (London), org `fzcbnypbxnvindfadegy`
  - URL: `https://zwndvgsllqpnntbtbtah.supabase.co`
  - Connected via Supabase MCP connector in this chat — migrations/seed
    data have been applied directly, not just written to files
- **Azure — SSO app registration**: "Iconos Website Admin SSO"
  - App ID: `583e8b32-c48b-43b6-a823-d985a8fee6c4`
  - Tenant ID: `f19c16c9-fc2f-44fe-a324-d7441440c23f`
  - Configured in Supabase Dashboard → Authentication → Providers → Azure
  - Redirect URI: `https://zwndvgsllqpnntbtbtah.supabase.co/auth/v1/callback`
- **Staff**: `shanel@iconos-group.com` added to `staff_users` as `admin`

## What's built and working
- **Full public site**: home, who-we-are, what-we-do (+ 6 service pages),
  how-we-work (+ 3 programs), clients, work-with-us, contact, blog (+
  dynamic posts from Supabase), 5 legal pages (mostly placeholder text
  pending the client's own review, per the original questionnaire)
- **Admin** (`/admin`, gated by `staff_users` allow-list via middleware):
  - Dashboard with live-data cards (Posts, Themes) + coming-soon cards
  - `/admin/posts` — blog CMS with a Tiptap rich text editor (not
    Markdown), image upload to Supabase Storage, auto-generated read-only
    URL slugs (locked once published), publish/unpublish/delete
  - `/admin/themes` — preview/publish for the 3 brand concepts from the
    Launch Studio visual identity deck, all seeded in Supabase
- **Auth**: Microsoft Entra ID SSO via Supabase Auth, confirmed working
  end-to-end. Login redirect now correctly lands on `/admin` (dashboard) —
  this was just fixed, confirm it's committed.
- **Contact form**: Turnstile widget + Microsoft Graph email sending built,
  **but not fully configured yet** — see Outstanding below.
- **Security**: CSP is nonce-based via `middleware.ts` (`strict-dynamic`),
  all blog HTML is sanitized server-side with DOMPurify before storage,
  RLS on every table (fixed a recursion bug in `staff_users` policies —
  see `0004_fix_staff_users_recursion.sql`).
- **Real logo** integrated in header/footer (`public/logo.png`).

## Outstanding / backlog, roughly in priority order
1. **Header nav**: dropdowns should reveal on hover, not require a click —
   keep keyboard/touch accessibility (currently uses `<details>/<summary>`
   deliberately for that reason; hover version needs care, not a one-line change)
2. **Pages system** (scoped, not yet built):
   - Migrate Services (`src/lib/content/services.ts`) and How We Work
     (`how-we-work.ts`) off static files into Supabase
   - New "Pages" admin section listing everything editable
   - "+ New Page" flow with a template picker (Service / Program / Custom
     Page), Custom Page = title + rich text body via the same editor as posts
   - Reserved-slug collision check for custom pages (can't collide with
     `/contact`, `/blog`, `/admin`, etc.)
3. **Finish Azure setup for contact form email** (nothing sends yet):
   - Create `enquiries@iconos-group.com` shared mailbox
   - Create a **separate** Azure app registration (not the SSO one) with
     `Mail.Send` application permission + admin consent
   - Run `New-ApplicationAccessPolicy` in Exchange Online PowerShell to
     restrict that app to only the `enquiries@` mailbox (documented in
     README — don't skip this, it's the actual security boundary)
   - Set `GRAPH_TENANT_ID`, `GRAPH_CLIENT_ID`, `GRAPH_CLIENT_SECRET`,
     `GRAPH_SENDER_MAILBOX`, `CONTACT_TO_EMAIL` in `.env.local`
   - Also still need real Turnstile site/secret keys from Cloudflare
4. **Cloudflare Pages deployment + GitHub Actions CI/CD** — not started
5. **Testimonials** — still a static array (`src/lib/content/testimonials.ts`),
   needs real client-supplied quotes + permission (per questionnaire Q23)
   and eventually admin management
6. **Contact submissions viewer** in admin (data's being stored in
   `contact_submissions` already, just no UI to read it yet)
7. **Staff access management UI** — currently `staff_users` can only be
   edited via direct SQL
8. Legal pages (Privacy, Complaints, Cookie, Terms) still placeholder text
   pending the client's own review — don't treat as launch-ready
9. Google/Cloudflare Analytics not wired up yet
10. Domain/DNS ownership still unconfirmed on the client's end (via Purple
    Marketing Communications) — needed before any real deployment

## Process note for whoever picks this up
This session lost a lot of time to zip-extraction silently not overwriting
existing files on the local Windows machine, causing several rounds of
"the fix isn't working" that turned out to be stale files, not bad code.
**Prefer direct copy-paste of full file contents into VS Code** over
zip-based delivery for anything beyond a brand-new file, and when
debugging something that "should" work, verify the actual file contents
on disk (`type filename` in `git cmd`) before assuming the code is wrong.