# Tahfeez Management System

A premium ERP web application for managing a Tahfeez (Quran memorization) institute — student registration, fee collection, and role-based dashboards for Janab (super admin), Accounts, and Students.

## Stack
React 19 · TypeScript · Vite · Tailwind CSS · React Router · Framer Motion · React Hook Form + Zod · Radix UI primitives · Sonner (toasts)

## Getting started

```bash
npm install
npm run dev
```

Open the printed local URL in your browser.

## Demo credentials

| Role     | Username / ID | Password    |
|----------|----------------|-------------|
| Janab    | janab          | janab123    |
| Accounts | accounts       | accounts123 |

Students receive a generated Student ID and password after registering from the login screen.

## Architecture notes

- **Data layer** (`src/lib/db.ts`): every function is `async` and returns plain data, mirroring what a real backend (Firebase/Supabase/REST API) would return. Today it persists to `localStorage`; swapping in a real backend later only requires editing this one file.
- **Contexts** (`src/context/`): `AuthContext` (session + role), `DataContext` (students + fees), `ThemeContext` (dark mode).
- **Role-based routing** (`src/routes/ProtectedRoute.tsx`): gates `/janab`, `/accounts`, and `/student` routes by role.
- **Future modules** (Attendance, Performance, Exams, Notifications, etc.) have placeholder nav entries in the sidebar and can be added as new routes/pages without restructuring existing code.

## Project structure

```
src/
  components/       Reusable UI (cards, tables, sidebar, navbar, etc.)
  components/ui/    Low-level primitives (button, input, dialog, select...)
  context/          Auth, Data, Theme providers
  lib/              db.ts (mock backend), utils.ts
  pages/            Login, Registration, Student/Janab/Accounts dashboards
  routes/           ProtectedRoute
  types/            Shared TypeScript types
```
