# Roanoke Valley Norton Owners

A custom website for the RVNO motorcycle club. Built with Next.js, Supabase, and Tailwind CSS.

## Setup

### 1. Supabase Database

Go to your Supabase project dashboard → **SQL Editor** → paste the contents of `supabase-schema.sql` and run it. This creates:

- `albums` table (rides, rallies, events)
- `photos` table (photos within albums)  
- `members` table (the crew)
- Storage buckets for photo uploads
- Row Level Security (public read, authenticated write)

### 2. Create Mark's Admin Account

In Supabase dashboard → **Authentication** → **Users** → **Add User**:
- Email: `mark@roanokevalleynortonowners.com` (or whatever he wants)
- Password: something he'll remember
- Auto-confirm: yes

### 3. Environment Variables

Copy `.env.local.example` to `.env.local` and fill in your Supabase credentials:

```bash
cp .env.local.example .env.local
```

Get your keys from Supabase dashboard → **Settings** → **API Keys**:
- `NEXT_PUBLIC_SUPABASE_URL` → Project URL
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` → Publishable key (the `sb_publishable_...` one)

### 4. Install & Run

```bash
npm install
npm run dev
```

Site runs at `http://localhost:3000`.

### 5. Deploy to Vercel

1. Push to GitHub
2. Import repo in Vercel
3. Add environment variables in Vercel project settings
4. Point `roanokevalleynortonowners.com` DNS to Vercel

## Pages

| Route | What |
|-------|------|
| `/` | Homepage — winding road timeline + map toggle |
| `/about` | About RVNO (Mark's copy) |
| `/members` | The Usual Suspects — member cards from DB |
| `/events` | Upcoming rides and meetups |
| `/resources` | Norton links — INOA, parts, riding info |
| `/contact` | Contact info and joining |
| `/album/[id]` | Individual album photo viewer |
| `/admin` | Mark's admin panel — create albums, upload photos |

## How Mark Uses It

1. Go to `/admin`
2. Sign in with his email/password
3. Click **+ New Album** → enter title, date, location, description
4. Expand the album → click **+ Add Photos** → select photos from phone/computer
5. Photos upload to Supabase Storage and appear on the homepage timeline

## Stack

- **Next.js 14** (App Router, TypeScript)
- **Tailwind CSS** (custom RVNO dark theme)
- **Supabase** (Postgres, Auth, Storage)
- **Vercel** (hosting)
