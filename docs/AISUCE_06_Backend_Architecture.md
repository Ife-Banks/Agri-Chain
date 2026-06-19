# AI-SUCE Backend Technical Architecture

> **NestJS · PostgreSQL · Redis · REST API · WebSockets**
>
> Version 1.0 · Applies to: apps/api · June 2026

---

## 1. Overview

The AI-SUCE backend is a NestJS (Node.js + TypeScript) application serving as the single API for all three web frontends (GreenPurse, GreenSC, MyVirtualFarm) and the Django-based Super Admin panel. It exposes a versioned REST API at `/api/v1/` and WebSocket gateways for real-time features. It persists data in PostgreSQL, caches in Redis, stores files in AWS S3, and delegates AI computation to Python microservices via HTTP.

> **⚠️ Confirmed from Existing Code**: The Super Admin Django panel (GreenPurseBackEnd Administration Dashboard at `127.0.0.1:8000/admin/`) already exists and manages the following models: User (with roles: Admin, Farmer, Agric Enterprise, Farm Customer), Commerce (Cart, CartItem, Category, FileUpload, ProductDetail, ProductImage, Product, Store), OTP (HOTP/TOTP devices), and Payment (Wallet). The NestJS API must be fully compatible with this existing schema — read the Django models before defining TypeORM entities.

---

## 2. Module Architecture

NestJS organises code into modules. Each module owns its entities, services, controllers, DTOs, and guards. Modules communicate through injected services — never via direct database access across module boundaries.

### 2.1 Module Inventory

| Module | Responsibility | Key Exports |
|---|---|---|
| AppModule | Root module — imports all feature modules, global config, database | — |
| ConfigModule | Environment variables via @nestjs/config, validation with Joi | ConfigService |
| DatabaseModule | TypeORM connection, entity registration | DataSource |
| AuthModule | Registration, login, JWT issue/refresh, PIN, OTP, role guards | JwtAuthGuard, RolesGuard, AuthService |
| UsersModule | User CRUD, profile, role management | UsersService |
| ProductsModule | Product CRUD, categories, stores, image upload, search | ProductsService |
| OrdersModule | Cart, checkout, order lifecycle, platform fee | OrdersService |
| WalletModule | Wallet CRUD, transactions, transfers, forex, QR codes | WalletService |
| LogisticsModule | Delivery batches, routes, tracking events, driver assignment | LogisticsService |
| MarketModule | Commodity prices, P&L, farm positions, watchlist | MarketService |
| NotificationsModule | FCM push, in-app, email triggers | NotificationsService |
| StorageModule | AWS S3 upload, signed URL generation | StorageService |
| AIModule | HTTP proxy to Python AI microservices | AIService |
| AdminModule | Platform analytics, ad slot management, super admin helpers | AdminService |
| HealthModule | Health check endpoints for load balancer probes | — |

### 2.2 Module Dependency Graph

> **Dependency Rules**: Modules may only import modules listed below them in the dependency order. No circular imports. AppModule imports everything. Feature modules import only AuthModule (for guards), UsersModule (for user lookup), NotificationsModule (for triggers), and StorageModule (for file operations). They do NOT import each other's services directly — use events (EventEmitter2) for cross-module side effects.

| Layer | Modules | Can Import |
|---|---|---|
| Infrastructure | ConfigModule, DatabaseModule, HealthModule | External libraries only |
| Core Services | AuthModule, UsersModule, StorageModule, NotificationsModule | Infrastructure layer |
| Domain: Commerce | ProductsModule, OrdersModule | Core Services |
| Domain: Finance | WalletModule | Core Services |
| Domain: Logistics | LogisticsModule | Core Services, Commerce (OrdersModule events) |
| Domain: Intelligence | MarketModule, AIModule | Core Services |
| Platform | AdminModule | All domain modules (read-only) |

---

## 3. Database Schema

PostgreSQL 16 via TypeORM 0.3.x. All entities use UUID primary keys (`uuid_generate_v4()`). Timestamps: `created_at` and `updated_at` on every table, auto-managed by TypeORM. Soft deletes via `deleted_at` where data must be retained for audit. Migrations are version-controlled in `apps/api/src/migrations/` — never use `synchronize: true` in production.

> **🚨 Schema Compatibility Warning**: The Django admin reveals these existing table names: `users`, `commerce_product`, `commerce_category`, `commerce_store`, `commerce_cart`, `commerce_cartitem`, `commerce_fileupload`, `commerce_productdetail`, `commerce_productimage`, `payment_wallet`, `auth_token_token`, `otp_hotp_hotpdevice`. TypeORM entities MUST map to these existing table names using the `@Entity('table_name')` decorator. Do not let TypeORM create new tables that duplicate existing Django-managed ones.

### 3.1 Identity Domain

| Table | Column | Type | Constraints / Notes |
|---|---|---|---|
| `users` | `id` | UUID | PK, default uuid_generate_v4() |
| | `email` | VARCHAR(255) | UNIQUE, NOT NULL |
| | `phone_number` | VARCHAR(20) | UNIQUE, nullable |
| | `username` | VARCHAR(100) | UNIQUE, NOT NULL |
| | `password_hash` | VARCHAR(255) | bcrypt, NOT NULL |
| | `pin_hash` | VARCHAR(255) | bcrypt, nullable (set post-registration) |
| | `is_admin` | BOOLEAN | Default FALSE |
| | `is_farmer` | BOOLEAN | Default FALSE |
| | `is_agric_enterprise` | BOOLEAN | Default FALSE |
| | `is_farm_customer` | BOOLEAN | Default FALSE |
| | `created_at / updated_at` | TIMESTAMPTZ | Auto-managed by TypeORM |
| `auth_token_token` | `id` | BIGINT | PK |
| | `key` | VARCHAR(40) | UNIQUE — Knox-style token key |
| | `user_id` | UUID | FK → users.id |
| | `created / expiry` | TIMESTAMPTZ | Token lifecycle |

### 3.2 Commerce Domain

| Table | Key Columns | Foreign Keys | Notes |
|---|---|---|---|
| `commerce_store` | id (UUID), name, farmer_id, address, lat, lng | farmer_id → users.id | One farmer may have multiple stores |
| `commerce_category` | id (UUID), name, slug, icon_url | — | Seeded by admin |
| `commerce_product` | id (UUID), title, description, store_id, category_id, price, kilogram, stock, condition, is_active | store_id, category_id | Platform fee applied at order creation, not stored here |
| `commerce_productimage` | id (UUID), product_id, s3_key, url, is_primary | product_id | Multiple images per product |
| `commerce_productdetail` | id (UUID), product_id, organic_pct, expiry_date, kcal_per_100g, rating | product_id | Extended product attributes |
| `commerce_cart` | id (UUID), user_id, created_at | user_id → users.id | One active cart per user |
| `commerce_cartitem` | id (UUID), cart_id, product_id, quantity | cart_id, product_id | Quantity in kg |
| `orders` | id (UUID), user_id, status, subtotal, discount, delivery_fee, platform_fee, grand_total, delivery_address_id, created_at | user_id | Status enum: PENDING, PLACED, ASSIGNED, ON_THE_WAY, DELIVERED, CANCELLED |
| `order_items` | id (UUID), order_id, product_id, quantity, unit_price, subtotal, farmer_id | order_id, product_id, farmer_id | Snapshot of price at order time |
| `addresses` | id (UUID), user_id, label, line1, city, state, lat, lng, is_default | user_id | Multiple addresses per user |
| `coupons` | id (UUID), code, discount_type, value, min_order, expiry, uses_remaining | — | PERCENTAGE or FIXED discount |

### 3.3 Finance Domain

| Table | Key Columns | Foreign Keys | Notes |
|---|---|---|---|
| `payment_wallet` | id (UUID), user_id, balance (DECIMAL 15,2), account_name, account_number, bank, phone_number, pin_hash | user_id → users.id | One wallet per user; created by admin or auto on registration |
| `wallet_transactions` | id (UUID), wallet_id, type, amount, fee, balance_after, counterpart_wallet_id, status, idempotency_key, metadata (JSONB), created_at | wallet_id, counterpart_wallet_id | Type enum: DEPOSIT, WITHDRAWAL, TRANSFER_OUT, TRANSFER_IN, PURCHASE, INVESTMENT, FEE |
| `qr_tokens` | id (UUID), wallet_id, token_hash, amount (nullable), expires_at, used_at | wallet_id | Single-use, 5-minute expiry |
| `bank_beneficiaries` | id (UUID), wallet_id, bank_name, account_number, account_name | wallet_id | Saved beneficiaries for faster transfer |
| `forex_rates` | id (UUID), from_currency, to_currency, rate, vat_pct, fetched_at | — | Cached from external API, refreshed every 5 minutes via cron |

### 3.4 Logistics Domain

| Table | Key Columns | Foreign Keys | Notes |
|---|---|---|---|
| `delivery_batches` | id (UUID), order_id, driver_id, vehicle_id, status, started_at, delivered_at | order_id, driver_id | Status: PENDING, ASSIGNED, IN_TRANSIT, DELIVERED, FAILED |
| `tracking_events` | id (UUID), batch_id, lat, lng, speed_kmh, status, recorded_at | batch_id | IoT GPS push events (stub in Phase 1) |
| `drivers` | id (UUID), user_id, vehicle_id, license_number, phone, is_available | user_id | |
| `vehicles` | id (UUID), plate, type, cooling_enabled, iot_device_id | — | Type: TRUCK, TRICYCLE, VAN |
| `warehousing_requests` | id (UUID), farmer_id, produce_type, volume_kg, requested_date, status, cooling_unit_id | farmer_id | Status: PENDING, CONFIRMED, ACTIVE, COMPLETED |

### 3.5 Market Intelligence Domain

| Table | Key Columns | Notes |
|---|---|---|
| `commodities` | id (UUID), name, symbol, category (CASH_CROP / FOOD_CROP), icon_url | Seeded: Cocoa, Groundnut, Rice, Millet, Maize |
| `commodity_prices` | id (UUID), commodity_id, price (DECIMAL 15,4), recorded_at | Appended by price-feed cron job, never updated |
| `farm_positions` | id (UUID), user_id, commodity_id, units_held, avg_buy_price, opened_at | Investment positions — opened/closed by buy/sell actions |
| `watchlist` | id (UUID), user_id, commodity_id, added_at | Many-to-many user–commodity relationship |
| `weather_alerts` | id (UUID), state, severity, message, valid_from, valid_to, sent_at | Ingested from OpenWeatherMap API |
| `price_alerts` | id (UUID), user_id, commodity_id, threshold_type (ABOVE/BELOW), threshold_price, triggered_at, is_active | User-defined price alert triggers |

---

## 4. REST API Design

### 4.1 Conventions

- Base URL: `/api/v1/` — all routes versioned from day one
- Authentication: Bearer JWT token in `Authorization` header
- Content type: `application/json` for all request/response bodies
- Error format: `{ statusCode, message, error, timestamp, path }`
- Pagination: `{ data: [], total, page, limit, totalPages }` on all list endpoints
- Idempotency: `POST /wallet/transactions` requires `Idempotency-Key` header
- File uploads: `multipart/form-data`, max 5MB per file, 5 files per request

### 4.2 Auth Endpoints

| Method | Path | Auth | Request Body | Response |
|---|---|---|---|---|
| POST | `api/v1/auth/register` | Public | username, email, phone, password, role | 201: { user, token } |
| POST | `api/v1/auth/login` | Public | email\|phone, password | 200: { user, token } |
| POST | `api/v1/auth/login/pin` | JWT | pin (4 digits) | 200: { verified: true } |
| POST | `api/v1/auth/otp/send` | Public | phone\|email | 200: { message } |
| POST | `api/v1/auth/otp/verify` | Public | phone\|email, otp | 200: { token } |
| POST | `api/v1/auth/refresh` | JWT | — | 200: { token } |
| POST | `api/v1/auth/logout` | JWT | — | 200: { message } |
| PUT | `api/v1/auth/pin` | JWT | old_pin, new_pin | 200: { message } |

### 4.3 Products & Catalogue Endpoints

| Method | Path | Auth | Notes |
|---|---|---|---|
| GET | `api/v1/products` | Public | Filters: category, search, min_price, max_price, page, limit |
| GET | `api/v1/products/feed` | JWT (Buyer) | AI-ranked personalised feed based on buyer history |
| GET | `api/v1/products/trending` | Public | Most-purchased in last 7 days |
| GET | `api/v1/products/:id` | Public | Single product with images and details |
| POST | `api/v1/products` | JWT (Farmer) | Multipart: product fields + images. Returns created product |
| PATCH | `api/v1/products/:id` | JWT (Farmer, own) | Update any product field |
| DELETE | `api/v1/products/:id` | JWT (Farmer / Admin) | Soft delete only |
| GET | `api/v1/categories` | Public | Full category list with icon URLs |

### 4.4 Order & Cart Endpoints

| Method | Path | Auth | Notes |
|---|---|---|---|
| GET | `api/v1/cart` | JWT | Current user's active cart with item totals |
| POST | `api/v1/cart/items` | JWT | { product_id, quantity }. Creates cart if none exists |
| PATCH | `api/v1/cart/items/:id` | JWT | { quantity }. 0 removes item |
| POST | `api/v1/cart/coupon` | JWT | { code }. Validates and applies coupon |
| POST | `api/v1/orders` | JWT (Buyer) | Checkout: { address_id, coupon_code, payment_method }. Deducts wallet, creates order |
| GET | `api/v1/orders` | JWT | List caller's orders. Farmers see their sold orders |
| GET | `api/v1/orders/:id` | JWT | Order detail with items and tracking status |
| PATCH | `api/v1/orders/:id/status` | JWT (Logistics) | Update order status. Triggers WebSocket + push notification |

### 4.5 Wallet Endpoints

| Method | Path | Auth | Notes |
|---|---|---|---|
| GET | `api/v1/wallet` | JWT | Wallet balance, card details, recent transactions |
| POST | `api/v1/wallet/deposit` | JWT | Initiates Paystack charge. Returns payment URL |
| POST | `api/v1/wallet/withdraw` | JWT + PIN | { amount, bank_name, account_number }. Paystack payout |
| POST | `api/v1/wallet/transfer` | JWT + PIN | { type: GP\|BANK\|PHONE\|QR, amount, target, idempotency_key } |
| GET | `api/v1/wallet/transactions` | JWT | Paginated transaction history |
| POST | `api/v1/wallet/qr/generate` | JWT | Returns { qr_token, qr_image_url, expires_at } |
| POST | `api/v1/wallet/qr/pay` | JWT + PIN | { qr_token, amount }. Validates and executes payment |
| GET | `api/v1/wallet/forex` | JWT | { from, to, amount } → rate, vat, total |
| POST | `api/v1/wallet/freeze` | JWT | Toggles wallet freeze state |
| POST | `api/v1/payments/webhook` | Public (signed) | Paystack webhook — validates signature, updates wallet |

### 4.6 Market & Investment Endpoints

| Method | Path | Auth | Notes |
|---|---|---|---|
| GET | `api/v1/market/commodities` | JWT | Full list with current prices and 24h change |
| GET | `api/v1/market/commodities/:id/prices` | JWT | { period: 1D\|1W\|1M\|1Y\|5Y } price history array |
| GET | `api/v1/market/portfolio` | JWT | Account value, P&L, open positions |
| POST | `api/v1/market/positions` | JWT + PIN | Buy: { commodity_id, amount }. Sell: { position_id, units } |
| GET | `api/v1/market/watchlist` | JWT | User's watchlist with live prices |
| POST | `api/v1/market/watchlist` | JWT | { commodity_id }. Add to watchlist |
| DELETE | `api/v1/market/watchlist/:id` | JWT | Remove from watchlist |
| POST | `api/v1/market/alerts` | JWT | { commodity_id, threshold_type, threshold_price } |
| GET | `api/v1/market/weather-alerts` | JWT (Farmer) | Active weather alerts for farmer's state |

---

## 5. WebSocket Gateways

WebSocket connections managed by `@nestjs/websockets` using Socket.IO. Redis adapter (`@socket.io/redis-adapter`) enables horizontal scaling across multiple API instances from day one.

### 5.1 Order Tracking Gateway

| Event | Direction | Payload | Description |
|---|---|---|---|
| `join-order` | Client → Server | { order_id, token } | Subscribe to a specific order's tracking room |
| `order:location-update` | Server → Client | { lat, lng, speed, eta_minutes } | Driver GPS position, emitted every 10 seconds |
| `order:status-change` | Server → Client | { order_id, status, timestamp } | Status transition (ASSIGNED → ON_THE_WAY → DELIVERED) |
| `order:driver-assigned` | Server → Client | { driver_name, vehicle_plate, phone } | Emitted when logistics assigns driver |

### 5.2 Market Data Gateway

| Event | Direction | Payload | Description |
|---|---|---|---|
| `subscribe-market` | Client → Server | { commodity_ids[] } | Subscribe to price feed for selected commodities |
| `market:price-update` | Server → Client | { commodity_id, price, change_pct, timestamp } | Emitted when price feed cron refreshes (every 60 seconds) |
| `market:alert-triggered` | Server → Client | { alert_id, commodity_id, price, message } | Emitted to specific user's room when price alert fires |

### 5.3 Notifications Gateway

| Event | Direction | Payload | Description |
|---|---|---|---|
| `authenticate` | Client → Server | { token } | Authenticate WebSocket connection, joins user-specific room |
| `notification:new` | Server → Client | { id, type, title, body, data, created_at } | Real-time in-app notification |
| `wallet:balance-update` | Server → Client | { new_balance, transaction_type, amount } | Instant balance refresh after transaction |

---

## 6. Authentication & Authorisation Architecture

### 6.1 Auth Flow

1. User submits credentials (email/phone + password) to `POST /api/v1/auth/login`
2. AuthService validates credentials, checks bcrypt hash against stored `password_hash`
3. On success: generates JWT (15-minute expiry) + refresh token (7-day expiry, stored in Redis)
4. JWT payload: `{ sub: userId, email, roles: ['farmer'|'buyer'|'admin'|...], iat, exp }`
5. Client stores JWT in memory (not localStorage); refresh token in httpOnly cookie
6. Every API request: JwtAuthGuard extracts and verifies JWT from Authorization header
7. Sensitive operations (wallet, PIN change): additional PIN verification via `POST /auth/login/pin`
8. Token refresh: client calls `POST /auth/refresh`; server validates refresh token from Redis, issues new JWT

### 6.2 Guards & Decorators

| Guard / Decorator | Type | Usage |
|---|---|---|
| `@UseGuards(JwtAuthGuard)` | Global (with exceptions) | Applied globally in AppModule; public routes opt-out with `@Public()` |
| `@UseGuards(RolesGuard)` | Method-level | Combined with `@Roles()` decorator to restrict endpoints by role |
| `@Roles('farmer', 'admin')` | Custom decorator | Specifies which roles can access the route |
| `@Public()` | Custom decorator | Bypasses JwtAuthGuard (login, register, public product list) |
| `@CurrentUser()` | Custom decorator | Injects the authenticated user object from JWT payload into handler |
| `@UseGuards(PinGuard)` | Method-level | Requires PIN verification header on wallet mutation routes |
| `@ApiKey()` | Custom decorator | Admin API routes use API key header instead of JWT |

### 6.3 Role Matrix

| Endpoint Group | Buyer | Farmer | Store Manager (GreenSC) | Admin |
|---|---|---|---|---|
| GET /products, /categories | ✓ | ✓ | ✓ | ✓ |
| POST /products | — | ✓ | ✓ | ✓ |
| POST /orders, GET /orders | ✓ | — | — | ✓ |
| GET /orders (sold) | — | ✓ | — | ✓ |
| PATCH /orders/:id/status | — | — | ✓ | ✓ |
| All /wallet endpoints | ✓ | ✓ | — | ✓ |
| All /market endpoints | ✓ | ✓ | — | ✓ |
| POST /logistics | — | — | ✓ | ✓ |
| GET /admin/* | — | — | — | ✓ |

---

## 7. Key Implementation Patterns

### 7.1 Platform Fee Calculation

> **Rule: Server-side only**: The 10% platform fee is ALWAYS calculated server-side in `OrdersService.createOrder()`. It is NEVER calculated or trusted from the client. The fee is computed as: `platform_fee = subtotal * 0.10`. The farmer receives 90% of item revenue credited to their wallet immediately upon delivery confirmation (status → DELIVERED). The 10% is credited to the platform revenue wallet.

```ts
// orders/orders.service.ts — fee calculation (simplified)
async createOrder(userId: string, dto: CreateOrderDto) {
  const cart = await this.cartService.getActiveCart(userId)
  const subtotal = cart.items.reduce((s, i) => s + i.product.price * i.quantity, 0)
  const discount  = await this.couponService.apply(dto.couponCode, subtotal)
  const platformFee = (subtotal - discount) * 0.10
  const grandTotal  = subtotal - discount + deliveryFee

  // Deduct from buyer wallet — atomic transaction
  await this.walletService.deduct(userId, grandTotal, idempotencyKey)

  // Order created with status PENDING
  const order = await this.ordersRepo.save({ ..., platformFee, grandTotal })

  // Farmer payout triggered only on DELIVERED status
  return order
}
```

### 7.2 Idempotency on Wallet Transactions

| Step | Detail |
|---|---|
| 1. Client sends | `POST /wallet/transfer` with `Idempotency-Key: <uuid>` header |
| 2. Server checks Redis | Key: `idempotency:{key}`. If exists → return cached response immediately (no DB write) |
| 3. Server processes | Executes transfer inside a PostgreSQL transaction (BEGIN … COMMIT) |
| 4. Server stores | Result stored in Redis with 24-hour TTL: `SET idempotency:{key} <response> EX 86400` |
| 5. Retry-safe | Client can safely retry on network timeout — same response returned, no duplicate debit |

### 7.3 Event-Driven Cross-Module Communication

Modules do not call each other's services directly across domain boundaries. They emit events via EventEmitter2 (`@nestjs/event-emitter`). This keeps modules decoupled and testable in isolation.

| Event Name | Emitted By | Handled By | Trigger |
|---|---|---|---|
| `order.placed` | OrdersModule | LogisticsModule, NotificationsModule | New order created |
| `order.status.changed` | LogisticsModule | OrdersModule, NotificationsModule, WalletModule | Status transition |
| `order.delivered` | LogisticsModule | WalletModule | Triggers farmer payout (90%) |
| `wallet.transaction.complete` | WalletModule | NotificationsModule | Any wallet transaction |
| `product.created` | ProductsModule | AIModule (re-index) | New product uploaded |
| `price.alert.triggered` | MarketModule | NotificationsModule | Price threshold crossed |
| `weather.alert.received` | MarketModule | NotificationsModule | New weather alert ingested |

### 7.4 Caching Strategy

| Data | Cache Key Pattern | TTL | Invalidation |
|---|---|---|---|
| Product list (by category) | `products:cat:{id}:p:{page}` | 10 min | On product create/update/delete |
| Single product | `products:item:{id}` | 30 min | On product update |
| Category list | `categories:all` | 1 hour | On category change (rare) |
| Forex rate (NGN/USD) | `forex:NGN:USD` | 5 min | Cron refresh every 5 min |
| Commodity price (latest) | `market:price:{id}:latest` | 60 sec | Price feed cron |
| Trending products | `products:trending` | 15 min | Cron recalculation |
| User JWT blacklist | `auth:blacklist:{token_jti}` | Until token expiry | On logout |
| Idempotency keys | `idempotency:{key}` | 24 hours | Never evicted early |

---

## 8. Project Folder Structure

```
apps/api/src/
  app.module.ts                ← Root module
  main.ts                      ← Bootstrap, global pipes, Swagger setup
  config/
    configuration.ts           ← Joi-validated env schema
  database/
    database.module.ts
    migrations/                ← TypeORM migration files (timestamped)
  common/
    decorators/                ← @Public(), @Roles(), @CurrentUser()
    guards/                    ← JwtAuthGuard, RolesGuard, PinGuard
    interceptors/              ← LoggingInterceptor, TransformInterceptor
    filters/                   ← GlobalExceptionFilter
    pipes/                     ← ValidationPipe (class-validator)
    dto/                       ← Shared DTOs (PaginationDto, etc.)
  modules/
    auth/
      auth.module.ts
      auth.controller.ts
      auth.service.ts
      strategies/              ← JwtStrategy, LocalStrategy
      dto/                     ← RegisterDto, LoginDto, PinDto
    users/
      users.module.ts
      users.service.ts
      entities/user.entity.ts  ← TypeORM entity mapping users table
    products/
      products.module.ts | .controller.ts | .service.ts
      entities/                ← product.entity, category.entity, ...
      dto/                     ← CreateProductDto, UpdateProductDto, ...
    orders/ | wallet/ | logistics/ | market/ | notifications/
    storage/
      storage.service.ts       ← AWS S3 upload / signed URL
    ai/
      ai.service.ts            ← HTTP proxy to Python microservices
    admin/
      admin.module.ts | .controller.ts | .service.ts
    health/
      health.controller.ts     ← GET /health (DB + Redis + S3 checks)
  gateways/
    tracking.gateway.ts        ← Order tracking WebSocket
    market.gateway.ts          ← Market price WebSocket
    notifications.gateway.ts   ← User notification WebSocket
```

---

## 9. Environment Variables

> **Security Rule**: Environment variables are NEVER committed to the repository. Production secrets are managed via AWS Secrets Manager. Developers use a `.env.local` file (gitignored). The `.env.example` file in the repo documents all required variables with placeholder values.

| Variable | Example Value | Required | Description |
|---|---|---|---|
| `NODE_ENV` | `production` | Yes | development \| staging \| production |
| `PORT` | `3001` | Yes | API server port |
| `DATABASE_URL` | `postgresql://user:pass@host:5432/aisuce` | Yes | Full Postgres connection string |
| `REDIS_URL` | `redis://host:6379` | Yes | Redis connection string |
| `JWT_SECRET` | `<64-char random string>` | Yes | JWT signing secret |
| `JWT_EXPIRES_IN` | `15m` | Yes | JWT access token expiry |
| `JWT_REFRESH_EXPIRES_IN` | `7d` | Yes | Refresh token expiry |
| `PAYSTACK_SECRET_KEY` | `sk_live_...` | Yes | Paystack secret key |
| `PAYSTACK_WEBHOOK_SECRET` | `<hash>` | Yes | Paystack webhook signature secret |
| `AWS_REGION` | `eu-west-1` | Yes | AWS region for S3 + Secrets Manager |
| `AWS_S3_BUCKET` | `aisuce-media-prod` | Yes | S3 bucket for product images |
| `AWS_ACCESS_KEY_ID` | `AKIA...` | Yes (dev only) | IAM credentials; use instance role in prod |
| `FIREBASE_PROJECT_ID` | `aisuce-prod` | Yes | FCM push notifications |
| `FIREBASE_CREDENTIALS` | `<base64 JSON>` | Yes | Firebase service account credentials |
| `OPENWEATHER_API_KEY` | `<key>` | Yes | OpenWeatherMap API |
| `COMMODITY_PRICE_API_URL` | `https://api.example.com/v1` | Yes | Agric commodity price feed base URL |
| `AI_SERVICE_URL` | `http://ai-service:8001` | Yes | Python AI microservices base URL |
| `TERMII_API_KEY` | `<key>` | Yes | SMS / OTP provider (Nigerian numbers) |
| `PLATFORM_WALLET_ID` | `<UUID>` | Yes | ID of the platform revenue wallet |

---

## 10. Testing Strategy

| Test Type | Framework | Coverage Target | What to test |
|---|---|---|---|
| Unit | Jest / Vitest | >80% per service | Service methods in isolation with mocked repositories and external services |
| Integration | Jest + NestJS Testing Module | Key flows | Controller → Service → TypeORM with in-memory SQLite or test Postgres |
| E2E | Jest + Supertest | Critical paths | Auth flow, order flow, wallet transfer flow — against real test DB |
| Load | Artillery or k6 | — | Simulate 500 concurrent buyers; wallet endpoint must handle 100 TPS |

> **Must-test Paths**: Priority E2E test cases: (1) Registration → PIN setup → Login → Add to cart → Checkout → Wallet deducted → Order placed. (2) Wallet transfer: sender balance decreases, receiver increases, 10% fee route. (3) Farmer uploads product → appears in buyer product list. (4) Order status change → WebSocket event received by buyer client. (5) Idempotency: duplicate wallet transfer returns same response, no double debit.

---

<p align="center"><em>— End of Backend Technical Architecture Document —</em></p>
