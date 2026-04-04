import type { Review } from "../../types/review";
import RatingStars from "./RatingStars";

interface ReviewCardProps {
  review: Review;
  onHelpfulToggle?: (review: Review) => void;
  helpfulLoading?: boolean;
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("vi-VN");
}

export default function ReviewCard({
  review,
  onHelpfulToggle,
  helpfulLoading = false,
}: ReviewCardProps) {
  return (
    <article className={`review-card ${review.featured ? "featured" : ""}`}>
      <div className="review-card__top">
        <div className="review-card__identity">
          <div className="review-card__avatar">{(review.displayName || "U").slice(0, 1).toUpperCase()}</div>
          <div>
            <h4>{review.displayName}</h4>
            <p>{formatDate(review.createdAt)}</p>
          </div>
        </div>

        <div className="review-card__badges">
          {review.purchased && <span className="review-chip">Đã mua hàng</span>}
          {review.images.length > 0 && <span className="review-chip">Có hình ảnh</span>}
          {review.featured && <span className="review-chip review-chip--accent">Đánh giá nổi bật</span>}
        </div>
      </div>

      <div className="review-card__rating-line">
        <RatingStars value={review.overallRating} readOnly />
        {review.edited && <span className="review-card__edited">Đã chỉnh sửa</span>}
      </div>

      <h5 className="review-card__title">{review.title}</h5>
      <p className="review-card__content">{review.content}</p>

      <div className="review-card__subscores">
        <span>Chất lượng {review.qualityRating}/5</span>
        <span>Thiết kế {review.designRating}/5</span>
        <span>Tiện nghi {review.comfortRating}/5</span>
        <span>Đáng tiền {review.valueRating}/5</span>
      </div>

      {review.images.length > 0 && (
        <div className="review-card__images">
          {review.images.map((image, index) => (
            <img key={`${review.id}-${index}`} src={image} alt={`Review ${review.id} ${index + 1}`} />
          ))}
        </div>
      )}

      {onHelpfulToggle && (
        <div className="review-card__actions">
          <button
            type="button"
            className={`btn btn-sm ${review.helpfulByCurrentUser ? "btn-domora" : "btn-domora-outline"}`}
            disabled={helpfulLoading}
            onClick={() => onHelpfulToggle(review)}
          >
            {helpfulLoading ? "Đang xử lý..." : `Hữu ích (${review.helpfulCount})`}
          </button>
        </div>
      )}
    </article>
  );
}
