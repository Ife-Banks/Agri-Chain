# AI-SUCE Technology Stack Decision Document

> **Web-First Architecture · NestJS Backend · JavaScript Full-Stack**
>
> Version 1.0 · ACE ICT Center, OAU · June 2026

---

## 1. Architecture Decision: Web-First Strategy

The build strategy has been **updated**: all three frontends (GreenPurse consumer app, GreenSC supply chain dashboard, and MyVirtualFarm) will be built as **web applications first**. Mobile apps (iOS/Android) will be developed in a subsequent phase using the same backend APIs. This decision reduces time-to-MVP and allows the core product to be tested and iterated before investing in native mobile development.

> **Web-First Trade-offs to Document Now:** Three GreenPurse features are mobile-native in the designs and require simplified web equivalents: (1) **QR Scan-to-Pay** — web version shows a QR code for display only; scanning requires user to use another device's camera. (2) **Biometric login** — web version uses password only; WebAuthn could be added later. (3) **Touch ID for transactions** — web version falls back to PIN entry only. These are acceptable MVP limitations. Document them in the product backlog so mobile phase restores full parity.

---

## 2. Backend: NestJS (Node.js)

> **Decision Rationale — Why NestJS over Express:** Express is too bare for this system's complexity. AI-SUCE has role-based auth, wallet transactions with idempotency, WebSockets for real-time tracking, AI service integration, and 5+ distinct modules. Express would require hand-building all of this from scratch, which leads to architectural drift by Sprint 6. NestJS gives you a module system, guards (auth), interceptors, pipes (validation), and decorators out of the box — it maps directly to the modular decomposition already established in the Architecture Document. The tradeoff: NestJS has a steeper learning curve than Express, but the structure it enforces pays back by Sprint 4.

### 2.1 NestJS Module Map

Each NestJS module corresponds to a domain from the System Architecture Document. Modules are independently testable and replaceable:

| Module | Responsibility | Key Dependencies |
|---|---|---|
| AuthModule | Registration, login, JWT tokens, OTP, PIN hashing, role guards | Passport.js, @nestjs/jwt, bcrypt, speakeasy (OTP) |
| UsersModule | User CRUD, role assignment, profile management | TypeORM, AuthModule |
| ProductsModule | Product CRUD, categories, stores, image uploads, search | TypeORM, AWS S3/Multer, ElasticSearch (Phase 2) |
| OrdersModule | Cart, checkout, order lifecycle, platform fee calculation | TypeORM, WalletModule, ProductsModule |
| WalletModule | Wallet CRUD, transactions, transfers, forex, QR codes | TypeORM, Paystack SDK, ioredis (idempotency) |
| LogisticsModule | Delivery batches, routes, tracking events, driver assignment | TypeORM, WebSocketGateway, Google Maps API |
| MarketModule | Commodity prices, price history, weather alerts, farm positions | External price API, OpenWeatherMap, cron jobs |
| NotificationsModule | Push alerts, in-app notifications, email triggers | Firebase Admin SDK, nodemailer |
| AdminModule | Platform stats, user management, ad slot management | AuthModule (Admin guard only) |
| AIModule | Proxy to Python AI microservices via HTTP | axios, @nestjs/axios |

### 2.2 Backend Core Libraries

| Library / Package | Version | Purpose |
|---|---|---|
| @nestjs/core + @nestjs/common | v10.x | Core framework, decorators, DI container |
| @nestjs/typeorm + typeorm | v10.x / v0.3.x | ORM, entity definitions, migrations, PostgreSQL driver |
| @nestjs/passport + passport-jwt | v10.x | JWT strategy, role guards, request-level auth |
| @nestjs/jwt | v10.x | JWT signing, verification, token refresh |
| @nestjs/websockets + socket.io | v10.x | WebSocket gateway for real-time order tracking and market prices |
| @nestjs/config | v3.x | Environment variable management, .env loading |
| @nestjs/throttler | v5.x | Rate limiting on all API endpoints |
| class-validator + class-transformer | Latest | DTO validation with decorators, automatic input sanitization |
| bcrypt | v5.x | Password hashing |
| speakeasy | v2.x | TOTP/HOTP one-time password generation and verification |
| ioredis | v5.x | Redis client for session cache, idempotency keys, rate limiting |
| @aws-sdk/client-s3 | v3.x | Product image + document uploads to S3 |
| paystack-node (or axios) | Latest | Paystack payment gateway integration |
| firebase-admin | v12.x | FCM push notifications to web and (future) mobile clients |
| qrcode | v1.x | QR code generation for Scan-to-Pay feature |
| @nestjs/schedule + cron | v4.x | Scheduled jobs: commodity price refresh, weather alert polling |
| jest + @nestjs/testing | v29.x | Unit and integration testing |
| @nestjs/swagger | v7.x | Auto-generate OpenAPI docs from decorators |

### 2.3 Database: PostgreSQL + Redis

| Store | Technology | What Lives Here |
|---|---|---|
| Primary DB | PostgreSQL 16 (via TypeORM) | All persistent data: users, products, orders, wallets, transactions, logistics, market data |
| Cache / Sessions | Redis 7 | JWT session blacklist, idempotency keys, real-time price cache, rate limit counters, WebSocket session state |
| Search (Phase 2) | Elasticsearch or pg_trgm | Full-text product search with fuzzy matching |
| File Storage | AWS S3 | Product images, farm photos, document uploads, report exports |

---

## 3. Frontend Stack

### 3.1 Framework Decision: React + Next.js

All three web frontends are built with **React 18** and **Next.js 14 (App Router)**. They share a common component library (the Design System) but are deployed as separate applications.

**Rationale:** Next.js provides SSR for initial page load performance on low-bandwidth Nigerian networks, built-in routing, API routes for BFF patterns, and image optimization.

| Frontend App | Deployment | Key Concern |
|---|---|---|
| GreenPurse Web (Buyer + Farmer) | Vercel or AWS Amplify | Performance on mobile browsers in low-bandwidth; progressive web app (PWA) capabilities |
| GreenSC Web (Store Manager) | Vercel or AWS Amplify | Data-dense dashboard with charts; large table rendering performance |
| MyVirtualFarm Web | Vercel or AWS Amplify | Real-time price chart updates; WebSocket integration for live prices |

### 3.2 Frontend Core Libraries

| Library | Version | Purpose |
|---|---|---|
| React | v18.x | Core UI library |
| Next.js | v14.x (App Router) | SSR, routing, image optimization, API routes |
| TypeScript | v5.x | Type safety across all frontend code — mandatory, not optional |
| Tailwind CSS | v3.x | Utility-first styling; all Design System tokens expressed as Tailwind config |
| Zustand | v4.x | Lightweight global state (auth state, cart, wallet balance, notifications) |
| TanStack Query (React Query) | v5.x | Server state management, data fetching, caching, background refresh |
| axios | v1.x | HTTP client for API calls; interceptors for auth token injection |
| socket.io-client | v4.x | WebSocket connection for real-time order tracking and market prices |
| Recharts | v2.x | Charts: price charts (MyVirtualFarm), dashboard analytics (GreenSC) |
| React Hook Form + Zod | Latest | Form management and validation; Zod schemas shared with backend DTOs |
| @googlemaps/react-wrapper | Latest | Google Maps for order tracking and address selection |
| react-qr-code | Latest | Display QR code for Scan-to-Pay (web replaces camera scanning) |
| next-pwa | Latest | Progressive Web App capabilities: offline support, installability |
| Framer Motion | v11.x | Animations: page transitions, modal entrances, micro-interactions |
| Vitest + React Testing Library | Latest | Frontend unit and component testing |
| Storybook | v8.x | Design System component development and documentation |

---

## 4. AI / ML Layer

AI services run as separate **Python microservices (FastAPI)**. NestJS calls them via HTTP through the AIModule. This keeps AI code isolated from the JavaScript codebase and allows independent scaling and deployment of each model.

| AI Service | Framework | Libraries |
|---|---|---|
| Matchmaking Service | FastAPI (Python) | scikit-learn, pandas, numpy — collaborative filtering on product-buyer history |
| Demand Forecasting Service | FastAPI (Python) | Prophet or ARIMA — time-series forecasting on harvest/sales data |
| Route Optimization Service | FastAPI (Python) | Google OR-Tools or custom Dijkstra — vehicle routing problem solver |
| Weather Alert Service | FastAPI (Python) | OpenWeatherMap API consumer + alert threshold logic |
| Crop Yield Prediction | FastAPI (Python) | scikit-learn regression — soil + weather + crop type inputs |

---

## 5. DevOps & Infrastructure

| Layer | Technology | Notes |
|---|---|---|
| Containerization | Docker + Docker Compose | All services run in containers: NestJS API, Postgres, Redis, Python AI services, Next.js apps |
| CI/CD | GitHub Actions | On PR: lint, test, type-check. On merge to main: build + deploy to staging. On tag: deploy to production. |
| API Hosting | AWS ECS (Fargate) or Railway | NestJS API in containers. Fargate for production scale; Railway for early-stage simplicity. |
| Frontend Hosting | Vercel | All Next.js apps. Auto-deployments on push. Edge network for Nigerian users. |
| Database | AWS RDS (PostgreSQL 16) | Multi-AZ in production. Automated backups. Connection pooling via PgBouncer. |
| Cache | AWS ElastiCache (Redis 7) | Managed Redis cluster. Used by NestJS for sessions and WebSocket scaling. |
| File Storage | AWS S3 + CloudFront | S3 for uploads. CloudFront CDN for serving product images globally. |
| Monitoring | Sentry (errors) + Datadog (infra) | Sentry in all apps and NestJS API. Datadog for DB, Redis, and server metrics. |
| Secrets Management | AWS Secrets Manager | API keys, DB credentials, JWT secrets. Never in .env files in production. |
| DNS & SSL | AWS Route 53 + ACM | Managed SSL certificates. Custom domains for each web app. |

---

## 6. Monorepo Structure

The project uses a **monorepo** managed with **pnpm workspaces** and **Turborepo** for build orchestration. This allows code sharing (types, Zod schemas, design system tokens) across frontend and backend without publishing packages.

```
aisuce/
  apps/
    api/                  ← NestJS backend
    web-greenpurse/       ← GreenPurse buyer+farmer web app (Next.js)
    web-greensc/          ← GreenSC store manager web app (Next.js)
    web-virtualfarm/      ← MyVirtualFarm web app (Next.js)
  packages/
    ui/                   ← Shared Design System components (React)
    types/                ← Shared TypeScript types (User, Product, Order, Wallet...)
    schemas/              ← Shared Zod validation schemas (used by API DTOs + frontend forms)
    config/               ← Shared ESLint, TypeScript, Tailwind configs
  docker-compose.yml
  turbo.json
  pnpm-workspace.yaml
```

---

## 7. Mobile Phase (Deferred)

When the web applications are stable and tested, the mobile phase begins. The NestJS API requires zero changes — mobile apps consume the exact same API. The recommended approach:

- **React Native with Expo** — reuses JavaScript/TypeScript knowledge from the web team
- Shared `packages/types` and `packages/schemas` packages work unchanged in React Native
- GreenPurse mobile app restores: biometric login (Expo LocalAuthentication), QR scan-to-pay (Expo Camera), PIN entry (existing logic, native numpad UX)
- Estimated mobile phase: **6 months after web MVP launch**, one platform at a time (Android first for Nigerian market)

---

## 8. Technology Risk Register

| Risk | Severity | Mitigation |
|---|---|---|
| NestJS learning curve for team unfamiliar with it | **MEDIUM** | Run a 3-day internal NestJS workshop before Sprint 1. Use official documentation extensively — it is excellent. |
| TypeORM migrations can be destructive if mishandled | **HIGH** | Enforce migration review in CI. Never run migrations directly on production without a backup snapshot. |
| WebSocket scaling across multiple API instances | **MEDIUM** | Use Redis adapter (@socket.io/redis-adapter) from Sprint 17 — not an afterthought. Document this in Sprint 1 setup. |
| Paystack API changes or downtime affect wallet features | **HIGH** | Abstract payment gateway behind a PaymentGatewayInterface — swap providers without touching business logic. |
| Vercel cold starts on serverless Next.js affect real-time features | **MEDIUM** | WebSocket connections stay in NestJS on dedicated infra. Next.js only handles page rendering and REST proxying. |
| TypeScript strict mode reveals many type errors on legacy code | **LOW** | Enable strict mode from day one on a clean codebase — not a problem if started correctly. |

---

<p align="center"><em>— End of Technology Stack Document —</em></p>
