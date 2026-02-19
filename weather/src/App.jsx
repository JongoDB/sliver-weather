import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { useState } from 'react'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import Today from './pages/Today'
import Hourly from './pages/Hourly'
import TenDay from './pages/TenDay'
import Monthly from './pages/Monthly'
import Explore from './pages/Explore'

function App() {
  const [darkMode, setDarkMode] = useState(false)
  const [location, setLocation] = useState('')

  const toggleDarkMode = () => {
    setDarkMode(!darkMode)
    document.body.classList.toggle('dark')
  }

  return (
    <Router basename="/weather">
      <div className={darkMode ? 'app dark' : 'app'}>
        <Navbar
          darkMode={darkMode}
          toggleDarkMode={toggleDarkMode}
          location={location}
          setLocation={setLocation}
        />
        <Routes>
          <Route path="/" element={<Home location={location} />} />
          <Route path="/today" element={<Today location={location} />} />
          <Route path="/hourly" element={<Hourly location={location} />} />
          <Route path="/10-day" element={<TenDay location={location} />} />
          <Route path="/monthly" element={<Monthly location={location} />} />
          <Route path="/explore" element={<Explore />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App
