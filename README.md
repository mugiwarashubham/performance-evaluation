Performance Evaluation Tool

Small internal tool for monthly manager → employee feedback across 5 fixed parameters. Built for a multi-company pilot — one login page, each user scoped to their own company's data.

See ASSUMPTIONS.md for the reasoning behind the data model and a few things I deliberately left out.

Stack
Backend: Node/Express, MongoDB (Mongoose), Redis (used for a logout token blacklist), JWT auth via httpOnly cookie
Frontend: React (Vite), Tailwind, React Router
Running it locally

You'll need a MongoDB instance and a Redis instance running (local or hosted — Atlas + Upstash both work fine for this).

1. Backend
bash
cd backend
npm install

Create a .env file in backend/ (see .env.example):

MONGO_URI=mongodb://127.0.0.1:27017/performance-eval
JWT_KEY=some-long-random-string
REDIS_HOST=127.0.0.1
REDIS_PORT=6379
REDIS_PASS=
CLIENT_URL=http://localhost:5173
PORT=5000

Seed the database — this creates both pilot companies (Ashoka Textiles and Bright Path Consulting) with users, a closed cycle with submitted feedback (so the history view has something in it), and an open cycle with pending assignments:

bash
node src/seed/seed.js

Then start the server:

bash
npm run dev

You should see MongoDB connected, Redis connected, and Server running on port 5000.

2. Frontend
bash
cd frontend
npm install

Create a .env in frontend/ if your backend isn't on the default:

VITE_API_URL=http://localhost:5000/api
bash
npm run dev

Open http://localhost:5173.

Demo accounts

All seeded users share the password password123.

Account	What it shows
kavita@ashoka.com	HR — cycle picker, submission summary, who's still pending
coo@ashoka.com	Top of Ashoka's chain, gives feedback to Rohan, receives none
rohan@ashoka.com	Gives feedback to Priya, receives feedback from the COO
priya@ashoka.com	The "dual role" case — gives feedback to 6 reports, receives from Rohan
amit@ashoka.com	Individual contributor — only sees their own history, no team tab
founder@brightpath.com	Flat hierarchy — gives feedback directly to 8 people, no middle layer
Project structure
backend/
  src/
    config/       # db, redis, and the fixed parameters list
    controllers/   # auth, feedback (employee-facing), hr
    middleware/    # auth + role gating
    models/        # Company, User, FeedbackCycle, FeedbackAssignment, FeedbackSubmission
    routes/
    seed/

frontend/
  src/
    pages/         # LoginPage, EmployeeApp, FeedbackForm, HRApp
    constants/      # parameters list, mirrored from backend
    utils/          # axios client
A note on what's not here

Cycle + assignment creation currently only happens via the seed script — there's no "open this month's cycle" button in the HR app yet. Written up in more detail in ASSUMPTIONS.md, but flagging it here too since it's the first thing that'll come up if someone tries to click through a second month in the demo.