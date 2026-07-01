# Personal Finance Manager

Full-Stack MERN Personal Finance Manager — **React, Node.js, Express, MongoDB**.

Track income, expenses, savings funds, subscriptions, credit cards, and goals; visualise them with charts and insights; and export the data to Excel.

## Features

- **Auth** — sign up / log in with JWT, optional profile photo upload
- **Dashboard** — total balance, income & expense summary cards, a financial-overview donut chart, recent transactions, last-30-days expenses (bar chart), last-60-days income (donut)
- **Income** — add / list / delete income entries, with a bar chart and Excel download
- **Expense** — add / list / delete expenses, with a spend-over-time area chart and Excel download
- **Preset icons** — a fixed grid of category icons for expenses (Food, Gas, Groceries, Appointments, Travel, Other)
- **Custom income sources** — each user manages their own income sources (create / rename / delete), each with a chosen icon, picked from a grid in the Add Income modal

## Tech stack

| Layer     | Tech                                                                 |
| --------- | ------------------------------------------------------------------- |
| Frontend  | React 19, Vite 7, Tailwind CSS v4, React Router 7, Recharts, Axios  |
| Backend   | Node.js, Express 4, Mongoose 8, JWT, bcryptjs, Multer, ExcelJS      |
| Database  | MongoDB (Atlas)                                                     |

## Project structure

```
expense-tracker/
├── backend/                     # Express API
│   ├── config/                  # db.js (Mongoose connection) + env.js (startup validation)
│   ├── controllers/             # auth, income, expense, dashboard, funds, cards, subs, goals
│   ├── middleware/              # JWT auth, Multer upload, rate limiters, error handling
│   ├── models/                  # User, Income, Expense, Fund, CreditCard, Subscription, Goal
│   ├── routes/                  # /api/v1/{auth,income,expense,dashboard,fund,...}
│   ├── services/                # interest + subscription schedulers, expense effects
│   ├── tests/                   # Vitest + Supertest API tests (in-memory MongoDB)
│   ├── uploads/                 # profile images (git-ignored)
│   ├── app.js                   # builds the Express app (no side effects — imported by tests)
│   ├── server.js                # boot: validate env → connect DB → start schedulers → listen
│   └── test-server.js           # boots the app on an in-memory DB for e2e (no schedulers)
├── frontend/expense-tracker/    # React + Vite app
│   └── src/
│       ├── components/          # layouts, cards, charts, forms, modal, ErrorBoundary
│       ├── context/             # UserContext + provider
│       ├── hooks/useUserAuth    # loads user on protected pages
│       ├── pages/               # Auth (Login/SignUp), Dashboard (Home/Income/Expense/...), NotFound
│       └── utils/               # apiPaths, axiosInstance, helpers (+ helper.test.js)
├── e2e/                         # Playwright end-to-end tests (boots the full stack)
└── .github/workflows/ci.yml     # CI: backend tests, frontend lint/unit/build, e2e on PRs
```

## Getting started

### Prerequisites

- Node.js **20.19+** (required by Vite 7; pinned via `engines` in each `package.json`)
- A free [MongoDB Atlas](https://www.mongodb.com/atlas) cluster

### 1. Backend

```bash
cd backend
npm install
```

Configure the environment. A `backend/.env` file is already created for you — open it and paste
your Atlas connection string into `MONGO_URI` (a `JWT_SECRET` has already been generated):

```
MONGO_URI=mongodb+srv://<user>:<password>@<cluster>.mongodb.net/expense-tracker?retryWrites=true&w=majority
JWT_SECRET=<already generated>
PORT=8000
CLIENT_URL=http://localhost:5173
```

> To get the string in Atlas: **Cluster → Connect → Drivers**, copy the URI, and replace
> `<password>` with your database user's password. Make sure `expense-tracker` (the DB name)
> appears before the `?`. Also add your IP under **Network Access** (or allow `0.0.0.0/0` for dev).

Run it:

```bash
npm run dev      # nodemon, auto-restarts on change
# or: npm start
```

The API listens on `http://localhost:8000`.

### 2. Frontend

```bash
cd frontend/expense-tracker
npm install
npm run dev
```

Vite serves the app at `http://localhost:5173`. It talks to `http://localhost:8000` by default;
override with `VITE_API_BASE_URL` in a `frontend/expense-tracker/.env` file if needed
(see `.env.example`).

Open the app, create an account, and start adding income and expenses.

## API reference

All routes are prefixed with `/api/v1`. Protected routes require an
`Authorization: Bearer <token>` header.

| Method | Endpoint                     | Description                       | Auth |
| ------ | ---------------------------- | --------------------------------- | :--: |
| POST   | `/auth/register`             | Create an account, returns a JWT  |  –   |
| POST   | `/auth/login`                | Log in, returns a JWT             |  –   |
| GET    | `/auth/getUser`              | Current user's profile            |  ✓   |
| POST   | `/auth/upload-image`         | Upload a profile image            |  ✓   |
| GET    | `/health`                    | Health check (status + DB state)  |  –   |
| GET    | `/dashboard`                 | Aggregated dashboard data         |  ✓   |
| POST   | `/income/add`                | Add an income entry               |  ✓   |
| GET    | `/income/get`                | List income entries               |  ✓   |
| DELETE | `/income/:id`                | Delete an income entry            |  ✓   |
| GET    | `/income/downloadexcel`      | Download income as `.xlsx`        |  ✓   |
| GET    | `/income-source/get`         | List the user's income sources    |  ✓   |
| POST   | `/income-source/add`         | Create an income source           |  ✓   |
| PUT    | `/income-source/:id`         | Rename / re-icon an income source |  ✓   |
| DELETE | `/income-source/:id`         | Delete an income source           |  ✓   |
| POST   | `/expense/add`               | Add an expense entry              |  ✓   |
| GET    | `/expense/get`               | List expense entries              |  ✓   |
| DELETE | `/expense/:id`               | Delete an expense entry           |  ✓   |
| GET    | `/expense/downloadexcel`     | Download expenses as `.xlsx`      |  ✓   |

## Available scripts

**Backend** (`backend/`)
- `npm run dev` — start with nodemon
- `npm start` — start with node
- `npm test` — run the API test suite (Vitest, one run)
- `npm run test:watch` — run the tests in watch mode

**Frontend** (`frontend/expense-tracker/`)
- `npm run dev` — Vite dev server
- `npm run build` — production build
- `npm run preview` — preview the production build
- `npm run lint` — run ESLint
- `npm test` — run unit tests (Vitest, one run)
- `npm run test:watch` — unit tests in watch mode

**E2E** (`e2e/`)
- `npm test` — run the Playwright end-to-end suite
- `npm run test:headed` — run e2e with a visible browser
- `npm run report` — open the last HTML report

## Testing

The project has three test layers, all runnable locally and wired into CI
(`.github/workflows/ci.yml`):

- **Backend API tests** — [Vitest](https://vitest.dev) + [Supertest](https://github.com/ladjs/supertest),
  running against an ephemeral [`mongodb-memory-server`](https://github.com/typegoose/mongodb-memory-server)
  so no real database is touched. Tests import `app.js` directly (which has no
  side effects — no DB connection, schedulers, or `listen`); `server.js` layers
  those on for production.

  ```bash
  cd backend && npm test
  ```

- **Frontend unit tests** — Vitest over the pure helpers in `src/utils/helper.js`
  (including the money-formatting contract).

  ```bash
  cd frontend/expense-tracker && npm test
  ```

- **End-to-end** — [Playwright](https://playwright.dev) drives real user journeys
  (sign up, log in/out, add income & expense, dashboard totals, 404, auth
  redirects). Its config boots the whole stack on isolated ports — the backend
  via `test-server.js` on an in-memory DB (no schedulers, so no real charges),
  and the Vite dev server — so it never collides with a normal dev session.

  ```bash
  cd e2e && npm install && npx playwright install chromium   # first time only
  npm test
  ```

## Production notes

- The API validates required env vars on startup (`MONGO_URI`, `JWT_SECRET`, and
  `CLIENT_URL` when `NODE_ENV=production`) and **fails fast** with a clear message
  rather than starting mis-configured. Set `NODE_ENV=production` on your host so
  error responses don't leak internal details and CORS is locked to `CLIENT_URL`.
- Security middleware: `helmet` headers and rate limiting (tight on auth
  endpoints, looser elsewhere) are enabled by default.
- Use `GET /health` for uptime monitors / keep-alive pings (returns `503` if the
  database is disconnected).
- See `DEPLOYMENT_PLAN.txt` (free hosting: Render + Vercel + Atlas) and
  `V0_CHECKLIST.txt` (pre-deploy hardening checklist) for deployment.
