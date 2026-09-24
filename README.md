# Mjeku.Im

Book a doctor, dentist or therapist in Kosovo, at the clinic or by video. Albanian by default, with an English switch.

Live: https://mjeku-im.vercel.app

> Demo: all doctors and clinics are fictional sample data, and bookings are not real appointments. The site says so in a banner at the top.

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
- Every doctor has a profile page at `/mjeku/<id>` (e.g. `/mjeku/arta-krasniqi`): summary, map and opening hours, presentation, FAQ, and a booking box with specialty, visit reason and 16 days of free times. The visit reason is saved with the booking.
- Filters are kept in the address (e.g. `/mjek-i-familjes?gjuha=de&gjinia=f`), so a filtered list can be shared.
- Without Supabase environment variables, the site runs on the same demo data from `lib/seed.json`, and bookings aren't saved.

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
| Demo doctors, clinics, cities, opening hours | `lib/seed.json` |
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
| Demo data SQL (generated) | `supabase/seed.sql` |

## Database

Supabase project `mjeku-im` (ref `xulrcmxkpbxpsnmrpsjw`, region eu-central-1).

- Schema: `supabase/migrations/20260924120000_init.sql`
- Nightly slot job: `supabase/migrations/20260924120100_daily_slots_cron.sql`
- Profile pages (map location, experience, public opening hours, visit reason): `supabase/migrations/20260924150000_profile_page.sql` and `20260924150100_profile_demo_data.sql`
- First free slot per doctor, for the availability filter: `supabase/migrations/20260924190000_next_free_slots.sql`
- Demo data: edit `lib/seed.json`, run `node scripts/make-seed-sql.mjs`, then run `supabase/seed.sql`

The demo job marks about 30% of new slots as taken so calendars look realistic. For real clinics, change it to `generate_slots(21, 0)`.

## Before going live with real patients

- Add a captcha (e.g. Cloudflare Turnstile) and rate limiting to booking, or move the booking functions behind a server-only key.
- Send confirmations and reminders by SMS or email (e.g. Twilio, Resend).
- Add a clinic dashboard so practices manage their own hours and see their bookings.
- Add a privacy policy and terms, and review them against Law No. 06/L-082 on the Protection of Personal Data.
- Profile and listing pages are marked `noindex` because the demo doctors are fictional. Remove `robots` in `app/mjeku/[id]/page.tsx` and `components/results/ListingPage.tsx` once real practitioners are listed.
- Add real photos (`practitioners.photo_url` is ready) and the practices' phone numbers.

## Push to GitHub

```bash
git remote add origin https://github.com/trimiiss/Mjeku.Im.git
git branch -M main
git push -u origin main
```
