import { useState, useEffect } from 'react'
import { fetchMonthlyWeather, weatherCodeToText } from '../utils/api'
import WeatherTile from '../components/WeatherTile'

function Monthly({ location }) {
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
      const data = await fetchMonthlyWeather(location)
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
          <h2>Monthly Forecast</h2>
          <p>Enter a location to see the monthly weather outlook</p>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="container">
        <div className="loading">Loading monthly forecast...</div>
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

  if (!weather || !weather.monthly) {
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
      <h1 className="section-title">30-Day Outlook for {weather.location}</h1>
      <p style={{ color: 'var(--muted)', marginBottom: '24px' }}>
        Updated: {new Date(weather.timestamp).toLocaleString()}
      </p>

      <div className="forecast-grid">
        {weather.monthly.map((day, idx) => (
          <WeatherTile
            key={idx}
            day={day.day.split(',')[0]} // Just show "Mon Jan 1" without full date
            forecast={day}
          />
        ))}
      </div>

      <div className="card" style={{ marginTop: '32px' }}>
        <h3 style={{ marginTop: 0 }}>About Monthly Forecasts</h3>
        <p style={{ color: 'var(--muted)', lineHeight: '1.6' }}>
          Monthly outlooks provide a general trend of expected weather patterns over the next 30 days.
          These extended forecasts are less precise than short-term forecasts and should be used for
          general planning purposes only. Accuracy decreases significantly beyond the first week.
        </p>
        <p style={{ color: 'var(--muted)', lineHeight: '1.6', marginTop: '12px' }}>
          Check back daily for updated forecasts as new data becomes available.
        </p>
      </div>

      <div className="footer" style={{ marginTop: '32px' }}>
        <small>JonDevs Weather • Live data via Open-Meteo API</small>
      </div>
    </div>
  )
}

export default Monthly
