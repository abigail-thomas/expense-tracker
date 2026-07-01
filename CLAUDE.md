# Expense Tracker

MERN expense tracker. Two parts that must **both** be running in dev:

- `backend/` — Express + MongoDB (Atlas) API on **port 8000**
- `frontend/expense-tracker/` — React + Vite dev server on **port 5173**

## Running the app

Start the backend first, then the frontend, in separate terminals:

```bash
# Terminal 1 — backend (auto-restarts on change)
cd backend
npm run dev        # or `npm start` for a plain node run

# Terminal 2 — frontend
cd frontend/expense-tracker
npm run dev
```

The frontend calls the API at `http://localhost:8000` (see `frontend/expense-tracker/src/utils/apiPaths.js`, overridable via `VITE_API_BASE_URL`).

## Common gotcha: "not logged in / account not working"

This almost always means **the backend server is not running**, not an account or data problem. If only Vite (5173) is up and nothing is listening on 8000, login and all account data will fail. Fix by starting the backend (see above). A healthy backend logs:

```
Server running on port 8000
MongoDB connected: ...
```

Both `backend/.env` (needs `MONGO_URI`, `JWT_SECRET`, `PORT`, `CLIENT_URL`) and `frontend/expense-tracker/.env` are gitignored — copy from the respective `.env.example` files if missing.

## Git

**Do not commit or push anything.** Stage/edit files as needed, but leave `git commit` and `git push` to the user — they run those themselves.

## Conventions

- **Money display:** all amounts render through `addThousandsSeparator()` in `frontend/expense-tracker/src/utils/helper.js`, which always shows exactly 2 decimals (e.g. `1,000.00`). Route any new amount display through it rather than printing raw numbers.
