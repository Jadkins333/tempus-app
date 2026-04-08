# Reddit Post Variations for Tempus

---

## r/SideProject — "I built a free year progress tracker PWA"

**Title:** I built a free year progress tracker PWA that shows your year as 365 dots

**Body:**

Hey everyone! I just shipped Tempus, a side project I've been working on over the past few weeks.

The idea is dead simple: it shows your year as a grid of 365 dots. Each day that passes, another dot fills in. Today's dot glows. You instantly see how much of the year is gone and how much is left.

I also added event countdowns — you can add dates you're looking forward to (or dreading) and it shows a minimal countdown card with days remaining.

**Why I built it:**
I used to love the Dale app on iOS for this, but I wanted something that works everywhere — phone, tablet, desktop — without downloading anything. So I made it as a PWA. It works offline, you can install it to your home screen, and it feels native.

**Tech stack:**
- Vanilla JS, CSS, HTML — no frameworks
- PWA with service worker for offline support
- Deployed on GitHub Pages (free hosting)
- Stripe for the optional premium upgrade

It's free to use. There's an optional $2.99 one-time upgrade that unlocks unlimited countdowns and 9 color themes, but the free tier is totally usable (2 countdowns + 1 theme).

Would love any feedback: **https://jadkins333.github.io/tempus-app/**

---

## r/webdev — "Built a PWA that visualizes your year as 365 dots — open for feedback"

**Title:** Built a PWA that visualizes your year as 365 dots — open for feedback

**Body:**

I just finished and deployed a year progress tracker called Tempus. It renders 365 dots in a grid — filled dots for days passed, an empty grid for what's ahead, and a glowing dot for today. Tap the + button to add event countdowns.

Built it as a fully vanilla stack (no React, no build tools):
- Pure HTML/CSS/JS
- Service worker for full offline support
- `manifest.json` for install-to-homescreen PWA
- CSS custom properties for theming (9 themes in the premium tier)
- Stripe Checkout for the $2.99 one-time premium upgrade
- Deployed via GitHub Pages

Some things I'm proud of:
- The dot grid renders and animates smoothly even on older phones
- The entire app is under 50KB (before fonts)
- Lighthouse score is 95+ across the board
- Works completely offline after first visit

Some things I'm not sure about:
- Is the dot grid too dense on mobile? I went with a responsive column count but I'm second-guessing the breakpoints
- The premium upsell banner — is it too aggressive or fine?
- Any accessibility issues I'm missing?

Live demo: **https://jadkins333.github.io/tempus-app/**

Free to use, $2.99 optional premium for more themes and unlimited countdowns. Appreciate any feedback on the code, UX, or design.

---

## r/productivity — "I made a minimal year tracker that shows your year slipping away, one dot at a time"

**Title:** I made a minimal year tracker that shows your year slipping away, one dot at a time

**Body:**

I've always found it weirdly motivating to see how much of the year has already passed. Not in a stressful way — more like a gentle nudge that time is actually moving and I should make it count.

So I built Tempus. It's a simple web app that shows your year as 365 dots. Each day that's passed fills in. Today's dot glows. You can see at a glance that you're, say, 27% through the year.

You can also add countdowns to events — vacation, a deadline, a birthday, whatever. Each one shows a card with the days remaining.

What I like about it vs. other trackers:
- **It's visual, not numerical.** The dot grid gives you a gut feeling for how much year is left in a way that "Day 98 of 365" doesn't.
- **It's instant.** No account, no login, no app store download. Just open the link and it works.
- **It works offline.** It's a PWA — add it to your home screen and it behaves like a native app.
- **It's private.** Everything stays on your device. No data sent anywhere.

It's completely free. There's an optional $2.99 one-time upgrade for more color themes and unlimited countdowns, but the free version does everything most people need.

Here it is if you want to try it: **https://jadkins333.github.io/tempus-app/**

Curious if anyone else finds this kind of "year awareness" helpful for staying motivated.
