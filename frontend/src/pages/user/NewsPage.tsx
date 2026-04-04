import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getNewsArticles } from "../../api/newsApi";
import type { NewsArticle } from "../../types/news";
import { buildImageUrl } from "../../utils/image";

function getNewsImageUrl(image?: string) {
  return buildImageUrl(image, "https://via.placeholder.com/1200x800?text=Tin+t%E1%BB%A9c+DOMORA");
}

export default function NewsPage() {
  const [newsArticles, setNewsArticles] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchNews = async () => {
      try {
        setLoading(true);
        setError("");
        const data = await getNewsArticles();
        setNewsArticles(data);
      } catch (err) {
        console.error(err);
        setError("Không thể tải danh sách tin tức.");
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, []);

  return (
    <section className="info-page">
      <div className="info-page-hero info-page-hero-news">
        <div className="container">
          <p className="info-page-kicker">Nhật ký DOMORA</p>
          <h1 className="info-page-title">Tin tức</h1>
          <p className="info-page-desc">
            Cập nhật xu hướng nội thất, mẹo bài trí và những câu chuyện giúp bạn hoàn thiện không
            gian sống theo phong cách riêng.
          </p>
        </div>
      </div>

      <div className="container info-page-section">
        {loading ? (
          <div className="empty-product-box text-center">
            <h4>Đang tải tin tức</h4>
            <p>DOMORA đang chuẩn bị nội dung cho bạn.</p>
          </div>
        ) : error ? (
          <div className="empty-product-box text-center">
            <h4>Có lỗi xảy ra</h4>
            <p>{error}</p>
          </div>
        ) : (
          <div className="row g-4">
            {newsArticles.map((item) => (
              <div className="col-md-6 col-xl-4" key={item.id}>
                <Link to={`/news/${item.id}`} className="info-news-link">
                  <article className="info-card info-news-card h-100">
                    <div className="info-news-image-wrap">
                      <img src={getNewsImageUrl(item.image)} alt={item.title} className="info-news-image" />
                    </div>
                    <h3 className="info-news-title">{item.title}</h3>
                  </article>
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
