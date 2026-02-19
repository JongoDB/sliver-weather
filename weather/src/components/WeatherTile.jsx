import { getWeatherVisuals } from '../utils/weatherVisuals'

function WeatherTile({ day, forecast, size = 'normal' }) {
  const visuals = getWeatherVisuals(forecast.code)

  const tileStyle = {
    backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.5)), url(${visuals.image})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    color: 'white',
    position: 'relative',
    overflow: 'hidden'
  }

  return (
    <div className={`weather-tile weather-tile-${size}`} style={tileStyle}>
      <div className="weather-tile-content">
        <div className="weather-tile-header">
          <span className="weather-tile-day">{day}</span>
          <span className="weather-tile-emoji">{visuals.emoji}</span>
        </div>

        <div className="weather-tile-temps">
          <div className="weather-tile-high">{forecast.high}°</div>
          <div className="weather-tile-low">{forecast.low}°</div>
        </div>

        <div className="weather-tile-desc">{visuals.description}</div>
      </div>

      <div className="weather-tile-gradient" style={{ background: visuals.gradient }}></div>
    </div>
  )
}

export default WeatherTile
