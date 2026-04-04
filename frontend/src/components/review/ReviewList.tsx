import type { Review } from "../../types/review";
import ReviewCard from "./ReviewCard";

interface ReviewListProps {
  reviews: Review[];
  helpfulLoadingId?: number | null;
  onHelpfulToggle?: (review: Review) => void;
}

export default function ReviewList({
  reviews,
  helpfulLoadingId,
  onHelpfulToggle,
}: ReviewListProps) {
  if (reviews.length === 0) {
    return <div className="review-empty">Chưa có đánh giá phù hợp với bộ lọc hiện tại.</div>;
  }

  return (
    <div className="review-list">
      {reviews.map((review) => (
        <ReviewCard
          key={review.id}
          review={review}
          onHelpfulToggle={onHelpfulToggle}
          helpfulLoading={helpfulLoadingId === review.id}
        />
      ))}
    </div>
  );
}
