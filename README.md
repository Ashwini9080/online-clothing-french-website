# Lumière Studio

A modern luxury clothing e-commerce web application built with React 19, TypeScript, Vite, Tailwind CSS, and Supabase.

## Features
- ✨ Product browsing and detailed showcase pages
- 🛍️ Cart and wishlist flows
- 🔐 Secure Authentication (Supabase Auth + Session management)
- 👑 Protected Owner / Admin areas
- ✉️ Contact and custom inquiry forms (EmailJS integration)
- 📱 Responsive luxury UI with smooth Lenis scrolling & Motion animations

## Tech Stack
- **Frontend**: React 19 + TypeScript + Vite
- **Styling**: Tailwind CSS
- **Database & Auth**: Supabase (PostgreSQL)
- **Backend (Optional)**: Express + TypeScript
- **Animations & Smooth Scroll**: Motion (Framer Motion) + Lenis

---

## ⚡ How to Create & Connect Supabase Database

### Step 1: Create a Supabase Project
1. Go to [https://supabase.com](https://supabase.com) and click **"Sign In"** / **"Start your project"**.
2. Click **"New Project"**.
3. Choose an Organization, give your project a name (e.g., `lumiere-studio`), choose a secure database password, and select the region closest to you.
4. Click **"Create new project"** (takes ~1-2 minutes to provision).

### Step 2: Get Your API Credentials
1. In your Supabase Project Dashboard, go to **Project Settings** (gear icon at the bottom left) -> **API** (or **Data API**).
2. Copy the following values:
   - **Project URL** (e.g. `https://xyzcompany.supabase.co`)
   - **anon / public key** (e.g. `eyJhbGciOi...`)

### Step 3: Run the Database Schema
1. In your Supabase Dashboard, click on **SQL Editor** from the left navigation bar.
2. Click **"New query"**.
3. Copy the entire contents of [`supabase_schema.sql`](./supabase_schema.sql) and paste it into the editor.
4. Click **"Run"** (or press Ctrl+Enter / Cmd+Enter).
5. This automatically creates the `profiles`, `orders`, `wishlists`, and `contact_inquiries` tables along with Row Level Security (RLS) policies and triggers!

### Step 4: Configure Supabase Auth (Email/Password)
1. Go to **Authentication** -> **Providers** -> **Email**.
2. Make sure **"Enable Email provider"** is turned ON.
3. *(Recommended for local development)*: Under **Authentication** -> **URL Configuration**, set Site URL to `http://localhost:3000`. You can also turn off **"Confirm email"** in **Authentication** -> **Providers** -> **Email** if you want instant logins during testing.

### Step 5: Add Credentials to `.env.local`
Open your `.env.local` file and add your Supabase credentials:
```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-public-key-here
```

---

## Local Development

### 1. Install dependencies
```bash
npm install
```

### 2. Start the development server
```bash
npm run dev
```
Open: [http://localhost:3000](http://localhost:3000)

### 3. (Optional) Run Express backend
```bash
npm run server
```

---

## Build for Production
```bash
npm run build
```
