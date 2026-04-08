# Tempus — Year Progress & Countdown Tracker (PWA)

> **For agent:** Build this end-to-end. No questions. Ship it live.

**Goal:** Build and deploy a freemium Progressive Web App that tracks year progress, event countdowns, and days remaining — monetized via Stripe Checkout ($2.99 lifetime premium unlock). Deploy via cloudflared tunnel for immediate public access.

**Architecture:** Single-page PWA with vanilla HTML/CSS/JS. No framework overhead. LocalStorage for data persistence. Service Worker for offline capability and installability. Stripe Checkout (client-side redirect) for payments. Cloudflared tunnel for instant public URL.

**Tech Stack:** HTML5, CSS3 (Linear-inspired dark design), Vanilla JS, Service Worker, Stripe Checkout (payment links), Cloudflared

**Revenue Model:** 
- Free tier: Year progress tracker, 2 event countdowns, basic theme
- Premium ($2.99 one-time): Unlimited countdowns, 9 color themes, ad-free, home screen widgets

---

## Design System (Linear-inspired dark mode)

### Colors
- Background: `#08090a` (marketing), `#0f1011` (panels), `#191a1b` (cards)
- Text: `#f7f8f8` (primary), `#d0d6e0` (secondary), `#8a8f98` (muted)
- Accent: `#5e6ad2` (brand), `#7170ff` (interactive), `#828fff` (hover)
- Borders: `rgba(255,255,255,0.08)` standard, `rgba(255,255,255,0.05)` subtle
- Success: `#10b981`

### Typography
- Font: Inter (Google Fonts), weight 400/500/600
- Display: 48px, weight 500, letter-spacing -1px
- Headings: 24px, weight 500
- Body: 16px, weight 400

---

## File Structure

```
/home/jadkins/tempus-app/
├── index.html          # Main SPA
├── styles.css          # All styles
├── app.js              # Core app logic
├── sw.js               # Service Worker
├── manifest.json       # PWA manifest
├── icons/              # App icons (generated via SVG)
│   ├── icon-192.png
│   └── icon-512.png
├── server.js           # Simple Node.js static server
└── start.sh            # Launch script (server + cloudflared)
```

---

## Task 1: Create the HTML shell

**File:** `index.html`

Build a single-page app with these sections:
1. **Header** — "Tempus" logo + settings gear icon
2. **Year Progress Hero** — Large dot grid (365 dots), today highlighted in accent color, progress percentage, days remaining
3. **Event Countdowns** — List of countdown cards (name, date, days remaining, progress bar)
4. **Add Event FAB** — Floating action button to add new countdown
5. **Premium Banner** — "Unlock Premium" CTA for free users
6. **Settings Modal** — Theme picker, premium status, about
7. **Add Event Modal** — Name, date picker, color picker

Include:
- Google Fonts Inter link
- Viewport meta for mobile
- PWA manifest link
- Service worker registration script tag
- Stripe.js script (for future payment integration)

## Task 2: Create the CSS

**File:** `styles.css`

Linear-inspired dark design:
- Dark background gradient
- Dot grid for year progress (CSS Grid, 19 columns × ~20 rows)
- Each dot: 8px circle, default `rgba(255,255,255,0.08)`, past days `rgba(255,255,255,0.2)`, today `#5e6ad2` with glow
- Countdown cards with glassmorphism effect
- Smooth animations (fade-in, pulse for today dot)
- Progress bars with gradient fill
- Responsive: works on mobile-first, scales up
- Premium theme variants (CSS custom properties):
  - Default (Indigo)
  - Electric Blue
  - Neon Mint  
  - Purple Dream
  - Sunset Orange
  - Rose Gold
  - Arctic
  - Midnight
  - Forest

## Task 3: Core JavaScript logic

**File:** `app.js`

Functions:
- `initYearProgress()` — Calculate day of year, render dot grid, animate
- `renderCountdowns()` — Read events from localStorage, render cards
- `addEvent(name, date, color)` — Save to localStorage, re-render
- `deleteEvent(id)` — Remove from localStorage
- `checkPremium()` — Check localStorage for premium status
- `unlockPremium()` — Redirect to Stripe Checkout URL (configurable)
- `setTheme(theme)` — Apply CSS custom property overrides
- `showModal(id)` / `hideModal(id)` — Modal management
- Event countdown calculation with "X days, Y hours" precision
- Notification scheduling for event reminders (Notification API)
- Data export/import (JSON)

Premium gating:
- Free: max 2 countdowns, 1 theme
- Premium: unlimited countdowns, all 9 themes, no premium banner

Payment integration point:
```javascript
const STRIPE_PAYMENT_LINK = 'https://buy.stripe.com/YOUR_LINK_HERE';
// User creates a Stripe Payment Link for $2.99
// On success, Stripe redirects to ?premium=true
// App checks URL param, sets localStorage premium flag
```

## Task 4: Service Worker

**File:** `sw.js`

- Cache-first strategy for all static assets
- Offline fallback
- Cache versioning for updates

## Task 5: PWA Manifest

**File:** `manifest.json`

- name: "Tempus"
- short_name: "Tempus"  
- display: standalone
- theme_color: #08090a
- background_color: #08090a
- icons: 192 and 512

## Task 6: Generate app icons

Create SVG-based icons (hourglass/calendar motif in brand indigo on dark background), convert to PNG using canvas or sharp.

## Task 7: Node.js static server

**File:** `server.js`

Simple Express or http server serving static files on port 3847. Include:
- Proper MIME types
- Cache headers
- Gzip compression if available

## Task 8: Launch script

**File:** `start.sh`

```bash
#!/bin/bash
cd /home/jadkins/tempus-app
node server.js &
sleep 2
cloudflared tunnel --url http://localhost:3847
```

## Task 9: Deploy and verify

1. Run `start.sh`
2. Capture the cloudflared public URL
3. Test in browser — verify year progress renders, countdowns work, premium gate works
4. Report the live URL

---

## Monetization Notes

The app uses Stripe Payment Links — the simplest possible integration:
1. User creates a Stripe account at stripe.com
2. Creates a Payment Link for $2.99 (one-time)
3. Sets success URL to `https://<tunnel-url>/?premium=activated`
4. Pastes the payment link URL into `app.js` STRIPE_PAYMENT_LINK constant
5. Done — customers click "Unlock Premium", pay $2.99, get redirected back with premium activated

No server-side Stripe integration needed. No webhooks. No API keys in code.
