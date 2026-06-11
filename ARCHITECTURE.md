# BusTrack Dashboard — Architecture Blueprint

## 1. SYSTEM OVERVIEW

```
┌─────────────────────────────────────────────────────────────────────┐
│                        BusTrack Dashboard                         │
│                    (Next.js 14 + Tailwind CSS)                     │
├─────────────────────────────────────────────────────────────────────┤
│                                                                    │
│  ┌──────────┐    ┌──────────────┐    ┌─────────────┐             │
│  │  Auth     │───▶│  Session     │───▶│  WebSocket   │             │
│  │  Flow     │    │  Storage     │    │  Real-time   │             │
│  │          │    │  (localStore)│    │  Connection   │             │
│  └──────────┘    └──────────────┘    └─────────────┘             │
│       │                                        │                  │
│       ▼                                        ▼                  │
│  ┌──────────┐    ┌──────────────┐    ┌─────────────┐             │
│  │  Pairing  │    │  Dashboard   │◀──│  Telemetry   │             │
│  │  Screen   │    │  Screens     │    │  Data Stream │             │
│  └──────────┘    └──────────────┘    └─────────────┘             │
│                                                                    │
└─────────────────────────────────────────────────────────────────────┘
```

## 2. AUTH FLOW (Screen State Machine)

```
┌─────────┐   pair code   ┌────────┐   unlock   ┌────────┐
│ Pairing │──────────────▶│ Unlock │────────────▶│ Login  │
└─────────┘               └────────┘             └────────┘
     ▲                        ▲                      │
     │ (no stored device)     │ (stored device_id)   │
     │                        │                      │ driver login
     │                        │                      ▼
     │                        │               ┌──────────┐
     │                        │               │ Pre-Ride │
     │                        │               └──────────┘
     │                        │                      │
     │                        │                      │ start ride
     │                        │                      ▼
     │                        │              ┌───────────┐
     │                        │              │Active Ride│◀──┐
     │                        │              └───────────┘   │
     │                        │                     │        │
     │                        │                     │ end    │
     │                        │                     ▼        │
     │                        │              ┌───────────┐   │
     │                        │              │ Post-Ride │───┘
     │                        │              └───────────┘ (new route)
     │                        │
     └────────────────────────┘ (full logout clears all)
```

## 3. LAYER ARCHITECTURE

### 3.1 Presentation Layer (UI)
```
app/
├── layout.tsx                    # Root layout + AuthProvider wrapper
├── page.tsx                      # Entry point — redirects based on auth state
├── globals.css                   # Global styles + Tailwind
├── (auth)/
│   ├── pairing/page.tsx          # Admin pairing code entry
│   ├── unlock/page.tsx           # Bus dashboard password unlock
│   └── login/page.tsx            # Driver credentials login
├── (dashboard)/
│   ├── layout.tsx                # Dashboard shell with sidebar/topbar
│   ├── pre-ride/page.tsx         # Pre-ride setup + vehicle info
│   ├── active-ride/page.tsx      # Active ride with map, telemetry
│   └── post-ride/page.tsx        # Ride summary + stats
components/
├── ui/                           # Reusable UI primitives
│   ├── button.tsx
│   ├── input.tsx
│   ├── card.tsx
│   ├── badge.tsx
│   ├── skeleton.tsx
│   └── map.tsx                   # Leaflet/MapLibre GL map component
├── auth/
│   ├── pairing-form.tsx
│   ├── unlock-form.tsx
│   └── driver-login-form.tsx
├── dashboard/
│   ├── sidebar.tsx               # Navigation sidebar
│   ├── topbar.tsx                # Top bar with time, status, logout
│   ├── occupancy-gauge.tsx       # Occupancy level visualization
│   ├── speed-indicator.tsx       # Speed telemetry display
│   ├── route-progress.tsx        # Route progress with stops
│   ├── vehicle-stats.tsx         # Vehicle stats cards
│   └── connection-status.tsx     # WebSocket connection indicator
lib/                              # (EXISTING — DO NOT MODIFY)
├── api.ts                        # Axios instance + API endpoints
├── haversine.ts                  # GPS distance calculation
├── nearest-stop.ts               # Nearest stop finder
├── session-storage.ts            # localStorage session management
├── ws-url.ts                     # WebSocket URL builder
hooks/
├── use-bus-websocket.ts          # (EXISTING) WebSocket hook
├── use-current-time.ts           # Live clock hook
├── use-geolocation.ts            # GPS position tracking
providers/
├── auth-provider.tsx             # (EXISTING) Auth context + state
types/
└── index.ts                      # (EXISTING) All TypeScript types
```

### 3.2 API Layer (All existing — DO NOT MODIFY)
- **Base URL**: `https://api.bustrack.dpdns.org/api/v1`
- **Auth via**: Bearer token in `Authorization` header
- **Pairing**: `POST /pair/verify` → `{ code, password }`
- **Bus Unlock**: `POST /auth/bus-dashboard/login` → `{ vehicle_id, device_id, password }`
- **Driver Login**: `POST /auth/driver-login` → `{ username, password, device_id, bus_token }`
- **Driver Logout**: `POST /auth/driver-logout` → `{ session_id }`
- **Vehicle**: `GET /vehicles/:id` — vehicle data
- **Position**: `GET /vehicles/positions/:id` — real-time position
- **Telemetry**: `POST /vehicles/telemetry` → `{ device_id, lat, lon }`
- **Route**: `GET /routes/:id` — route with stops
- **Assignments**: `GET /driver/assignments/current`, `POST /driver/assignments/start`, `POST /driver/assignments/end`
- **WebSocket**: `ws://api.bustrack.dpdns.org/api/v1/ws/mobile?token=...`

### 3.3 Business Logic Layer
- **AuthProvider** (existing) manages the entire screen flow
- **useBusWebSocket** (existing) manages real-time data
- New hooks: `use-current-time`, `use-geolocation`

### 3.4 Data Access Layer
- **localStorage** via `session-storage.ts` (existing)
- **REST API** via `api.ts` (existing)
- **WebSocket** via `use-bus-websocket.ts` (existing)

## 4. DESIGN SYSTEM

### 4.1 Theme: Dark Mode (default for drivers)
- **Background**: `#0F172A` (Slate-900)
- **Surface**: `#1E293B` (Slate-800)
- **Accent**: `#2563EB` (Blue-600)
- **Success**: `#10B981` (Emerald-500)
- **Warning**: `#F59E0B` (Amber-500)
- **Destructive**: `#DC2626` (Red-600)
- **Text Primary**: `#F8FAFC` (Slate-50)
- **Text Secondary**: `#94A3B8` (Slate-400)
- **Border**: `rgba(255,255,255,0.08)`

### 4.2 Typography
- **Primary**: Inter (fallback to system sans)
- **Monospace**: JetBrains Mono (for numbers, telemetry)
- Scale: 12, 14, 16, 18, 20, 24, 32

### 4.3 Layout
- Sidebar: 260px fixed (desktop), slide-over (mobile)
- Content: fluid max-w-[1400px]
- Bento-style grid for dashboard metrics
- Gap: 24px (consistent)

## 5. PAGE BREAKDOWN

### 5.1 Pairing Page
- Full-screen centered form
- Input for pairing code (from admin)
- Input for password (first-time setup)
- Error display
- Success → redirect to unlock

### 5.2 Unlock Page
- Bus icon + plate number display
- Password input
- Error display
- Success → redirect to driver login

### 5.3 Driver Login Page
- Clean auth form (mimic reference design)
- Username + password fields
- Loading state
- Success → redirect to pre-ride

### 5.4 Pre-Ride Page (Dashboard)
- Vehicle info card (plate, type, capacity)
- Route info (number, origin, destination, stops list)
- Current occupancy level gauge
- Live clock
- Start Ride button (large CTA)
- Connection status indicator

### 5.5 Active-Ride Page (Main Dashboard)
- **Top Bar**: Current time/date, route number, connection status, logout
- **Left Column**: 
  - Speed indicator (large number, monospace)
  - Occupancy gauge (visual)
  - Vehicle stats
- **Center**: Map (Leaflet) with route polyline + current position marker
- **Right Column**:
  - Route progress (stop list with progress indicator)
  - ETA to next stop
  - Telemetry data (lat, lon)
- **Bottom Bar**: End Ride button

### 5.6 Post-Ride Page
- Trip summary stats
- Duration, distance, avg speed
- Start New Route button

## 6. PERFORMANCE CONSIDERATIONS
- WebSocket reconnection with exponential backoff (existing)
- Map rendering: use Leaflet (lightweight) with canvas renderer
- Skeleton loading states for all async data
- Minimize re-renders: isolate WebSocket message handling
- Lazy load map component (heavy)
- `React.memo` for telemetry display components

## 7. ENVIRONMENT VARIABLES
```
NEXT_PUBLIC_API_URL=https://api.bustrack.dpdns.org
```

## 8. IMPLEMENTATION ORDER
1. Next.js project setup (package.json, tailwind.config, tsconfig)
2. Root layout + AuthProvider wrapper
3. Global styles (dark theme)
4. Reusable UI components (button, input, card, badge, skeleton)
5. Auth pages (pairing, unlock, login) with forms
6. Dashboard layout (sidebar, topbar)
7. Pre-Ride page
8. Active-Ride page (map, telemetry, route progress)
9. Post-Ride page
10. Hook: use-current-time
11. Hook: use-geolocation
