# RSX6900 — Roblox Stonks Index ($RSX)

Static marketing/dashboard site for RSX6900, a meme-finance index protocol. Every $RSX trade generates fees; a Basket ([@isBacked_](https://x.com/isBacked_)) hook routes those fees into buying tokenized $RBLX stock, which is airdropped to $RSX holders each distribution round.

## Stack

Plain HTML/CSS/JS — no build step, no dependencies. Deploy the folder as-is to any static host (GitHub Pages, Netlify, Vercel, S3, etc). On Vercel, use the "Other" framework preset with no build command and `.` as the output directory.

```
index.html             Page markup (hero, dashboard, about, links)
css/style.css           Design system: neon + pastel themes, neubrutalist components, animations
js/main.js              Interactivity: theme toggle, scroll-reveal, active-section nav,
                         keyboard nav, glitch pulses, hero parallax, digital hover sound,
                         mobile responsive relocation (CTA buttons, mode toggle)
assets/logo.svg         RSX6900 seal logo (favicon + sidebar logo)
assets/hero-scene.svg   Fallback hero illustration (used if the background video can't load)
assets/rsx-bg.mp4       Hero background video (muted, looping)
assets/rsx-bg.webm      Hero background video, WebM fallback
assets/rsx-bg-poster.jpg Poster frame for the hero video
```

## Run locally

Any static file server works, e.g.:

```
python3 -m http.server 8000
# or
npx serve .
```

Then open `http://localhost:8000`.

## Notes

- RSX has not launched yet. Every dashboard/ticker figure (fees collected, holders, market cap, volume, distribution round, treasury address, contract address) shows a blinking `...` placeholder (`.pending-value` in `css/style.css`) instead of fake numbers. Once the token is live, replace those placeholders with real values and wire up a live data feed.
- The hero background is the provided `assets/rsx_web.MOV`, transcoded to `rsx-bg.mp4`/`rsx-bg.webm` for browser compatibility. The hero and logo artwork are original SVGs (not photographic assets), styled to match the requested neubrutalist/terminal aesthetic.
- Social links point to `https://x.com/RSX6900_rh`; Explorer/Docs links are still placeholders (`#`) — update them once those destinations exist.
