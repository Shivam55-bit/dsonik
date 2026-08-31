# 🚀 DSONIK Admin Panel & UI Documentation

Comprehensive technical documentation and user guide for the **DSONIK Industrial Machinery & Ultrasonic Automation Admin Panel** and UI Architecture.

---

## 📌 Table of Contents
1. [Overview & Tech Stack](#-overview--tech-stack)
2. [Design System & UI Architecture](#-design-system--ui-architecture)
3. [Modules & Feature Breakdown](#-modules--feature-breakdown)
   - [Authentication & Protection](#1-authentication--protection)
   - [Dashboard Overview & Metrics](#2-dashboard-overview--metrics)
   - [Hero Banners Management](#3-hero-banners-management)
   - [Categories Management](#4-categories-management)
   - [Product Catalog Management](#5-product-catalog-management)
   - [Customer Leads & Inquiries](#6-customer-leads--inquiries)
   - [Order Management](#7-order-management)
4. [One-Click Preset Seeders](#-one-click-preset-seeders)
5. [Local & Production URLs](#-local--production-urls)
6. [Credentials & Access](#-credentials--access)

---

## 🛠️ Overview & Tech Stack

| Layer | Technology | Key Details |
| :--- | :--- | :--- |
| **Frontend Admin** | React 19 + Vite 8 | Single Page Application with React Router v6 |
| **Styling** | Modern Vanilla CSS (`admin.css`) | Custom Design System with Design Tokens & Glassmorphism |
| **Icons** | Vector SVG (`Icons.jsx`) | Lightweight, high-resolution Lucide-style SVG icons |
| **Backend API** | Node.js + Express | RESTful API with JWT Authentication and CORS configuration |
| **Database** | MongoDB Atlas | Cloud Cluster: `dsonik-ecommerce` |

---

## 🎨 Design System & UI Architecture

### 1. Vector Icon System (`Icons.jsx`)
- Replaced emoji indicators with crisp, scalable **Vector SVG Icons**:
  - `dashboard`, `banners`, `categories`, `products`, `inquiries`, `orders`
  - `search`, `refresh`, `plus`, `edit`, `trash`, `externalLink`, `check`, `close`, `database`, `user`, `trendingUp`

### 2. Modern Dark Navy Sidebar (`admin.css`)
- **Header:** Brand pill with `DSONIK CORE` badge and portal title.
- **Nav Items:** Interactive navigation links with active cyan border indicators (`#38BDF8`) and live item count badges.
- **Footer:** Administrator user card with avatar initials and direct **Sign Out** button.

### 3. Glassmorphic Top Navigation Bar
- **Global Search:** Instant live client-side search across banners, products, categories, and customer inquiries.
- **Pulsing DB Health Pill:** Real-time visual indicator (`● MongoDB Atlas Active`).
- **Storefront Link:** Direct one-click shortcut to launch the customer-facing storefront.
- **Sync Button:** Force refresh and sync all database records.

### 4. Interactive Modals & Toast System
- **Backdrop Blur:** Modal dialogues with `backdrop-filter: blur(4px)` and entry scale animations.
- **Toast Notifications:** Automatic floating feedback pills on create, update, or delete actions.

---

## 📦 Modules & Feature Breakdown

### 1. Authentication & Protection
- **Login Portal (`Login.jsx`):**
  - Sleek login card with instant credentials auto-fill helper.
  - Secure token storage in `localStorage` (`adminToken`, `admin`).
- **Route Guard (`ProtectedRoute.jsx`):**
  - Verifies token validity and queries `/api/auth/profile` to ensure user role is `admin`.

---

### 2. Dashboard Overview & Metrics
- **4 Live Metric Cards:**
  - 🖼️ Total Hero Banners count
  - 📁 Total Active Categories
  - 📦 Total Products in Catalog
  - ✉️ Total Inquiries & Leads Received
- **Production Server & API Status Panel:**
  - Live Database connection state (`dsonik-ecommerce`).
  - Active API baseURL endpoint.
  - Current Administrator profile and session role.
- **Recent Inquiries & Catalog Snippets:** Quick-action previews.

---

### 3. Hero Banners Management
Manage rotating banner slides, headlines, and call-to-action buttons displayed on the storefront hero slider.

- **Banner Cards Grid:** Displays live preview of the banner with dark gradient overlay, eyebrow tag, headline, subtitle, and CTA button destinations.
- **Add / Edit Modal Fields:**
  - **Banner Headline (Title)\*:** e.g., `We Deliver Results` / `High Strength Jointing`
  - **Eyebrow Tag / Badge:** e.g., `Ultrasonic Plastic Welding` / `ISO 9001:2015`
  - **Subtitle & Description:** Descriptive marketing and technical text.
  - **Desktop Background Image\*:** Custom URL or one-click preset selector.
  - **CTA Button 1:** Text & Link (e.g., `Explore Machines` ➔ `/category/all`).
  - **CTA Button 2:** Text & Link (e.g., `Enquire Now` ➔ `/contact`).
  - **Text Alignment:** `Left`, `Center`, or `Right`.
  - **Display Order:** Numeric sequence for carousel slides (`1`, `2`, `3`...).
  - **Status:** `Active` (Visible on Home) / `Inactive` (Draft/Hidden).
- **Actions:** Add, Edit, Delete, and 1-Click Seed Presets.

---

### 4. Categories Management
- **Category Data Table:** Displays category thumbnail image, name, slug, description, display order, and status badge.
- **Add / Edit Modal Fields:**
  - **Category Name\*:** e.g., `Ultrasonic Plastic Welding`
  - **Category Slug:** Auto-generated or custom slug (e.g., `ultrasonic-plastic-welding`).
  - **Category Image URL:** Image preview for category headers.
  - **Description:** Industrial applications and machinery capabilities.
  - **Display Order & Status:** Active/Inactive toggle.
- **Actions:** Add, Edit, Delete, and 1-Click Seed Official Categories.

---

### 5. Product Catalog Management
- **Product Inventory Table:** Features image thumbnail, product title, slug, category badge, SKU/Model code, price, stock counter, and Featured star.
- **Category Filter:** Filter catalog view by specific category.
- **Add / Edit Modal Fields:**
  - **Product Name\*:** e.g., `20kHz Standard Ultrasonic Plastic Welder`
  - **Category Selection\*:** Dynamic dropdown pulling from active database categories.
  - **Model Number / SKU:** e.g., `DSK-US2020`, `DSK-SP500`
  - **Price (₹)\*:** Regular price.
  - **Sale Price (₹):** Optional discounted price.
  - **Product Image URL:** High-res machinery image.
  - **Short Description:** Quick summary displayed in product cards.
  - **Full Description:** Technical specifications, generator frequency, pneumatic controls, and applications.
  - **Stock Quantity:** Inventory stock level.
  - **★ Featured Toggle:** Checkbox to highlight product in homepage Featured Section.
  - **Status:** Active / Inactive.
- **Actions:** Add, Edit, Delete, Filter, and 1-Click Seed Machinery Products.

---

### 6. Customer Leads & Inquiries
- **Lead Capture Table:** Captures inquiries submitted via website contact and quote forms.
- **Captured Fields:** Customer Name, Company Name, Email Address, Phone Number, Subject, Message, and Timestamp.
- **Quick Action Triggers:**
  - 💬 **WhatsApp Action:** Opens direct WhatsApp chat with the customer's phone number (`https://wa.me/...`).
  - ✉️ **Email Action:** Opens default email client pre-addressed to the customer.

---

### 7. Order Management
- Order ID, Customer Name, Items Purchased, Total Amount (₹), and Order Status tracking (`Pending`, `Processing`, `Delivered`).

---

## ⚡ One-Click Preset Seeders

For instant database initialization without manual data entry:

1. **`⚡ Load 3 Default Banners`:**
   - *We Deliver Results* (`Ultrasonic Plastic Welding`)
   - *High Strength Jointing* (`Spin & Rotary Welding`)
   - *Engineered For Precision* (`Custom B2B Solutions`)

2. **`⚡ Load 6 Default Categories`:**
   - Ultrasonic Plastic Welding
   - Spin Welding Machines
   - Impulse Welding
   - Hot Plate Welding
   - Vibration Welding Systems
   - Ultrasonic Generators & Horns

3. **`⚡ Load 6 Machinery Products`:**
   - 20kHz Standard Ultrasonic Plastic Welder (`DSK-US2020`) — ₹1,85,000
   - Precision Rotary Spin Welding Machine (`DSK-SP500`) — ₹2,40,000
   - Heavy-Duty Impulse Sealer & Welder (`DSK-IMP800`) — ₹1,25,000
   - Pneumatic Hot Plate Plastic Welder (`DSK-HP1200`) — ₹3,20,000
   - High Frequency Vibration Welder Pro (`DSK-VIB3000`) — ₹4,50,000
   - Digital Ultrasonic Generator & Titanium Horn (`DSK-GEN20K`) — ₹75,000

---

## 🌐 Local & Production URLs

| Component | Local URL | Production URL |
| :--- | :--- | :--- |
| **Admin Panel** | `http://localhost:5173/` | Hosted on Render / Vercel |
| **Storefront** | `http://localhost:5176/` | `https://dsonik.onrender.com` |
| **Backend REST API** | `http://localhost:5002/api` | `https://dsonik-backend-l8xa.onrender.com/api` |

---

## 🔑 Credentials & Access

- **Admin Login URL:** `http://localhost:5173/login`
- **Default Email:** `admin@dsonik.com`
- **Default Password:** `Admin@123`
- **Role:** `superadmin` / `admin`
