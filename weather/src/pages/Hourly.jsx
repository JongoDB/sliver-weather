import { useState, useEffect } from 'react'
import { fetchHourlyWeather, weatherCodeToText } from '../utils/api'
import { getWeatherVisuals, getWeatherIcon } from '../utils/weatherVisuals'

function Hourly({ location }) {
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
      const data = await fetchHourlyWeather(location)
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
        <svg className="weather-icon weather-icon-small" viewBox="0 0 24 24" aria-hidden="true">
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
      <svg className="weather-icon weather-icon-small" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M3 15a4 4 0 0 1 4-4h8a3 3 0 0 1 0 6H7a4 4 0 0 1-4-2z" />
      </svg>
    )
  }

  if (!location && !weather) {
    return (
      <div className="container">
        <div className="empty-state">
          <h2>Hourly Forecast</h2>
          <p>Enter a location to see the hourly weather forecast</p>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="container">
        <div className="loading">Loading hourly forecast...</div>
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

  if (!weather || !weather.hourly) {
    return (
      <div className="container">
        <div className="empty-state">
          <h2>No forecast data</h2>
          <p>Press Enter to search for the location</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container">
      <h1 className="section-title">24-Hour Forecast for {weather.location}</h1>
      <p style={{ color: 'var(--muted)', marginBottom: '24px' }}>
        Updated: {new Date(weather.timestamp).toLocaleString()}
      </p>

      <div className="hourly-timeline">
        {weather.hourly.map((hour, idx) => {
          const visuals = getWeatherVisuals(hour.code);
          // Convert precipitation percentage to simulated inches (rough estimate)
          const precipInches = (hour.precipitation / 100) * 0.5;
          const precipDisplay = precipInches > 0 ? precipInches.toFixed(2) : '0.00';

          return (
            <div key={idx} className="hourly-row">
              <div className="hourly-row-time">
                <div className="hourly-time-label">{hour.time}</div>
                <div className="hourly-emoji">{visuals.emoji}</div>
              </div>

              <div className="hourly-row-content">
                <div className="hourly-info">
                  <div className="hourly-temp-display">{hour.temp}°F</div>
                  <div className="hourly-condition">{visuals.description}</div>
                </div>

                <div className="hourly-precip-section">
                  <div className="precip-label">Precipitation</div>
                  <div className="precip-bar-container">
                    <div
                      className="precip-bar"
                      style={{
                        width: `${hour.precipitation}%`,
                        background: hour.precipitation > 60 ?
                          'linear-gradient(90deg, #1e3c72, #2a5298)' :
                          hour.precipitation > 30 ?
                          'linear-gradient(90deg, #4facfe, #00f2fe)' :
                          'linear-gradient(90deg, #89f7fe, #66a6ff)'
                      }}
                    >
                      <span className="precip-bar-text">{hour.precipitation}%</span>
                    </div>
                  </div>
                  <div className="precip-amount">{precipDisplay} in</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="footer" style={{ marginTop: '32px' }}>
        <small>JonDevs Weather • Live data via Open-Meteo API</small>
      </div>
    </div>
  )
}

export default Hourly
