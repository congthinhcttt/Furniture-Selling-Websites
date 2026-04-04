import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { getApiErrorMessage } from "../../api/authApi";
import { addToCart } from "../../api/cartApi";
import { useAuth } from "../../hooks/useAuth";
import { getProductById, getProducts } from "../../api/productApi";
import { getProductReviews, getProductReviewSummary, markReviewHelpful, unmarkReviewHelpful } from "../../api/reviewApi";
import ReviewList from "../../components/review/ReviewList";
import ReviewSummary from "../../components/review/ReviewSummary";
import type { Product } from "../../types/product";
import type {
  Review,
  ReviewPageResponse,
  ReviewQueryParams,
  ReviewSummary as ReviewSummaryType,
} from "../../types/review";
import { getColorSwatch } from "../../utils/color";
import { buildImageUrl } from "../../utils/image";

function formatPrice(price: number) {
  return `${price.toLocaleString("vi-VN")} đ`;
}

function getImageUrl(image?: string) {
  return buildImageUrl(image, "https://via.placeholder.com/800x600?text=%E1%BA%A2nh+ch%C6%B0a+c%C3%B3");
}

function formatDimensions(product: Product) {
  return `${product.width} x ${product.length} cm`;
}

function buildProductHighlights(product: Product) {
  return [
    `Thiết kế thuộc dòng ${product.categoryName || "nội thất"} phù hợp với không gian sống hiện đại.`,
    `Màu sắc chủ đạo: ${product.color || "đang cập nhật"}.`,
    `Kích thước tham khảo: ${formatDimensions(product)}.`,
    `Số lượng hiện có trong kho: ${product.stockQuantity}.`,
  ];
}

function buildMaterialNotes(product: Product) {
  return [
    "Khung và bề mặt hoàn thiện theo phong cách nội thất hiện đại, dễ phối với nhiều không gian.",
    `Tông ${product.color?.toLowerCase() || "trung tính"} giúp sản phẩm dễ kết hợp với các món nội thất khác.`,
    "Phù hợp cho căn hộ, nhà phố và khu vực trưng bày theo phong cách tối giản hoặc ấm cúng.",
  ];
}

export default function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { auth } = useAuth();
  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [selectedColor, setSelectedColor] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [addToCartLoading, setAddToCartLoading] = useState(false);
  const [cartMessage, setCartMessage] = useState("");
  const [reviewSummary, setReviewSummary] = useState<ReviewSummaryType | null>(null);
  const [reviewPage, setReviewPage] = useState<ReviewPageResponse | null>(null);
  const [reviewLoading, setReviewLoading] = useState(true);
  const [reviewError, setReviewError] = useState("");
  const [helpfulLoadingId, setHelpfulLoadingId] = useState<number | null>(null);
  const [reviewQuery, setReviewQuery] = useState<ReviewQueryParams>({
    page: 1,
    size: 6,
    sort: "newest",
  });

  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) {
        setError("Không xác định được sản phẩm.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");
        const data = await getProductById(Number(id));
        setProduct(data);
        setSelectedColor(data.color || "");
        setQuantity(data.stockQuantity > 0 ? 1 : 0);

        if (data.categoryId) {
          const productsInCategory = await getProducts({ categoryId: data.categoryId });
          setRelatedProducts(productsInCategory);
        } else {
          setRelatedProducts([]);
        }
      } catch (err) {
        console.error(err);
        setError("Không thể tải chi tiết sản phẩm.");
      } finally {
        setLoading(false);
      }
    };

    void fetchProduct();
  }, [id]);

  const colorOptions = useMemo(() => {
    return Array.from(
      new Set(
        relatedProducts
          .map((item) => item.color?.trim())
          .filter((value): value is string => Boolean(value))
      )
    );
  }, [relatedProducts]);

  const similarProducts = useMemo(() => {
    const pool =
      selectedColor && selectedColor.trim()
        ? relatedProducts.filter((item) => item.color === selectedColor)
        : relatedProducts;

    return pool.filter((item) => item.id !== product?.id).slice(0, 4);
  }, [product?.id, relatedProducts, selectedColor]);

  const handleAddToCart = async () => {
    if (!product || product.stockQuantity <= 0 || quantity <= 0) {
      return;
    }

    if (!auth?.token) {
      navigate("/login", { state: { from: location.pathname } });
      return;
    }

    try {
      setAddToCartLoading(true);
      setCartMessage("");
      await addToCart(product.id, quantity);
      setCartMessage(`Đã thêm ${quantity} sản phẩm vào giỏ hàng.`);
    } catch (err) {
      if (axios.isAxiosError(err) && (err.response?.status === 401 || err.response?.status === 403)) {
        setCartMessage("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
        navigate("/login", { state: { from: location.pathname } });
        return;
      }

      setCartMessage(getApiErrorMessage(err, "Không thể thêm vào giỏ hàng."));
    } finally {
      setAddToCartLoading(false);
    }
  };

  const detailHighlights = product ? buildProductHighlights(product) : [];
  const materialNotes = product ? buildMaterialNotes(product) : [];
  const featuredReview =
    reviewPage?.items.find((item) => item.featured) || reviewPage?.items.find((item) => item.images.length > 0) || null;
  const customerImages = (reviewPage?.items.flatMap((item) => item.images) ?? []).slice(0, 6);
  const maxSelectableQuantity = product?.stockQuantity ?? 1;

  const decreaseQuantity = () => {
    setQuantity((current) => Math.max(1, current - 1));
  };

  const increaseQuantity = () => {
    setQuantity((current) => Math.min(maxSelectableQuantity, current + 1));
  };

  const loadReviewData = async (targetProductId: number, params: ReviewQueryParams) => {
    try {
      setReviewLoading(true);
      setReviewError("");
      const [summaryData, reviewData] = await Promise.all([
        getProductReviewSummary(targetProductId),
        getProductReviews(targetProductId, params),
      ]);
      setReviewSummary(summaryData);
      setReviewPage(reviewData);
    } catch (err) {
      setReviewError(getApiErrorMessage(err, "Không thể tải dữ liệu đánh giá."));
    } finally {
      setReviewLoading(false);
    }
  };

  useEffect(() => {
    if (!product?.id) {
      return;
    }

    void loadReviewData(product.id, reviewQuery);
  }, [product?.id, reviewQuery.page, reviewQuery.rating, reviewQuery.sort, reviewQuery.withImages, reviewQuery.longContentOnly]);


  const handleHelpfulToggle = async (review: Review) => {
    if (!auth?.token) {
      navigate("/login", { state: { from: location.pathname } });
      return;
    }

    try {
      setHelpfulLoadingId(review.id);
      const updatedReview = review.helpfulByCurrentUser
        ? await unmarkReviewHelpful(review.id)
        : await markReviewHelpful(review.id);

      setReviewPage((current) =>
        current
          ? {
              ...current,
              items: current.items.map((item) => (item.id === updatedReview.id ? updatedReview : item)),
            }
          : current
      );
    } catch (err) {
      setReviewError(getApiErrorMessage(err, "Không thể cập nhật trạng thái hữu ích."));
    } finally {
      setHelpfulLoadingId(null);
    }
  };

  if (loading) {
    return <div className="container py-5">Đang tải chi tiết sản phẩm...</div>;
  }

  if (error || !product) {
    return (
      <div className="container py-5">
        <div className="empty-product-box text-center">
          <h4>Không tải được sản phẩm</h4>
          <p>{error || "Sản phẩm không tồn tại."}</p>
          <Link to="/products" className="btn btn-domora">
            Quay lại danh sách
          </Link>
        </div>
      </div>
    );
  }

  return (
    <section className="product-detail-page">
      <div className="container py-5">
        <div className="product-detail-shell">
          <div className="row g-5 align-items-start">
            <div className="col-lg-6">
              <div className="product-detail-gallery">
                <div className="product-detail-thumbs">
                  {[product, ...similarProducts.slice(0, 3)].map((item) => (
                    <button
                      type="button"
                      key={item.id}
                      className={`product-thumb-btn ${item.id === product.id ? "active" : ""}`}
                    >
                      <img src={getImageUrl(item.image)} alt={item.name} />
                    </button>
                  ))}
                </div>

                <div className="product-detail-main-image">
                  <img src={getImageUrl(product.image)} alt={product.name} />
                </div>
              </div>
            </div>

            <div className="col-lg-6">
              <div className="product-detail-content">
                <p className="product-detail-category">{product.categoryName || "Nội thất"}</p>
                <h1 className="product-detail-title">{product.name}</h1>
                <p className="product-detail-price">{formatPrice(product.price)}</p>

                {product.description && (
                  <p className="product-detail-summary">{product.description}</p>
                )}

                <div className="product-detail-divider"></div>

                <div className="product-detail-option">
                  <span className="product-detail-option-label">Màu sắc</span>
                  <div className="product-color-list">
                    {(colorOptions.length > 0 ? colorOptions : [product.color || "Mặc định"]).map(
                      (color) => (
                        <button
                          type="button"
                          key={color}
                          className={`product-color-chip ${selectedColor === color ? "active" : ""}`}
                          onClick={() => setSelectedColor(color)}
                        >
                          <span className="product-color-dot" style={getColorSwatch(color)}></span>
                          {color}
                        </button>
                      )
                    )}
                  </div>
                </div>

                <div className="product-detail-option">
                  <span className="product-detail-option-label">Thông tin nhanh</span>
                  <div className="product-detail-meta">
                    <div>
                      <strong>Kích thước:</strong> {formatDimensions(product)}
                    </div>
                    <div>
                      <strong>Màu đang chọn:</strong> {selectedColor || product.color || "Đang cập nhật"}
                    </div>
                    <div>
                      <strong>Tồn kho:</strong> {product.stockQuantity}
                    </div>
                    <div>
                      <strong>Danh mục:</strong> {product.categoryName || "Nội thất"}
                    </div>
                  </div>
                </div>

                {product.stockQuantity > 0 && (
                  <div className="product-detail-option">
                    <span className="product-detail-option-label">Số lượng</span>
                    <div className="product-quantity-selector">
                      <button
                        type="button"
                        className="product-quantity-btn"
                        onClick={decreaseQuantity}
                        disabled={quantity <= 1}
                        aria-label="Giảm số lượng"
                      >
                        -
                      </button>
                      <span className="product-quantity-value">{quantity}</span>
                      <button
                        type="button"
                        className="product-quantity-btn"
                        onClick={increaseQuantity}
                        disabled={quantity >= product.stockQuantity}
                        aria-label="Tăng số lượng"
                      >
                        +
                      </button>
                    </div>
                  </div>
                )}

                <div className="d-flex gap-3 flex-wrap">
                  <button
                    type="button"
                    className="btn btn-domora"
                    onClick={handleAddToCart}
                    disabled={addToCartLoading || product.stockQuantity <= 0}
                  >
                    {product.stockQuantity <= 0
                      ? "Hết hàng"
                      : addToCartLoading
                        ? "Đang xử lý..."
                        : "Thêm vào giỏ"}
                  </button>
                  <Link to="/products" className="btn btn-domora-outline">
                    Tiếp tục xem sản phẩm
                  </Link>
                </div>

                {cartMessage && <p className="product-detail-feedback mb-0 mt-3">{cartMessage}</p>}
              </div>
            </div>
          </div>

          <div className="product-detail-sections">
            <div className="row g-4">
              <div className="col-lg-6">
                <div className="product-detail-card">
                  <h3>Mô tả chi tiết</h3>
                  <ul className="product-detail-list">
                    {detailHighlights.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="col-lg-6">
                <div className="product-detail-card">
                  <h3>Chất liệu và sử dụng</h3>
                  <ul className="product-detail-list">
                    {materialNotes.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <div className="product-similar-section">
            <div className="section-heading text-start mb-4">
              <p className="subtitle">Gợi ý cho bạn</p>
              <h2 className="title mb-0">Sản phẩm tương tự</h2>
            </div>

            {similarProducts.length > 0 ? (
              <div className="row g-4">
                {similarProducts.map((item) => (
                  <div className="col-6 col-md-4 col-xl-3" key={item.id}>
                    <div className="product-card h-100">
                      <div className="product-card-image-wrap">
                        <Link to={`/products/${item.id}`}>
                          <img
                            src={getImageUrl(item.image)}
                            alt={item.name}
                            className="product-card-image"
                          />
                        </Link>
                      </div>

                      <div className="product-card-body">
                        <p className="product-category">{item.categoryName || "Nội thất"}</p>
                        <h3 className="product-name">
                          <Link to={`/products/${item.id}`}>{item.name}</Link>
                        </h3>
                        <div className="product-price-box">
                          <span className="product-price">{formatPrice(item.price)}</span>
                        </div>
                        <Link
                          to={`/products/${item.id}`}
                          className="btn btn-domora-outline btn-sm w-100"
                        >
                          Xem chi tiết
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-product-box text-center">
                <h4>Chưa có sản phẩm tương tự</h4>
                <p>Hãy quay lại danh sách để xem thêm các mẫu nội thất khác.</p>
              </div>
            )}
          </div>

          <div className="product-review-section">
            <div className="section-heading text-start mb-4">
              <p className="subtitle">Khách hàng nói gì</p>
              <h2 className="title mb-0">Đánh giá sản phẩm</h2>
            </div>

            {reviewLoading ? (
              <div className="review-empty">Đang tải đánh giá...</div>
            ) : reviewError ? (
              <div className="review-empty">{reviewError}</div>
            ) : (
              <>
                {reviewSummary && <ReviewSummary summary={reviewSummary} />}

                {featuredReview && (
                  <div className="review-highlight">
                    <div>
                      <p className="review-form__kicker">Đánh giá nổi bật</p>
                      <h3>{featuredReview.title}</h3>
                      <p>{featuredReview.content}</p>
                    </div>
                  </div>
                )}

                {customerImages.length > 0 && (
                  <div className="customer-images">
                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <h3>Ảnh từ khách hàng</h3>
                      <span>{reviewSummary?.totalWithImages || customerImages.length} ảnh review</span>
                    </div>
                    <div className="customer-images__grid">
                      {customerImages.map((image, index) => (
                        <img key={index} src={image} alt={`Khách hàng ${index + 1}`} />
                      ))}
                    </div>
                  </div>
                )}

                <div className="review-toolbar">
                  <select
                    className="form-select"
                    value={reviewQuery.sort || "newest"}
                    onChange={(event) =>
                      setReviewQuery((current) => ({
                        ...current,
                        page: 1,
                        sort: event.target.value as ReviewQueryParams["sort"],
                      }))
                    }
                  >
                    <option value="newest">Mới nhất</option>
                    <option value="highest">Nhiều sao nhất</option>
                    <option value="lowest">Ít sao nhất</option>
                    <option value="helpful">Hữu ích nhất</option>
                  </select>

                  <select
                    className="form-select"
                    value={reviewQuery.rating || ""}
                    onChange={(event) =>
                      setReviewQuery((current) => ({
                        ...current,
                        page: 1,
                        rating: event.target.value ? Number(event.target.value) : undefined,
                      }))
                    }
                  >
                    <option value="">Tất cả số sao</option>
                    <option value="5">5 sao</option>
                    <option value="4">4 sao</option>
                    <option value="3">3 sao</option>
                    <option value="2">2 sao</option>
                    <option value="1">1 sao</option>
                  </select>

                  <label className="form-check">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      checked={Boolean(reviewQuery.withImages)}
                      onChange={(event) =>
                        setReviewQuery((current) => ({
                          ...current,
                          page: 1,
                          withImages: event.target.checked,
                        }))
                      }
                    />
                    <span className="form-check-label">Chỉ review có ảnh</span>
                  </label>

                  <label className="form-check">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      checked={Boolean(reviewQuery.longContentOnly)}
                      onChange={(event) =>
                        setReviewQuery((current) => ({
                          ...current,
                          page: 1,
                          longContentOnly: event.target.checked,
                        }))
                      }
                    />
                    <span className="form-check-label">Nội dung chi tiết</span>
                  </label>
                </div>

                <ReviewList
                  reviews={reviewPage?.items || []}
                  helpfulLoadingId={helpfulLoadingId}
                  onHelpfulToggle={handleHelpfulToggle}
                />

                {reviewPage && reviewPage.totalPages > 1 && (
                  <div className="review-pagination">
                    <button
                      type="button"
                      className="btn btn-domora-outline btn-sm"
                      disabled={reviewPage.currentPage <= 1}
                      onClick={() =>
                        setReviewQuery((current) => ({
                          ...current,
                          page: Math.max(1, (current.page || 1) - 1),
                        }))
                      }
                    >
                      Trước
                    </button>
                    <span>
                      Trang {reviewPage.currentPage}/{reviewPage.totalPages}
                    </span>
                    <button
                      type="button"
                      className="btn btn-domora-outline btn-sm"
                      disabled={reviewPage.currentPage >= reviewPage.totalPages}
                      onClick={() =>
                        setReviewQuery((current) => ({
                          ...current,
                          page: Math.min(reviewPage.totalPages, (current.page || 1) + 1),
                        }))
                      }
                    >
                      Sau
                    </button>
                  </div>
                )}

                                <div className="review-cta">
                  <h3>Muốn chia sẻ trải nghiệm?</h3>
                  <p>Bạn hãy vào Tài khoản cá nhân &gt; Đánh giá của tôi để viết hoặc chỉnh sửa đánh giá.</p>
                  <p className="mb-0">Đánh giá chỉ hiển thị công khai sau khi admin duyệt.</p>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

