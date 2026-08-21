# ⚡ Hackquire — AI-Powered Invoicing for Independent Workers

> **Turn your work into an invoice in seconds.**
> AI-powered invoicing built for gig economy workers (electricians, tutors, tailors, freelancers, and service providers).

---

## 🌟 Core Features

### 1. ⭐ AI Invoice Generator (Biddable / Integrable Service)
- **Natural Language Parsing**: Enter plain speech/text like:
  > *"Repaired Rahul's AC for ₹2500 and replaced the filter for ₹600. Payment due in 7 days."*
- Powered by **Google Gemini API** with an automatic heuristic fallback engine.
- Extracts **Client Name**, **Line Items**, **Quantities**, **Unit Rates**, **Due Dates**, and **Notes**.
- Calculates subtotal, tax rate, discounts, and grand totals on the backend.
- Professional invoice generation with **one-click PDF download**.
- **Reusable API**: Available via `POST /api/ai/invoice` for other teams to integrate into their workflows!

### 2. 💳 UPI Reconciliation
- Simple, intuitive transaction matching interface.
- Match incoming UPI payments to pending invoices with one click.
- Automatic balance calculation (`amountPaid`, `amountDue`, `paid`/`partial`/`overdue` status).
- Supports manual unmatching and dispute review.

### 3. 🔔 Due Reminders & One-Click Notifications
- Real-time tracking of overdue and upcoming due invoices.
- **1-Click WhatsApp Reminder**: Opens pre-formatted WhatsApp message with invoice number, amount, and client name.
- **1-Click SMS Reminder**: Opens default SMS messaging with polite payment reminder.

---

## 🛠️ Tech Stack

- **Frontend**: React 18 + Vite + Tailwind CSS + Lucide Icons + React Hot Toast + jsPDF
- **Backend**: Node.js + Express.js + RESTful Controllers + JWT Authentication + bcryptjs
- **Database**: MongoDB Atlas + Mongoose ODM (with seamless in-memory fallback)
- **AI Engine**: Google Gemini Generative AI SDK (`@google/generative-ai`)

---

## 🚀 Quick Start (Local Development)

### 1. Backend Setup

```bash
cd backend
npm install
npm run dev
```
*Backend runs on `http://localhost:5000`*

### 2. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```
*Frontend runs on `http://localhost:5173`*

---

## 🔑 Demo Account (Pre-Seeded)

- **Email**: `demo@hackquire.com`
- **Password**: `demo123`

---

## 🌐 Environment Variables

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

---

## 🚢 Deployment Guide

### Deploying Backend (Render / Railway / Heroku)
1. Push repository to GitHub.
2. Create a new **Web Service** on [Render](https://render.com).
3. Set **Root Directory** to `backend`.
4. Set **Build Command** to `npm install`.
5. Set **Start Command** to `node server.js`.
6. Add Environment Variables: `MONGO_URI`, `JWT_SECRET`, `GEMINI_API_KEY`, `CLIENT_URL` (your frontend URL), `NODE_ENV=production`.

### Deploying Frontend (Vercel / Netlify)
1. Create a new Project on [Vercel](https://vercel.com).
2. Set **Root Directory** to `frontend`.
3. Set **Build Command** to `npm run build`.
4. Set **Output Directory** to `dist`.
5. Add Environment Variable: `VITE_API_URL=https://your-backend.onrender.com/api`.
