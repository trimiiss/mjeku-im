# Mjeku.Im

Book a doctor, dentist or therapist in Kosovo, at the clinic or by video. Albanian by default, with an English switch.

Live: https://mjeku-im.vercel.app

> All data is real: bookable doctors are the ones who sign up through `/llogaria`, and the "More in <town>" lists are real practices (see below). The fictional demo doctors were removed in October 2026.

## Stack

- Next.js 16 (App Router) + React 19 + TypeScript, plain CSS
- Supabase (Postgres, Frankfurt) for doctors, clinics, availability and bookings
- Vercel for hosting (functions in `fra1`, next to the database)

## How it works

- It's a multi-page site, like OneDoc:
  - `/`: home page with search, popular specialties and the first free slots.
  - `/stomatolog`, `/stomatolog/prishtine`: a page per specialty and per specialty + city, like OneDoc's `/en/physiotherapist` and `/en/physiotherapist/zurich`. Result cards show the next 4 days of free times, with filters for new patients, spoken language, gender and availability, plus pages, FAQ and related searches.
  - `/kerko?q=glaukoma&qyteti=prizren`: search by text, service, institution type (`lloji`) or city.
  - `/konsultime-video`, `/specialitetet`, `/per-mjeket`, `/ndihme`: video consultations, all specialties, for practitioners, help center.
  - `/mjeku/<id>`: doctor profile (below).
- Every page loads cities, specialties, clinics, doctors and free slots on each request (`lib/directory.ts`).
- Patients book as guests: name and phone, optional email and note. They get a booking code like `MJK-7Q2F9K`.
- "Rezervimi im / My booking" finds a booking by code + phone number and can cancel it up to 2 hours before.
- Bookings are never readable through the API. The website only calls three database functions: `book_slot`, `find_booking` and `cancel_booking` (see `app/actions.ts`).
- A nightly job (pg_cron, 01:10 UTC) creates slots 3 weeks ahead from each doctor's opening hours.
- Every doctor has a profile page at `/mjeku/<id>` (made from their name, e.g. `/mjeku/arben-gashi`): summary, map and opening hours, presentation, FAQ, and a booking box with specialty, visit reason and 16 days of free times. The visit reason is saved with the booking.
- Filters are kept in the address (e.g. `/mjek-i-familjes?gjuha=de&gjinia=f`), so a filtered list can be shared.
- Every specialty page has a page for each of Kosovo's 38 municipalities. Below the bookable doctors, "Të tjerë në <qyteti> / More in <town>" lists the real practices, clinics and health centres there that aren't on Mjeku.Im yet, with phone, address and map, filterable by neighbourhood or village. `/stomatolog` lists every municipality with its count.
- Doctors can create an account at `/llogaria` (Supabase Auth, email and password), fill in their profile, practice and opening hours, and appear on the site straight away with a "not verified yet" note. Free slots are created for the next 3 weeks from their hours, and they see their bookings (patient name and phone) in the account. "Kjo është klinika ime / This is my practice" on a listed practice opens the sign-up with its details filled in.
- Until a doctor signs up, the home page invites doctors to join in place of the "next free appointments" card.
- Without Supabase environment variables (or if the database fails), the site shows the municipalities and specialties from `lib/seed.json` and the practices from `lib/listed.json`, with no bookable doctors.

## Run it locally

```bash
cp .env.example .env.local
npm install
npm run dev
```

Open http://localhost:3000.

## Where things live

| What | File |
| --- | --- |
| All text, Albanian and English | `lib/i18n.ts` (home, header, footer), `lib/pagesText.ts` (listing and info pages), `lib/profileText.ts` (profile pages) |
| Page addresses (Albanian slugs) | `lib/routes.ts` |
| Listing filters, sorting and titles | `lib/listing.ts` |
| Municipalities and specialties | `lib/seed.json` |
| Real practices not on Mjeku.Im yet | `lib/listed.json` (→ `supabase/listed.sql`) |
| Practitioner account page | `app/llogaria/`, `components/account/`, `lib/accountText.ts` |
| Services, institution types, popular searches | `lib/taxonomy.ts` |
| Search logic | `lib/search.ts` |
| Dates and prices in Kosovo time | `lib/format.ts` |
| Booking server actions | `app/actions.ts` |
| Page sections and dialogs | `components/*.tsx` |
| Doctor profile page | `app/mjeku/[id]/page.tsx`, `components/profile/` |
| Specialty, city, search and video pages | `app/[specialty]/`, `app/kerko/`, `app/konsultime-video/`, `components/results/` |
| Specialties, practitioners and help pages | `app/specialitetet/`, `app/per-mjeket/`, `app/ndihme/`, `components/pages/` |
| Styles | `app/globals.css`, `app/booking.css`, `app/profile.css`, `app/pages.css` |
| Database schema and functions | `supabase/migrations/` |
| Municipalities and specialties SQL (generated) | `supabase/seed.sql` |

## Database

Supabase project `mjeku-im` (ref `xulrcmxkpbxpsnmrpsjw`, region eu-central-1).

- Schema: `supabase/migrations/20260924120000_init.sql`
- Nightly slot job: `supabase/migrations/20260924120100_daily_slots_cron.sql`
- Profile pages (map location, experience, public opening hours, visit reason): `supabase/migrations/20260924150000_profile_page.sql` and `20260924150100_profile_demo_data.sql`
- First free slot per doctor, for the availability filter: `supabase/migrations/20260924190000_next_free_slots.sql`
- All 38 municipalities and the real-practice listings: `supabase/migrations/20261012120000_listed_practices.sql`
- Practitioner accounts (`accounts` table, `my_profile`, `save_my_profile`, `my_bookings`): `supabase/migrations/20261012120100_practitioner_accounts.sql`
- Municipalities and specialties: edit `lib/seed.json`, run `node scripts/make-seed-sql.mjs`, then run `supabase/seed.sql`

The nightly job runs `generate_slots(21, 0)`: free slots only, none marked as taken.

### Real practices ("More in <town>")

`lib/listed.json` holds the real practices, clinics and health centres per municipality and specialty, each with its sources. The first version comes from OpenStreetMap (© OpenStreetMap contributors, ODbL; the pages credit it) and was sorted into specialties by tags and names; places whose specialty couldn't be told (most hospitals and unnamed clinics) are left out for now. To update it: edit `lib/listed.json`, run `node scripts/make-listed-sql.mjs`, then run `supabase/listed.sql` in the SQL editor. Practices removed from the JSON are hidden, not deleted.

### Practitioner accounts

- In Supabase → Authentication → URL Configuration, set the Site URL to `https://mjeku-im.vercel.app` and add `https://mjeku-im.vercel.app/**` and `http://localhost:3000/**` to the redirect URLs, so confirmation and password emails link back to the site.
- Supabase's built-in email sender only delivers to members of the Supabase team. For other doctors to receive confirmation and password emails, add a custom SMTP sender (e.g. Resend) under Authentication → Emails, or turn off "Confirm email" under Authentication → Sign In / Providers → Email.
- To verify a doctor, set `practitioners.verified = true` in the table editor. This removes the "not verified" note and, if they picked their practice from the lists, hides that listing in favour of their profile. To take a profile down, set `active = false`.

## Before going live with real patients

- Add a captcha (e.g. Cloudflare Turnstile) and rate limiting to booking, or move the booking functions behind a server-only key.
- Send confirmations and reminders by SMS or email (e.g. Twilio, Resend).
- Check doctors' licences before verifying them, and let a practice manage more than one doctor from one account.
- Add a privacy policy and terms, and review them against Law No. 06/L-082 on the Protection of Personal Data.
- Doctor profiles stay `noindex` until they're verified (`app/mjeku/[id]/page.tsx`); listing pages are indexed.
- Add real photos (`practitioners.photo_url` is ready) and the practices' phone numbers.

## Push to GitHub

```bash
git remote add origin https://github.com/trimiiss/Mjeku.Im.git
git branch -M main
git push -u origin main
```
