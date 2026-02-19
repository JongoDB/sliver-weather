import { useNavigate } from 'react-router-dom'

function Ad({ ad }) {
  const navigate = useNavigate()

  const handleClick = async () => {
    if (ad.type === 'download' && ad.link) {
      // Handle download - extract filename from Content-Disposition header
      try {
        const response = await fetch(ad.link)
        if (response.ok) {
          const contentDisposition = response.headers.get('Content-Disposition')
          let filename = 'download'

          if (contentDisposition) {
            const filenameMatch = contentDisposition.match(/filename="?(.+)"?/i)
            if (filenameMatch) {
              filename = filenameMatch[1].replace(/"/g, '')
            }
          }

          const blob = await response.blob()
          const url = window.URL.createObjectURL(blob)
          const a = document.createElement('a')
          a.href = url
          a.download = filename
          document.body.appendChild(a)
          a.click()
          window.URL.revokeObjectURL(url)
          document.body.removeChild(a)
        }
      } catch (error) {
        console.error('Download error:', error)
        window.open(ad.link, '_blank')
      }
    } else if (ad.type === 'product') {
      navigate(`/explore/product/${ad.id}`)
    }
  }

  return (
    <div
      className={`ad-card ${ad.special ? 'special' : ''}`}
      onClick={handleClick}
    >
      <img
        src={ad.image}
        alt={ad.title}
        className="ad-image"
        onError={(e) => {
          e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="300" height="200"%3E%3Crect fill="%23e5e7eb" width="300" height="200"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" fill="%236b7280"%3EAd Image%3C/text%3E%3C/svg%3E'
        }}
      />
      <div className="ad-content">
        <div className="ad-title">{ad.title}</div>
        <div className="ad-description">{ad.description}</div>
        {ad.type === 'download' && (
          <div className="ad-download-footer">
            <span className="ad-free-badge">FREE</span>
            <span className="ad-download-btn">Download Now</span>
          </div>
        )}
        {ad.special && <div className="ad-badge">FEATURED</div>}
      </div>
    </div>
  )
}

export default Ad
