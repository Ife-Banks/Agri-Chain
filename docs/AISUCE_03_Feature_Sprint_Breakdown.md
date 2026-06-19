# AI-SUCE Feature Breakdown: Sprints, Modules & Phases

> **Version 1.0 · All Systems · June 2026**

---

## 1. Build Strategy Overview

The AI-SUCE system is broken into **three phases** spanning approximately **24 months (January 2026 – December 2027)**. Each phase is subdivided into **two-week sprints**. Features are sequenced by dependency: infrastructure → authentication → core commerce → payments → logistics → AI services → advanced features.

| Phase | Name | Duration | Deliverable |
|---|---|---|---|
| **Phase 1** | Foundation & Core Commerce | Months 1–8 (16 sprints) | Working marketplace MVP with payments |
| **Phase 2** | Logistics, Intelligence & Supply Chain | Months 9–16 (16 sprints) | Full logistics tracking + GreenSC web + AI features |
| **Phase 3** | Advanced Features & Scale | Months 17–24 (16 sprints) | MyVirtualFarm, IoT, blockchain audit, full AI suite |

> **Sprint Convention:** Each sprint = 2 weeks. Sprint goals below describe the completed state by end of sprint. 'Module' refers to a logical feature grouping. 'Phase' is a deployable milestone. The tech stack is **NestJS (backend) + Next.js 14 (web frontends) + pnpm monorepo with Turborepo** — all four apps (GreenPurse, GreenSC, MyVirtualFarm, Admin) are web-first; mobile deferred to post-MVP phase.

---

## PHASE 1 — FOUNDATION & CORE COMMERCE
**Duration: Months 1–8 | Scope: Backend infrastructure, Auth, Marketplace, Wallet basics**

### Module 1.1 — Project Setup & Infrastructure (Sprint 1–2)

| Sprint | Duration | Features |
|---|---|---|
| **1** | Weeks 1–2 | **Monorepo scaffold:** pnpm workspace + Turborepo init. Root `package.json`, `pnpm-workspace.yaml`, `turbo.json`, `.gitignore`. **API:** `apps/api` — NestJS project via `@nestjs/cli`. Generate all 15 modules: App, Config, Database, Health, Auth, Users, Products, Orders, Wallet, Logistics, Market, Notifications, Storage, AI, Admin. **Frontend apps:** `apps/web-greenpurse`, `apps/web-greensc`, `apps/web-virtualfarm`, `apps/web-admin` — all Next.js 14 App Router via `create-next-app`. **Shared packages:** `packages/ui`, `packages/types`, `packages/schemas`, `packages/config`. **Docker Compose:** NestJS API + PostgreSQL 16 + Redis 7. `.env.example` with all env vars. **CI/CD:** GitHub Actions workflow (lint → test → type-check on PR; build + deploy staging on merge to main). **DB schema design:** TypeORM entities for all domains (Identity, Commerce, Finance, Logistics, Market). Shared ESLint/TSConfig/Tailwind presets in `packages/config`. |
| **2** | Weeks 3–4 | **Cloud infra:** AWS RDS (PostgreSQL 16), ElastiCache (Redis 7), S3 bucket + CloudFront. **Staging deploy:** NestJS API on Railway/AWS ECS Fargate; all 4 Next.js apps on Vercel. Route 53 + ACM certs for custom domains. **Monitoring:** Sentry (all apps + API) + Datadog (infra). **Design System tokens:** `packages/ui/tokens/` — `colors.css`, `typography.css`, `spacing.css`, `dark.css`. Wire into Tailwind config per Design System spec. **Storybook v8** in `packages/ui`. **Shared types:** TypeScript interfaces in `packages/types` (User, Product, Order, Wallet, etc.). **Zod schemas** in `packages/schemas` shared between API DTOs and frontend forms. **TypeORM migrations:** Initial migration creating all tables. `GET /health` endpoint with DB + Redis + S3 checks. |

### Module 1.2 — Authentication System (Sprint 3–4)

| Sprint | Duration | Features |
|---|---|---|
| **3** | Weeks 5–6 | **Backend:** User registration API (username, email, phone, password, role). Login API (email or phone + password). JWT token generation via @nestjs/jwt (15min access + 7-day refresh). Password hashing (bcrypt). Email verification (optional at MVP). Phone OTP via SMS provider (Termii or Africa's Talking). Forgot password + reset via OTP. Role-based guards (@Roles decorator). |
| **4** | Weeks 7–8 | **Web (GreenPurse):** Splash screen UI. Onboarding screen ('Get your groceries delivered'). Login screen (phone/email + password, biometric icon, register link). Registration form screen (username, email, phone, password, confirm). PIN setup screen (4-digit numpad). Biometric/Touch ID setup screen (WebAuthn stub; deferred to mobile phase). Auth flow integration with API. Token storage in httpOnly cookie + in-memory. Auto-login on page load if refresh token valid. Role-based routing (Buyer vs Farmer post-login). |

### Module 1.3 — Product Catalogue & Marketplace (Sprint 5–7)

| Sprint | Duration | Features |
|---|---|---|
| **5** | Weeks 9–10 | **Backend:** Product model (title, description, store, category, price, kg, stock, condition, images). Category model. Store model. Product CRUD APIs. Product image upload to S3. Product list API (with filters: category, price range, search query). Product detail API. **Admin panel (web-admin):** Products, Categories, Stores, File uploads, Product images. |
| **6** | Weeks 11–12 | **Web (GreenPurse):** Home screen (greeting, address selector, promotional banner slot, category icons grid, Best Selling horizontal scroll). Category view screen (product grid). Product detail screen (image, name, price, qty selector, organic %, expiry, rating, kcal, 'Add to cart' button). Promotional banner CMS hook (admin-configurable). |
| **7** | Weeks 13–14 | **Web (GreenPurse):** Search screen (input, Recent Searches chips, Trending Now grid). Search results screen (query result grid, filter icon). **Backend:** Search API with keyword matching. Trending endpoint (most-viewed/purchased). Recent search stored locally. Image lazy loading and caching (Next.js Image). |

### Module 1.4 — Cart & Checkout (Sprint 8–9)

| Sprint | Duration | Features |
|---|---|---|
| **8** | Weeks 15–16 | **Backend:** Cart model (user, items, created date). CartItem model (product, quantity). Cart CRUD APIs (add, update qty, remove item). Coupon model and validation API. Order model (user, items, total, status, address, payment status). Order creation API. Price calculation: item total, discount, delivery fee, grand total. Platform fee calculation: 10% on farmer-sold items. |
| **9** | Weeks 17–18 | **Web (GreenPurse):** Cart screen (items list with −/+ qty, 'Before you Checkout' recommendations, coupon input, price breakdown, delivery address summary, 'Checkout' CTA). Address selection screen (Google Maps component, address input, confirm). Order summary screen (item details, delivery address, price summary, 'Pay Now'). Integration with wallet payment API (stub if wallet not yet built). |

### Module 1.5 — GreenPurse Wallet (Sprint 10–13)

| Sprint | Duration | Features |
|---|---|---|
| **10** | Weeks 19–20 | **Backend:** Wallet model (user, balance, account name/number, bank, phone, PIN hash). Wallet creation API. Deposit API (integration with Paystack/Flutterwave webhook). Withdrawal API. Transaction model (wallet, amount, type, counterpart, timestamp, idempotency key). Transaction history API. PIN verification endpoint. Wallet freeze/unfreeze. |
| **11** | Weeks 21–22 | **Backend:** Transfer via Green Purse account API (sender → receiver lookup, amount, PIN confirm). Transfer via bank account API (bank selection, account number → beneficiary verification via payment gateway, schedule transfer toggle). Transfer via phone number API (contact-based lookup). Platform fee auto-deduction on marketplace payments. |
| **12** | Weeks 23–24 | **Backend:** QR code generation API (time-limited, single-use). QR code scan-to-pay validation API. Receive money (display account number). Multi-currency: live exchange rate fetch (CBN or ExchangeRate-API), USD → NGN conversion calculation, VAT on forex. **Web (GreenPurse):** Wallet dashboard screen (card display, action shortcuts, recent transactions, freeze toggle). Transaction history screen. |
| **13** | Weeks 25–26 | **Web (GreenPurse):** Transfer flow screens (transaction type selection, send via GP account, bank transfer form with beneficiary verification, amount numpad + confirm). QR display screen (My Code tab showing own QR code — scan is display-only on web; camera deferred). Receive screen (account number + copy). Currency transfer screen (USD/NGN, exchange rate + VAT display). Integration tests for all wallet flows. |

### Module 1.6 — Super Admin Panel (Sprint 14)

| Sprint | Duration | Features |
|---|---|---|
| **14** | Weeks 27–28 | **Admin panel (web-admin):** Build admin UI using shared Design System components. User management: list with role filters, add/edit/deactivate, role assignment. Commerce: product CRUD, category/store management, file/image uploads. Payment: wallet creation, balance management. Auth Token management: view/revoke tokens. OTP device management. Import/Export user lists. Staff-only role enforcement via NestJS guards. All operations via NestJS API — admin app never touches the DB directly. |

### Module 1.7 — Farmer Mobile (Sprint 15–16)

| Sprint | Duration | Features |
|---|---|---|
| **15** | Weeks 29–30 | **Backend:** Farmer product upload API (same Product model, farm-linked). Warehousing request API (produce type, volume, date, location). Logistics request API. Financial aid application API. Market data API (stub with static prices until Phase 2 AI integration). **Web (GreenPurse):** Farmer-gated navigation after login. Farmer home/dashboard screen (must be designed first — flag as blocker). Product upload form screen. |
| **16** | Weeks 31–32 | **Web (GreenPurse):** Warehousing request form. Logistics request form. Financial aid form. Sales monitoring screen (orders received, revenue, pending). Machinery/agro-input browse screen. Market prices screen (basic, static data from stub API). Phase 1 QA, regression testing, and staging sign-off. Phase 1 release candidate. |

---

## PHASE 2 — LOGISTICS, INTELLIGENCE & SUPPLY CHAIN
**Duration: Months 9–16 | Scope: Real-time tracking, GreenSC Web App, AI features, Market monitoring**

### Module 2.1 — Order Tracking & Real-Time Logistics (Sprint 17–18)

| Sprint | Duration | Features |
|---|---|---|
| **17** | Weeks 33–34 | **Backend:** DeliveryBatch model. Route model. Driver/Vehicle model. TrackingEvent model (timestamp, GPS coordinate, status). WebSocket server (Socket.IO + @nestjs/websockets + Redis adapter) for live tracking updates. Order status transitions: Placed → Assigned → On the Way → Delivered. Driver assignment API. Push notification triggers (FCM) on status change. |
| **18** | Weeks 35–36 | **Web (GreenPurse):** Order tracking map screen (Google Maps integration, delivery route display, status tabs: Placed/On the Way/Delivered, delivery agent name + chat/call icons, store and destination markers, ETA countdown). Delivery confirmation screen. Push notification receipt + display (web push via FCM). Driver contact functionality. |

### Module 2.2 — GreenSC Web App (Sprint 19–22)

| Sprint | Duration | Features |
|---|---|---|
| **19** | Weeks 37–38 | Web app (React/Next.js) setup. Auth: Staff login page, JWT session management. Dashboard screen: KPI tiles (Balance, Forex Need, Receivables, Active Projects), payment tracking chart, vendor donut chart, top suppliers table, inventory + tools condition charts. Sidebar navigation with all module links. |
| **20** | Weeks 39–40 | **Web:** Project Tracking module (project cards with client, manager, deadline, days left, team avatars, pagination, search). Suppliers module (tabs: Suppliers/Manufacturer/Country/Solutions, search, add supplier, capability tags). Products module (product catalogue view, add/edit). |
| **21** | Weeks 41–42 | **Web:** Sourcing module (PA Summary, AMU view, order table with status/cost/supplier/profit indicators). Logistics module (Documents: Active Batch / Missed Item / Delivered Batch / RMA, project filter). Documents module (BDU-DCF grid, active status, pagination). Inventory module (stock levels, condition tracking). |
| **22** | Weeks 43–44 | **Web:** Reports module (time filters: weekly/quarterly/yearly, category filters: sourcing/logistics/finance, table view with profit/loss indicators, download report as PDF/Excel). Clients module (client management). Settings module. GreenSC web app QA and sign-off. |

### Module 2.3 — Payment Module in GreenSC (Sprint 23)

| Sprint | Duration | Features |
|---|---|---|
| **23** | Weeks 45–46 | **Web:** Payment module sub-sections: Forex Approval (review and approve/reject forex requests), Forex Planning (currency need planning), Supplier Payment (process payments to suppliers), Payment Collection (track incoming payments), Variance Analysis (compare planned vs actual spend), Payment Request Form (raise new payment requests), Guarantee Preparation (prepare bank guarantees), Aging (overdue payment tracker). All linked to existing financial APIs. |

### Module 2.4 — AI Features Phase 1: Matchmaking & Market Data (Sprint 24–26)

| Sprint | Duration | Features |
|---|---|---|
| **24** | Weeks 47–48 | **AI Service:** Farmer-Buyer matchmaking algorithm (FastAPI microservice). Inputs: buyer location, purchase history, product availability. Output: ranked product feed. Integrate into home screen product API. Replace stub market prices with real commodity data feed (source and integrate price API for: Cocoa, Groundnut, Rice, Millet, Maize). CommodityPrice and PriceHistory models. Market data ingestion job (cron or webhook). |
| **25** | Weeks 49–50 | **Web (GreenPurse Farmer):** Real-time market price screen with live data (replace stub). Price chart per commodity (Recharts). Price alert threshold setup (notify farmer when price crosses threshold). **Backend:** Alert trigger system (check price against thresholds, push notification via FCM). |
| **26** | Weeks 51–52 | **AI Service:** Demand forecasting model (predict harvest volumes, recommend cooling pre-bookings). Weather alert integration (OpenWeatherMap API). Pest alert data source integration. Push notification triggers for weather and pest events to affected farmer accounts. Phase 2 QA and staging sign-off. |

---

## PHASE 3 — ADVANCED FEATURES & SCALE
**Duration: Months 17–24 | Scope: MyVirtualFarm, IoT Integration, Blockchain Audit, AI Route Optimization**

### Module 3.1 — MyVirtualFarm Investment Platform (Sprint 27–29)

| Sprint | Duration | Features |
|---|---|---|
| **27** | Weeks 53–54 | **Backend:** FarmPosition model (user, commodity, units held, avg buy price, current value, P&L). Watchlist model. Trade execution API (buy/sell commodity positions). Position valuation API (real-time price × units). Trade history API. 10% platform interest on profits. Deposit to trade (links to wallet deposit). |
| **28** | Weeks 55–56 | **Web (MyVirtualFarm):** MyVirtualFarm home (account value, P&L mini-chart, 'Make a deposit', My Positions list with P&L per commodity, My Watchlist with prices + trend arrows). Commodity detail screen (icon, price, change %, time selector 1D/1W/1M/1Y/5Y, interactive Recharts chart). Buy flow (amount input → review → PIN confirm → success). |
| **29** | Weeks 57–58 | **Web (MyVirtualFarm):** Sell flow (select position → units to sell → proceeds review → confirm). Watchlist management (add/remove commodities). Deposit to trade flow. Portfolio performance history. Alert banner for incomplete profile. Integration with real commodity price feed. Phase 3 milestone QA. |

### Module 3.2 — IoT Sensor Integration (Sprint 30–31)

| Sprint | Duration | Features |
|---|---|---|
| **30** | Weeks 59–60 | **Backend:** MQTT broker setup (AWS IoT Core or Mosquitto). IoT data ingestion API for: cooling unit sensors (temperature, humidity), logistics vehicle GPS (location, speed, ETA update). CoolingUnit model. VehicleLocation real-time update via WebSocket. Integration with GreenSC logistics tracking. |
| **31** | Weeks 61–62 | **AI Route Optimization service:** inputs (delivery addresses, vehicle locations, traffic data), output (optimized route). Integrate with delivery assignment flow. Cooling unit AI optimization: predict demand from harvest data, auto-adjust temperature settings. Alert if temperature deviates from optimal. |

### Module 3.3 — Blockchain Audit Layer (Sprint 32)

| Sprint | Duration | Features |
|---|---|---|
| **32** | Weeks 63–64 | Implement immutable transaction audit log on top of existing wallet transaction records. Each confirmed transaction (payment, transfer, trade) generates a blockchain record with: transaction hash, timestamp, parties, amount. Verify record on dispute. **NOT** a full public blockchain — implement as permissioned ledger (e.g. Hyperledger Fabric lite or a hash-chained append-only log). Expose verification endpoint for admin and enterprise clients. |

### Module 3.4 — AI Crop Yield Prediction & Financial Aid Automation (Sprint 33–34)

| Sprint | Duration | Features |
|---|---|---|
| **33** | Weeks 65–66 | **AI:** Crop yield prediction model (soil data, weather history, crop type → harvest volume estimate). Feed estimates into warehousing demand forecasting. Farmer dashboard: show predicted yield for current season. Automated financial aid eligibility scoring (ML model on farm profile + repayment history). |
| **34** | Weeks 67–68 | **Monetized data insights product:** Aggregate anonymized market data into structured reports. API for third-party organizations (government, NGOs, agro businesses) to purchase monthly data subscriptions at ₦1M/organization. Admin dashboard for data product subscription management. Seminar and empowerment program module (registration, payment, certificates). |

### Module 3.5 — Advertising & Marketplace Monetization (Sprint 35)

| Sprint | Duration | Features |
|---|---|---|
| **35** | Weeks 69–70 | Promotional banner CMS (admin configures banners visible on buyer home screen). Ad slot management (₦5,000/day per slot). Sponsored product placement in search results. Agro-industry sponsorship registration and billing. Revenue tracking per ad slot in GreenSC Reports module. |

### Module 3.6 — Performance, Scaling & Final QA (Sprint 36)

| Sprint | Duration | Features |
|---|---|---|
| **36** | Weeks 71–72 | Load testing (k6 or Artillery): simulate concurrent buyers, farmers, trades. Database query optimization (add missing indexes, optimize N+1 queries). CDN configuration for static assets and product images. Auto-scaling configuration for NestJS API tier (ECS Fargate + cluster mode). Final penetration testing and security audit. Full documentation handover. Stakeholder sign-off. Mobile app development phase begins post-MVP. |

---

## 2. Feature Completion Summary

| Feature | Phase | Sprints | Systems Affected |
|---|---|---|---|---|
| Infrastructure & CI/CD | 1 | 1–2 | All |
| Authentication (all roles) | 1 | 3–4 | Web (GreenPurse) + Admin |
| Product Catalogue & Search | 1 | 5–7 | Web (GreenPurse) + Admin |
| Cart & Checkout | 1 | 8–9 | Web (GreenPurse) |
| GreenPurse Wallet (full) | 1 | 10–13 | Web (GreenPurse) + Admin |
| Super Admin Panel | 1 | 14 | Web (Admin) |
| Farmer Web Screens | 1 | 15–16 | Web (GreenPurse) |
| Order Tracking & Real-Time Logistics | 2 | 17–18 | Web + Backend |
| GreenSC Web App (all modules) | 2 | 19–22 | Web (GreenSC) |
| GreenSC Payment Module | 2 | 23 | Web (GreenSC) |
| AI Matchmaking + Market Data | 2 | 24–26 | Web + AI Service |
| MyVirtualFarm Investment Platform | 3 | 27–29 | Web (MyVirtualFarm) + Backend |
| IoT Sensor Integration | 3 | 30–31 | Backend + IoT Layer |
| Blockchain Audit Layer | 3 | 32 | Backend |
| Crop Yield Prediction + Financial Aid AI | 3 | 33–34 | Web + AI Service |
| Advertising & Monetization | 3 | 35 | Web (All) + Admin |
| Scaling, Security Audit & Launch | 3 | 36 | All |

---

## 3. Definition of Done (Per Sprint)

- All planned features implemented and code reviewed
- Unit tests written and passing (minimum 70% coverage on new code)
- API endpoints documented (Swagger/OpenAPI)
- Feature deployed to staging environment
- Manual QA sign-off by team lead
- No critical (P1) bugs open
- Performance benchmarks met (API response < 500ms for 95th percentile)

---

## 4. Dependencies & Blockers to Resolve Before Build Starts

| Blocker | Urgency | Resolution Required |
|---|---|---|
| Farmer web UI designs not yet complete | **CRITICAL** — blocks Sprint 15 | Design and approve Farmer dashboard screens before Sprint 14 |
| Tech stack finalized: NestJS + Next.js web-first ✅ | **RESOLVED** | NestJS backend, Next.js 14 frontends, pnpm monorepo with Turborepo |
| Payment gateway selection (Paystack vs Flutterwave) | **HIGH** — needed before Sprint 10 | Compare fees, API quality, and CBN compliance for dual currency |
| Commodity price data source for MyVirtualFarm | **MEDIUM** — needed before Sprint 24 | Research available Nigerian agric commodity price APIs |
| IoT hardware partner for cooling units + vehicles | **MEDIUM** — needed before Sprint 30 | Identify embedded systems partner; stub with mock data until then |
| CBN regulatory approval for dual-currency wallet (USD/NGN) | **HIGH** — needed before Sprint 12 | Legal consultation required before implementing forex wallet feature |
| Cloud infrastructure budget approval | **HIGH** — needed before Sprint 2 | Finalize AWS (or equivalent) account and billing with stakeholders |

---

<p align="center"><em>— End of Feature Breakdown Document —</em></p>
