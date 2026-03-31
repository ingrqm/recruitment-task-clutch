# Clutch Challenge

A React Native video feed app built with **Expo SDK 54**, **Supabase**, and **TanStack Query**. Built as a recruitment task for [Clutch](https://clutchapp.io).

> **Challenge brief:** [Clutch Full-Stack Developer Challenge V2](https://clutchapp.notion.site/Clutch-Full-Stack-Developer-Challenge-V2-31ff733f6e6980cd9674f72d0f36b19e) — see [CHALLENGE.md](./CHALLENGE.md) for a local copy.

## Features

- **Auth** — Email/password registration and login with persistent sessions via SecureStore
- **Video Feed** — Instagram-style scrollable feed with auto-play/pause, infinite scroll, and pull-to-refresh
- **Likes** — Optimistic like/unlike with denormalized counters and "liked by" user list
- **Comments** — Threaded replies, @mentions (by username or name), bottom sheet with keyboard support
- **Video Toggle** — Switch between Autopan, Full Match, and Landscape video URLs per highlight
- **Profile Pictures** — Upload and display avatars via Supabase Storage
- **User Profiles** — View other users' profiles from comments or likes

## Tech Stack

| Layer | Choice |
|---|---|
| Framework | Expo SDK 54 (React Native 0.81, React 19) |
| Routing | Expo Router v6 (file-based, layout auth guards) |
| Backend | Supabase (Auth, PostgreSQL, Storage) |
| Server State | TanStack Query v5 (caching, infinite scroll, optimistic updates) |
| Forms | TanStack Form + Zod validation |
| Video | expo-video (native VideoPlayer with fullscreen support) |
| Lists | FlashList (recycled views for performance) |
| Styling | NativeWind v4 (Tailwind CSS for React Native) |
| Tabs | Expo Router NativeTabs (iOS 26+ liquid glass), standard Tabs fallback |
| Sheets | @gorhom/bottom-sheet v5 (dynamic sizing, keyboard-interactive) |
| Formatting | Prettier with @prettier/plugin-oxc |

## Architecture

See [architecture.md](./architecture.md) for detailed diagrams and decision rationale.

## Setup

### Prerequisites

- Node.js 22+
- pnpm
- Expo CLI (`npx expo`)
- iOS Simulator or Android Emulator

### 1. Clone and install

```bash
git clone <repo-url>
cd clutch-challenge
pnpm install
```

### 2. Supabase setup

1. Create a new project at [supabase.com](https://supabase.com)
2. Install the [Supabase CLI](https://supabase.com/docs/guides/cli)
3. Link your project: `supabase link --project-ref <your-project-ref>`
4. Run migrations: `supabase db push`
5. Create a Storage bucket called `avatars` with public read access

Migrations are split by feature in `supabase/migrations/`:

| File | Description |
|---|---|
| `001_profiles.sql` | Profiles table, RLS, auto-create trigger |
| `002_likes.sql` | Likes table, video_stats, count triggers |
| `003_comments.sql` | Comments table, comment count triggers |
| `004_avatars.sql` | Storage policies for avatars bucket |

Migrations are auto-deployed to production via CI on merge to `main`.

### 3. Environment variables

```bash
cp .env.example .env.local
```

Fill in your Supabase credentials (or use the ones below for the demo instance):

```
EXPO_PUBLIC_SUPABASE_URL=https://facslbjnymnlgpymnwrx.supabase.co
EXPO_PUBLIC_SUPABASE_KEY=sb_publishable_rd0l1YmGd6Y8qd0WH8E4mQ_M38hA1Kr
EXPO_PUBLIC_CLUTCH_API_URL=https://jslnnchztrhhrzytyzql.supabase.co/functions/v1/clutch-demos
```

### 4. Run

```bash
pnpm start
```

Press `i` for iOS simulator or `a` for Android emulator.

## CI Pipeline

The GitHub Actions workflow runs on every PR and push to `main`:

| Job | Trigger | Description |
|---|---|---|
| **Quality** | Always | Lint, typecheck, format check |
| **Validate Migrations** | PR only | Starts local Supabase, runs `db reset` |
| **Deploy Migrations** | Merge to main | Links project, runs `db push` |
| **EAS Preview** | PR only | Publishes OTA update with QR code |
| **Release** | Merge to main | Publishes EAS Update + creates GitHub Release |

## Scripts

| Command | Description |
|---|---|
| `pnpm start` | Start Expo dev server |
| `pnpm ios` | Start on iOS simulator |
| `pnpm android` | Start on Android emulator |
| `pnpm lint` | Run ESLint |
| `pnpm format` | Format with Prettier |
| `pnpm format:check` | Check formatting |
| `pnpm typecheck` | Run TypeScript type checking |
