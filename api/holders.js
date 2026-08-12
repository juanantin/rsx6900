// Server-side proxy for the Robinhood Chain Blockscout token API.
// Gives a real unique-holder count for the $RSX contract, which
// neither the Backed basket API nor Dexscreener expose.
const UPSTREAM_URL = "https://robinhoodchain.blockscout.com/api/v2/tokens/0x1bEf1E4d1F98d91d99F1F2f384490F3999D7ccd9";

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
