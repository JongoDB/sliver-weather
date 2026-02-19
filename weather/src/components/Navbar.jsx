import { NavLink } from 'react-router-dom'

function Navbar({ darkMode, toggleDarkMode, location, setLocation }) {
  const handleLocationChange = (e) => {
    setLocation(e.target.value)
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      // Trigger weather fetch in the active page
      window.dispatchEvent(new CustomEvent('locationChange', { detail: location }))
    }
  }

  return (
    <nav className="navbar">
      <div className="navbar-content">
        <div className="navbar-top">
          <NavLink to="/" className="brand">
            <svg className="logo" viewBox="0 0 24 24" aria-hidden="true">
              <circle cx="12" cy="12" r="10" fill="url(#g)" />
              <defs>
                <linearGradient id="g" x1="0" x2="1">
                  <stop offset="0" stopColor="#4facfe" />
                  <stop offset="1" stopColor="#00f2fe" />
                </linearGradient>
              </defs>
            </svg>
            <h1>JonDevs Weather</h1>
          </NavLink>

          <div className="navbar-controls">
            <input
              className="location-input"
              type="text"
              placeholder="Enter location..."
              value={location}
              onChange={handleLocationChange}
              onKeyDown={handleKeyDown}
              aria-label="Location"
            />
            <button
              className="mode-toggle"
              onClick={toggleDarkMode}
              aria-label="Toggle dark mode"
              title="Toggle dark mode"
            >
              {darkMode ? '☀️' : '🌙'}
            </button>
          </div>
        </div>

        <ul className="navbar-links">
          <li>
            <NavLink to="/" end>
              Home
            </NavLink>
          </li>
          <li>
            <NavLink to="/today">Today</NavLink>
          </li>
          <li>
            <NavLink to="/hourly">Hourly</NavLink>
          </li>
          <li>
            <NavLink to="/10-day">10 Day</NavLink>
          </li>
          <li>
            <NavLink to="/monthly">Monthly</NavLink>
          </li>
          <li>
            <NavLink to="/explore">Explore</NavLink>
          </li>
        </ul>
      </div>
    </nav>
  )
}

export default Navbar
