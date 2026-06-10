# BusTrack Bus Dashboard

A standalone Next.js app for bus device authentication and real-time monitoring. This is a **separate app** from the admin dashboard — it runs on its own port/domain and has its own auth flow.

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     ONE SERVER                              │
│                                                             │
│  ┌──────────────────┐  ┌──────────────────┐                │
│  │   Admin App       │  │  Bus Dashboard   │                │
│  │   (port 3000)     │  │  (port 3001)     │                │
│  │                   │  │                  │                │
│  │  • Admin login    │  │  • Setup key     │                │
│  │  • Vehicle mgmt   │  │  • Device pair   │                │
│  │  • Route mgmt     │  │  • Driver login  │                │
│  │  • User mgmt      │  │  • Live GPS      │                │
│  │  • Analytics      │  │  • Ride control  │                │
│  │                   │  │  • Announcements │                │
│  └────────┬─────────┘  └────────┬─────────┘                │
│           │                     │                           │
│           └──────────┬──────────┘                           │
│                      │                                      │
│           ┌──────────▼──────────┐                           │
│           │   FastAPI Backend   │                           │
│           │   (port 8000)       │                           │
│           └─────────────────────┘                           │
└─────────────────────────────────────────────────────────────┘
```

## Auth Flow

### First-Time Setup (Device Pairing)

1. **Admin** goes to Admin App → Vehicles → "Setup Bus Dashboard"
2. Admin sets a dashboard password for the bus
3. System generates a **one-time setup key** (expires in 24 hours)
4. Admin gives the setup key to the person at the bus device
5. On the bus device, user enters:
   - Bus Vehicle ID
   - Device IMEI
   - Setup key
6. Device is **paired** — key is consumed, password is now the auth method

### Subsequent Logins

1. Driver opens bus dashboard URL
2. Enters device IMEI + dashboard password → gets bus token
3. Enters driver username + password → gets driver session
4. Full dashboard with live GPS, ride control, announcements

### Session Persistence

- If driver refreshes: session is restored from localStorage
- If bus token expires but device is paired: goes to unlock (password)
- If driver logs out: goes back to unlock (device stays paired)

## Setup

### 1. Install dependencies

```bash
cd bus-dashboard-app
npm install
```

### 2. Configure environment

```bash
cp .env.local.example .env.local
# Edit .env.local with your backend API URL
```

### 3. Run dev server

```bash
npm run dev
# Runs on http://localhost:3001
```

### 4. Build for production

```bash
npm run build
npm start
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NEXT_PUBLIC_API_URL` | Backend FastAPI URL | `http://localhost:8000` |

## Backend Requirements

This app requires the following backend endpoints:

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/v1/auth/bus-dashboard/pair` | POST | First-time device pairing with setup key |
| `/api/v1/auth/bus-dashboard/login` | POST | Unlock with password |
| `/api/v1/auth/driver-login` | POST | Driver credential login |
| `/api/v1/auth/driver-logout` | POST | End driver session |
| `/api/v1/admin/bus-dashboard/setup` | POST | Admin: create dashboard + generate key |
| `/api/v1/admin/bus-dashboard/reset-key` | POST | Admin: regenerate setup key |
| `/api/v1/vehicles/:id` | GET | Vehicle data |
| `/api/v1/vehicles/positions/:id` | GET | Vehicle position |
| `/api/v1/routes/:id` | GET | Route with stops |
| `/api/v1/admin/crowd/:plate` | GET | Crowd density |
| `/api/v1/admin/trip-history/vehicle/:id` | GET | Trip history |
| `/api/v1/assignments/active` | GET | Active assignments |
| `/api/v1/assignments/start` | POST | Start assignment |
| `/api/v1/assignments/end` | POST | End assignment |
| `/api/v1/ws/live` | WebSocket | Live fleet stream |

## Deployment

### Separate Domains (Production)

```
admin.myurl.com     → Admin App (port 3000 or reverse proxy)
busd.myurl.com      → Bus Dashboard App (port 3001 or reverse proxy)
```

Since the two apps are completely separate, they can be deployed on different domains with no shared cookies or sessions.

### Nginx Example

```nginx
# Admin
server {
    listen 80;
    server_name admin.myurl.com;
    location / {
        proxy_pass http://localhost:3000;
    }
}

# Bus Dashboard
server {
    listen 80;
    server_name busd.myurl.com;
    location / {
        proxy_pass http://localhost:3001;
    }
}
```

### Docker (Optional)

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 3001
CMD ["npm", "start"]
```

## File Structure

```
bus-dashboard-app/
├── src/
│   ├── app/
│   │   ├── page.tsx              # Landing / Bus ID entry
│   │   ├── layout.tsx            # Root layout
│   │   ├── globals.css           # Global styles
│   │   └── bus/[busId]/page.tsx  # Main dashboard with auth flow
│   ├── components/               # UI components (shared with admin)
│   ├── hooks/
│   │   └── useBusDashboardWebSocket.ts
│   ├── lib/
│   │   ├── api.ts                # Axios instance + API helpers
│   │   └── wsUrl.ts              # WebSocket URL builder
│   └── types/
│       └── index.ts              # TypeScript interfaces
├── public/
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── postcss.config.js
├── next.config.mjs
├── .env.local.example
└── README.md
```
