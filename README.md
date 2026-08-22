# Hackquire — AI-Powered Invoicing for Independent Workers

Turn your work into an invoice in seconds. Hackquire is an AI-powered invoicing tool built for gig economy workers — electricians, tutors, tailors, freelancers, and other service providers who need to send professional invoices fast without wrestling with spreadsheets.

## Core Features

### AI Invoice Generator (Biddable / Integrable Service)

Just type or speak plain language, like:

> "Repaired Rahul's AC for ₹2500 and replaced the filter for ₹600. Payment due in 7 days."

and Hackquire turns it into a full invoice. It's powered by the Google Gemini API, with a heuristic fallback engine that kicks in automatically if Gemini is unavailable.

The parser pulls out the client name, line items, quantities, unit rates, due dates, and any notes, then handles subtotal, tax, discounts, and grand total calculations on the backend. Once it's generated, invoices can be downloaded as a polished PDF with one click.

This is also exposed as a reusable API — `POST /api/ai/invoice` — so other teams can plug invoice generation into their own workflows.

### UPI Reconciliation

A simple interface for matching incoming UPI payments to pending invoices. Match with one click, and the app automatically calculates `amountPaid`, `amountDue`, and status (`paid`, `partial`, or `overdue`). Manual unmatching and dispute review are supported too, for when something doesn't line up.

### Due Reminders & One-Click Notifications

Real-time tracking of upcoming and overdue invoices, plus:

- **One-click WhatsApp reminder** — opens a pre-formatted message with the invoice number, amount, and client name
- **One-click SMS reminder** — opens your default messaging app with a polite payment nudge

## Tech Stack

- **Frontend**: React 18, Vite, Tailwind CSS, Lucide Icons, React Hot Toast, jsPDF
- **Backend**: Node.js, Express.js, RESTful controllers, JWT authentication, bcryptjs
- **Database**: MongoDB Atlas with Mongoose ODM (falls back to in-memory storage seamlessly)
- **AI Engine**: Google Gemini Generative AI SDK (`@google/generative-ai`)

## Quick Start (Local Development)

### 1. Backend

```bash
cd backend
npm install
npm run dev
```

Runs on `http://localhost:5000`.

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
```

Runs on `http://localhost:5173`.

## Demo Account (Pre-Seeded)

- **Email**: `demo@hackquire.com`
- **Password**: `demo123`

## Environment Variables

### Backend (`backend/.env`)

```env
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/hackquire?retryWrites=true&w=majority
JWT_SECRET=hackquire_jwt_super_secret_2026_change_in_production
GEMINI_API_KEY=your_gemini_api_key
CLIENT_URL=http://localhost:5173
PORT=5000
NODE_ENV=development
```

### Frontend (`frontend/.env`)

```env
VITE_API_URL=http://localhost:5000/api
```

## Deployment Guide

### Option 1: Full-Stack on Vercel (Recommended - Single Project)

1. Push this repository to GitHub.
2. Go to [Vercel Dashboard](https://vercel.com/dashboard) and click **"Add New" > "Project"**.
3. Import your GitHub repository.
4. Keep the **Root Directory** as `./` (default).
5. In **Environment Variables**, configure:
   - `MONGO_URI`: Your MongoDB Atlas connection string (`mongodb+srv://...`)
   - `JWT_SECRET`: A secure random secret string
   - `GEMINI_API_KEY`: Your Google Gemini API Key
   - `NODE_ENV`: `production`
6. Click **Deploy**. Vercel will automatically build the React frontend and deploy the Express API as Serverless Functions (`/api/*`).

---

### Option 2: Frontend on Vercel + Backend on Render/Railway

#### Backend (Render / Railway)
1. Create a new Web Service on [Render](https://render.com) or [Railway](https://railway.app).
2. Set the root directory to `backend`.
3. Set the build command to `npm install` and start command to `node server.js`.
4. Set environment variables: `MONGO_URI`, `JWT_SECRET`, `GEMINI_API_KEY`, `CLIENT_URL` (your frontend Vercel URL), and `NODE_ENV=production`.

#### Frontend (Vercel)
1. Create a new project on [Vercel](https://vercel.com).
2. Set the root directory to `frontend`.
3. Framework Preset: **Vite**.
4. Set the environment variable: `VITE_API_URL=https://your-backend.onrender.com/api`.
5. Click **Deploy**. (The included `frontend/vercel.json` ensures SPA routes like `/dashboard` work seamlessly on page reload).