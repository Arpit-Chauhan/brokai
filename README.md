# Brokai - Full Stack Dispatch Management System

A high-performance, real-time Dispatch Management architecture built as a unified monorepo. This system connects an Admin Dashboard (Next.js) directly to Field Engineer devices (Flutter) using instant, persistent WebSockets over a Node.js REST API.

## 🏗️ Monorepo Architecture
This project is structured as an NPM Workspace containing three highly-coupled but distinct applications:

- `apps/server`: **Node.js + Express API** bridging the Database and WebSockets.
- `apps/web`: **Next.js 15 Admin Dashboard** utilizing React Server Components.
- `apps/mobile`: **Flutter App (Brokai Field)** engineered for robust offline/online connectivity.

## 🚀 Key Features

* **Instant WebSockets (Socket.io)**: State mutations (creating or completing a standard task) instantly bypass traditional HTTP polling and broadcast dynamic UI updates seamlessly to all connected Web & Mobile clients in real-time.
* **Offline Resiliency**: The Flutter mobile app actively maps device connectivity using `connectivity_plus`, throws UI warnings upon internet detachment, and intercepts connection timeouts via `dio_smart_retry` with exponential backoffs (10-second hard timeouts).
* **Prisma & Supabase DB**: Highly structured PostgreSQL relational tables configured via `zod` validation pipelines on the backend.
* **Smart UI Separation**: The React logic and GetX UI dynamically sort tasks into separate reactive tabs for `Pending` vs `Completed` streams instantly.
* **Native Branding**: Flutter Splash screens, Home Screen launcher icons, and Next.js Favicons natively hardcode the Brokai company emblem for unified branding.

## 🛠️ Technology Stack
- **Database**: PostgreSQL (Supabase) + Prisma ORM
- **Backend API**: Node.js, Express, Socket.io, Zod
- **Admin Dashboard**: Next.js, React, Tailwind CSS, React-Hot-Toast
- **Field Engineer App**: Flutter, Dart, GetX, Dio

## ⚙️ Running Locally

### 1. Database & Server Setup
Provide a PostgreSQL `DATABASE_URL` string inside `apps/server/.env`.
```bash
# From the root directory:
npm install
npm run db:push -w apps/server
npm run db:generate -w apps/server
```
Run the server:
```bash
npm run dev -w apps/server
```

### 2. Next.js Dashboard
In `apps/web/.env`, map `NEXT_PUBLIC_API_URL=http://localhost:3001`
Run the dashboard:
```bash
npm run dev -w apps/web
```

### 3. Flutter Mobile App
In `apps/mobile/.env`, map `API_URL=http://10.0.2.2:3001` for the Android Emerald or standard `http://localhost:3001`.
Boot the app:
```bash
cd apps/mobile
flutter run
```

## ☁️ Cloud Deployment
This monorepo utilizes an explicit Infrastructure-as-code protocol via the `/render.yaml` blueprint. 
By dropping this repository into **Render.com** (Blueprint deployment), the cloud natively bypasses complex monorepo dependency collisions and constructs the Linux Node server dynamically out-of-the-box. The Web dashboard can be similarly tossed natively into **Netlify**.
