# AI-SUCE Web Admin Dashboard

A modern, feature-rich admin dashboard built with Next.js 14, React, TypeScript, and state-of-the-art UI components.

## Features

### 🎨 Modern UI/UX
- **Responsive Design**: Fully responsive layout that works on all devices
- **Smooth Animations**: Page transitions and micro-interactions powered by Framer Motion
- **Dark/Light Theme Support**: Built-in theme system using CSS variables
- **Modern Components**: Shadcn-inspired UI components from @aisuce/ui

### 📊 Dashboard
- **Metrics Cards**: Key performance indicators with trend indicators
- **Interactive Charts**: Revenue, user growth, and sales analytics using Recharts
- **Recent Activity**: Real-time activity feed
- **Data Visualization**: Bar charts, line charts, and pie charts

### 👥 User Management
- **User Table**: Sortable, searchable data table with pagination
- **CRUD Operations**: Create, read, update, and delete users
- **Bulk Actions**: Select and delete multiple users
- **Status Management**: Track user status (Active, Inactive, Pending)
- **Role Management**: Admin, User, and Moderator roles

### 📦 Product Management
- **Product Inventory**: Manage product catalog
- **Stock Tracking**: Real-time stock level monitoring
- **Category Organization**: Products organized by category
- **Price Management**: Update product pricing
- **Status Control**: Active, Inactive, and Out of Stock statuses

### 🛒 Order Management
- **Order Tracking**: Track and manage customer orders
- **Status Updates**: Update order status (Pending, Processing, Shipped, Delivered, Cancelled)
- **Filtering**: Filter orders by status
- **Customer Info**: View customer details and order history

### 📈 Analytics
- **Revenue Trends**: Track revenue over time
- **Customer Analytics**: New vs returning customers
- **Product Performance**: Top-performing products
- **Order Volume**: Order volume trends
- **Key Metrics**: Conversion rates, average order value, customer satisfaction

### ⚙️ Settings
- **General Settings**: Site configuration
- **Profile Management**: Update admin profile
- **Security Settings**: Password management and 2FA
- **Notification Preferences**: Email, push, and SMS notifications

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: CSS Variables + Tailwind CSS
- **UI Components**: @aisuce/ui (Shadcn-inspired)
- **State Management**: Zustand
- **Data Fetching**: React Query (@tanstack/react-query)
- **HTTP Client**: Axios
- **Animations**: Framer Motion
- **Charts**: Recharts
- **Forms**: React Hook Form + Zod

## Project Structure

```
apps/web-admin/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── dashboard/         # Dashboard page
│   │   ├── users/             # User management
│   │   ├── products/          # Product management
│   │   ├── orders/            # Order management
│   │   ├── analytics/         # Analytics page
│   │   ├── settings/          # Settings page
│   │   ├── layout.tsx         # Root layout
│   │   └── page.tsx           # Home page
│   ├── components/            # React components
│   │   ├── AdminLayout.tsx    # Main layout with sidebar
│   │   └── Providers.tsx      # React Query provider
│   ├── hooks/                 # Custom React hooks
│   │   ├── useUsers.ts        # User data fetching
│   │   ├── useProducts.ts     # Product data fetching
│   │   └── useOrders.ts       # Order data fetching
│   ├── lib/                   # Utility libraries
│   │   └── api.ts             # API client configuration
│   └── store/                 # State management
│       └── adminStore.ts      # Zustand store
├── package.json
├── tsconfig.json
└── next.config.js
```

## Getting Started

### Prerequisites

- Node.js 18+ installed
- npm or yarn package manager

### Installation

1. Navigate to the web-admin directory:
```bash
cd apps/web-admin
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
Create a `.env.local` file in the root directory:
```env
NEXT_PUBLIC_API_URL=http://localhost:4000
```

### Running the Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:3003`

### Building for Production

```bash
npm run build
npm start
```

## API Integration

The application is configured to work with a backend API. Update the `NEXT_PUBLIC_API_URL` environment variable to point to your API endpoint.

### API Endpoints

- `GET /users` - Get all users
- `POST /users` - Create a new user
- `PUT /users/:id` - Update a user
- `DELETE /users/:id` - Delete a user

- `GET /products` - Get all products
- `POST /products` - Create a new product
- `PUT /products/:id` - Update a product
- `DELETE /products/:id` - Delete a product

- `GET /orders` - Get all orders
- `POST /orders` - Create a new order
- `PUT /orders/:id` - Update an order
- `DELETE /orders/:id` - Delete an order

## State Management

The application uses Zustand for global state management. The store includes:

- Users state and actions
- Products state and actions
- Orders state and actions
- Sidebar collapse state
- Current user state

## Data Fetching

React Query is used for server state management with:

- Automatic caching and refetching
- Optimistic updates
- Loading and error states
- Pagination support

## Styling

The application uses CSS variables for theming. Update the token files in `@aisuce/ui/src/tokens/` to customize:

- Colors
- Typography
- Spacing
- Border radius
- Shadows

## Components

The application uses components from the `@aisuce/ui` workspace package:

- Button
- Input
- Card
- Badge
- Alert
- MetricCard
- Sidebar
- Header
- DataTable
- Toast

## Performance Optimizations

- Code splitting with Next.js App Router
- Image optimization with Next.js Image component
- Lazy loading for heavy components
- React Query caching to reduce API calls
- Framer Motion for smooth animations

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Contributing

1. Create a feature branch
2. Make your changes
3. Test thoroughly
4. Submit a pull request

## License

Copyright © 2024 AI-SUCE. All rights reserved.
