// server.js
// Node 20+ (has fetch built in)
import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { readdir, stat, unlink } from "fs/promises";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());

// Serve static files from dist (production) or public (development)
const staticDir = path.join(__dirname, "dist");
app.use(express.static(staticDir));

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
    daily: "temperature_2m_max,temperature_2m_min,weathercode,precipitation_sum,windspeed_10m_max,uv_index_max",
    temperature_unit: "fahrenheit", // 👈 return temps in Fahrenheit
    windspeed_unit: "mph",
    forecast_days: "10", // 👈 request 10 days of forecast
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
// Download latest file from builds directory
// ---------------------------------------------------------------------
app.get("/api/download/latest", async (req, res) => {
  try {
    // Path to builds directory (from env var or default)
    const buildsDir = process.env.BUILDS_DIR || path.join(__dirname, "..", "builds");

    // Detect OS from User-Agent
    const userAgent = req.headers['user-agent'] || '';
    const isWindows = /Windows/i.test(userAgent);
    const isLinux = /Linux/i.test(userAgent) && !/Android/i.test(userAgent);

    console.log(`User-Agent: ${userAgent}`);
    console.log(`Detected OS - Windows: ${isWindows}, Linux: ${isLinux}`);

    // Read all files in the builds directory (exclude .tar.gz temp files)
    const files = await readdir(buildsDir);
    let filteredFiles = files.filter(f => !f.endsWith('.tar.gz'));

    // Filter by OS name in filename
    const osFilteredFiles = filteredFiles.filter(filename => {
      const lowerName = filename.toLowerCase();
      if (isWindows) {
        return lowerName.includes('windows');
      } else if (isLinux) {
        return lowerName.includes('linux');
      } else {
        // For other OS (macOS, etc), prefer linux builds
        return lowerName.includes('linux');
      }
    });

    // If no OS-specific files found, fall back to all files
    const targetFiles = osFilteredFiles.length > 0 ? osFilteredFiles : filteredFiles;

    if (targetFiles.length === 0) {
      return res.status(404).json({ error: "No files available for download" });
    }

    console.log(`Files matching OS filter: ${targetFiles.join(', ')}`);

    // Get file stats to find the most recent file from filtered list
    const fileStats = await Promise.all(
      targetFiles.map(async (filename) => {
        const filePath = path.join(buildsDir, filename);
        const stats = await stat(filePath);
        return { filename, path: filePath, mtime: stats.mtime };
      })
    );

    // Sort by modification time (most recent first)
    fileStats.sort((a, b) => b.mtime - a.mtime);

    // Get the most recent file matching OS
    const latestFile = fileStats[0];

    console.log(`Serving latest build for OS: ${latestFile.filename}`);

    // Determine the file extension from the original file
    const originalExt = path.extname(latestFile.filename);
    const baseName = path.basename(latestFile.filename, originalExt);

    // Windows: serve directly with original filename
    if (isWindows) {
      const downloadFilename = latestFile.filename;
      console.log(`Serving for Windows: ${downloadFilename}`);
      res.setHeader("Content-Disposition", `attachment; filename="${downloadFilename}"`);
      res.setHeader("Content-Type", "application/octet-stream");
      return res.sendFile(latestFile.path);
    }

    // Linux/macOS: create tar.gz with original filename preserved
    const tarFileName = `${baseName}.tar.gz`;
    const tarFilePath = path.join(buildsDir, tarFileName);
    const archivedFile = latestFile.filename;

    try {
      // Create tar.gz directly with original filename to preserve binary behavior
      const tarCommand = `tar -czhf "${tarFilePath}" -C "${buildsDir}" "${archivedFile}"`;
      console.log(`Running tar command: ${tarCommand}`);
      const { stdout, stderr } = await execAsync(tarCommand);
      if (stdout) console.log(`tar stdout: ${stdout}`);
      if (stderr) console.log(`tar stderr: ${stderr}`);

      console.log(`Tar created successfully: ${tarFilePath}`);

      // Send the tar.gz file
      res.setHeader("Content-Disposition", `attachment; filename="${tarFileName}"`);
      res.setHeader("Content-Type", "application/gzip");

      res.sendFile(tarFilePath, async (err) => {
        if (err) {
          console.error("Error sending tar file:", err);
        }
        // Clean up tar.gz after sending
        try {
          await unlink(tarFilePath);
          console.log("Cleaned up tar file");
        } catch (cleanupErr) {
          console.error("Failed to cleanup tar file:", cleanupErr);
        }
      });
    } catch (tarErr) {
      console.error("Failed to create tar.gz, falling back to direct download:");
      console.error("Error name:", tarErr.name);
      console.error("Error message:", tarErr.message);
      console.error("Error stack:", tarErr.stack);
      // Clean up any leftover files
      try {
        await unlink(tarFilePath).catch(() => {});
      } catch {}
      // Fallback to direct download with original filename
      const downloadFilename = latestFile.filename;
      res.setHeader("Content-Disposition", `attachment; filename="${downloadFilename}"`);
      res.setHeader("Content-Type", "application/octet-stream");
      res.sendFile(latestFile.path);
    }
  } catch (err) {
    console.error("Error serving latest build:", err);
    res.status(500).json({ error: "Failed to serve latest build", message: String(err) });
  }
});

// ---------------------------------------------------------------------
// Health check
// ---------------------------------------------------------------------
app.get("/health", (req, res) => res.send("ok"));

// ---------------------------------------------------------------------
// Catch-all route for React Router (must be last)
// ---------------------------------------------------------------------
app.get("*", (req, res) => {
  res.sendFile(path.join(staticDir, "index.html"));
});

// ---------------------------------------------------------------------
// Start server
// ---------------------------------------------------------------------
const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`✅ Weather service running on port ${PORT}`)
);
