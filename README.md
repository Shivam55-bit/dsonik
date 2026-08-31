# DSONIK Platform

A complete B2B industrial solutions web platform consisting of:
- **dsonik-frontend**: Customer-facing E-Commerce Web Application (React + Vite)
- **dsonik-admin**: Management Dashboard (React + Vite)
- **dsonik-backend**: REST API Server (Node.js + Express + MongoDB)

## Project Structure

```
dsonik/
├── dsonik-frontend/     # Customer-facing E-commerce Web Application (Port 5176)
├── dsonik-admin/        # Admin Dashboard (Port 5173)
├── dsonik-backend/      # Express API Server (Port 5001)
├── package.json         # Monorepo root scripts
└── README.md
```

## Quick Start (Local Development)

### Run all from root:
```bash
npm run dev:frontend   # Starts customer frontend (http://localhost:5176)
npm run dev:admin      # Starts admin dashboard (http://localhost:5173)
npm run dev:backend    # Starts backend API (http://localhost:5001)
```

## Deployment Guide (Render)

### 1. Backend (Render Web Service)
- **Service Type:** Web Service (Node)
- **Root Directory:** `dsonik-backend`
- **Build Command:** `npm install`
- **Start Command:** `npm start`
- **Environment Variables:**
  - `MONGODB_URI`: MongoDB Atlas connection string
  - `JWT_SECRET`: Random secure string
  - `FRONTEND_URL`: `https://dsonik.onrender.com`
  - `ADMIN_URL`: `https://dsonik-admin.onrender.com`

### 2. Frontend (Render Static Site)
- **Service Type:** Static Site
- **Root Directory:** `dsonik-frontend`
- **Build Command:** `npm install && npm run build`
- **Publish Directory:** `dist`
- **Environment Variables:**
  - `VITE_API_BASE_URL`: `https://<your-backend-service>.onrender.com/api`
  - `VITE_BACKEND_URL`: `https://<your-backend-service>.onrender.com`
  - `VITE_API_URL`: `https://<your-backend-service>.onrender.com`
- **Redirects / Rewrites:**
  - `/*` -> `/index.html` (Rewrite)

### 3. Admin (Render Static Site)
- **Service Type:** Static Site
- **Root Directory:** `dsonik-admin`
- **Build Command:** `npm install && npm run build`
- **Publish Directory:** `dist`
- **Environment Variables:**
  - `VITE_API_BASE_URL`: `https://<your-backend-service>.onrender.com/api`
- **Redirects / Rewrites:**
  - `/*` -> `/index.html` (Rewrite)
