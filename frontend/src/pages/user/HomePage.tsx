import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { getFeaturedProducts } from "../../api/productApi";
import type { Product } from "../../types/product";
import { buildImageUrl } from "../../utils/image";

function formatPrice(price: number) {
  return `${price.toLocaleString("vi-VN")} đ`;
}

function getProductImage(image?: string) {
  return buildImageUrl(image, "https://via.placeholder.com/400x320?text=%E1%BA%A2nh+ch%C6%B0a+c%C3%B3");
}

export default function HomePage() {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchFeaturedProducts = async () => {
      try {
        setLoading(true);
        setError("");
        const data = await getFeaturedProducts(12);
        setFeaturedProducts(data);
      } catch (err) {
        console.error(err);
        setError("Không thể tải sản phẩm nổi bật.");
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedProducts();
  }, []);

  return (
    <>
      <section className="hero-section text-center">
        <div className="container hero-content">
          <h4 className="hero-subtitle">Bộ sưu tập cao cấp</h4>
          <h1 className="hero-title">Kiến Tạo Tổ Ấm Domora</h1>
          <p className="hero-desc">
            Mang đến sự tinh tế trong từng đường nét gỗ tự nhiên, biến không gian sống
            trở thành nơi thư giãn lý tưởng nhất.
          </p>

          <div className="d-flex gap-3 justify-content-center flex-wrap">
            <Link to="/products" className="btn btn-domora btn-lg px-5 py-3 shadow">
              KHÁM PHÁ NGAY
            </Link>
            <a href="#featured" className="btn btn-outline-light btn-lg px-5 py-3 rounded-0">
              BỘ SƯU TẬP
            </a>
          </div>
        </div>
      </section>

      <section className="py-5 bg-white" id="featured">
        <div className="container py-5">
          <div className="text-center mb-5">
            <h2 className="display-4 fw-bold mb-2 section-title">Sản phẩm nổi bật</h2>
            <div className="featured-divider mx-auto"></div>
            <p className="text-muted mt-3">
              Những thiết kế được yêu thích nhất mùa này tại Domora.
            </p>
          </div>

          {loading ? (
            <div className="text-center py-5">Đang tải sản phẩm nổi bật...</div>
          ) : error ? (
            <div className="text-center py-5 text-danger">{error}</div>
          ) : featuredProducts.length > 0 ? (
            <div className="row g-4">
              {featuredProducts.map((product) => (
                <div className="col-6 col-md-4 col-lg-3" key={product.id}>
                  <div className="card h-100 border-0 shadow-sm product-card">
                    <div className="product-card-image-wrap">
                      <Link to={`/products/${product.id}`}>
                        <img
                          src={getProductImage(product.image)}
                          className="w-100 h-100 product-card-image"
                          alt={product.name}
                        />
                      </Link>
                    </div>

                    <div className="card-body text-center p-4">
                      <p className="text-muted small text-uppercase mb-1">
                        {product.categoryName || "Nội thất"}
                      </p>
                      <h6 className="fw-bold mb-2">{product.name}</h6>
                      <p className="product-price">{formatPrice(product.price)}</p>
                      <Link
                        to={`/products/${product.id}`}
                        className="btn btn-outline-dark btn-sm w-100 mt-2 rounded-0"
                      >
                        Xem chi tiết
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-5 text-muted">Chưa có sản phẩm nổi bật.</div>
          )}
        </div>
      </section>
    </>
  );
}
