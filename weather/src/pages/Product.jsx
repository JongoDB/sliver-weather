import { useParams, Link } from 'react-router-dom'
import { mockAds } from '../data/mockAds'

function Product() {
  const { id } = useParams()
  const product = mockAds.find(a => a.id === Number(id) && a.type === 'product')

  if (!product) {
    return (
      <div className="container">
        <div className="article-not-found">
          <h2>Product Not Found</h2>
          <p>The product you're looking for doesn't exist.</p>
          <Link to="/explore" className="back-link">Back to Explore</Link>
        </div>
      </div>
    )
  }

  const renderStars = (rating) => {
    const full = Math.floor(rating)
    const hasHalf = rating % 1 >= 0.3
    const stars = []
    for (let i = 0; i < full; i++) stars.push('\u2605')
    if (hasHalf) stars.push('\u2606')
    return stars.join('')
  }

  const formatBold = (text) => {
    const parts = text.split(/(\*\*.+?\*\*)/g)
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i}>{part.slice(2, -2)}</strong>
      }
      return part
    })
  }

  const renderContent = (text) => {
    return text.split('\n\n').map((paragraph, idx) => {
      if (paragraph.startsWith('- ')) {
        const items = paragraph.split('\n').filter(l => l.startsWith('- '))
        return (
          <ul key={idx} className="article-list">
            {items.map((item, i) => (
              <li key={i}>{formatBold(item.replace(/^- /, ''))}</li>
            ))}
          </ul>
        )
      }

      if (paragraph.startsWith('**') && paragraph.indexOf('**', 2) < 80) {
        const match = paragraph.match(/^\*\*(.+?)\*\*(.*)$/s)
        if (match) {
          return (
            <div key={idx}>
              <h3 className="article-subheading">{match[1]}</h3>
              {match[2].trim() && <p className="article-paragraph">{formatBold(match[2].trim())}</p>}
            </div>
          )
        }
      }

      if (paragraph.includes('\n**')) {
        const lines = paragraph.split('\n')
        return (
          <div key={idx}>
            {lines.map((line, i) => {
              const boldMatch = line.match(/^\*\*(.+?)\*\*\s*(.*)$/)
              if (boldMatch) {
                return (
                  <div key={i} className="article-detail-item">
                    <strong>{boldMatch[1]}</strong> {boldMatch[2]}
                  </div>
                )
              }
              return line.trim() ? <p key={i} className="article-paragraph">{formatBold(line)}</p> : null
            })}
          </div>
        )
      }

      // Check for quoted testimonials
      if (paragraph.startsWith('"') || paragraph.startsWith('\u201c')) {
        return <blockquote key={idx} className="product-quote">{formatBold(paragraph)}</blockquote>
      }

      return <p key={idx} className="article-paragraph">{formatBold(paragraph)}</p>
    })
  }

  return (
    <div className="container">
      <div className="article-page">
        <Link to="/explore" className="back-link">Back to Explore</Link>

        <div className="product-header">
          <div className="product-header-content">
            <h1 className="article-title">{product.title}</h1>
            <p className="product-tagline">{product.description}</p>
            <div className="product-meta">
              <span className="product-price">{product.price}</span>
              <span className="product-rating">
                <span className="product-stars">{renderStars(product.rating)}</span>
                {' '}{product.rating} / 5.0
              </span>
            </div>
          </div>
          <img
            src={product.image.replace('w=300&h=250', 'w=600&h=400')}
            alt={product.title}
            className="product-header-image"
            onError={(e) => {
              e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="600" height="400"%3E%3Crect fill="%23e5e7eb" width="600" height="400"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" fill="%236b7280"%3EProduct Image%3C/text%3E%3C/svg%3E'
            }}
          />
        </div>

        {product.features && (
          <div className="product-features">
            <h2 className="article-subheading">Key Features</h2>
            <ul className="product-feature-list">
              {product.features.map((feature, idx) => (
                <li key={idx}>{feature}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="article-body">
          {renderContent(product.content)}
        </div>

        <div className="article-footer">
          <Link to="/explore" className="back-link">Back to Explore</Link>
        </div>
      </div>
    </div>
  )
}

export default Product
