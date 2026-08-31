# DSONIK

A full-stack industrial solutions web platform consisting of the customer frontend and the admin panel.

## Project Structure

```
dsonik/
├── dsonik-frontend/     # Customer-facing E-commerce Web Application (React + Vite)
├── dsonik-admin/        # Admin Dashboard (React + Vite)
├── package.json         # Monorepo root scripts
└── README.md
```

## Quick Start

### 1. Customer Frontend
```bash
cd dsonik-frontend
npm install
npm run dev
```
Runs at `http://localhost:5176`

### 2. Admin Dashboard
```bash
cd dsonik-admin
npm install
npm run dev
```
Runs at `http://localhost:5173`

### Or from the root directory:
```bash
npm run dev:frontend   # Starts customer frontend
npm run dev:admin      # Starts admin dashboard
```

## Render Deployment Settings
- **Customer Frontend Static Site:**
  - **Root Directory:** `dsonik-frontend`
  - **Build Command:** `npm install && npm run build`
  - **Publish Directory:** `dist`
- **Admin Dashboard Static Site:**
  - **Root Directory:** `dsonik-admin`
  - **Build Command:** `npm install && npm run build`
  - **Publish Directory:** `dist`
