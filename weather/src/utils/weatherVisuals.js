// Weather condition visuals and styling

export const getWeatherVisuals = (weatherCode, isDay = true) => {
  // Map weather codes to visual themes
  const visualMap = {
    // Clear/Sunny
    0: {
      image: 'https://images.unsplash.com/photo-1601297183305-6df142704ea2?w=400&h=300&fit=crop',
      gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: '#667eea',
      emoji: '☀️',
      description: 'Clear Sky'
    },
    1: {
      image: 'https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=400&h=300&fit=crop',
      gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
      color: '#4facfe',
      emoji: '🌤️',
      description: 'Mainly Clear'
    },
    2: {
      image: 'https://images.unsplash.com/photo-1534088568595-a066f410bcda?w=400&h=300&fit=crop',
      gradient: 'linear-gradient(135deg, #a1c4fd 0%, #c2e9fb 100%)',
      color: '#a1c4fd',
      emoji: '⛅',
      description: 'Partly Cloudy'
    },
    3: {
      image: 'https://images.unsplash.com/photo-1513002749550-c59d786b8e6c?w=400&h=300&fit=crop',
      gradient: 'linear-gradient(135deg, #667db6 0%, #868f96 100%)',
      color: '#667db6',
      emoji: '☁️',
      description: 'Overcast'
    },
    // Fog
    45: {
      image: 'https://images.unsplash.com/photo-1487621167305-5d248087c724?w=400&h=300&fit=crop',
      gradient: 'linear-gradient(135deg, #757f9a 0%, #d7dde8 100%)',
      color: '#757f9a',
      emoji: '🌫️',
      description: 'Foggy'
    },
    48: {
      image: 'https://images.unsplash.com/photo-1519692933481-e162a57d6721?w=400&h=300&fit=crop',
      gradient: 'linear-gradient(135deg, #868f96 0%, #596164 100%)',
      color: '#868f96',
      emoji: '🌫️',
      description: 'Rime Fog'
    },
    // Drizzle
    51: {
      image: 'https://images.unsplash.com/photo-1515694346937-94d85e41e6f0?w=400&h=300&fit=crop',
      gradient: 'linear-gradient(135deg, #89f7fe 0%, #66a6ff 100%)',
      color: '#89f7fe',
      emoji: '🌦️',
      description: 'Light Drizzle'
    },
    53: {
      image: 'https://images.unsplash.com/photo-1515694346937-94d85e41e6f0?w=400&h=300&fit=crop',
      gradient: 'linear-gradient(135deg, #89f7fe 0%, #66a6ff 100%)',
      color: '#66a6ff',
      emoji: '🌦️',
      description: 'Drizzle'
    },
    55: {
      image: 'https://images.unsplash.com/photo-1515694346937-94d85e41e6f0?w=400&h=300&fit=crop',
      gradient: 'linear-gradient(135deg, #667db6 0%, #0082c8 100%)',
      color: '#667db6',
      emoji: '🌧️',
      description: 'Heavy Drizzle'
    },
    // Rain
    61: {
      image: 'https://images.unsplash.com/photo-1428908728789-d2de25dbd4e2?w=400&h=300&fit=crop',
      gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
      color: '#4facfe',
      emoji: '🌧️',
      description: 'Light Rain'
    },
    63: {
      image: 'https://images.unsplash.com/photo-1515694346937-94d85e41e6f0?w=400&h=300&fit=crop',
      gradient: 'linear-gradient(135deg, #0093E9 0%, #80D0C7 100%)',
      color: '#0093E9',
      emoji: '🌧️',
      description: 'Rain'
    },
    65: {
      image: 'https://images.unsplash.com/photo-1518803194621-27188ba362c9?w=400&h=300&fit=crop',
      gradient: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)',
      color: '#1e3c72',
      emoji: '⛈️',
      description: 'Heavy Rain'
    },
    // Snow
    71: {
      image: 'https://images.unsplash.com/photo-1491002052546-bf38f186af56?w=400&h=300&fit=crop',
      gradient: 'linear-gradient(135deg, #e0e7ff 0%, #cfd9df 100%)',
      color: '#e0e7ff',
      emoji: '🌨️',
      description: 'Light Snow'
    },
    73: {
      image: 'https://images.unsplash.com/photo-1491002052546-bf38f186af56?w=400&h=300&fit=crop',
      gradient: 'linear-gradient(135deg, #d4e4f7 0%, #a3bdd6 100%)',
      color: '#d4e4f7',
      emoji: '❄️',
      description: 'Snow'
    },
    75: {
      image: 'https://images.unsplash.com/photo-1491002052546-bf38f186af56?w=400&h=300&fit=crop',
      gradient: 'linear-gradient(135deg, #b8c6db 0%, #f5f7fa 100%)',
      color: '#b8c6db',
      emoji: '❄️',
      description: 'Heavy Snow'
    },
    // Rain Showers
    80: {
      image: 'https://images.unsplash.com/photo-1433863448220-78aaa064ff47?w=400&h=300&fit=crop',
      gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
      color: '#4facfe',
      emoji: '🌦️',
      description: 'Rain Showers'
    },
    81: {
      image: 'https://images.unsplash.com/photo-1518803194621-27188ba362c9?w=400&h=300&fit=crop',
      gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: '#667eea',
      emoji: '🌧️',
      description: 'Rain Showers'
    },
    82: {
      image: 'https://images.unsplash.com/photo-1527766833261-b09c3163a791?w=400&h=300&fit=crop',
      gradient: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)',
      color: '#1e3c72',
      emoji: '⛈️',
      description: 'Heavy Showers'
    },
    // Thunderstorm
    95: {
      image: 'https://images.unsplash.com/photo-1605727216801-e27ce1d0cc28?w=400&h=300&fit=crop',
      gradient: 'linear-gradient(135deg, #232526 0%, #414345 100%)',
      color: '#232526',
      emoji: '⛈️',
      description: 'Thunderstorm'
    },
    96: {
      image: 'https://images.unsplash.com/photo-1605727216801-e27ce1d0cc28?w=400&h=300&fit=crop',
      gradient: 'linear-gradient(135deg, #283c86 0%, #45a247 100%)',
      color: '#283c86',
      emoji: '⛈️',
      description: 'Thunderstorm'
    },
    99: {
      image: 'https://images.unsplash.com/photo-1527766833261-b09c3163a791?w=400&h=300&fit=crop',
      gradient: 'linear-gradient(135deg, #141e30 0%, #243b55 100%)',
      color: '#141e30',
      emoji: '🌩️',
      description: 'Severe Thunderstorm'
    }
  };

  // Return the visual theme or a default
  return visualMap[weatherCode] || visualMap[0];
};

export const getWeatherIcon = (weatherCode) => {
  const visuals = getWeatherVisuals(weatherCode);
  return visuals.emoji;
};

export const getWeatherGradient = (weatherCode) => {
  const visuals = getWeatherVisuals(weatherCode);
  return visuals.gradient;
};

export const getWeatherImage = (weatherCode) => {
  const visuals = getWeatherVisuals(weatherCode);
  return visuals.image;
};

export const getWeatherColor = (weatherCode) => {
  const visuals = getWeatherVisuals(weatherCode);
  return visuals.color;
};
