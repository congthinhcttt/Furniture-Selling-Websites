import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getNewsArticleById } from "../../api/newsApi";
import type { NewsArticle } from "../../types/news";
import { buildImageUrl } from "../../utils/image";

function getNewsImageUrl(image?: string) {
  return buildImageUrl(image, "https://via.placeholder.com/1200x800?text=Tin+t%E1%BB%A9c+DOMORA");
}

export default function NewsDetailPage() {
  const { id } = useParams();
  const [article, setArticle] = useState<NewsArticle | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const articleId = Number(id);

    if (!articleId) {
      setError("Tin tức không tồn tại.");
      setLoading(false);
      return;
    }

    const fetchArticle = async () => {
      try {
        setLoading(true);
        setError("");
        const data = await getNewsArticleById(articleId);
        setArticle(data);
      } catch (err) {
        console.error(err);
        setError("Không thể tải nội dung tin tức.");
      } finally {
        setLoading(false);
      }
    };

    fetchArticle();
  }, [id]);

  return (
    <section className="info-page">
      <div className="info-page-hero info-page-hero-news">
        <div className="container">
          <p className="info-page-kicker">Nhật ký DOMORA</p>
          <h1 className="info-page-title">Chi tiết tin tức</h1>
          <p className="info-page-desc">Khám phá nội dung đầy đủ của từng bài viết từ DOMORA.</p>
        </div>
      </div>

      <div className="container info-page-section">
        {loading ? (
          <div className="empty-product-box text-center">
            <h4>Đang tải bài viết</h4>
            <p>DOMORA đang chuẩn bị nội dung cho bạn.</p>
          </div>
        ) : error || !article ? (
          <div className="empty-product-box text-center">
            <h4>Không tìm thấy bài viết</h4>
            <p>{error || "Bài viết này hiện không còn khả dụng."}</p>
            <Link to="/news" className="btn btn-outline-dark mt-3">
              Quay lại tin tức
            </Link>
          </div>
        ) : (
          <article className="news-detail-shell">
            <Link to="/news" className="news-detail-back">
              Quay lại danh sách tin tức
            </Link>
            <span className="info-card-tag">{article.topic}</span>
            <h2 className="news-detail-title">{article.title}</h2>
            <div className="news-detail-image-wrap">
              <img src={getNewsImageUrl(article.image)} alt={article.title} className="news-detail-image" />
            </div>
            <div className="news-detail-content">
              {article.content.split(/\n+/).map((paragraph, index) => (
                <p key={`${article.id}-${index}`}>{paragraph}</p>
              ))}
            </div>
          </article>
        )}
      </div>
    </section>
  );
}
