import { useState, useEffect } from 'react'
import { fetchWeather, weatherCodeToText } from '../utils/api'
import { getWeatherVisuals } from '../utils/weatherVisuals'

function Today({ location }) {
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

  const WeatherIcon = ({ code, size = 'normal' }) => {
    const desc = weatherCodeToText(code)?.toLowerCase() || ''
    const className = size === 'small' ? 'weather-icon weather-icon-small' : 'weather-icon'

    if (desc.includes('sun') || desc.includes('clear')) {
      return (
        <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
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
      <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
        <path d="M3 15a4 4 0 0 1 4-4h8a3 3 0 0 1 0 6H7a4 4 0 0 1-4-2z" />
      </svg>
    )
  }

  if (!location && !weather) {
    return (
      <div className="container">
        <div className="empty-state">
          <h2>Today's Forecast</h2>
          <p>Enter a location to see today's detailed weather forecast</p>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="container">
        <div className="loading">Loading today's forecast...</div>
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

  if (!weather || !weather.forecast.length) {
    return (
      <div className="container">
        <div className="empty-state">
          <h2>No forecast data</h2>
          <p>Press Enter to search for the location</p>
        </div>
      </div>
    )
  }

  const today = weather.forecast[0]
  const visuals = getWeatherVisuals(today.code)

  return (
    <div className="container">
      <h1 className="section-title">Today's Forecast for {weather.location}</h1>

      <div className="current-main" style={{ marginBottom: '24px' }}>
        <div className="current-conditions">
          <div style={{ fontSize: '4rem' }}>{visuals.emoji}</div>
          <div>
            <div className="current-temp">{today.high}°F</div>
            <div style={{ fontSize: '1.2rem', opacity: 0.95 }}>{visuals.description}</div>
          </div>
        </div>
        <div className="current-details">
          <div className="current-detail">
            <div className="current-detail-label">High Temperature</div>
            <div className="current-detail-value">{today.high}°F</div>
          </div>
          <div className="current-detail">
            <div className="current-detail-label">Low Temperature</div>
            <div className="current-detail-value">{today.low}°F</div>
          </div>
          <div className="current-detail">
            <div className="current-detail-label">Conditions</div>
            <div className="current-detail-value">{today.desc}</div>
          </div>
          <div className="current-detail">
            <div className="current-detail-label">Day</div>
            <div className="current-detail-value">{today.day}</div>
          </div>
        </div>
      </div>

      <div className="card" style={{ marginBottom: '24px' }}>
        <h2 style={{ marginTop: 0, marginBottom: '16px' }}>Today's Details</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
          <div>
            <div style={{ fontWeight: '600', marginBottom: '8px' }}>Temperature Range</div>
            <div style={{ color: 'var(--muted)' }}>
              High: {today.high}°F<br />
              Low: {today.low}°F<br />
              Range: {today.high - today.low}°F
            </div>
          </div>
          <div>
            <div style={{ fontWeight: '600', marginBottom: '8px' }}>Sky Conditions</div>
            <div style={{ color: 'var(--muted)' }}>{today.desc}</div>
          </div>
          <div>
            <div style={{ fontWeight: '600', marginBottom: '8px' }}>Date</div>
            <div style={{ color: 'var(--muted)' }}>
              {new Date(today.date).toLocaleDateString(undefined, {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </div>
          </div>
        </div>
      </div>

      <div className="footer">
        <small>JonDevs Weather • Live data via Open-Meteo API</small>
      </div>
    </div>
  )
}

export default Today
