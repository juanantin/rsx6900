# RSX6900 — Roblox Stonks Index ($RSX)

Static marketing/dashboard site for RSX6900, a meme-finance index protocol. Every $RSX trade generates fees; a Basket ([@isBacked_](https://x.com/isBacked_)) hook routes those fees into buying tokenized $RBLX stock, which is airdropped to $RSX holders each distribution round.

## Stack

Static HTML/CSS/JS plus three tiny Vercel serverless functions (`api/*.js`) that proxy third-party APIs the browser can't call directly due to CORS. No build step, no npm dependencies. Deploy to Vercel with the "Other" framework preset, no build command, `.` as the output directory — Vercel auto-detects the `api/` folder as serverless functions.

```
index.html               Page markup (hero, dashboard, about, links)
css/style.css             Design system: neon + pastel themes, neubrutalist components, animations
js/main.js                Interactivity: theme toggle, scroll-reveal, active-section nav,
                           keyboard nav, glitch pulses, hero parallax, digital hover sound,
                           mobile responsive relocation (CTA buttons, mode toggle), and the
                           live dashboard fetches described below
api/basket.js             Serverless proxy for the Backed basket API (fees, rounds, airdrops)
api/dex.js                Serverless proxy for the Dexscreener pairs API (market cap, price, 24h volume)
api/holders.js            Serverless proxy for the Robinhood Chain Blockscout token API (holder count)
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

- Dashboard values fetch live from three sources via the serverless proxies: `js/main.js` calls same-origin `/api/basket` (fees collected, $RBLX airdropped, distribution round, holder share) every 60s, `/api/dex` (market cap, price, 24h volume) every 45s, and `/api/holders` (real unique-holder count from the chain explorer) every 90s. Holders falls back to an estimate derived from the basket API's last payout round if the explorer call fails, and falls back further to the hardcoded snapshot if both fail. If a call fails (network error, upstream schema change, etc.) the page quietly keeps the last known-good value instead of breaking — look for the "MANUAL SNAPSHOT" vs "LIVE" text in the dashboard header chip to tell which state it's in.
- These third-party APIs are proxied (`api/basket.js`, `api/dex.js`, `api/holders.js`) rather than called directly from the browser because `backed.is` and the Blockscout explorer don't reliably set CORS headers permitting cross-origin requests. The proxies fetch server-side (not subject to CORS) and hand the JSON back same-origin.
- The hero background is the provided `assets/rsx_web.MOV`, transcoded to `rsx-bg.mp4`/`rsx-bg.webm` for browser compatibility. The hero and logo artwork are original SVGs (not photographic assets), styled to match the requested neubrutalist/terminal aesthetic.
- Social links point to `https://x.com/RSX6900_rh`. The Explorer link card points to $RSX's token page on the Robinhood Chain Blockscout explorer; Docs is still a placeholder (`#`).
