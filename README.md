# FlowBoard — React + Tailwind + Supabase Kanban

## Setup (3 steps)

### 1. Create a Supabase project
- Go to https://supabase.com → New project
- Open **SQL Editor** → paste the full contents of `supabase/schema.sql` → click **Run**
- Go to **Project Settings → API** → copy your Project URL and anon key

### 2. Add your environment variables
```bash
cp .env.example .env
```
Open `.env` and fill in:
```
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### 3. Install and run
```bash
npm install
npm run dev
```
Open http://localhost:5173

---

## Google OAuth (optional)
1. In Supabase: **Authentication → Providers → Google** → enable it and copy the Callback URL
2. In Google Cloud Console: create OAuth credentials and paste the Supabase callback URL
3. Paste Client ID + Secret back into Supabase
That's it — no code changes needed!

---

## Tailwind note
This project uses **only standard Tailwind utility classes** — no custom config.
The `tailwind.config.js` only has the content paths so Tailwind knows which files to scan.
Every class like `bg-indigo-600`, `rounded-xl`, `text-sm` etc. comes built-in with Tailwind.

---

## File structure
```
src/
  lib/supabase.js          → Supabase client setup
  context/AuthContext.jsx  → Login/logout state for whole app
  hooks/
    useProjects.js         → Load, create, delete projects
    useTasks.js            → Load, create, update, delete, reorder tasks
  components/
    Navbar.jsx             → Top nav with user menu
    ProtectedRoute.jsx     → Redirect to login if not signed in
    ProjectModal.jsx       → Create project popup
    TaskModal.jsx          → Create/edit task popup
  pages/
    Login.jsx              → Sign in page
    Signup.jsx             → Create account page
    AuthCallback.jsx       → Google OAuth redirect handler
    Dashboard.jsx          → Stats + project grid
    KanbanBoard.jsx        → Drag-and-drop kanban board
```
