# AI-SUCE Design System

> **Visual Language, Component Library & Usage Guidelines**
>
> Version 1.0 · Applies to: GreenPurse Web · GreenSC Web · MyVirtualFarm

---

## 1. Overview & Principles

The AI-SUCE Design System is the single source of truth for all visual and interaction decisions across the three web applications: GreenPurse (buyer and farmer), GreenSC (store manager), and MyVirtualFarm (investment). It lives in the monorepo at `packages/ui/` and is consumed by all Next.js apps. Every token, component, and pattern documented here must be used as specified — no one-off overrides in application code.

### 1.1 Design Principles

| Principle | What it means in practice |
|---|---|
| **Clarity first** | Information hierarchy is always legible. No decoration competes with data. Farmers on 3G should read prices and status as fast as managers on fiber. |
| **Trust through consistency** | Every app feels like one product. Same tokens, same component behaviour, same interaction patterns. Users who learn GreenPurse immediately understand GreenSC. |
| **Green means action** | The primary brand green (#1A6B3A) is reserved exclusively for primary actions, active states, and positive values. Never use it decoratively. |
| **Accessible by default** | WCAG AA minimum contrast on all text. Focus rings on all interactive elements. Screen-reader labels on all icon-only buttons. |
| **Mobile-first, web-first now** | Components are designed for a minimum 320px viewport but optimised at 1280px. The current web build is the MVP; mobile-native follows. |

---

## 2. Brand Identity

### 2.1 Logos & App Marks

| App | Mark | Primary Usage | Background Rule |
|---|---|---|---|
| **GreenPurse** | Green leaf + purse/card icon | Mobile app splash, web navbar, favicon | Use on white or brand-green backgrounds only |
| **GreenSC** | Green SC leaf mark | Sidebar top, web tab favicon | Use on dark sidebar (#1A202C) or white |
| **AI-SUCE (parent)** | GreenSC + GreenPurse lockup | Proposals, print, presentations | Never stretch, rotate, or recolor |

### 2.2 Brand Voice

| Dimension | Tone | Example copy |
|---|---|---|
| Headlines | Confident, active | "Get fresh produce delivered to your door" |
| CTAs | Direct, verb-first | Add to cart · Pay now · Upload product · Track order |
| Errors | Honest, never blame user | "Payment declined — please check your wallet balance and retry" |
| Success | Warm, specific | "₦22,000 sent to Amelia's Green Purse wallet" |
| Empty states | Helpful, action-oriented | "No products listed yet — upload your first harvest" |

---

## 3. Colour System

All colours are defined as CSS custom properties in `packages/ui/tokens/colors.css` and extended into the Tailwind config. Never hardcode hex values in component or application code — always reference the token.

### 3.1 Brand Green Scale

> **Usage Rule**: The 600 stop (#1A6B3A) is the only fill permitted for primary buttons and active navigation items. The 50 stop (#E8F5EC) is used for hover backgrounds, tint fills, and light badges. Never use any other green stop for interactive elements.

| Token | Hex | Stop | Usage |
|---|---|---|---|
| `--color-green-50` | `#E8F5EC` | 50 | Tint backgrounds, light badges, hover states |
| `--color-green-100` | `#C6E6CE` | 100 | Subtle borders on green surfaces |
| `--color-green-200` | `#8ECFA0` | 200 | Disabled primary button background |
| `--color-green-400` | `#2D8A50` | 400 | Hover state on primary button |
| `--color-green-600` | `#1A6B3A` | 600 | **PRIMARY** — buttons, active nav, key brand moments |
| `--color-green-800` | `#0F4A28` | 800 | Pressed/active primary button, sidebar background hover |
| `--color-green-900` | `#062D18` | 900 | Dark sidebar text on deep green backgrounds |

### 3.2 Semantic Colours

| Semantic Role | Token | Hex | When to use |
|---|---|---|---|
| Success / Positive | `--color-success` | `#1A6B3A` | Delivered, confirmed, profit, active |
| Warning / Caution | `--color-warning` | `#D97706` | Pending, in transit, near expiry |
| Danger / Loss | `--color-danger` | `#DC2626` | Failed, overdue, loss, destructive action |
| Informational | `--color-info` | `#1E40AF` | Processing, neutral alerts, forex/exchange |
| Investment / Gain | `--color-invest` | `#2D8A50` | MyVirtualFarm profit, positive P&L |

### 3.3 Neutral Scale (Surfaces & Text)

| Token | Hex | Usage |
|---|---|---|
| `--color-bg-page` | `#F7F9FB` | Page background for all three apps |
| `--color-bg-surface` | `#FFFFFF` | Cards, modals, dropdowns, form fields |
| `--color-bg-subtle` | `#F0F4F8` | Metric tiles, table header rows, secondary panels |
| `--color-border-default` | `#CBD5E0` | Default border on all components |
| `--color-border-strong` | `#A0AEC0` | Hover and focused borders |
| `--color-text-primary` | `#2D3748` | Body copy, data values, headings |
| `--color-text-secondary` | `#718096` | Labels, captions, placeholders, hints |
| `--color-text-disabled` | `#CBD5E0` | Disabled inputs and ghost text |
| `--color-dark-sidebar` | `#1A202C` | GreenSC sidebar background |

### 3.4 Dark Mode

> Dark mode is implemented via CSS custom property overrides in a `[data-theme='dark']` selector. All three apps toggle this class on the `<html>` element via a user preference stored in localStorage. Component code never checks for dark mode — it only uses tokens. The token layer handles the swap. Dark mode token overrides are defined in `packages/ui/tokens/dark.css` and documented in the Storybook addon.

---

## 4. Typography System

### 4.1 Font Stack

| Role | Font Family | Variable Token | Fallback |
|---|---|---|---|
| Primary (UI) | DM Sans | `--font-sans` | `system-ui, sans-serif` |
| Monospace (prices, codes) | JetBrains Mono | `--font-mono` | `'Courier New', monospace` |
| Serif (editorial, rare) | Lora | `--font-serif` | `Georgia, serif` |

> **Monospace Usage**: All monetary values (₦ and $ amounts), account numbers, wallet balances, transaction IDs, and order numbers must use `--font-mono`. This prevents layout jitter when values update, and makes numbers scannable in tables and dashboards. Example: `font-family: var(--font-mono)`.

### 4.2 Type Scale

| Name | Size | Weight | Line Height | Token | Usage |
|---|---|---|---|---|---|
| Display | 32px | 500 | 1.2 | `--text-display` | Hero sections, splash screens |
| H1 | 24px | 500 | 1.3 | `--text-h1` | Page titles |
| H2 | 18px | 500 | 1.4 | `--text-h2` | Section headers |
| H3 | 15px | 500 | 1.5 | `--text-h3` | Card titles, sub-sections |
| Body | 14px | 400 | 1.7 | `--text-body` | All body copy |
| Small | 13px | 400 | 1.6 | `--text-sm` | Secondary info, table cells |
| Caption | 12px | 400 | 1.5 | `--text-caption` | Timestamps, hints, meta |
| Overline | 11px | 500 | 1.4 | `--text-overline` | Metric labels (uppercase) |

---

## 5. Spacing, Layout & Grid

### 5.1 Spacing Scale

Base unit: 4px. All spacing values are multiples of 4. Use the token — never arbitrary pixel values in component or layout code.

| Token | Value | Tailwind Class | Usage |
|---|---|---|---|
| `--space-1` | 4px | `p-1 / gap-1` | Icon internal padding, inline gap between icon and label |
| `--space-2` | 8px | `p-2 / gap-2` | Gap between closely related elements (badge + text) |
| `--space-3` | 12px | `p-3 / gap-3` | Table cell padding, tight card internal spacing |
| `--space-4` | 16px | `p-4 / gap-4` | Standard card padding, form field gap |
| `--space-6` | 24px | `p-6 / gap-6` | Gap between card groups, section margin |
| `--space-8` | 32px | `p-8 / gap-8` | Section breaks, large layout gaps |
| `--space-12` | 48px | `p-12 / gap-12` | Page-level top/bottom padding |
| `--space-16` | 64px | `p-16 / gap-16` | Hero sections, full-page vertical rhythm |

### 5.2 Border Radius

| Token | Value | Tailwind | Usage |
|---|---|---|---|
| `--radius-sm` | 4px | `rounded` | Badges, status chips, small pills |
| `--radius-md` | 8px | `rounded-lg` | Buttons, input fields, dropdowns |
| `--radius-lg` | 12px | `rounded-xl` | Cards, modals, panels |
| `--radius-xl` | 20px | `rounded-2xl` | Filter chips, nav pills, large tags |
| `--radius-full` | 9999px | `rounded-full` | Avatars, toggle tracks, circular icon buttons |

### 5.3 Layout Grid

| Context | Grid | Gutter | Max Width |
|---|---|---|---|
| GreenPurse (buyer/farmer) | 12 columns | 16px | 1280px |
| GreenSC (with sidebar) | 10 columns (content area) | 24px | Fluid (sidebar: 240px fixed) |
| MyVirtualFarm | 12 columns | 16px | 1280px |
| Mobile (320px–767px) | 4 columns | 12px | 100% |

---

## 6. Component Library

All components live in `packages/ui/src/components/`. Each is a React functional component written in TypeScript with prop types defined via TypeScript interfaces. Every component has a Storybook story in `packages/ui/src/stories/` and a Vitest unit test. Components are exported from `packages/ui/src/index.ts`.

### 6.1 Button

#### Variants

| Variant | Class / Prop | Fill | Text | Border | Usage |
|---|---|---|---|---|---|
| Primary | `variant='primary'` | `#1A6B3A` | White | None | Main CTA — one per screen |
| Secondary | `variant='secondary'` | Transparent | `#1A6B3A` | 1.5px green | Secondary actions |
| Ghost | `variant='ghost'` | Transparent | Muted | 0.5px border | Tertiary, cancel, dismiss |
| Danger | `variant='danger'` | `#DC2626` | White | None | Delete, destructive only |
| Link | `variant='link'` | None | `#1A6B3A` | None (underline) | Inline text actions |

#### Sizes

| Size | Prop | Padding | Font Size | Icon Size | Min Width |
|---|---|---|---|---|---|
| Small | `size='sm'` | 6px 12px | 13px | 14px | None |
| Default | `size='md'` | 9px 18px | 14px | 16px | 80px |
| Large | `size='lg'` | 13px 28px | 16px | 18px | 120px |
| Full Width | `fullWidth` | (same) | (same) | (same) | 100% |

#### States

| State | Visual Change | Behaviour |
|---|---|---|
| Default | As specified above | Clickable |
| Hover | Primary: darken to #2D8A50. Others: subtle bg tint | Cursor pointer |
| Pressed/Active | Scale(0.98), darken 10% | Held feedback |
| Loading | Text replaced by spinner icon + 'Loading…' (aria-label preserved) | `disabled` + `aria-busy=true` |
| Disabled | Opacity 0.4 | `disabled` attribute, `cursor: not-allowed` |
| Focus | 3px green focus ring (`box-shadow: 0 0 0 3px rgba(26,107,58,.2)`) | Tab navigation |

### 6.2 Input Field

| Prop / State | Border | Background | Notes |
|---|---|---|---|
| Default | 1px #CBD5E0 | White | Placeholder in `--color-text-secondary` |
| Focus | 1px #1A6B3A + green focus ring | White | Border color switches to brand green |
| Error | 1px #DC2626 + red focus ring | #FEF2F2 tint | Pairs with error message below |
| Disabled | 1px #CBD5E0 | #F7F9FB | Text at 40% opacity |
| With Icon (left) | — | — | Icon at 16px, left-pad 36px, icon color muted |
| With Icon (right) | — | — | Used for password toggle, clear button |

**Companion elements:**
- Label: 13px/500, `--color-text-primary`, 5px margin-bottom
- Hint text: 12px/400, `--color-text-secondary`, 4px margin-top
- Error message: 12px/400, `--color-danger`, 4px margin-top, paired with alert-circle icon
- Character count (optional): 12px, right-aligned below field, changes to red when over limit

### 6.3 Select & Dropdown

| Property | Value |
|---|---|
| Trigger | Same height and style as Input Field |
| Chevron icon | Right side, 16px, rotates 180° on open |
| Menu | White surface, 12px radius-lg, border default, max-height 240px with scroll |
| Option height | 36px, 12px horizontal padding |
| Option hover | `--color-bg-subtle` background |
| Selected option | Green checkmark right side, text in `--color-green-600` |

### 6.4 Card

| Variant | Background | Border | Radius | Padding | Shadow | Usage |
|---|---|---|---|---|---|---|
| Raised | White | 0.5px default | 12px | 20px | Subtle | Products, orders, suppliers |
| Metric | `--color-bg-subtle` | None | 8px | 16px | None | KPI tiles, dashboard stats |
| Flat | Transparent | 0.5px default | 12px | 20px | None | Contained info panels |
| Wallet | Brand green gradient | None | 12px | 20px | md | GreenPurse wallet display |
| Product | White | 0.5px default | 12px | 0 (image flush) | Subtle | Marketplace grid |

### 6.5 Badge & Status Chip

| Status | Background Token | Text Token | Icon |
|---|---|---|---|
| Active / Delivered / Success | `--color-green-50` | `--color-green-600` | `ti-check` |
| Pending / In Transit / Warning | `--color-amber-50` | `--color-warning` | `ti-clock` |
| Failed / Overdue / Danger | `--color-danger-light` | `--color-danger` | `ti-alert-circle` |
| Processing / Info | `--color-info-light` | `--color-info` | `ti-refresh` |
| Draft / Neutral | `--color-bg-subtle` | `--color-text-secondary` | `ti-file` |

### 6.6 Alert / Notification Banner

| Type | Left Border | Background | Text Colour | Icon |
|---|---|---|---|---|
| Success | 3px #1A6B3A | #E8F5EC | #14532D | `ti-circle-check` |
| Warning | 3px #D97706 | #FFFBEB | #78350F | `ti-alert-triangle` |
| Danger | 3px #DC2626 | #FEF2F2 | #7F1D1D | `ti-alert-circle` |
| Info | 3px #1E40AF | #EFF6FF | #1E3A5F | `ti-info-circle` |

### 6.7 Table

| Element | Specification |
|---|---|
| Header row | `--color-bg-subtle` background, 12px/500 text, 10px 12px padding |
| Data row | White background, 13px/400 text, 10px 12px padding |
| Alternating rows | Even rows: `--color-bg-subtle` (optional, configured per table) |
| Row hover | `--color-bg-subtle` background transition 100ms |
| Row divider | 0.5px `--color-border-default` bottom border on each row |
| Sortable column | Chevron icon right of header text; filled chevron = active sort direction |
| Sticky header | `position: sticky, top: 0, z-index: 10` for scrollable tables |
| Pagination | Below table, right-aligned: Previous / Page numbers / Next; max 7 page indicators |

### 6.8 Navigation Components

#### Sidebar (GreenSC)

| Element | Specification |
|---|---|
| Container width | 240px fixed, 100% viewport height, `position: fixed left 0` |
| Background | `--color-dark-sidebar` (#1A202C) |
| Logo area | 16px padding, 48px height, app mark + wordmark in white |
| Nav item default | 12px left padding + 16px icon + 8px gap + 13px label, `rgba(255,255,255,0.6)` text |
| Nav item active | `rgba(26,107,58,0.4)` background, white text, 3px left border in #1A6B3A |
| Nav item hover | `rgba(255,255,255,0.08)` background, white text |
| Collapse button | Bottom of sidebar, toggles to 64px icon-only mode |

#### Top Navigation (GreenPurse)

| Element | Specification |
|---|---|
| Height | 64px, `position: sticky top 0`, white background, bottom border 0.5px |
| Logo | Left side, 32px height |
| Address selector | Centred pill: green pin icon + address text + chevron |
| Right actions | Search icon, Cart icon (badge for item count), Profile avatar |

#### Tab Bar

| Element | Specification |
|---|---|
| Container | Bottom border 1px default, no background |
| Tab item | 13px text, 8px 14px padding, `--color-text-secondary` default |
| Active tab | `--color-green-600` text, 2px green border-bottom (negative margin -1px) |
| Underline animation | border-bottom transitions with transform translateX 150ms |

### 6.9 Form Patterns

#### Registration / Login

| Screen | Required Fields | CTA |
|---|---|---|
| Registration | Username, Email, Phone Number, Password, Confirm Password | Register |
| Login | Phone Number or Email, Password | Login (+ biometric icon) |
| PIN Setup | 4-digit numpad (PIN hidden), confirm PIN | Continue |
| Biometric Setup | Toggle: Enable Touch ID (device API) | Enable / Skip |
| Forgot Password | Phone or Email → OTP → New Password | Reset password |

#### Product Upload (Farmer)

| Field | Type | Validation |
|---|---|---|
| Title | Text input | Required, 3–100 chars |
| Description | Textarea | Required, 20–1000 chars |
| Category | Select | Required — must match existing category |
| Price (₦/kg) | Number input | Required, > 0, max 7 digits |
| Stock (kg) | Number input | Required, > 0, integer |
| Condition | Select: Fresh / Dried / Processed | Required |
| Images | File upload, min 1 max 5 | Required, JPG/PNG only, max 5MB each |

### 6.10 Icon System

Icons use the Tabler Icons library (outline style, 24px baseline). All icons referenced via class names (`ti ti-{name}`). Fill variants are not used — outline only throughout the product.

| Context | Icon Name | Usage |
|---|---|---|
| Home | `ti-home` | GreenPurse bottom nav — home |
| Cart | `ti-shopping-cart` | Cart icon with item count badge |
| Wallet | `ti-wallet` | GreenPurse wallet tab |
| Transfer | `ti-arrows-left-right` | Wallet transfer action |
| QR Pay | `ti-qrcode` | Scan-to-pay, My Code display |
| Delivery / Truck | `ti-truck` | Logistics tracking, GreenSC sidebar |
| Market | `ti-chart-line` | Market monitoring, MyVirtualFarm |
| Warehouse | `ti-building-warehouse` | Warehousing service request |
| Alert / Warning | `ti-alert-triangle` | Weather and pest alerts |
| Search | `ti-search` | Search inputs and bars |
| Dashboard | `ti-layout-dashboard` | GreenSC dashboard nav |
| Settings | `ti-settings` | Settings screens |
| Profile | `ti-user` | Profile / account |
| Map pin | `ti-map-pin` | Address selection, delivery location |
| Leaf (brand) | `ti-leaf` | Brand accent, logo companion |

---

## 7. Motion & Animation

| Animation | Duration | Easing | Trigger |
|---|---|---|---|
| Button press | 100ms | ease-out | click / tap |
| State transition (hover, focus) | 150ms | ease-in-out | hover / focus |
| Dropdown / menu open | 200ms | ease-out | click |
| Modal enter | 250ms | ease-out, scale 0.96→1 + opacity 0→1 | open |
| Modal exit | 200ms | ease-in, reverse | close |
| Page transition | 200ms | ease-out, opacity 0→1 | route change |
| Skeleton loader | 1.5s loop | linear, shimmer left→right | loading state |
| Toast / alert enter | 300ms | ease-out, translateY(-8px)→0 | trigger |
| Real-time value update | 400ms | ease-out, colour flash | WebSocket update |

> **Reduced Motion**: All animations must respect `prefers-reduced-motion`. In the Tailwind config, `motion-safe:` and `motion-reduce:` variants are enabled. Duration-0 and opacity-only fallbacks are applied when reduced motion is active. Never remove loading feedback entirely — show a static state instead of an animation.

---

## 8. Accessibility Standards

| Requirement | Standard | Implementation |
|---|---|---|
| Colour contrast — body text | WCAG AA (4.5:1) | All text/bg combinations tested via Storybook a11y addon |
| Colour contrast — large text | WCAG AA (3:1) | H1–H2 on white and subtle surfaces confirmed |
| Focus indicator | WCAG 2.2 2.4.11 | 3px green focus ring on all interactive elements |
| Keyboard navigation | WCAG 2.1.1 | Tab order matches visual order; no keyboard traps |
| Icon buttons | WCAG 1.1.1 | All icon-only buttons have `aria-label` |
| Form errors | WCAG 3.3.1 | `aria-describedby` links error message to input |
| Status updates | WCAG 4.1.3 | Toast notifications use `aria-live='polite'` |
| Images | WCAG 1.1.1 | Product images have descriptive alt text; decorative images `alt=''` |

---

## 9. Implementation Guide

### 9.1 Package Structure

```
packages/ui/
  src/
    components/
      Button/
        Button.tsx          ← Component
        Button.test.tsx     ← Vitest unit test
        Button.stories.tsx  ← Storybook story
        index.ts            ← Named export
      Input/ Card/ Badge/ Alert/ Table/ Nav/ ...
    tokens/
      colors.css           ← All CSS custom properties
      dark.css             ← Dark mode overrides
      typography.css       ← Font faces + scale
      spacing.css          ← Spacing + radius tokens
    index.ts               ← Barrel export of all components
  tailwind.config.ts       ← Tokens wired into Tailwind
  tsconfig.json
  package.json
```

### 9.2 Tailwind Token Wiring

```ts
// tailwind.config.ts (packages/ui)
import type { Config } from 'tailwindcss'

export default {
  theme: {
    extend: {
      colors: {
        green: {
          50:  'var(--color-green-50)',
          600: 'var(--color-green-600)',
          800: 'var(--color-green-800)',
        },
        danger: 'var(--color-danger)',
        warning: 'var(--color-warning)',
        info:    'var(--color-info)',
      },
      fontFamily: {
        sans:  ['DM Sans', 'system-ui', 'sans-serif'],
        mono:  ['JetBrains Mono', 'monospace'],
      },
      borderRadius: {
        sm: '4px', md: '8px', lg: '12px', xl: '20px',
      },
    },
  },
} satisfies Config
```

### 9.3 Component Usage Examples

```tsx
// Correct — always import from packages/ui
import { Button, Badge, MetricCard } from '@aisuce/ui'

// Primary button
<Button variant='primary' size='lg' onClick={handleCheckout}>
  Pay ₦28,800
</Button>

// Status badge
<Badge status='success'>Delivered</Badge>
<Badge status='warning'>Pending</Badge>

// Metric tile
<MetricCard
  label='Wallet balance'
  value='₦3,554,841'
  change='+12.4%'
  trend='up'
/>
```

### 9.4 Do's and Don'ts

| Do | Don't |
|---|---|
| Use `--color-green-600` for primary actions | Hardcode `#1A6B3A` in any component or page |
| Use `font-family: var(--font-mono)` for all prices | Use px, em, or system fonts for monetary values |
| One primary button per screen / form | Stack two primary buttons side by side |
| Use semantic colour tokens for status | Use raw hex or arbitrary Tailwind colours for status |
| Add `aria-label` to every icon-only button | Ship icon buttons without accessible labels |
| Import from `@aisuce/ui` | Copy-paste component code into app directories |
| Use the 4px spacing scale | Use arbitrary values like `margin: 7px` or `padding: 11px` |
| Match type scale exactly (14px body, etc.) | Invent new font sizes not in the scale |

---

<p align="center"><em>— End of Design System Document —</em></p>
