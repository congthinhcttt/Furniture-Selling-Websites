import { Link } from "react-router-dom";
import type { ReviewableItem } from "../../types/review";
import { buildImageUrl } from "../../utils/image";

interface ReviewableItemsProps {
  items: ReviewableItem[];
  onReviewClick?: (item: ReviewableItem) => void;
}

function getImageUrl(image?: string) {
  return buildImageUrl(image, "https://via.placeholder.com/120x120?text=No+Image");
}

export default function ReviewableItems({ items, onReviewClick }: ReviewableItemsProps) {
  if (items.length === 0) {
    return <div className="review-empty">Đơn hàng này chưa có sản phẩm nào đủ điều kiện để đánh giá.</div>;
  }

  return (
    <div className="reviewable-items">
      {items.map((item) => (
        <article className="reviewable-card" key={item.orderItemId}>
          <img src={getImageUrl(item.productImage)} alt={item.productName} className="reviewable-card__image" />
          <div className="reviewable-card__body">
            <h4>{item.productName}</h4>
            <p>Đơn #{item.orderId} • Số lượng {item.quantity}</p>
          </div>
          <div className="reviewable-card__actions">
            {item.reviewed ? (
              <>
                <span className="review-chip">Đã đánh giá</span>
                {item.reviewId && (
                  <Link to={`/products/${item.productId}`} className="btn btn-domora-outline btn-sm">
                    Xem sản phẩm
                  </Link>
                )}
              </>
            ) : item.canReview ? (
              <button type="button" className="btn btn-domora btn-sm" onClick={() => onReviewClick?.(item)}>
                Viết đánh giá
              </button>
            ) : (
              <span className="review-chip">Chưa đủ điều kiện</span>
            )}
          </div>
        </article>
      ))}
    </div>
  );
}
