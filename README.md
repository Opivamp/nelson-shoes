# NELSON SHOES - Luxury Artisanal Footwear Web Application

A web application for **Nelson Shoes** featuring a bespoke luxury storefront, dynamic product catalog management, self-uploading product atelier, and atelier workbench commission tracking.

---

## 🌟 Key Application Features

### 1. Integrated Admin Atelier Dashboard (`/admin`)
- **Direct Route**: Access via the top navigation **"ADMIN"** link or by navigating to `http://localhost:5173/admin`.
- **Authentication**:
  - **Instant 1-Click Access**: Click the gold button **"Sign in as Master Nelson (Instant Access)"**.
  - **Credentials**: Email: `admin@nelsonshoes.com` | Password: `admin` (or any non-empty password).
- **Executive Metrics**:
  - Gross Commission Value (NGN & USD)
  - Active Workbench Commissions
  - Live Catalog Inventory Count
  - Bespoke Measurement Dossiers Count

### 2. Self-Uploading Product Atelier (`/admin/products`)
- **Direct Image Upload**:
  - Upload footwear photography directly from your local device via the file picker or drag-and-drop zone. Images are instantly encoded and preserved.
  - Alternatively, input external HTTPS image URLs.
- **Product Parameters**:
  - Shoe Model Name & Category (Oxford, Loafer, Boot, Monkstrap, Bespoke)
  - Price in Nigerian Naira (₦) and US Dollar ($)
  - Artisanal Story & Leather Specifications (e.g. Full-grain French calfskin, Hand-patinated crust)
  - Sole Construction (Goodyear welted, Blake-stitched, Italian leather sole)
  - Size Ranges (EU 38 to 47)
  - Lead time specification
- **Instant Storefront Synchronization**:
  - Any product created or edited in the Admin Atelier appears dynamically across the homepage, collection catalog (`/collection`), product detail views, and search filters immediately!

### 3. Order Management & Workbench Workflow (`/admin/orders`)
- **Commission Lifecycle**: Progress client commissions through the 7 artisanal stages:
  1. `01. Commission Initiated`
  2. `02. Last Selected & Leather Cut`
  3. `03. Upper Stitched & Welting`
  4. `04. Hand-Burnished Patina`
  5. `05. Quality Inspection`
  6. `06. Dispatched via DHL Express`
  7. `07. Delivered to Client`
- **Artisan Bench Notes**: Keep internal notes per order.
- **Tracking Assignment**: Assign DHL Express or courier tracking IDs.
- **1-Click WhatsApp Client Updates**: Send pre-formatted status updates directly to the client's WhatsApp with one click.

### 4. Visitor Online Ordering & Order Tracking (`/track`)
- **Seamless Cart & Checkout**:
  - Select shoe size and add to Commission Dossier.
  - Review items, select delivery method (DHL Express or Atelier Pickup), and choose payment preference (WhatsApp Concierge, Bank Transfer, or Card Deposit).
  - Every completed order generates a unique reference code (e.g., `#NS-ORD-XXXXXX`) and registers in the Admin Dashboard.
- **Client Live Order Tracker (`/track`)**:
  - Clients can enter their Order Number anytime on the tracking page to view the artisanal progress bar and current status.

---

## 🛠 Tech Stack & Architecture

- **Core**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS + Custom Obsidian & Gold Luxury Design System (`#0A0A0A`, `#F5F1E8`, `#B89B5E`)
- **State Management**:
  - [`ProductContext`](src/context/ProductContext.tsx) — Dynamic CRUD with persistent browser storage & seed fallback
  - [`OrderContext`](src/context/OrderContext.tsx) — Real-time order pipeline & tracking updates
  - [`AdminAuthContext`](src/context/AdminAuthContext.tsx) — Session and administrative authorization
  - [`CartContext`](src/context/CartContext.tsx) — Multi-item commission dossier & currency switching

---

## 🚀 Running Locally

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

Storefront: `http://localhost:5173/`  
Admin Dashboard: `http://localhost:5173/admin`  
Order Tracker: `http://localhost:5173/track`
