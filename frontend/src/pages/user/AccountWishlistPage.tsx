import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { addToCart } from "../../api/cartApi";
import { getApiErrorMessage } from "../../api/authApi";
import { getMyWishlist, removeProductFromWishlist } from "../../api/wishlistApi";
import type { WishlistItem } from "../../types/wishlist";
import { buildImageUrl } from "../../utils/image";

function formatPrice(price: number) {
  return `${price.toLocaleString("vi-VN")} đ`;
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("vi-VN");
}

function getImageUrl(image?: string) {
  return buildImageUrl(image, "https://via.placeholder.com/320x240?text=%E1%BA%A2nh+ch%C6%B0a+c%C3%B3");
}

export default function AccountWishlistPage() {
  const navigate = useNavigate();
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [pendingProductId, setPendingProductId] = useState<number | null>(null);
  const [cartMessage, setCartMessage] = useState("");

  useEffect(() => {
    const fetchWishlist = async () => {
      try {
        setLoading(true);
        setError("");
        setItems(await getMyWishlist());
      } catch (err) {
        setError(getApiErrorMessage(err, "Không thể tải danh sách yêu thích."));
      } finally {
        setLoading(false);
      }
    };

    void fetchWishlist();
  }, []);

  const handleRemove = async (productId: number) => {
    try {
      setPendingProductId(productId);
      setError("");
      await removeProductFromWishlist(productId);
      setItems((current) => current.filter((item) => item.productId !== productId));
    } catch (err) {
      setError(getApiErrorMessage(err, "Không thể xóa sản phẩm khỏi yêu thích."));
    } finally {
      setPendingProductId(null);
    }
  };

  const handleAddToCart = async (productId: number) => {
    try {
      setPendingProductId(productId);
      setError("");
      setCartMessage("");
      await addToCart(productId, 1);
      setCartMessage("Đã thêm sản phẩm vào giỏ hàng.");
    } catch (err) {
      setError(getApiErrorMessage(err, "Không thể thêm sản phẩm vào giỏ hàng."));
    } finally {
      setPendingProductId(null);
    }
  };

  return (
    <section className="wishlist-page">
      <div className="container py-5">
        <div className="wishlist-page-header">
          <div>
            <p className="wishlist-page-subtitle">Tài khoản của bạn</p>
            <h1 className="wishlist-page-title">Sản phẩm yêu thích</h1>
            <p className="wishlist-page-desc">
              Lưu lại các món nội thất bạn muốn xem lại, so sánh hoặc mua sau.
            </p>
          </div>
          <Link to="/products" className="btn btn-domora-outline">
            Tiếp tục xem sản phẩm
          </Link>
        </div>

        {cartMessage && <div className="alert alert-success">{cartMessage}</div>}
        {error && <div className="alert alert-danger">{error}</div>}

        {loading ? (
          <div className="wishlist-empty-state">
            <h3>Đang tải danh sách yêu thích...</h3>
          </div>
        ) : items.length === 0 ? (
          <div className="wishlist-empty-state">
            <div className="wishlist-empty-icon">
              <i className="bi bi-heart"></i>
            </div>
            <h3>Bạn chưa có sản phẩm yêu thích nào</h3>
            <p>Hãy bấm vào biểu tượng trái tim để lưu lại những món đồ nội thất bạn quan tâm.</p>
            <button type="button" className="btn btn-domora" onClick={() => navigate("/products")}>
              Khám phá sản phẩm
            </button>
          </div>
        ) : (
          <div className="wishlist-list">
            {items.map((item) => {
              const isPending = pendingProductId === item.productId;

              return (
                <article className="wishlist-item-card" key={item.productId}>
                  <Link to={`/products/${item.productId}`} className="wishlist-item-image-wrap">
                    <img
                      src={getImageUrl(item.image)}
                      alt={item.productName}
                      className="wishlist-item-image"
                    />
                  </Link>

                  <div className="wishlist-item-content">
                    <div className="wishlist-item-top">
                      <div>
                        <p className="wishlist-item-category">{item.categoryName || "Nội thất"}</p>
                        <Link to={`/products/${item.productId}`} className="wishlist-item-name">
                          {item.productName}
                        </Link>
                      </div>
                      <button
                        type="button"
                        className="wishlist-remove-btn"
                        onClick={() => handleRemove(item.productId)}
                        disabled={isPending}
                      >
                        Xóa khỏi yêu thích
                      </button>
                    </div>

                    <p className="wishlist-item-description">
                      {item.shortDescription || "Sản phẩm nội thất nổi bật cho không gian sống của bạn."}
                    </p>

                    <div className="wishlist-item-meta">
                      <strong>{formatPrice(item.price)}</strong>
                      <span>Đã lưu ngày {formatDate(item.createdAt)}</span>
                    </div>

                    <div className="wishlist-item-actions">
                      <Link to={`/products/${item.productId}`} className="btn btn-domora-outline">
                        Xem chi tiết
                      </Link>
                      <button
                        type="button"
                        className="btn btn-domora"
                        onClick={() => handleAddToCart(item.productId)}
                        disabled={isPending}
                      >
                        {isPending ? "Đang xử lý..." : "Thêm vào giỏ hàng"}
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
