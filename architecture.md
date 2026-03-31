# Architecture

## App Structure

```mermaid
graph TD
    Root["_layout.tsx<br/>QueryClient, SafeArea, GestureHandler"] --> Auth["(auth)/_layout.tsx<br/>Redirects if authenticated"]
    Root --> App["(app)/_layout.tsx<br/>Jotai atoms, Sheets overlay"]

    Auth --> Login["login.tsx"]
    Auth --> Register["register.tsx"]

    App --> Stack["Stack Navigator"]
    App --> CommentSheet["CommentSheet<br/>Overlay above Stack"]
    App --> LikedBySheet["LikedBySheet<br/>Overlay above Stack"]

    Stack --> Tabs["(tabs)/_layout.tsx<br/>NativeTabs"]
    Stack --> UserProfile["user/[id].tsx"]

    Tabs --> Feed["feed.tsx<br/>FlashList + VideoCard"]
    Tabs --> Profile["profile.tsx"]

    Feed --> VideoCard["VideoCard"]
    VideoCard --> VideoPlayer["VideoPlayer<br/>3x useVideoPlayer"]
```

## Video Player Architecture

Each `VideoCard` renders a `VideoPlayer` with three `useVideoPlayer` instances — one per video URL type (autopan, match without breaks, landscape). Only the active URL key's player plays; the other two are paused.

```mermaid
sequenceDiagram
    participant Feed as FlashList
    participant Card as VideoCard
    participant VP as VideoPlayer
    participant P1 as playerAutopan
    participant P2 as playerMatchWoBreaks
    participant P3 as playerLandscape

    Feed->>Card: isActive=true, activeUrlKey="clutch_autopan"
    Card->>VP: render
    VP->>P1: play(), muted=isMuted
    VP->>P2: pause()
    VP->>P3: pause()

    Note over VP: User taps "Full Match" button
    Card->>VP: activeUrlKey="match_wo_breaks"
    VP->>P1: pause()
    VP->>P2: play(), muted=isMuted

    Note over VP: Card scrolls off screen
    Feed->>Card: isActive=false
    VP->>P1: pause()
    VP->>P2: pause()
    VP->>P3: pause()
```

A thumbnail overlay (using `expo-image`) covers the video until the native compositor renders the first frame. The thumbnail hides 300ms after `readyToPlay` status to avoid flash.

## HLS Video Delivery

The Clutch API returns highlight URLs containing HLS (HTTP Live Streaming) video streams. Each highlight has three video variants and corresponding thumbnails.

```mermaid
graph TD
    API["Clutch API<br/>/clutch-demos"] -->|"highlight_urls"| URLs["Video URL Set"]

    URLs --> AP["clutch_autopan<br/>Portrait, auto-panned"]
    URLs --> MW["match_wo_breaks<br/>Full match, no breaks"]
    URLs --> CL["clutch_landscape<br/>Landscape view"]

    subgraph "VideoPlayer (per card)"
        AP --> P1["useVideoPlayer(autopan)"]
        MW --> P2["useVideoPlayer(match)"]
        CL --> P3["useVideoPlayer(landscape)"]
    end

    P1 -->|"HLS stream"| VV["VideoView<br/>expo-video"]
    P2 -->|"HLS stream"| VV
    P3 -->|"HLS stream"| VV

    Toggle["VideoToggle"] -->|"activeUrlKey"| VV
```

Only the active player plays at any time — the other two are paused. A thumbnail overlay covers the video until the native compositor renders the first frame (300ms delay after `readyToPlay` + 150ms fade).

## Pagination Strategy

Infinite scroll uses TanStack Query's `useInfiniteQuery` with Supabase `.range()` for cursor-based pagination.

```mermaid
sequenceDiagram
    participant UI as FlashList
    participant RQ as useInfiniteQuery
    participant SB as Supabase

    UI->>RQ: initial render
    RQ->>SB: .range(0, 19)
    SB-->>RQ: 20 items
    RQ-->>UI: pages[0].data

    Note over UI: User scrolls to end
    UI->>RQ: onEndReached → fetchNextPage
    RQ->>SB: .range(20, 39)
    SB-->>RQ: 20 items
    RQ-->>UI: pages[0..1].data (40 items)
```

Each page returns `{ data, nextCursor }`. The `getNextPageParam` extracts the cursor. Pages are flattened with `data.pages.flatMap(p => p.data)`.

## Denormalized Counters

Instead of `COUNT(*)` queries (O(n)), a `video_stats` table stores pre-computed `like_count` and `comment_count`. PostgreSQL triggers maintain these automatically.

```mermaid
graph TD
    subgraph "Write Path"
        InsertLike["INSERT INTO likes"] --> Trigger1["on_like_created trigger"]
        Trigger1 --> Upsert1["UPSERT video_stats<br/>like_count + 1"]

        DeleteLike["DELETE FROM likes"] --> Trigger2["on_like_deleted trigger"]
        Trigger2 --> Update1["UPDATE video_stats<br/>like_count - 1"]
    end

    subgraph "Read Path"
        Query["SELECT like_count<br/>FROM video_stats"] --> O1["O(1) read"]
    end
```

The client never writes to `video_stats` directly — RLS makes it read-only. Optimistic updates on the client side are reconciled when the query refetches.

## Bottom Sheet State (Jotai Atoms)

Comment and liked-by sheets are rendered as overlays in `(app)/_layout.tsx`, above the Stack navigator. Jotai atoms in `src/store/` manage open/close state — no providers needed.

```mermaid
graph TD
    Layout["(app)/_layout.tsx"] --> AppContent

    subgraph AppContent
        StackNav["Stack Navigator"]
        CS["CommentSheet"]
        LS["LikedBySheet"]
    end

    subgraph "Jotai Atoms (src/store/)"
        CA["commentVideoIdAtom"]
        LA["likedByVideoIdAtom"]
        MA["mutedAtom"]
    end

    Feed["feed.tsx"] -->|"openComments(videoId)"| CA
    CA --> CS
    Feed -->|"openLikedBy(videoId)"| LA
    LA --> LS
```

This pattern ensures sheets persist across screen transitions within the app stack. The sheets use `@gorhom/bottom-sheet` with `snapPoints` (50%/90%) and `footerComponent` for a sticky input that stays above the keyboard.
