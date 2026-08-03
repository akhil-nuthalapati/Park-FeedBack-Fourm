<div align="center">

# 🌳 SW19 — Park Maintenance System
### GVMC Park & Green Space Usage Monitoring · Team Zenith

A contactless, QR-code driven platform for park check-ins, visitor feedback,
and maintenance reporting — built for a hackathon, wired to a real Supabase backend.

[![React](https://img.shields.io/badge/React-18.3-61DAFB?style=for-the-badge&logo=react&logoColor=white)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-5-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![Supabase](https://img.shields.io/badge/Supabase-Backend-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com)
[![Vercel](https://img.shields.io/badge/Vercel-Deployed-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://vercel.com)

</div>

---

## ✨ What it does

Visitors **scan a QR code** at a park to check in, rate the facilities, and report
problems — no login needed. Staff manage everything through a role-based admin
dashboard, and a separate Super-Admin portal handles staff accounts.

## 🚀 Key Features

| | |
|---|---|
| 📱 **QR Check-In** | Instant, anonymous visit logging |
| ⭐ **8-Category Feedback** | Cleanliness, safety, facilities & more |
| 🛠️ **Maintenance Reports** | Photo evidence + issue tracking |
| 📊 **Live Dashboard** | Visitor trends, ratings, complaint status |
| 🔐 **Role-Based Access** | SUPER_ADMIN · ADMIN · OFFICER · VIEWER |
| 👥 **Staff Management** | Dedicated Super-Admin portal |

## 🧱 Tech Stack

| Layer | Technology |
|---|---|
| 🎨 **Frontend** | ⚛️ React 18 · ⚡ Vite 5 · 🌊 Tailwind CSS 3 · 🧭 React Router 6 |
| 📈 **Charts / Icons** | Recharts · lucide-react |
| 🗄️ **Backend** | 🟢 Supabase — Auth, Postgres, Storage, Realtime |
| 🛢️ **Database** | 🐘 PostgreSQL with Row-Level Security |
| ☁️ **Hosting** | ▲ Vercel |

## 📂 Structure

```
src/            → Visitor + Admin web app (React)
admin-portal/   → Standalone Super-Admin console
supabase/       → Schema, RLS policies, triggers (SQL)
```

## 🏁 Quick Start

```bash
npm install
cp .env.example .env   # add your Supabase URL & anon key
npm run dev
```

---

<div align="center">
Built with 💙 by <b>NVSA</b>
</div>
