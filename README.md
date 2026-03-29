# Brokai — Full-Stack Dispatch Management System

A production-grade, real-time dispatch management platform built as a unified monorepo. An Admin Dashboard (Next.js) dispatches tasks to Field Engineers on mobile (Flutter) with instant WebSocket-powered updates, backed by a Node.js REST API and PostgreSQL.

---

## 🔗 Live Links

| Resource | Link |
|---|---|
| 🎥 **Demo Video** | [Watch on Google Drive](https://drive.google.com/file/d/1cOfE7gB_s66vo0Mstb0nrLiM88bL2N6M/view?usp=sharing) |
| 📱 **Brokai Field Flutter APK** | [Download APK](https://drive.google.com/file/d/1CQ_p8ELcgHYIAfDBEXi90rOwYF5JW7l0/view?usp=sharing) |
| 🌐 **Live APIs (Render)** | [https://brokai.onrender.com](https://brokai.onrender.com/) |
| 🖥️ **Web Dashboard (Netlify)** | [https://brokaiweb.netlify.app](http://brokaiweb.netlify.app/) |

> **⚠️ Important — Render Free Tier Cold Starts**
>
> The backend is deployed on Render's free tier, which puts the server to sleep after periods of inactivity. While cron jobs have been set up to keep it alive, Render occasionally identifies and throttles these pings. **If fetching tasks takes unusually long on the first load**, please visit [https://brokai.onrender.com](https://brokai.onrender.com/) in your browser first — if it shows the welcome message, the server is awake and the dashboard/app will load normally.

---

## 📋 Trade-offs & Compromises

> Given the 48-hour deadline, the following technical compromises were made:

1. **No Authentication Layer** — The API, dashboard, and mobile app currently have no auth (no login, no role-based access). In production, Supabase Auth or a provider like Clerk would gate API routes and restrict the dashboard to authorized dispatchers only.
2. **In-Memory Notification Storage** — Notifications on both the web dashboard and mobile app are session-only (stored in memory / React state). They reset on page refresh or app restart. A production system would persist these to a database table with read/unread status.
3. **No Input Sanitization or Rate Limiting** — API endpoints accept task creation and completion without request throttling or input sanitization beyond basic Zod schema validation. For production, rate limiting middleware (e.g., `express-rate-limit`) and stricter sanitization would be essential.
4. **No Automated Testing** — Unit tests, integration tests, and E2E tests were skipped entirely to prioritize feature delivery within the time constraint.

---

## 🏗️ Monorepo Architecture

This project is structured as an NPM Workspace containing three distinct applications:

```
brokai/
├── apps/
│   ├── server/      # Node.js + Express REST API + Socket.io
│   ├── web/         # Next.js 15 Admin Dashboard
│   └── mobile/      # Flutter Field Engineer App
├── package.json     # NPM Workspace root
├── render.yaml      # Render Blueprint (IaC)
└── netlify.toml     # Netlify build config
```

---

## 🚀 Features

### Backend API (`apps/server`)
- **RESTful Endpoints** — `GET /tasks`, `POST /tasks`, `PATCH /tasks/:id/complete` with Zod validation
- **Real-Time WebSockets** — Socket.io broadcasts `task_created` and `task_completed` events to all connected clients instantly
- **Prisma ORM** — Type-safe database operations with PostgreSQL (Supabase)
- **Error Handling** — Centralized error handler middleware with structured responses
- **Health Check** — Root `/` endpoint returns a welcome message for uptime monitoring

### Web Dashboard (`apps/web`)
- **Dispatch New Tasks** — Clean form with task title and location inputs
- **Task List with Tabs** — Separate Pending and Completed tabs with live counts and completion percentage
- **Real-Time Updates** — Socket.io listener auto-refreshes the task list when new tasks are dispatched or completed from any client
- **Live Search** — Header search bar filters tasks by title or location with an inline results dropdown
- **Session Notifications** — Bell icon with unread badge; stores all session toast events (dispatches, completions) in an in-memory store accessible via a dropdown
- **Dark / Light Mode** — Toggle via profile dropdown; persists preference in localStorage; full theme coverage for header, cards, inputs, dropdowns, and footer
- **Responsive Design** — 12-column grid layout adapting from desktop to mobile viewports
- **Footer Links** — Privacy Policy, Terms of Service, and Support redirect to Brokai Labs pages in new tabs

### Flutter Mobile App (`apps/mobile`)
- **Task Management** — View pending and completed tasks in a tabbed interface with pull-to-refresh
- **Mark as Done** — Inline "Mark Done" button on each pending task with confirmation dialog
- **Real-Time Socket Updates** — Receives `task_created` and `task_completed` events with styled snackbar notifications
- **Notification Screen** — Bell icon with unread badge; dedicated notification screen showing all session events (dispatches, completions) with time-ago timestamps and "Clear All"
- **Dark / Light Mode** — Toggle in app bar with full theme support across all screens
- **Offline Resilience** — Detects connectivity loss via `connectivity_plus`, shows offline banner, and uses `dio_smart_retry` with exponential backoffs
- **Native Branding** — Custom splash screen and launcher icon with Brokai logo
- **IST Timezone** — All timestamps converted from UTC to device local time in 24-hour format

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Database** | PostgreSQL (Supabase) + Prisma ORM |
| **Backend** | Node.js, Express, Socket.io, Zod, TypeScript |
| **Admin Dashboard** | Next.js 15, React 19, Tailwind CSS v4, React-Hot-Toast |
| **Mobile App** | Flutter, Dart, GetX, Dio, Socket.io Client |
| **Deployment** | Render (API), Netlify (Web), Google Drive (APK) |

---

## ⚙️ Running Locally

### Prerequisites
- Node.js ≥ 18, npm ≥ 9
- Flutter SDK ≥ 3.10
- A PostgreSQL database (Supabase recommended)

### 1. Clone & Install

```bash
git clone <repository-url>
cd brokai
npm install
```

### 2. Database & Server

Create `apps/server/.env`:
```env
DATABASE_URL="postgresql://user:password@host:port/dbname"
```

Push the schema and start:
```bash
npm run db:push -w apps/server
npm run db:generate -w apps/server
npm run dev -w apps/server
```
Server runs at `http://localhost:3001`

### 3. Web Dashboard

Create `apps/web/.env`:
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

Start the dashboard:
```bash
npm run dev -w apps/web
```
Dashboard runs at `http://localhost:3000`

### 4. Flutter Mobile App

Create `apps/mobile/.env`:
```env
API_URL=http://10.0.2.2:3001
```
> Use `10.0.2.2` for Android Emulator or your machine's local IP for physical devices.

Run the app:
```bash
cd apps/mobile
flutter pub get
flutter run
```

---

## ☁️ Deployment

### Backend (Render)
- Uses `render.yaml` blueprint for Infrastructure-as-Code deployment
- Auto-detects the monorepo `apps/server` build context
- Environment variables (`DATABASE_URL`, `PORT`) set in Render dashboard

### Web Dashboard (Netlify)
- Uses `netlify.toml` for build configuration  
- Build command: `npm run build` in `apps/web` context
- `NEXT_PUBLIC_API_URL` points to the live Render API

### Mobile App
- APK built via `flutter build apk --release`
- Distributed via Google Drive for field engineer installation

---

## 📁 Project Structure

```
apps/server/
├── src/
│   ├── index.ts              # Express + Socket.io server entry
│   ├── routes/tasks.ts       # Task CRUD routes
│   ├── middlewares/           # Error handler
│   └── prisma/schema.prisma  # Database schema
└── package.json

apps/web/
├── src/
│   ├── app/
│   │   ├── page.tsx           # Main dashboard page
│   │   ├── actions.ts         # Server actions (fetch/create/complete)
│   │   ├── layout.tsx         # Root layout with toast provider
│   │   └── globals.css        # Design tokens + dark mode overrides
│   ├── components/
│   │   ├── Header.tsx         # Search, notifications, profile + theme toggle
│   │   ├── TaskForm.tsx       # Dispatch new task form
│   │   ├── TaskList.tsx       # Tabbed task list with stats
│   │   └── SocketListener.tsx # Real-time WebSocket event handler
│   └── lib/
│       └── notificationStore.ts  # In-memory pub/sub notification store
└── package.json

apps/mobile/
├── lib/
│   ├── main.dart              # App entry with GetMaterialApp
│   ├── screens/
│   │   ├── home_screen.dart       # Main tabbed task view
│   │   └── notification_screen.dart # Session notification list
│   ├── controllers/
│   │   └── task_controller.dart   # GetX controller (tasks, notifications, theme)
│   ├── models/
│   │   ├── task_model.dart        # Task data model
│   │   └── notification_model.dart # Notification data model
│   └── services/
│       └── api_service.dart       # Dio HTTP + Socket.io client
├── assets/logo.jpg
└── pubspec.yaml
```

---
