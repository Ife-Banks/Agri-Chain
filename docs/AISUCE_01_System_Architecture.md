# AI-SUCE System Architecture Document

> **Version 1.0 · ACE ICT Center, OAU Ile-Ife Nigeria · June 2026**

---

## 1. System Overview

AI-SUCE (Artificial Intelligence-Based Agricultural Supply Chain E-Commerce Application) is a multi-platform digital ecosystem developed by the ACE ICT Center at Obafemi Awolowo University, Ile-Ife, Nigeria. It addresses three critical failures in Nigeria's agricultural sector: 50% post-harvest loss, ₦3.5 trillion in annual agro-market revenue loss, and 25% unemployment among rural youth.

The system operates under two brand identities: **GreenSC** (supply chain management) and **GreenPurse** (digital wallet and payments). Together they form a vertically integrated platform connecting farmers, consumers, logistics operators, and platform administrators through shared backend services.

### 1.1 System Constituents

| System | Brand | Platform | Primary Users |
|---|---|---|---|
| GreenPurse Web App | GreenPurse | Web Browser (Next.js) | Buyers & Farmers |
| GreenSC Web App | GreenSC | Web Browser (Next.js) | Store Managers & Operators |
| MyVirtualFarm | GreenPurse (tab) | Web Browser (Next.js) | Investors & Traders |
| Super Admin Panel | GreenPurse Backend | Web Browser (Next.js) | Platform Administrators |
| AI/ML Services | Internal | Cloud Microservices | All Systems (via API) |

### 1.2 High-Level Architecture Style

The system follows a **Microservices + API Gateway** architecture. All client applications communicate exclusively through a central REST API. Real-time features (order tracking, market prices, notifications) use WebSockets. AI modules run as independent Python services consumed by the core API.

> **Architecture Decision:** A monolith-first approach is NOT recommended here. The three user types (buyer, farmer, store manager) have sufficiently different data access patterns and scaling needs that separating them by service boundary from day one reduces future migration pain. The shared concern is Auth — which must be a single service consumed by all.

---

## 2. System Components

### 2.1 GreenPurse Mobile Application

A single mobile application (GreenPurse) serves both Buyers and Farmers, with role-based UI rendering post-authentication. The app is segmented into five functional areas:

| Module | Description |
|---|---|
| Authentication | Splash screen, onboarding, registration (username/email/phone/password), login (email or phone), 4-digit PIN setup, Touch ID / fingerprint biometric, forgot password, OTP verification |
| Marketplace (Buyer) | Home with promotions & categories, product grid by category, product detail (organic %, expiry, rating, kcal, add to cart), search with recent + trending, cart with quantity controls + coupon + grand total, checkout flow |
| Order & Logistics (Buyer) | Delivery address selection on map, order placement, real-time tracking map (Order Placed → On the Way → Delivered), delivery agent contact, order summary |
| GreenPurse Wallet | Wallet dashboard (balance, card display, freeze card), transfer via Green Purse / bank account / phone / QR scan-to-pay, receive via account number, deposit, withdraw, invest, transaction history, multi-currency with live exchange rate |
| MyVirtualFarm (Investment) | Portfolio dashboard (account value, P&L), positions tracker (cash crops: Cocoa, Groundnut), watchlist (Rice, Millet, Maize), commodity price chart (1D/1W/1M/1Y/5Y), buy/sell execution |

**Farmer-Specific Screens (Role-Gated)**

When a user registers or logs in as a Farmer, the following additional/alternative screens are activated within the same GreenPurse app:
- Product upload form (title, description, category, price/kg, stock quantity, condition, images)
- Warehousing service request
- Logistics service request
- Financial aid and support request
- Real-time agric market monitoring dashboard
- Farm machinery rental and agro-input purchasing
- Sales and logistics monitoring

> **Design Gap Note:** The Farmer dashboard screens are described functionally in the 'How It Works' documentation but UI mockups are not yet provided in the design files. These screens must be designed before Sprint 3 begins. The authentication flow (registration, PIN, biometric) is identical for both Farmer and Buyer roles.

### 2.2 GreenSC Web Application (Store Manager)

A web-based dashboard (GreenSC) for platform operators and supply chain managers. Built as a React SPA with a persistent left navigation sidebar. Modules:

| Module | Screens & Features |
|---|---|
| Dashboard | KPI tiles (Balance, Forex Need, Receivables, Active Projects), payment tracking chart, vendor distribution donut, forex summary, top suppliers table, inventory status, tools condition breakdown |
| Project Tracking | Project cards (client name, manager, end date, days left, team avatars), search, pagination |
| Products | Product catalogue management, add/edit/delete products |
| Suppliers | Supplier list (tabs: Suppliers / Manufacturer / Country / Solutions), search, add supplier, capability tags |
| Sourcing | PA Summary view, order list (status, description, BoQ cost, final cost, payment method, batch name, supplier, profit indicator) |
| Payment | Sub-modules: Forex Approval, Forex Planning, Supplier Payment, Payment Collection, Variance Analysis, Payment Request Form, Guarantee Preparation, Aging |
| Logistics | Logistics Documents: Active Batch, Missed Item, Delivered Batch, RMA — filtered by project |
| Documents | BDU-DCF document tracking grid, active/inactive status, pagination |
| Inventory | Inventory management (stock levels, condition tracking) |
| Reports | Weekly/Quarterly/Yearly reports, filter by: profit/loss, country, supplier, batch, category (Sourcing/Logistics/Finance), downloadable report |
| Clients | Client management |
| Settings | User settings, preferences |

### 2.3 Super Admin Panel

A Next.js-based administration dashboard (deployed at `app/web-admin/`) for the platform super-administrator. This replaces the legacy Django-based admin panel. It provides the following management capabilities via the shared NestJS API:

- **User Management:** Full user CRUD with role filter (Admin / Farmer / Agric Enterprise / Farm Customer)
- **Commerce:** Product CRUD, Categories, Stores, File uploads, Order oversight, Cart management
- **Finance:** Wallet creation, balance management, transaction inspection, forex rate administration
- **Platform Settings:** Promotional banners, ad slot management, data product subscriptions, OTP device management
- **System:** Auth token management, staff role assignment, activity audit log

### 2.4 AI & Intelligence Services

| AI Feature | Input Data | Output |
|---|---|---|
| Farmer-Buyer Matchmaking | Farmer product listings, Buyer location, purchase history, preferences | Ranked product feed on buyer home screen |
| Demand Forecasting | Historical sales, seasonal patterns, market trends | Warehouse cooling pre-booking recommendations |
| Route Optimization | Delivery addresses, vehicle GPS, traffic data | Optimal delivery routes for logistics vehicles |
| Weather & Pest Alerts | Satellite data, IoT sensor readings, weather APIs | Push notifications to farmer accounts |
| Market Price Monitoring | Commodity price feeds, historical agric data | Real-time price charts on marketplace and MyVirtualFarm |
| Crop Yield Prediction | Soil data, weather history, crop type | Harvest volume estimates for warehousing planning |

---

## 3. Data Architecture

### 3.1 Core Data Domains

The system is organized around five core data domains. Each domain maps to one or more database tables and one or more API service areas:

| Domain | Key Entities | Primary Consumers |
|---|---|---|
| Identity | User, Role, AuthToken, OTPDevice, BiometricKey | All systems |
| Commerce | Product, ProductImage, ProductDetail, Category, Store, Cart, CartItem, Order, OrderItem, Coupon | GreenPurse web, Super Admin |
| Logistics | DeliveryBatch, Route, Vehicle, Driver, TrackingEvent, Warehouse, CoolingUnit | GreenSC web, GreenPurse web |
| Finance | Wallet, WalletTransaction, BankAccount, PaymentRequest, ForexRate, Invoice, SupplierPayment | GreenPurse web, GreenSC web, Super Admin |
| Market Intelligence | CommodityPrice, PriceHistory, WeatherAlert, PestAlert, MarketReport, FarmPosition, Watchlist | GreenPurse web (MyVirtualFarm + Farmer dashboard) |

### 3.2 User Roles & Access Matrix

| Capability | Buyer | Farmer | Store Manager | Super Admin |
|---|---|---|---|---|
| Browse & purchase products | ✓ | — | — | ✓ |
| List & upload products | — | ✓ | ✓ | ✓ |
| GreenPurse Wallet | ✓ | ✓ | — | ✓ |
| MyVirtualFarm trading | ✓ | ✓ | — | ✓ |
| Request warehousing | — | ✓ | — | ✓ |
| Request logistics | — | ✓ | ✓ | ✓ |
| View supply chain dashboard | — | — | ✓ | ✓ |
| Manage suppliers & sourcing | — | — | ✓ | ✓ |
| Process payments (forex etc.) | — | — | ✓ | ✓ |
| Full user management | — | — | — | ✓ |
| View market intelligence | Partial | ✓ | ✓ | ✓ |

---

## 4. Integration Architecture

### 4.1 API Design Principles

- REST API with JSON payloads, versioned at `/api/v1/`
- JWT-based authentication (Knox tokens confirmed from Django admin)
- OTP/2FA via HOTP and TOTP devices for sensitive operations (wallet transactions, PIN reset)
- WebSocket connections for: real-time order tracking, live market prices, push alerts
- All financial transactions logged with idempotency keys to prevent duplicate charges

### 4.2 External Integrations

| Service Category | Vendor (Recommended) | Purpose |
|---|---|---|
| Payment Gateway | Paystack or Flutterwave | Card payments, bank transfers, USSD, wallet funding, merchant payouts |
| Maps & Geolocation | Google Maps Platform | Delivery tracking map, address selection, route display |
| Push Notifications | Firebase Cloud Messaging | Order updates, weather alerts, pest alerts, price alerts |
| SMS / OTP | Termii or Africa's Talking | Phone-based OTP for Nigerian numbers, USSD payment confirmation |
| Weather Data | OpenWeatherMap API | Weather alerts for farmer dashboard |
| Commodity Prices | Custom feed or Quandl | Real-time agric commodity pricing for MyVirtualFarm |
| Object Storage | AWS S3 or Cloudinary | Product images, farm photos, document uploads |
| Currency Exchange | ExchangeRate-API or CBN feed | Live NGN/USD exchange rates shown in wallet transfer |
| IoT Data Ingest | AWS IoT Core or custom MQTT | Sensor data from cooling units and logistics vehicles |

### 4.3 Inter-System Communication

The three frontend systems do not communicate with each other directly. All data flows through the shared REST API:

| Flow | From | To | Mechanism |
|---|---|---|---|
| Buyer places order → logistics notified | Web (GreenPurse) | API | `POST /api/v1/orders/` → event emitted to LogisticsModule |
| Farmer uploads product → appears in buyer feed | Web (GreenPurse) | API | `POST /api/v1/products/` → AI matchmaking re-ranks feed |
| Store manager updates delivery status → buyer sees update | Web (GreenSC) | API | `PATCH /api/v1/logistics/{id}/` → WebSocket push to GreenPurse web |
| Wallet payment (10% fee auto-deducted) | Web (GreenPurse) | API | `POST /api/v1/wallet/transactions/` → platform revenue ledger updated |
| Admin creates product via web-admin | Web (Admin) | API | `POST /api/v1/products` → NestJS creates record → visible in GreenPurse marketplace |

---

## 5. Security Architecture

### 5.1 Authentication Layers

- **Layer 1 — Credential Auth:** Email/phone + password with bcrypt hashing
- **Layer 2 — Token:** JWT tokens with configurable expiry (15min access, 7-day refresh)
- **Layer 3 — OTP:** HOTP/TOTP for wallet operations and account recovery
- **Layer 4 — Biometric:** Device-level fingerprint / Touch ID (stored locally on device, not transmitted)
- **Layer 5 — PIN:** 4-digit transaction PIN as secondary authorization for payments

### 5.2 Financial Security

- All wallet transactions require PIN or biometric confirmation
- Idempotency keys prevent duplicate transaction submissions
- QR codes for Scan-to-Pay are time-limited and single-use
- Bank account verification ('Verifying beneficiary...') calls payment gateway before any transfer
- Card freeze functionality accessible from wallet dashboard
- 10% platform fee applied server-side — never calculated client-side

### 5.3 Data Security

- All API traffic over HTTPS/TLS 1.3
- Admin panel restricted to staff accounts only (role-gated)
- Role-based access enforced at API level via NestJS guards, not just UI
- Product images and uploads stored in private S3 buckets with signed URLs
- IoT sensor data encrypted in transit via MQTT over TLS

---

## 6. Deployment Architecture

### 6.1 Recommended Infrastructure

| Layer | Technology | Notes |
|---|---|---|
| Frontend (all apps) | React + Next.js 14 (App Router) | Web-first strategy: GreenPurse, GreenSC, MyVirtualFarm, Admin — all as Next.js web apps |
| Backend API | NestJS (Node.js) | Modular monolith with 15 feature modules, guards, interceptors, Swagger |
| Database | PostgreSQL 16 (via TypeORM) | Primary relational store, UUID PKs, auto-migrations |
| Cache / Sessions | Redis 7 (via ioredis) | Session tokens, idempotency keys, rate limiting, WebSocket adapter |
| WebSocket Server | Socket.IO + @nestjs/websockets | Order tracking live updates, market prices, push notifications |
| AI/ML Services | Python (FastAPI) | Separate microservices per AI feature, consumed via HTTP by NestJS AIModule |
| Cloud Provider | AWS | ECS Fargate for API, RDS for Postgres, ElastiCache for Redis, S3 for media |
| CDN | AWS CloudFront | Static assets, product images |
| CI/CD | GitHub Actions | Lint → test → type-check on PR; build + deploy staging on merge to main |
| Monitoring | Sentry + Datadog | Error tracking and infrastructure metrics |

> **Critical Note on IoT Components:** The IoT-based sensors in logistics vehicles and cooling units require a separate embedded systems layer (firmware + MQTT broker) that is outside the scope of the software build. This must be handled by a hardware engineering partner or treated as a stub in Phase 1 with mock data.

### 6.2 Environment Strategy

- **Development:** Local Docker Compose (NestJS API + Postgres + Redis + Next.js apps via pnpm dev)
- **Staging:** Cloud deployment mirroring production, seeded with anonymized test data
- **Production:** Auto-scaling group behind load balancer, multi-AZ database

---

## 7. Architectural Risks & Mitigations

| Risk | Severity | Mitigation |
|---|---|---|
| Farmer mobile screens not designed yet — blocks Sprint 3 | **HIGH** | Treat Farmer dashboard as separate sprint; use Buyer screens as design baseline |
| MyVirtualFarm requires real-time commodity data feeds | **HIGH** | Source a reliable Nigerian agric commodity price API in Phase 1; stub with static data if unavailable |
| Blockchain for fraud-proof transactions mentioned in proposal but not in UI | **MEDIUM** | Defer blockchain to Phase 3; implement as an audit log layer on top of existing wallet transactions |
| IoT sensor integration requires physical hardware | **HIGH** | Build mock IoT data endpoint for software testing; physical integration is a post-MVP milestone |
| Dual-currency (USD/NGN) in wallet requires CBN compliance | **HIGH** | Consult regulatory requirements before implementing; use licensed payment processor to handle forex |
| GreenSC web app has complex payment sub-modules (Forex, Guarantee) | **MEDIUM** | Scope these as Phase 2 features; Phase 1 GreenSC delivers dashboard + products + suppliers only |
| NestJS API may bottleneck under high concurrent load | **MEDIUM** | Horizontally scale with Node.js cluster mode; extract AI services as microservices; Redis-backed WebSocket adapter |

---

<p align="center"><em>— End of System Architecture Document —</em></p>
