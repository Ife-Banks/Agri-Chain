# AI-SUCE Application Flow & User Flow Document

> **Version 1.0 · All User Roles · June 2026**

---

## 1. User Types & Entry Points

AI-SUCE has four distinct user types, each with a separate entry point and navigation structure. All mobile users enter through the GreenPurse app; their experience diverges after authentication based on their registered role.

| User Type | Platform | Entry Point | Primary Journey |
|---|---|---|---|
| Buyer / Consumer | GreenPurse Mobile | App download → Register/Login | Browse → Buy → Pay → Track |
| Farmer / Supplier | GreenPurse Mobile | App download → Register/Login (Farmer) | List products → Manage requests → Get paid |
| Store Manager | GreenSC Web | Web browser → Login | Monitor → Manage → Report |
| Super Administrator | Django Admin Panel | Web browser → `/admin/` login | Manage users → Upload products → Create wallets |

---

## 2. Buyer (Consumer) Flow

### 2.1 Onboarding & Authentication

| Step | Screen | Actions & Logic |
|---|---|---|
| 1 | Splash Screen | App loads, GreenPurse logo displayed. Auto-navigate to Onboarding after 2 seconds. |
| 2 | Onboarding | Value proposition screen ('Get your groceries delivered to your home'). CTA: 'Shop now'. Navigate to Login. |
| 3a | Login | Input: Phone Number or Email + Password. Options: Login button, Fingerprint biometric login, 'Forgot Password?' link, 'Register' link. |
| 3b | Registration | Input: Username, Email, Phone Number, Password, Confirm Password. CTA: Register. Navigate to PIN Setup. |
| 4 | PIN Setup | Set 4-digit transaction PIN. Numpad interface. Used to confirm all wallet transactions. |
| 5 | Biometric Setup | Optional: Enable Touch ID / fingerprint for future logins. Toggle switch. Skip option available. |
| 6 | Home Screen | Auth complete. Navigate to Marketplace Home. |

### 2.2 Marketplace Browsing & Product Discovery

| Step | Screen | Actions & Logic |
|---|---|---|
| 7 | Home | Displays: greeting + address selector, promotional banner (e.g. 'Ramadan Offers, Get 25%'), category icons (Fruits/Vegetables/Diary/Meat + 'See all'), Best Selling grid. Bottom nav: Home \| Grid \| Cart \| Orders \| Profile. |
| 8 | Category View | Tap category icon → grid of products with image, name, price/kg, '+' add button. |
| 9 | Search | Tap search bar → Search screen shows: search input, Recent Searches (chips), Trending Now grid. Typing → navigates to Search Results. |
| 10 | Search Results | Shows 'Showing Result for X', product grid with filter icon. Tap product → Product Detail. |
| 11 | Product Detail | Full screen: product image, name, price/kg, quantity selector (−/+), description, badges: Organic %, Expiry date, Star rating + review count, Kcal per gram. CTA: 'Add to cart'. Tap store icon → store info. |

### 2.3 Cart & Checkout

| Step | Screen | Actions & Logic |
|---|---|---|
| 12 | Cart | Lists cart items (image, name, price, quantity −/+). Section: 'Before you Checkout' (recommended items). Coupon code input. Price breakdown: Item Total, Discount, Delivery Fee (Free or calculated), Grand Total. Delivery address summary with 'Change' link. CTA: 'Checkout ($X,XXX)'. |
| 13 | Address Selection | Map view with pin drop. Address confirmation input field. CTA: 'Confirm Address'. |
| 14 | Order Summary | Final review: Item details list (product, kg, qty), Delivery Address, Price Summary (Item Total, Discount, Delivery Fee, Grand Total). CTA: 'Pay Now'. |
| 15 | Payment | Routes to GreenPurse Wallet payment flow (see Section 2.4). On success → Order Confirmed screen. |

### 2.4 Order Tracking

| Step | Screen | Actions & Logic |
|---|---|---|
| 16 | Order Tracking Map | Real-time map showing delivery route. Status tabs: 'Order placed' \| 'On the way' \| 'Delivered'. Shows: Delivery agent name + avatar + chat/call buttons, Store name, Buyer address, ETA counter. |
| 17 | Delivery Confirmation | Status transitions to 'Delivered'. Order marked complete. Review prompt may appear. |

### 2.5 GreenPurse Wallet Flow

| Step | Screen / Action | Details |
|---|---|---|
| W1 | Wallet Dashboard | Greeting, virtual card display (masked number, cardholder name, balance, expiry). Action shortcuts: Transfer \| Deposit \| Withdraw \| Invest. Settings: Freeze card, Settings. Recent Transactions list. Quick Links. |
| W2a | Send — Pay via Green Purse | Select recipient's Green Purse account. Enter amount (numpad). Confirm with PIN. Send money. |
| W2b | Send — Bank Account Transfer | Select bank (dropdown). Enter account number → 'Verifying beneficiary...'. Toggle: Save as Beneficiary, Schedule Transfer. CTA: Continue. |
| W2c | Send — By Phone Number | Send money to contacts list. Pick contact → amount → confirm. |
| W2d | Send — Scan to Pay | Two tabs: 'My Code' (displays own QR) \| 'Scan Code' (camera scanner). Scan merchant QR to initiate payment. |
| W3 | Receive | Displays account number with copy/share option. Recipient shares this for incoming transfers. |
| W4 | Currency Transfer | USD/NGN conversion view. Enter USD amount → NGN equivalent auto-calculated. Exchange rate + VAT shown. CTA: Continue. |
| W5 | Invest | Routes to MyVirtualFarm module (see Section 4). |

---

## 3. Farmer Flow

### 3.1 Authentication (Same App, Different Role)

The Farmer uses the same GreenPurse mobile app as the Buyer. During registration, the user selects 'Farmer' as their account type. The authentication screens (registration form, PIN setup, biometric setup) are identical. Post-login, the app renders a Farmer-specific navigation and dashboard.

> **Design Gap:** The Farmer home dashboard, product upload, and service request screens are described below based on the 'How It Works' documentation. These screens are NOT yet fully mocked up. They must be designed and approved before implementation begins.

### 3.2 Core Farmer Journeys

| Journey | Flow Description |
|---|---|
| List a Product | Farmer Dashboard → 'Upload Product' → Form (title, description, store/category, price/kg, stock, condition, images) → Submit → Product goes live on marketplace (pending admin approval or auto-publish) |
| Request Warehousing | Dashboard → 'Request Warehousing' → Select produce type, volume, preferred date/location → Submit → Platform confirms cooling unit availability |
| Request Logistics | Dashboard → 'Request Logistics' → Enter pickup location, destination, volume → Submit → Platform assigns IoT-tracked vehicle |
| Request Financial Aid | Dashboard → 'Financial Aids & Support' → Fill application form (farm details, amount needed, purpose) → Submit → Review by admin |
| Monitor Market Prices | Dashboard → 'Real-time Market' → Live price chart for chosen commodities → Set price alert threshold |
| Rent Machinery / Buy Inputs | Dashboard → 'Agro-allied' → Browse machinery/inputs → Book or purchase → Payment via GreenPurse wallet |
| Monitor Sales | Dashboard → 'My Sales' → List of orders, revenue, pending deliveries, logistics status |
| Access Wallet | Same GreenPurse wallet as Buyer (Section 2.5) — farmers receive payment for sold produce here |

---

## 4. Store Manager Flow (GreenSC Web App)

### 4.1 Authentication

| Step | Screen | Actions & Logic |
|---|---|---|
| 1 | Login Page | Email + Password. Staff accounts only (not public registration). Redirect to Dashboard on success. |

### 4.2 Main Navigation & Module Flows

| Nav Item | Flow & Key Actions |
|---|---|
| Home / Dashboard | View KPIs → Click Payment Tracking → Select project → View payment status chart. View vendor breakdown donut. Monitor forex need and receivables. Scan top supplier payments. Review inventory and tools condition. |
| Project | View project cards → Search project by name → Click card → View project details (client, managers, deadline, team members, progress). Pagination through projects. |
| Products | View product catalogue → Add new product → Edit existing product → Manage stock levels. |
| Suppliers | Browse suppliers (tabs: by Supplier / Manufacturer / Country / Solutions) → Search → Add Supplier → View supplier capability tags. |
| Sourcing | Navigate to PA Summary → Select AMU → View order table (status, description, BoQ cost, final cost, batch name, supplier, profit flag) → Drill into order detail. |
| Payment | Select sub-module: Forex Approval → review and approve/reject forex requests. Forex Planning → plan currency needs. Supplier Payment → process payments. Payment Collection → track incoming. Variance Analysis → compare planned vs actual. Payment Request Form → raise new requests. Guarantee Preparation → prepare bank guarantees. Aging → view overdue items. |
| Logistics | Open Logistics → Documents → Select Project → View: Active Batch / Missed Item / Delivered Batch / RMA. Drill into each for batch details and tracking events. |
| Documents | View BDU-DCF document grid → Each card shows document count and active status → Click 'View more' → Document detail list. |
| Inventory | View inventory levels → Update stock conditions (New / Used-Good / Used-Poor / Damaged / Under Maintenance). |
| Reports | Set filters (time: Weekly/Quarterly/Yearly; type: Sourcing/Logistics/Finance; country, supplier, batch, payment) → View table (Order Name, BoQ Cost, Final Cost, Profit/Loss, ETA, Supplier, Manufacturer, Total Cost) → Download Report. |
| Clients | View and manage client records. |
| Settings | User preferences, account settings. |

---

## 5. MyVirtualFarm (Investment) Flow

MyVirtualFarm is a tab/section within the GreenPurse mobile app, accessible to both Buyers and Farmers. It functions as an agro-commodity investment and trading platform.

| Step | Screen | Actions & Logic |
|---|---|---|
| 1 | Portfolio Home | Account value display + P&L line chart. Alert banner for incomplete profile. 'Make a deposit' CTA. Sections: My Positions (active investments with P&L per commodity), My Watchlist (commodities being tracked with current price + trend). |
| 2 | Commodity Detail | Tap any commodity (e.g. Cocoa) → Detail screen: commodity icon, current price, price change %, time selector (1D/1W/1M/1Y/5Y), interactive price chart. CTA buttons: Buy \| Sell. |
| 3 | Buy Flow | Tap 'Buy' → Enter investment amount (numpad) → Review: commodity, amount, current price, projected units → Confirm with PIN → Success screen → Position added to portfolio. |
| 4 | Sell Flow | Tap 'Sell' → Select position → Enter units to sell → Review: proceeds, P&L impact → Confirm → Funds credited to GreenPurse Wallet. |
| 5 | Watchlist Management | Tap '+' on Watchlist → Browse commodity list → Add to watchlist → Monitor price movements. |
| 6 | Deposit to Trade | Tap 'Make a deposit' → Routes to GreenPurse Wallet deposit flow → On success, MyVirtualFarm balance updated. |

---

## 6. Super Administrator Flow (Django Admin Panel)

The Super Admin accesses the system via the Django administration dashboard. This is a staff-only interface, not accessible to regular users.

| Task | Flow |
|---|---|
| Login | Navigate to `/admin/login` → Enter staff username + password → Access GreenPurseBackEnd Administration Dashboard |
| Manage Users | Authentication > Users → View list filtered by role (Admin/Farmer/Agric Enterprise/Farm Customer) → Add/Edit/Deactivate users → Assign roles |
| Upload Products (Admin-side) | Commerce > Products > Add Product → Fill: Title, Description, StoreId, Category, Price, Kilogram, Stock, Condition → Save → Product visible in mobile app |
| Manage Categories & Stores | Commerce > Categories \| Stores → Add/Edit/Delete → Changes reflected in mobile app immediately |
| Create Wallets | Payment > Wallets > Add Wallet → Assign to User, set Balance, Account name, Account number, Bank, Phone → Save |
| Manage Auth Tokens | Auth Token > Tokens → View/Revoke active session tokens for any user → Force logout |
| OTP Device Management | OTP_HOTP or OTP_STATIC > Devices → View registered 2FA devices per user → Remove if needed |
| Upload Files | Commerce > File uploads → Attach images or documents to products or farm profiles |
| Cart Oversight | Commerce > Carts / Cart Items → View and manage active shopping carts if needed for support |

---

## 7. Cross-Cutting Flows

### 7.1 Notification Flow

- Order status change → Push notification to Buyer (via FCM)
- Weather alert triggered → Push notification to Farmer
- Pest alert triggered → Push notification to Farmer
- Price threshold reached → Push notification to user who set alert
- Payment received → In-app notification + wallet balance update
- Delivery agent assigned → Push notification to Buyer with agent name

### 7.2 Payment Fee Deduction Flow

1. Buyer initiates payment of X amount.
2. API calculates platform fee: **10% of X**.
3. Net amount (90% of X) transferred to Farmer's GreenPurse wallet.
4. 10% credited to platform revenue ledger.
5. Transaction logged with: timestamp, buyer ID, farmer ID, amount, fee, idempotency key.
6. Both parties receive transaction notification.

### 7.3 Farmer Product Listing to Buyer Feed Flow

1. Farmer submits product via mobile app (or Admin uploads via Django panel).
2. Product record created in database with status 'Pending' or 'Active'.
3. AI matchmaking service indexes the new product.
4. On next buyer home refresh or real-time push, relevant buyers see the product in their feed.
5. Buyer can search, browse, or receive AI-curated recommendation.

---

<p align="center"><em>— End of Application Flow Document —</em></p>
