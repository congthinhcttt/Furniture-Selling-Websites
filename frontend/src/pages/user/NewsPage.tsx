import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { getNewsArticles } from "../../api/newsApi";
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

export default function NewsPage() {
  const [newsArticles, setNewsArticles] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const hero = getNewsHeroContent();

  useEffect(() => {
    const fetchNews = async () => {
      try {
        setLoading(true);
        setError("");
        const data = await getNewsArticles();
        setNewsArticles(data);
      } catch (err) {
        console.error(err);
        setError("Không thể tải danh sách bài viết lúc này.");
      } finally {
        setLoading(false);
      }
    };

    void fetchNews();
  }, []);

  const featuredArticle = newsArticles[0] || null;
  const secondaryArticles = useMemo(() => newsArticles.slice(1), [newsArticles]);
  const featuredPresentation = featuredArticle ? getNewsArticlePresentation(featuredArticle) : null;

  return (
    <section className="info-page info-page-news">
      <div className="info-page-hero info-page-hero-news">
        <div className="container">
          <div className="info-news-hero-shell">
            <p className="info-page-kicker">{hero.kicker}</p>
            <p className="info-news-hero-eyebrow">{hero.eyebrow}</p>
            <h1 className="info-page-title">{hero.title}</h1>
            <p className="info-page-desc">{hero.description}</p>
          </div>
        </div>
      </div>

      <div className="container info-page-section info-news-section">
        {loading ? (
          <div className="empty-product-box text-center">
            <h4>Đang tải bài viết</h4>
            <p>DOMORA đang chuẩn bị chuyên mục cảm hứng cho bạn.</p>
          </div>
        ) : error ? (
          <div className="empty-product-box text-center">
            <h4>Chưa thể hiển thị Tin tức</h4>
            <p>{error}</p>
          </div>
        ) : newsArticles.length === 0 ? (
          <div className="empty-product-box text-center">
            <h4>Chưa có bài viết</h4>
            <p>DOMORA sẽ sớm cập nhật thêm những ý tưởng nội thất mới cho bạn.</p>
          </div>
        ) : (
          <div className="info-news-shell">
            {featuredArticle ? (
              <Link to={`/news/${featuredArticle.id}`} className="info-news-featured-link">
                <article className="info-news-featured">
                  <div className="info-news-featured__image-wrap">
                    <img
                      src={getNewsImageUrl(featuredArticle.image)}
                      alt={featuredPresentation?.title}
                      className="info-news-featured__image"
                    />
                  </div>
                  <div className="info-news-featured__content">
                    <span className="info-card-tag">{featuredPresentation?.topic}</span>
                    <h2 className="info-news-featured__title">{featuredPresentation?.title}</h2>
                    <p className="info-news-featured__excerpt">{featuredPresentation?.excerpt}</p>
                    <span className="info-news-featured__cta">Đọc bài viết</span>
                  </div>
                </article>
              </Link>
            ) : null}

            <div className="info-news-grid-head">
              <div>
                <p className="info-page-kicker">Bài viết chọn lọc</p>
                <h2>Những góc nhìn giúp ngôi nhà trông ấm, gọn và có gu hơn</h2>
              </div>
              <p>
                Tập trung vào tỷ lệ, vật liệu và bảng màu để mỗi lựa chọn nội thất đều trở nên dễ áp dụng hơn.
              </p>
            </div>

            <div className="info-news-grid">
              {secondaryArticles.map((item) => {
                const presentation = getNewsArticlePresentation(item);
                return (
                  <Link to={`/news/${item.id}`} className="info-news-link" key={item.id}>
                    <article className="info-news-card">
                      <div className="info-news-image-wrap">
                        <img
                          src={getNewsImageUrl(item.image)}
                          alt={presentation.title}
                          className="info-news-image"
                        />
                      </div>
                      <div className="info-news-card__body">
                        <span className="info-card-tag">{presentation.topic}</span>
                        <h3 className="info-news-title">{presentation.title}</h3>
                        <p className="info-news-excerpt">{presentation.excerpt}</p>
                        <span className="info-news-meta">Khám phá cùng DOMORA</span>
                      </div>
                    </article>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
