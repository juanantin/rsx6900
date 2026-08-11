# RSX6900 — Roblox Stonks Index ($RSX)

Static marketing/dashboard site for RSX6900, a meme-finance index protocol. Every $RSX trade generates fees; a TheIndex Finance hook routes those fees into buying tokenized $RBLX stock, which is airdropped to $RSX holders each distribution round.

## Stack

Plain HTML/CSS/JS — no build step, no dependencies. Deploy the folder as-is to any static host (GitHub Pages, Netlify, Vercel, S3, etc).

```
index.html        Page markup (hero, dashboard, about, commands, links, media, ...)
css/style.css     Design system: neon + pastel themes, neubrutalist components, animations
js/main.js        Interactivity: live clock, countdown, count-up stats, theme toggle,
                   scroll-reveal, keyboard nav, clipboard copy, ticker jitter, audio-player UI
assets/logo.svg   RSX6900 seal logo (used as favicon + site logo)
assets/hero-scene.svg  Hero illustration
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

- Dashboard figures (fees collected, holders, market cap, etc.) are **illustrative demo data** rendered client-side. Wire `js/main.js` up to a real TheIndex Finance / Robinhood Chain data feed to power live numbers.
- The hero and logo artwork are original SVGs created for this build (not photographic assets), styled to match the requested neubrutalist/terminal aesthetic.
- Social links point to `https://x.com/rsx6900_`; Discord/Telegram/Explorer/Docs/GitHub links are placeholders (`#`) — update them once those destinations exist.
