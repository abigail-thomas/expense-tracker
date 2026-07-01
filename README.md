# Expense Tracker

Full-Stack MERN Expense Tracker — **React, Node.js, Express, MongoDB**.

Track your income and expenses, visualise them with charts, and export the data to Excel.

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
│   ├── config/db.js             # Mongoose connection
│   ├── controllers/             # auth, income, expense, dashboard
│   ├── middleware/              # JWT auth + Multer upload
│   ├── models/                  # User, Income, Expense
│   ├── routes/                  # /api/v1/{auth,income,expense,dashboard}
│   ├── uploads/                 # profile images (git-ignored)
│   └── server.js
└── frontend/expense-tracker/    # React + Vite app
    └── src/
        ├── components/          # layouts, cards, charts, forms, modal
        ├── context/             # UserContext + provider
        ├── hooks/useUserAuth    # loads user on protected pages
        ├── pages/               # Auth (Login/SignUp), Dashboard (Home/Income/Expense)
        └── utils/               # apiPaths, axiosInstance, helpers
```

## Getting started

### Prerequisites

- Node.js 18+ (tested on v24)
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
| POST   | `/auth/upload-image`         | Upload a profile image            |  –   |
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

**Frontend** (`frontend/expense-tracker/`)
- `npm run dev` — Vite dev server
- `npm run build` — production build
- `npm run preview` — preview the production build
- `npm run lint` — run ESLint
