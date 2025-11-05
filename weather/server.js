// server.js
// Node 20+ (has fetch built in)
import express from "express";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// ---------------------------------------------------------------------
// In-memory cache (simple 60-second TTL to reduce API calls)
// ---------------------------------------------------------------------
const cache = new Map();
function cacheGet(key) {
  const rec = cache.get(key);
  if (!rec) return null;
  if (Date.now() > rec.expiry) {
    cache.delete(key);
    return null;
  }
  return rec.value;
}
function cacheSet(key, value, ttlMs = 60000) {
  cache.set(key, { value, expiry: Date.now() + ttlMs });
}

// ---------------------------------------------------------------------
// Helper: geocode city name to latitude/longitude using Open-Meteo
// ---------------------------------------------------------------------
async function geocode(name) {
  if (!name) return null;

  const cached = cacheGet("geo:" + name.toLowerCase());
  if (cached) return cached;

  const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
    name
  )}&count=1&language=en&format=json`;

  const res = await fetch(url, { headers: { Accept: "application/json" } });
  if (!res.ok) return null;
  const j = await res.json();
  if (!j?.results?.length) return null;

  const item = j.results[0];
  const place = {
    name: item.name,
    latitude: item.latitude,
    longitude: item.longitude,
    country: item.country ?? item.country_code,
  };
  cacheSet("geo:" + name.toLowerCase(), place);
  return place;
}

// ---------------------------------------------------------------------
// Helper: fetch current & daily weather in Fahrenheit from Open-Meteo
// ---------------------------------------------------------------------
async function fetchWeatherForLatLon(lat, lon, timezone = "auto") {
  const key = `wx:${lat.toFixed(2)},${lon.toFixed(2)}`;
  const cached = cacheGet(key);
  if (cached) return cached;

  const params = new URLSearchParams({
    latitude: String(lat),
    longitude: String(lon),
    current_weather: "true",
    daily: "temperature_2m_max,temperature_2m_min,weathercode",
    temperature_unit: "fahrenheit", // 👈 return temps in Fahrenheit
    timezone,
  });

  const url = `https://api.open-meteo.com/v1/forecast?${params.toString()}`;
  const res = await fetch(url, { headers: { Accept: "application/json" } });
  if (!res.ok) throw new Error(`Weather API failed: ${res.status}`);
  const data = await res.json();

  cacheSet(key, data);
  return data;
}

// ---------------------------------------------------------------------
// Route: /api/weather?q=<location>
// ---------------------------------------------------------------------
app.get("/api/weather", async (req, res) => {
  try {
    const q = (req.query.q || "").trim();
    const fallback = {
      name: "Demoville",
      latitude: 40.0,
      longitude: -95.0,
      country: "US",
    };

    const place = q ? await geocode(q) : fallback;
    if (!place) {
      return res.status(404).json({ error: "Location not found" });
    }

    const weather = await fetchWeatherForLatLon(
      place.latitude,
      place.longitude
    );

    const resp = {
      location: `${place.name}${
        place.country ? ", " + place.country : ""
      }`,
      queried: q || "",
      timestamp: new Date().toISOString(),
      current: weather.current_weather ?? null,
      daily: weather.daily ?? null,
      raw: weather, // included for demo/debug purposes
    };

    res.set("Cache-Control", "private, max-age=60");
    res.json(resp);
  } catch (err) {
    console.error("Error /api/weather:", err);
    res.status(500).json({ error: "internal_error", message: String(err) });
  }
});

// ---------------------------------------------------------------------
// Health check
// ---------------------------------------------------------------------
app.get("/health", (req, res) => res.send("ok"));

// ---------------------------------------------------------------------
// Start server
// ---------------------------------------------------------------------
const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`✅ Weather service running on port ${PORT}`)
);
