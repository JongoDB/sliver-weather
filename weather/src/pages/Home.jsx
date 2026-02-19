import { useState, useEffect } from 'react'
import { fetchWeather, weatherCodeToText } from '../utils/api'
import WeatherTile from '../components/WeatherTile'
import { getWeatherVisuals } from '../utils/weatherVisuals'

function Home({ location }) {
  const [weather, setWeather] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const loadWeather = async () => {
    if (!location) {
      setWeather(null)
      return
    }

    setLoading(true)
    setError(null)
    try {
      const data = await fetchWeather(location)
      setWeather(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (location) {
      loadWeather()
    }
  }, [])

  useEffect(() => {
    const handleLocationChange = () => {
      loadWeather()
    }

    window.addEventListener('locationChange', handleLocationChange)
    return () => window.removeEventListener('locationChange', handleLocationChange)
  }, [location])

  const WeatherIcon = ({ code }) => {
    const desc = weatherCodeToText(code)?.toLowerCase() || ''
    if (desc.includes('sun') || desc.includes('clear')) {
      return (
        <svg className="weather-icon" viewBox="0 0 24 24" aria-hidden="true">
          <circle cx="12" cy="12" r="5" />
          <g stroke="#fff" strokeWidth="1.5" strokeLinecap="round">
            <line x1="12" y1="1" x2="12" y2="4" />
            <line x1="12" y1="20" x2="12" y2="23" />
            <line x1="1" y1="12" x2="4" y2="12" />
            <line x1="20" y1="12" x2="23" y2="12" />
          </g>
        </svg>
      )
    }
    return (
      <svg className="weather-icon" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M3 15a4 4 0 0 1 4-4h8a3 3 0 0 1 0 6H7a4 4 0 0 1-4-2z" />
      </svg>
    )
  }

  if (!location && !weather) {
    return (
      <div className="container">
        <div className="empty-state">
          <h2>Welcome to JonDevs Weather</h2>
          <p>Enter a location in the search bar above to get started</p>
          <p className="muted">Try: Seattle, Paris, Tokyo, New York, London</p>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="container">
        <div className="loading">Loading weather data...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container">
        <div className="error">Error: {error}</div>
      </div>
    )
  }

  if (!weather) {
    return (
      <div className="container">
        <div className="empty-state">
          <h2>No weather data</h2>
          <p>Press Enter to search for the location</p>
        </div>
      </div>
    )
  }

  const today = weather.forecast[0]
  const visuals = getWeatherVisuals(today?.code)

  return (
    <div className="container">
      <div className="current-weather">
        <div className="current-main">
          <div style={{ marginBottom: '12px' }}>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '4px' }}>{weather.location}</h2>
            <p style={{ opacity: 0.9, fontSize: '0.9rem' }}>
              {new Date(weather.timestamp).toLocaleString()}
            </p>
          </div>
          <div className="current-conditions">
            <div style={{ fontSize: '4rem' }}>{visuals.emoji}</div>
            <div>
              <div className="current-temp">{today?.high || '--'}°F</div>
              <div style={{ fontSize: '1.2rem', opacity: 0.95 }}>{visuals.description || 'N/A'}</div>
            </div>
          </div>
          <div className="current-details">
            <div className="current-detail">
              <div className="current-detail-label">High / Low</div>
              <div className="current-detail-value">
                {today?.high || '--'}° / {today?.low || '--'}°
              </div>
            </div>
            <div className="current-detail">
              <div className="current-detail-label">Conditions</div>
              <div className="current-detail-value">{today?.desc || 'N/A'}</div>
            </div>
          </div>
        </div>

        <div className="card">
          <h3 style={{ marginTop: 0 }}>How to use</h3>
          <ol style={{ paddingLeft: '20px', lineHeight: '1.8' }}>
            <li>Enter a city in the search bar above</li>
            <li>Press Enter to fetch live weather data</li>
            <li>Navigate between different forecast views</li>
            <li>Explore weather news and updates</li>
          </ol>
          <p style={{ color: 'var(--muted)', fontSize: '0.9rem', marginTop: '16px' }}>
            Data sourced from Open-Meteo API
          </p>
        </div>
      </div>

      <div className="home-forecast-layout">
        <div className="forecast-section">
          <h2 className="section-title">7-Day Forecast</h2>
          <div className="forecast-grid">
            {weather.forecast.slice(0, 7).map((day, idx) => (
              <WeatherTile
                key={idx}
                day={day.day}
                forecast={day}
              />
            ))}
          </div>
        </div>

        <div className="highlights-section">
          <div className="card">
            <h2 className="section-title" style={{ marginTop: 0 }}>Today's Highlights</h2>

            <div className="highlight-grid">
              <div className="highlight-card">
                <div className="highlight-label">UV Index</div>
                <div className="highlight-value">{today?.uvIndex?.toFixed(1) || '0.0'}</div>
                <div className="highlight-desc">
                  {(today?.uvIndex || 0) < 3 ? 'Low' :
                   (today?.uvIndex || 0) < 6 ? 'Moderate' :
                   (today?.uvIndex || 0) < 8 ? 'High' : 'Very High'}
                </div>
              </div>

              <div className="highlight-card">
                <div className="highlight-label">Wind Speed</div>
                <div className="highlight-value">{Math.round(today?.windSpeed || 0)}</div>
                <div className="highlight-desc">mph</div>
              </div>

              <div className="highlight-card">
                <div className="highlight-label">Precipitation</div>
                <div className="highlight-value">{(today?.precipitation || 0).toFixed(2)}</div>
                <div className="highlight-desc">inches</div>
              </div>

              <div className="highlight-card">
                <div className="highlight-label">Conditions</div>
                <div className="highlight-value" style={{ fontSize: '2rem' }}>{visuals.emoji}</div>
                <div className="highlight-desc">{visuals.description}</div>
              </div>
            </div>

            <p style={{ color: 'var(--muted)', fontSize: '0.75rem', marginTop: 'auto', marginBottom: 0, paddingTop: '12px' }}>
              Last updated: {new Date(weather.timestamp).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })}
            </p>
          </div>
        </div>
      </div>

      <div className="footer">
        <small>JonDevs Weather • Live data via Open-Meteo API</small>
      </div>
    </div>
  )
}

export default Home
