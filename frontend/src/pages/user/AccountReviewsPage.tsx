import { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { getApiErrorMessage } from "../../api/authApi";
import { getMyOrders } from "../../api/orderApi";
import { createReview, getMyReviews, getOrderReviewableItems, updateReview } from "../../api/reviewApi";
import ReviewCard from "../../components/review/ReviewCard";
import ReviewForm from "../../components/review/ReviewForm";
import ReviewableItems from "../../components/review/ReviewableItems";
import type { CreateReviewPayload, Review, ReviewStatus, ReviewableItem, UpdateReviewPayload } from "../../types/review";

function getStatusMeta(status: ReviewStatus) {
  switch (status) {
    case "APPROVED":
      return {
        label: "Đã duyệt",
        description: "Review này đang hiển thị ở trang sản phẩm.",
        className: "approved",
      };
    case "PENDING":
      return {
        label: "Chờ duyệt",
        description: "Review sẽ hiển thị công khai sau khi admin duyệt.",
        className: "pending",
      };
    case "REJECTED":
      return {
        label: "Bị từ chối",
        description: "Bạn có thể chỉnh sửa nội dung rồi gửi lại.",
        className: "rejected",
      };
    case "HIDDEN":
      return {
        label: "Đã ẩn",
        description: "Review tạm thời không hiển thị bên ngoài.",
        className: "hidden",
      };
    default:
      return {
        label: status,
        description: "",
        className: "",
      };
  }
}

export default function AccountReviewsPage() {
  const location = useLocation();
  const [reviewableMap, setReviewableMap] = useState<Record<number, ReviewableItem[]>>({});
  const [myReviews, setMyReviews] = useState<Review[]>([]);
  const [selectedReviewItem, setSelectedReviewItem] = useState<ReviewableItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError("");
        const [orderData, myReviewData] = await Promise.all([getMyOrders(), getMyReviews()]);
        setMyReviews(myReviewData);

        const completedOrders = orderData.filter((order) =>
          ["COMPLETED", "DELIVERED"].includes(order.status.toUpperCase())
        );

        const reviewableData = await Promise.all(
          completedOrders.map(async (order) => ({
            orderId: order.id,
            items: await getOrderReviewableItems(order.id),
          }))
        );

        const nextMap = reviewableData.reduce<Record<number, ReviewableItem[]>>((accumulator, current) => {
          accumulator[current.orderId] = current.items;
          return accumulator;
        }, {});

        setReviewableMap(nextMap);

        const state = location.state as { orderId?: number; orderItemId?: number } | null;
        if (state?.orderId && state?.orderItemId) {
          const targetItem = nextMap[state.orderId]?.find((item) => item.orderItemId === state.orderItemId) || null;
          setSelectedReviewItem(targetItem);
        }
      } catch (err) {
        setError(getApiErrorMessage(err, "Không thể tải dữ liệu đánh giá của bạn."));
      } finally {
        setLoading(false);
      }
    };

    void fetchData();
  }, [location.state]);

  const reviewableItems = useMemo(
    () =>
      Object.values(reviewableMap)
        .flat()
        .filter((item) => item.canReview || item.reviewed),
    [reviewableMap]
  );

  const selectedReview = useMemo(
    () =>
      selectedReviewItem
        ? myReviews.find(
            (review) =>
              review.orderId === selectedReviewItem.orderId &&
              review.orderItemId === selectedReviewItem.orderItemId
          ) || null
        : null,
    [myReviews, selectedReviewItem]
  );

  const handleReviewSubmit = async (payload: CreateReviewPayload | UpdateReviewPayload) => {
    try {
      setSubmitting(true);
      setError("");

      if (selectedReview) {
        await updateReview(selectedReview.id, payload as UpdateReviewPayload);
      } else {
        await createReview(payload as CreateReviewPayload);
      }

      const [reviewData, reviewableData] = await Promise.all([
        getMyReviews(),
        selectedReviewItem ? getOrderReviewableItems(selectedReviewItem.orderId) : Promise.resolve([]),
      ]);

      setMyReviews(reviewData);
      if (selectedReviewItem) {
        setReviewableMap((current) => ({ ...current, [selectedReviewItem.orderId]: reviewableData }));
      }
      setSelectedReviewItem(null);
    } catch (err) {
      setError(getApiErrorMessage(err, "Không thể gửi đánh giá."));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="info-page">
      <div className="container info-page-section">
        <div className="account-main-grid">
          <div className="info-card info-card-large">
            <div className="account-section-heading">
              <div>
                <p className="account-section-kicker">Review Center</p>
                <h2>Đánh giá của tôi</h2>
              </div>
              <span className="account-section-chip">{myReviews.length} đánh giá</span>
            </div>

            <p className="account-note">
              Đánh giá chỉ xuất hiện ở trang sản phẩm sau khi admin duyệt. Bạn có thể viết mới từ các đơn hàng đã hoàn
              tất hoặc chỉnh sửa lại review đã gửi.
            </p>

            {loading ? (
              <p>Đang tải danh sách đánh giá...</p>
            ) : error ? (
              <p>{error}</p>
            ) : (
              <>
                <div className="account-review-grid">
                  {myReviews.length === 0 ? (
                    <div className="review-empty">Bạn chưa có đánh giá nào.</div>
                  ) : (
                    myReviews.map((review) => {
                      const statusMeta = getStatusMeta(review.status);
                      return (
                        <div className="account-review-item" key={review.id}>
                          <div className="account-review-item__head">
                            <div>
                              <h3>{review.productName}</h3>
                              <p>{statusMeta.description}</p>
                            </div>
                            <div className={`account-status-badge ${statusMeta.className}`}>{statusMeta.label}</div>
                          </div>

                          <ReviewCard review={review} />

                          <div className="account-review-item__actions">
                            <button
                              type="button"
                              className="btn btn-domora-outline"
                              onClick={() =>
                                setSelectedReviewItem({
                                  orderId: review.orderId,
                                  orderItemId: review.orderItemId,
                                  productId: review.productId,
                                  productName: review.productName,
                                  quantity: 1,
                                  canReview: true,
                                  reviewed: true,
                                  reviewId: review.id,
                                })
                              }
                            >
                              Chỉnh sửa đánh giá
                            </button>
                            <Link to={`/products/${review.productId}`} className="btn btn-domora-outline">
                              Xem sản phẩm
                            </Link>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                <div className="account-reviewables">
                  <div className="account-section-heading">
                    <div>
                      <p className="account-section-kicker">Có thể đánh giá</p>
                      <h2>Sản phẩm đã mua</h2>
                    </div>
                    <span className="account-section-chip">{reviewableItems.length} mục</span>
                  </div>

                  <ReviewableItems items={reviewableItems} onReviewClick={setSelectedReviewItem} />
                </div>

                {selectedReviewItem && (
                  <div className="account-review-form">
                    <ReviewForm
                      reviewableItems={[selectedReviewItem]}
                      initialReview={selectedReview}
                      submitting={submitting}
                      onSubmit={handleReviewSubmit}
                      onCancelEdit={() => setSelectedReviewItem(null)}
                    />
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
