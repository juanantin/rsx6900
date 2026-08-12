// Server-side proxy for the Dexscreener pairs API. Dexscreener's API
// generally allows browser CORS, but routing it through our own domain
// avoids depending on that and lets us cache/rate-limit if needed.
const UPSTREAM_URL =
  "https://api.dexscreener.com/latest/dex/pairs/robinhood/0x2afde58b40cca5093c86208aae5d2a0a14530cde316a09362adfd30d13e16b7c";

module.exports = async (req, res) => {
  try {
    const upstream = await fetch(UPSTREAM_URL, { headers: { accept: "application/json" } });
    if (!upstream.ok) {
      res.status(upstream.status).json({ error: "upstream error " + upstream.status });
      return;
    }
    const data = await upstream.json();
    res.setHeader("Cache-Control", "s-maxage=30, stale-while-revalidate=60");
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.status(200).json(data);
  } catch (err) {
    res.status(502).json({ error: "proxy fetch failed" });
  }
};
