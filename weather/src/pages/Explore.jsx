import NewsCard from '../components/NewsCard'
import Ad from '../components/Ad'
import { mockNews } from '../data/mockNews'
import { mockAds } from '../data/mockAds'

function Explore() {
  return (
    <div className="container">
      <h1 className="section-title">Explore Weather News & Updates</h1>
      <p style={{ color: 'var(--muted)', marginBottom: '32px' }}>
        Stay informed with the latest weather news, alerts, and analysis
      </p>

      <div className="news-grid">
        {mockNews.map((article) => (
          <NewsCard key={article.id} article={article} />
        ))}
      </div>

      <div className="ads-section">
        <h2 className="section-title">Featured</h2>
        <div className="ads-grid">
          {mockAds.map((ad) => (
            <Ad key={ad.id} ad={ad} />
          ))}
        </div>
      </div>

      <div className="footer" style={{ marginTop: '48px' }}>
        <small>JonDevs Weather • Explore weather news and resources</small>
      </div>
    </div>
  )
}

export default Explore
