# Mjeku.Im

Book a doctor, dentist or therapist in Switzerland, in person or by video. White and baby-blue patient website built with Next.js.

## Stack

- Next.js 16 (App Router) + React 19 + TypeScript
- Plain CSS (`app/globals.css`), no UI framework
- Fonts: Gabarito + Figtree via `next/font`, downloaded at build time and served from the site, so visitors never contact Google
- No database yet: practitioners, slots and clinics are sample data in `lib/data.ts`

## Run it locally

```bash
npm install
npm run dev
```

Open http://localhost:3000.

## Where things live

| What | File |
| --- | --- |
| Brand name, country, tagline | `lib/site.ts` |
| Practitioners, slots, directory lists | `lib/data.ts` |
| Search and matching logic | `lib/search.ts` |
| Page sections | `components/*.tsx` |
| Colors, type, layout | `app/globals.css` |

## Sections

Header with language menu · hero with in-person/video toggle, grouped search (specialties, practitioners, institutions) and news chips · 4 benefits · data protection · video consultations in 3 steps · practitioners available today with filters · app download with QR code · Mjeku.Im Pro for practitioners · directory (specialists, expertise, institutions) with popular searches by city · FAQ · footer.

Booking, sign-in, app store links and the Pro buttons show a "coming soon" note. Nothing is booked for real yet.

## Push to GitHub

Create an empty repository on GitHub (no README), then from this folder:

```bash
git remote add origin https://github.com/<your-user>/mjeku-im.git
git branch -M main
git push -u origin main
```

Then in Vercel, open the `mjeku-im` project → Settings → Git and connect the repository, so every push deploys automatically.

## Next steps

- Supabase: tables for practitioners, clinics, availability slots and bookings, plus patient sign-in
- Next.js server actions to book, move and cancel appointments
- SMS reminders through a provider such as Twilio
- Albanian, German, French and Italian translations
