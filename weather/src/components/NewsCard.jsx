function NewsCard({ article }) {
  const handleClick = () => {
    if (article.link && article.link !== '#') {
      window.open(article.link, '_blank')
    }
  }

  const handleReadMore = (e) => {
    e.stopPropagation()
    if (article.link && article.link !== '#') {
      window.open(article.link, '_blank')
    }
  }

  return (
    <div className="news-card" onClick={handleClick}>
      <img
        src={article.thumbnail}
        alt={article.title}
        className="news-thumbnail"
        onError={(e) => {
          e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300"%3E%3Crect fill="%23e5e7eb" width="400" height="300"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" fill="%236b7280"%3EWeather News%3C/text%3E%3C/svg%3E'
        }}
      />
      <div className="news-content">
        <span className="news-category">{article.category}</span>
        <h3 className="news-title">{article.title}</h3>
        <p className="news-description">{article.description}</p>
        <div className="news-footer">
          <span className="news-date">{article.date}</span>
          <button className="read-more-btn" onClick={handleReadMore}>
            Read More
          </button>
        </div>
      </div>
    </div>
  )
}

export default NewsCard
