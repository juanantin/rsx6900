# RSX6900 — Roblox Stonks Index ($RSX)

Static marketing/dashboard site for RSX6900, a meme-finance index protocol. Every $RSX trade generates fees; a Basket ([@isBacked_](https://x.com/isBacked_)) hook routes those fees into buying tokenized $RBLX stock, which is airdropped to $RSX holders each distribution round.

## Stack

Static HTML/CSS/JS plus two tiny Vercel serverless functions (`api/*.js`) that proxy third-party APIs the browser can't call directly due to CORS. No build step, no npm dependencies. Deploy to Vercel with the "Other" framework preset, no build command, `.` as the output directory — Vercel auto-detects the `api/` folder as serverless functions.

```
index.html               Page markup (hero, dashboard, about, links)
css/style.css             Design system: neon + pastel themes, neubrutalist components, animations
js/main.js                Interactivity: theme toggle, scroll-reveal, active-section nav,
                           keyboard nav, glitch pulses, hero parallax, digital hover sound,
                           mobile responsive relocation (CTA buttons, mode toggle), and the
                           live dashboard fetches described below
api/basket.js             Serverless proxy for the Backed basket API (fees, rounds, airdrops, holders)
api/dex.js                Serverless proxy for the Dexscreener pairs API (market cap, price, 24h volume)
assets/logo.svg           RSX6900 seal logo (favicon + sidebar logo)
assets/hero-scene.svg     Fallback hero illustration (used if the background video can't load)
assets/rsx-bg.mp4         Hero background video (muted, looping)
assets/rsx-bg.webm        Hero background video, WebM fallback
assets/rsx-bg-poster.jpg  Poster frame for the hero video
```

## Run locally

For static-only editing, any file server works:

```
python3 -m http.server 8000
# or
npx serve .
```

Note this won't serve `api/*.js` — the dashboard will just fall back to its hardcoded snapshot values, which is expected. To test the live proxy locally, use `vercel dev` instead (needs the Vercel CLI + a linked project).

## Notes

- Dashboard values fetch live from two sources via the serverless proxies: `js/main.js` calls same-origin `/api/basket` (fees collected, $RBLX airdropped, distribution round, holder share, holders — the last-round payout count, not a total unique-holder count) and `/api/dex` (market cap, price, 24h volume) every 45–60s. If either call fails (network error, upstream schema change, etc.) the page quietly falls back to the last hardcoded snapshot in `index.html` instead of breaking — look for the "MANUAL SNAPSHOT" vs "LIVE" text in the dashboard header chip to tell which state it's in.
- The Backed and Dexscreener APIs are proxied through `api/basket.js` / `api/dex.js` rather than called directly from the browser because `backed.is` doesn't set CORS headers permitting cross-origin requests. The proxies fetch server-side (not subject to CORS) and hand the JSON back same-origin.
- The hero background is the provided `assets/rsx_web.MOV`, transcoded to `rsx-bg.mp4`/`rsx-bg.webm` for browser compatibility. The hero and logo artwork are original SVGs (not photographic assets), styled to match the requested neubrutalist/terminal aesthetic.
- Social links point to `https://x.com/RSX6900_rh`; Explorer/Docs links are still placeholders (`#`) — update them once those destinations exist.
