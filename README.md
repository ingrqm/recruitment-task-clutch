# Clutch Challenge

Video feed app built with Expo SDK 54, React Native 0.81, and React 19.

## Tech Stack

- **Framework**: Expo SDK 54, React Native, React 19
- **Routing**: Expo Router v6
- **Styling**: NativeWind v4 (Tailwind CSS)
- **State**: Jotai, TanStack Query v5
- **Backend**: Supabase (Auth, PostgreSQL, Storage)
- **Video**: expo-video (HLS)
- **Lists**: FlashList
- **Bottom Sheets**: @gorhom/bottom-sheet v5

## Getting Started

```bash
pnpm install
cp .env.example .env.local
# Fill in your environment variables
pnpm start
```

## Scripts

```bash
pnpm start          # Start Expo dev server
pnpm lint           # Run ESLint
pnpm typecheck      # Run TypeScript compiler check
pnpm format         # Format code with Prettier
pnpm format:check   # Check formatting
```
