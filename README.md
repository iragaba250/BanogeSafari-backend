# BANOGE safari — Tour Booking Website

Full-stack tour booking site. **React (Vite)** frontend + **Express/MongoDB** backend.

## Project structure

- `frontend/` — React SPA (Vite), all pages + admin dashboard
- `backend/` — Express REST API + Mongo models/routes/controllers

## Running locally

```bash
# 1. Start MongoDB (local or Atlas), then:
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env

# 2. Install + seed the database
npm --prefix backend install
npm --prefix backend run seed   # creates admin + demo data

# 3. Run backend (http://localhost:5000)
npm --prefix backend run dev

# 4. Run frontend (http://localhost:5173)
npm --prefix frontend install
npm --prefix frontend run dev
```

Default seeded logins:
- Admin: `admin@banoge.com` / `admin123`
- User: `john@example.com` / `password123`

> Change the admin password before going live.

## Environment variables

**Backend (`backend/.env`)**
| Variable | Purpose |
| --- | --- |
| `MONGO_URI` | MongoDB connection string (use MongoDB Atlas for production) |
| `JWT_SECRET` | Must be 32+ random characters |
| `JWT_EXPIRES_IN` | Token lifetime, e.g. `7d` |
| `CORS_ORIGIN` | Comma-separated allowed origins (your frontend domain) |
| `PUBLIC_URL` | Public base URL used to build uploaded-image URLs |

**Frontend (`frontend/.env`)**
| Variable | Purpose |
| --- | --- |
| `VITE_API_URL` | Backend base URL without `/api`. Unset → `http://localhost:5000` |

## MongoDB Atlas setup (production database)

1. Go to [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas), sign up, and create a **free M0 cluster**.
2. In **Database Access** → **Add New Database User** → create a user (e.g. `banoge`) with read/write access and a strong password.
3. In **Network Access** → **Add IP Address** → choose **Allow access from anywhere** (`0.0.0.0/0`) for simplicity.
4. In your cluster → **Connect** → **Drivers** → copy the connection string, e.g.:
   `mongodb+srv://banoge:<password>@cluster0.xxxxx.mongodb.net/banoge_safari`
5. Put it in `MONGO_URI` on the host (and in `backend/.env` locally).

> Free Atlas clusters pause after ~60 days of inactivity and may need a quick reconnect — check the Atlas dashboard if the site ever shows DB errors.

## Deploying (one service on Render)

The backend serves the built frontend from `frontend/dist`, so you only host one service.

1. Push this repo to GitHub and connect it to [Render](https://render.com).
2. Use `render.yaml` (Blueprint) or configure a **Node web service**:
   - **Root Directory:** `backend`
   - **Build:** `npm install && npm --prefix ../frontend install && npm --prefix ../frontend run build`
   - **Start:** `node server.js`
3. Set environment variables:
   - `MONGO_URI` → your MongoDB Atlas URI
   - `JWT_SECRET` → long random string (32+ chars)
   - `CORS_ORIGIN` → `https://your-app.onrender.com`
   - `PUBLIC_URL` → `https://your-app.onrender.com`
4. Deploy. After the first deploy, run the seed once to load demo data.

## Deploying on Vercel

Vercel builds the frontend (`frontend/dist`) and runs the backend as a serverless function
in `api/index.js`. All `/api/*` requests are proxied to it, so frontend and API share one domain.

1. Push this repo to GitHub and import it on [Vercel](https://vercel.com).
2. **Required environment variables** (Project → Settings → Environment Variables) — without these
   the API will not work and sign-in fails:
   - `MONGO_URI` → your MongoDB Atlas URI
   - `JWT_SECRET` → long random string (32+ chars). The API refuses to start without it.
   - `CORS_ORIGIN` → your deployed domain, e.g. `https://your-app.vercel.app`
   - `PUBLIC_URL` → same as `CORS_ORIGIN`
   - Optional: `ADMIN_EMAIL`, `ADMIN_PASSWORD` — credentials for the auto-seeded admin.
3. Deploy. On the first request the API automatically creates the default admin
   (`admin@banoge.com` / `admin123`, or your `ADMIN_EMAIL`/`ADMIN_PASSWORD`) when the database
   is empty, so sign-in works without running a seed script.

> **Vercel caveats**
> - The serverless function only starts with a valid `JWT_SECRET` (32+ chars) and `MONGO_URI`.
> - For image uploads, set the Cloudinary keys (see below) — the server disk does **not** persist
>   on serverless platforms.

> **Uploaded images** are stored on the server disk (`backend/uploads/`) **only when no
> Cloudinary keys are set** (i.e. local development). In production set `CLOUDINARY_CLOUD_NAME`,
> `CLOUDINARY_API_KEY` and `CLOUDINARY_API_SECRET` (free account at cloudinary.com) and every
> upload is stored in the cloud, so images survive restarts, sleep, and redeploys.

### Cloudinary setup (recommended, required for reliable production uploads)

1. Create a free account at [cloudinary.com](https://cloudinary.com) — no credit card needed.
2. From the dashboard copy your **Cloud Name**, **API Key** and **API Secret**.
3. Add them as environment variables on your host (and in `backend/.env` for local testing):
   - `CLOUDINARY_CLOUD_NAME`
   - `CLOUDINARY_API_KEY`
   - `CLOUDINARY_API_SECRET`

Once set, admin uploads (hero, gallery, tour images) go straight to Cloudinary and the cloud
URL is saved in MongoDB — the images will keep working even after the server restarts.

## Alternative: separate hosting

Frontend on Vercel/Netlify + backend on Render/Railway:
- Frontend: build with `VITE_API_URL=https://your-backend.com` (no `/api` suffix)
- Backend: set `CORS_ORIGIN=https://your-frontend.com` and `PUBLIC_URL=https://your-backend.com`
- Serve `frontend/dist` as the static site (Netlify/Vercel auto-detects Vite)

## Notes

- Forgot-password returns the reset link in the API response (no email service configured). To
  email it, add nodemailer in `backend/controllers/authController.js` inside `forgotPassword`.
