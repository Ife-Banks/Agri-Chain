# AI-SUCE Deployment Guide

Deploy the backend and all 4 frontends independently on any hosting platform.

---

## Architecture at a Glance

| App | Port (dev) | Repo path | Production URL (example) |
|---|---|---|---|
| API (NestJS) | 4000 | `apps/api/` | `https://api.yourdomain.com` |
| GreenPurse (Next.js) | 3000 | `apps/web-greenpurse/` | `https://greenpurse.yourdomain.com` |
| GreenSC (Next.js) | 3001 | `apps/web-greensc/` | `https://greensc.yourdomain.com` |
| Web Admin (Next.js) | 3002 | `apps/web-admin/` | `https://admin.yourdomain.com` |
| MyVirtualFarm (Next.js) | 3003 | `apps/web-virtualfarm/` | `https://virtualfarm.yourdomain.com` |

---

## 1. Prepare Environment Files

Each app has its own `.env.example`. Copy it to `.env.local` (or `.env` for the API) and fill in values.

```bash
# Backend
cp apps/api/.env.example apps/api/.env

# Frontends
cp apps/web-greenpurse/.env.example apps/web-greenpurse/.env.local
cp apps/web-greensc/.env.example apps/web-greensc/.env.local
cp apps/web-admin/.env.example apps/web-admin/.env.local
cp apps/web-virtualfarm/.env.example apps/web-virtualfarm/.env.local
```

### Key Variables per App

**`apps/api/.env`** (required for production):
```
NODE_ENV=production
PORT=4000
JWT_SECRET=<min 32-char random string>
DATABASE_URL=postgresql://user:pass@your-db-host:5432/aisuce
REDIS_URL=redis://user:pass@your-redis-host:6379
PAYSTACK_SECRET_KEY=sk_live_...
PAYSTACK_WEBHOOK_SECRET=<your paystack webhook secret>
STORAGE_PROVIDER=local   # or cloudinary or s3
CLOUDINARY_CLOUD_NAME=    # if cloudinary
CLOUDINARY_API_KEY=      # if cloudinary
CLOUDINARY_API_SECRET=   # if cloudinary
AWS_REGION=               # if s3
AWS_S3_BUCKET=            # if s3
AWS_ACCESS_KEY_ID=        # if s3
AWS_SECRET_ACCESS_KEY=    # if s3
CORS_ORIGINS=https://greenpurse.yourdomain.com,https://greensc.yourdomain.com,https://admin.yourdomain.com,https://virtualfarm.yourdomain.com
```

**`apps/web-greenpurse/.env.local`** (example):
```
NEXT_PUBLIC_API_URL=https://api.yourdomain.com/api/v1
NEXT_PUBLIC_MAPBOX_TOKEN=pk.eyJ1...
NEXT_PUBLIC_APP_URL=https://greenpurse.yourdomain.com
NODE_ENV=production
PORT=3000
```

Same pattern applies for `web-greensc`, `web-admin`, and `web-virtualfarm` — only `NEXT_PUBLIC_APP_URL` and `PORT` change per app.

---

## 2. Build Each App

```bash
# From repo root
pnpm install

# Build backend
pnpm --filter @aisuce/api build

# Build frontends (all or selective)
pnpm --filter @aisuce/web-greenpurse build
pnpm --filter @aisuce/web-greensc build
pnpm --filter @aisuce/web-admin build
pnpm --filter @aisuce/web-virtualfarm build
```

Built output lands in `apps/*/app/` (Next.js) and `apps/api/dist/` (NestJS).

---

## 3. Deploy the Backend

### Option A — Railway (Recommended for simplicity)

1. Create a new Railway project
2. Add a PostgreSQL database (Railway auto-provides `DATABASE_URL`)
3. Add a Redis instance (or use Upstash Redis)
4. Deploy from GitHub — set root to `apps/api`
5. Add environment variables from `apps/api/.env.example`
6. Railway auto-detects NestJS and runs `node dist/main`

### Option B — Render

1. Create a **Web Service**
2. Build command: `pnpm install && pnpm --filter @aisuce/api build`
3. Start command: `node apps/api/dist/main.js`
4. Add all env vars from `apps/api/.env.example`
5. Scale to 1+ instance

### Option C — Docker

```dockerfile
# apps/api/Dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN corepack enable && pnpm install --frozen-lockfile
COPY apps/api ./apps/api
RUN pnpm --filter @aisuce/api build
EXPOSE 4000
CMD ["node", "apps/api/dist/main.js"]
```

```bash
docker build -f apps/api/Dockerfile . -t aisuce-api
docker run -p 4000:4000 --env-file apps/api/.env aisuce-api
```

### Option D — VPS (DigitalOcean, Linode, etc.)

```bash
# SSH into your server
# Install Node 20, PostgreSQL 16, Redis 7
# Clone repo
git clone https://github.com/your-org/AgriChain-AI.git
cd AgriChain-AI
pnpm install --frozen-lockfile

# Set env
cp apps/api/.env.example apps/api/.env
nano apps/api/.env   # fill in PRODUCTION values

# Build
pnpm --filter @aisuce/api build

# Run with PM2
npm install -g pm2
pm2 start apps/api/dist/main.js --name aisuce-api
pm2 startup   # generates systemd init script
pm2 save
```

### Backend Health Check
After deploying, verify:
```
GET https://api.yourdomain.com/api/v1/health
```

---

## 4. Deploy Each Frontend

Each Next.js app can be deployed to **Vercel**, **Netlify**, **Railway**, or any static hosting.

### Option A — Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy each app (run from repo root)
cd apps/web-greenpurse
vercel --prod --env-file=../../apps/web-greenpurse/.env.local

cd ../web-greensc
vercel --prod --env-file=../../apps/web-greensc/.env.local

# ... repeat for web-admin and web-virtualfarm
```

Or connect each app's GitHub repo to Vercel and set:
- **Root directory:** `apps/web-greenpurse`
- **Build command:** `pnpm install && pnpm build`
- **Output directory:** `apps/web-greenpurse/.next`
- **Environment variables:** copy from `.env.example`

### Option B — Docker + Nginx (VPS)

```dockerfile
# apps/web-greenpurse/Dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN corepack enable && pnpm install --frozen-lockfile
COPY apps/web-greenpurse ./apps/web-greenpurse
RUN pnpm --filter @aisuce/web-greenpurse build

FROM nginx:alpine
COPY --from=builder /app/apps/web-greenpurse/.next /usr/share/nginx/html
COPY apps/web-greenpurse/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 3000
CMD ["nginx", "-g", "daemon off;"]
```

```nginx
# apps/web-greenpurse/nginx.conf
server {
  listen 3000;
  root /usr/share/nginx/html;
  location / {
    try_files $uri $uri/ /index.html;
  }
  location /api {
    proxy_pass http://api.yourdomain.com;
  }
}
```

### Option C — PM2 + Nginx (VPS, no Docker)

```bash
# Build on server
cd apps/web-greenpurse
pnpm install && pnpm build
pm2 start apps/web-greenpurse/node_modules/.bin/next start apps/web-greenpurse --name greenpurse-web
```

---

## 5. Domain & HTTPS Setup

| Service | subdomain | Points to |
|---|---|---|
| API | `api.yourdomain.com` | Backend server/container |
| GreenPurse | `greenpurse.yourdomain.com` | Frontend 1 |
| GreenSC | `greensc.yourdomain.com` | Frontend 2 |
| Admin | `admin.yourdomain.com` | Frontend 3 |
| VirtualFarm | `virtualfarm.yourdomain.com` | Frontend 4 |

**DNS:** Create A records or CNAMEs in your DNS provider pointing each subdomain to your server IP (for VPS) or to Vercel/Railway's deployment URL.

**HTTPS:** All major platforms (Railway, Render, Vercel) auto-provision SSL. On a VPS, use **Certbot**:
```bash
sudo certbot --nginx -d api.yourdomain.com -d greenpurse.yourdomain.com -d greensc.yourdomain.com
```

**Nginx (VPS):** Proxy `/api` requests to the NestJS backend, serve frontends from disk:
```nginx
server {
    listen 80;
    server_name greenpurse.yourdomain.com;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl;
    server_name greenpurse.yourdomain.com;
    ssl_certificate /etc/letsencrypt/live/greenpurse.yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/greenpurse.yourdomain.com/privkey.pem;

    root /var/www/greenpurse;
    try_files $uri $uri/ /index.html;

    location /api/ {
        proxy_pass http://127.0.0.1:4000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

---

## 6. Paystack Webhook (Production)

1. Go to https://dashboard.paystack.com → Webhooks
2. Add: `https://api.yourdomain.com/api/v1/wallet/deposit/webhook`
3. Copy the webhook signing secret to `PAYSTACK_WEBHOOK_SECRET`

---

## 7. CORS Configuration (Production)

In `apps/api/.env`, set:
```
CORS_ORIGINS=https://greenpurse.yourdomain.com,https://greensc.yourdomain.com,https://admin.yourdomain.com,https://virtualfarm.yourdomain.com
```

This is read at startup — restart the API after changing it.

---

## 8. Database Migrations (First Deploy)

```bash
# SSH into your server
cd AgriChain-AI
npx nx run api:migration:run   # if using nx
# OR
cd apps/api && npx typeorm migration:run -d dist/config/data.source.js
```

For subsequent deploys, TypeORM entities use `synchronize: true` in development. For production, generate and run migrations:
```bash
npx typeorm migration:generate -d src/config/data.source.ts AddSomeField
npx typeorm migration:run -d dist/config/data.source.js
```

---

## 9. CI/CD with GitHub Actions

```yaml
# .github/workflows/deploy.yml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy-api:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'pnpm'
      - run: pnpm install --frozen-lockfile
      - run: pnpm --filter @aisuce/api build
      - run: |
          # Deploy to Railway/Render/VPS here
          # Example for Railway:
          # npm install -g railway
          # railway up

  deploy-frontends:
    needs: deploy-api
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'pnpm'
      - run: pnpm install --frozen-lockfile
      - run: pnpm --filter @aisuce/web-greenpurse build
      - uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID_GREENPURSE }}
          working-directory: apps/web-greenpurse
```

---

## Quick Checklist

- [ ] Copy `.env.example` → `.env` for each app
- [ ] Fill in all required values (especially `JWT_SECRET`, `DATABASE_URL`, `REDIS_URL`, `PAYSTACK_*`)
- [ ] Point `CORS_ORIGINS` to production frontend URLs
- [ ] Update `NEXT_PUBLIC_API_URL` in each frontend to production backend URL
- [ ] Set up SSL certificates
- [ ] Configure Paystack webhook for production
- [ ] Run database migrations on first deploy
- [ ] Restart backend after env changes