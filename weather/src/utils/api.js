// API utility functions for weather data

export const weatherCodeToText = (code) => {
  const map = {
    0: "Clear",
    1: "Mainly Clear",
    2: "Partly Cloudy",
    3: "Overcast",
    45: "Fog",
    48: "Rime Fog",
    51: "Light Drizzle",
    53: "Drizzle",
    55: "Heavy Drizzle",
    61: "Light Rain",
    63: "Rain",
    65: "Heavy Rain",
    71: "Light Snow",
    73: "Snow",
    75: "Heavy Snow",
    80: "Rain Showers",
    81: "Rain Showers",
    82: "Heavy Showers",
    95: "Thunderstorm",
    96: "Thundershowers",
    99: "Severe Thunderstorm"
  };
  return map[code] ?? (code === undefined ? "Unknown" : "Code " + code);
};

export const fetchWeather = async (location) => {
  const loc = encodeURIComponent(location || "");
  const url = `/api/weather?q=${loc}`;
  const res = await fetch(url);
  const data = await res.json();

  if (!res.ok || data.error) {
    throw new Error(data?.message || data?.error || `HTTP ${res.status}`);
  }

  // Flatten Open-Meteo style response into our UI shape
  const flat = {
    location: data.location || location || 'Unknown',
    timestamp: data.timestamp || new Date().toISOString(),
    current: data.current_weather || data.current,
    forecast: []
  };

  if (data.daily && Array.isArray(data.daily.time)) {
    const times = data.daily.time;
    const highs = data.daily.temperature_2m_max || [];
    const lows = data.daily.temperature_2m_min || [];
    const codes = data.daily.weathercode || [];
    const precip = data.daily.precipitation_sum || [];
    const wind = data.daily.windspeed_10m_max || [];
    const uv = data.daily.uv_index_max || [];
    for (let i = 0; i < times.length; i++) {
      flat.forecast.push({
        date: times[i],
        day: new Date(times[i]).toLocaleDateString(undefined, { weekday: "short" }),
        high: Math.round(highs[i]),
        low: Math.round(lows[i]),
        code: codes[i],
        desc: weatherCodeToText(codes[i]),
        precipitation: precip[i] || 0,
        windSpeed: wind[i] || 0,
        uvIndex: uv[i] || 0
      });
    }
  }

  return flat;
};

export const fetchHourlyWeather = async (location) => {
  // For now, return mock data - will implement server endpoint later
  const data = await fetchWeather(location);

  // Generate 24 hourly forecasts based on daily data
  const hourly = [];
  const now = new Date();

  for (let i = 0; i < 24; i++) {
    const time = new Date(now.getTime() + i * 60 * 60 * 1000);
    const dayIndex = Math.floor(i / 8); // Rough day estimation
    const forecast = data.forecast[Math.min(dayIndex, data.forecast.length - 1)] || {};

    // Interpolate temperature between high and low
    const hourOfDay = time.getHours();
    const tempRange = (forecast.high || 70) - (forecast.low || 50);
    const temp = (forecast.low || 50) + (tempRange * Math.sin((hourOfDay - 6) * Math.PI / 12));

    hourly.push({
      time: time.toLocaleTimeString(undefined, { hour: 'numeric' }),
      temp: Math.round(temp),
      code: forecast.code,
      desc: forecast.desc,
      precipitation: Math.round(Math.random() * 30)
    });
  }

  return { ...data, hourly };
};

export const fetchMonthlyWeather = async (location) => {
  // For now, return mock extended data
  const data = await fetchWeather(location);

  // Generate 30-day forecast based on weekly pattern
  const monthly = [];
  const baseDate = new Date();

  for (let i = 0; i < 30; i++) {
    const date = new Date(baseDate.getTime() + i * 24 * 60 * 60 * 1000);
    const weekIndex = Math.floor(i / 7);
    const dayInWeek = i % 7;
    const sourceForecast = data.forecast[Math.min(dayInWeek, data.forecast.length - 1)] || {};

    // Add some variation
    const variance = (Math.random() - 0.5) * 10;

    monthly.push({
      date: date.toISOString().split('T')[0],
      day: date.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' }),
      high: Math.round((sourceForecast.high || 70) + variance),
      low: Math.round((sourceForecast.low || 50) + variance),
      code: sourceForecast.code,
      desc: sourceForecast.desc,
      precipitation: Math.round(Math.random() * 100)
    });
  }

  return { ...data, monthly };
};
