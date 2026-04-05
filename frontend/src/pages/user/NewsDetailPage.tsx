import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getNewsArticleById } from "../../api/newsApi";
import type { NewsArticle } from "../../types/news";
import { buildImageUrl } from "../../utils/image";
import {
  getNewsArticlePresentation,
  getNewsHeroContent,
  getNewsImageUrlFallback,
} from "../../utils/newsPresentation";

function getNewsImageUrl(image?: string) {
  return buildImageUrl(image, getNewsImageUrlFallback());
}

export default function NewsDetailPage() {
  const { id } = useParams();
  const [article, setArticle] = useState<NewsArticle | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const hero = getNewsHeroContent();

  useEffect(() => {
    const articleId = Number(id);

    if (!articleId) {
      setError("Bài viết không tồn tại.");
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
        setError("Không thể tải nội dung bài viết.");
      } finally {
        setLoading(false);
      }
    };

    void fetchArticle();
  }, [id]);

  const presentation = useMemo(
    () => (article ? getNewsArticlePresentation(article) : null),
    [article]
  );

  return (
    <section className="info-page info-page-news">
      <div className="info-page-hero info-page-hero-news">
        <div className="container">
          <div className="info-news-hero-shell info-news-hero-shell--detail">
            <p className="info-page-kicker">{hero.kicker}</p>
            <p className="info-news-hero-eyebrow">Một lát cắt nhỏ để ngôi nhà trở nên hài hòa và dễ sống hơn</p>
            <h1 className="info-page-title">Góc đọc cùng DOMORA</h1>
            <p className="info-page-desc">
              Những bài viết ngắn gọn, giàu cảm hứng để bạn tìm ra nhịp thẩm mỹ phù hợp cho từng không gian sống.
            </p>
          </div>
        </div>
      </div>

      <div className="container info-page-section info-news-section">
        {loading ? (
          <div className="empty-product-box text-center">
            <h4>Đang tải bài viết</h4>
            <p>DOMORA đang chuẩn bị nội dung cho bạn.</p>
          </div>
        ) : error || !article || !presentation ? (
          <div className="empty-product-box text-center">
            <h4>Không tìm thấy bài viết</h4>
            <p>{error || "Bài viết này hiện không còn khả dụng."}</p>
            <Link to="/news" className="btn btn-outline-dark mt-3">
              Quay lại Tin tức
            </Link>
          </div>
        ) : (
          <article className="news-detail-shell">
            <Link to="/news" className="news-detail-back">
              Quay lại chuyên mục Tin tức
            </Link>
            <header className="news-detail-header">
              <span className="info-card-tag">{presentation.topic}</span>
              <h2 className="news-detail-title">{presentation.title}</h2>
              <p className="news-detail-intro">{presentation.excerpt}</p>
            </header>

            <div className="news-detail-image-wrap">
              <img src={getNewsImageUrl(article.image)} alt={presentation.title} className="news-detail-image" />
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
