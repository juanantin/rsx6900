// Server-side proxy for the Backed basket API (backed.is doesn't allow
// cross-origin browser requests, so this relays it same-origin instead).
const UPSTREAM_URL = "https://www.backed.is/api/baskets/0xDFe8d771C5187E690D3B8063795Fc5254Bb5DcE6";

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
