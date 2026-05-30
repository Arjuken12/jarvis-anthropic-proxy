import express from "express";

const app = express();
app.use(express.json({ limit: "25mb" }));

app.all("/v1/messages", async (req, res) => {
  try {
    const upstream = await fetch("https://api.anthropic.com/v1/messages", {
      method: req.method,
      headers: {
        "x-api-key": req.headers["x-api-key"] || "",
        "anthropic-version": req.headers["anthropic-version"] || "2023-06-01",
        "content-type": "application/json",
      },
      body: req.method === "POST" ? JSON.stringify(req.body) : undefined,
    });
    const text = await upstream.text();
    res
      .status(upstream.status)
      .type(upstream.headers.get("content-type") || "application/json")
      .send(text);
  } catch (err) {
    res.status(502).json({ error: "Proxy error: " + (err.message || err) });
  }
});

app.get("/", (_req, res) => res.send("JARVIS Anthropic Proxy — alive."));

const port = process.env.PORT || 3000;
app.listen(port, () => console.log("Proxy listening on", port));
