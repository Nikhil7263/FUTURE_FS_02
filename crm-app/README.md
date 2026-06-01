# ⚡ LeadFlow CRM

A modern, full-stack CRM application for managing client leads from website contact forms.

![Stack](https://img.shields.io/badge/React-18-61DAFB?logo=react) ![Node.js](https://img.shields.io/badge/Node.js-18-339933?logo=nodedotjs) ![MongoDB](https://img.shields.io/badge/MongoDB-7-47A248?logo=mongodb)

---

## ✨ Features

- **Lead Management** — List, create, edit, and delete leads with rich contact info
- **Status Pipeline** — Track leads across: `New → Contacted → Qualified → Converted / Lost`
- **Notes System** — Add timestamped notes to each lead with author tracking
- **Follow-up Scheduling** — Set due-dated follow-ups with priority levels (low/medium/high)
- **Dashboard Analytics** — Pipeline chart, source breakdown, conversion stats
- **Secure Auth** — JWT-based login with role support (admin / agent)
- **Search & Filters** — Filter leads by status, source, or full-text search
- **Pagination** — Efficient paginated lead listing

---

## 🗂 Project Structure

```
crm-app/
├── backend/
│   ├── config/        # MongoDB connection
│   ├── middleware/    # JWT auth middleware
│   ├── models/        # Mongoose schemas (User, Lead)
│   ├── routes/        # Express routes (auth, leads)
│   └── server.js      # Entry point
└── frontend/
    └── src/
        ├── components/ # Layout, sidebar
        ├── context/    # Auth context
        ├── pages/      # Dashboard, Leads, Forms
        └── utils/      # API helpers
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- MongoDB (local or [MongoDB Atlas](https://cloud.mongodb.com))

### 1. Clone & Install

```bash
git clone https://github.com/YOUR_USERNAME/leadflow-crm.git
cd leadflow-crm

# Install all dependencies
cd backend && npm install
cd ../frontend && npm install
```

### 2. Configure Environment

```bash
cd backend
cp .env.example .env
```

Edit `backend/.env`:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/crm_db
JWT_SECRET=change_this_to_a_long_random_secret
JWT_EXPIRE=7d
NODE_ENV=development
```

### 3. Start the App

**Terminal 1 — Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 — Frontend:**
```bash
cd frontend
npm start
```

Open [http://localhost:3000](http://localhost:3000) and register your admin account.

---

## 🔌 API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login |
| GET | `/api/auth/me` | Get current user |

### Leads *(all require Bearer token)*
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/leads` | List leads (filter/search/paginate) |
| GET | `/api/leads/stats` | Dashboard statistics |
| GET | `/api/leads/:id` | Get single lead |
| POST | `/api/leads` | Create lead |
| PUT | `/api/leads/:id` | Update lead |
| DELETE | `/api/leads/:id` | Delete lead |
| POST | `/api/leads/:id/notes` | Add note |
| DELETE | `/api/leads/:id/notes/:noteId` | Delete note |
| POST | `/api/leads/:id/followups` | Schedule follow-up |
| PUT | `/api/leads/:id/followups/:fuId` | Update follow-up |
| DELETE | `/api/leads/:id/followups/:fuId` | Delete follow-up |

---

## 🛡 Security Features

- **JWT Authentication** with configurable expiry
- **Password hashing** via bcryptjs (12 salt rounds)
- **Rate limiting** — 200 requests/15 min per IP
- **Input validation** on all Mongoose models
- **CORS** configured for frontend origin only
- **Request size limits** (10kb JSON)

---

## 🧑‍💻 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, React Router 6, Recharts, Lucide Icons |
| Backend | Node.js, Express 4 |
| Database | MongoDB, Mongoose 8 |
| Auth | JWT, bcryptjs |
| Styling | CSS Variables, DM Sans + Syne fonts |

---

## 📦 Deployment

### Backend (Railway / Render / Heroku)
Set environment variables and deploy the `/backend` folder.

### Frontend (Vercel / Netlify)
```bash
cd frontend
npm run build
```
Deploy the `build/` folder. Set `REACT_APP_API_URL` if your backend is on a different domain.

---

## 📄 License

MIT — free to use and modify.
