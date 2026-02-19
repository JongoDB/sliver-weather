import { useParams, Link } from 'react-router-dom'
import { mockNews } from '../data/mockNews'

function Article() {
  const { id } = useParams()
  const article = mockNews.find(a => a.id === Number(id))

  if (!article) {
    return (
      <div className="container">
        <div className="article-not-found">
          <h2>Article Not Found</h2>
          <p>The article you're looking for doesn't exist.</p>
          <Link to="/explore" className="back-link">Back to Explore</Link>
        </div>
      </div>
    )
  }

  // Convert markdown-like bold (**text**) to JSX
  const renderContent = (text) => {
    return text.split('\n\n').map((paragraph, idx) => {
      // Check if paragraph is a list item
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

      // Check if paragraph starts with bold (section header)
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

      // Check for multiple bold items (like a list without dashes)
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

      return <p key={idx} className="article-paragraph">{formatBold(paragraph)}</p>
    })
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

  return (
    <div className="container">
      <div className="article-page">
        <Link to="/explore" className="back-link">Back to Explore</Link>

        <div className="article-header">
          <span className="news-category">{article.category}</span>
          <h1 className="article-title">{article.title}</h1>
          <div className="article-meta">
            <span className="article-author">By {article.author}</span>
            <span className="article-date">{article.date}</span>
          </div>
        </div>

        <img
          src={article.thumbnail.replace('w=400&h=300', 'w=1200&h=500')}
          alt={article.title}
          className="article-hero-image"
          onError={(e) => {
            e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="1200" height="500"%3E%3Crect fill="%23e5e7eb" width="1200" height="500"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" fill="%236b7280"%3EWeather News%3C/text%3E%3C/svg%3E'
          }}
        />

        <div className="article-body">
          {renderContent(article.content)}
        </div>

        <div className="article-footer">
          <Link to="/explore" className="back-link">Back to Explore</Link>
        </div>
      </div>
    </div>
  )
}

export default Article
