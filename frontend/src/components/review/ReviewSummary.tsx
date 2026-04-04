import type { ReviewSummary as ReviewSummaryType } from "../../types/review";
import RatingBreakdown from "./RatingBreakdown";
import RatingStars from "./RatingStars";

interface ReviewSummaryProps {
  summary: ReviewSummaryType;
}

const criteria = [
  { key: "averageQuality", label: "Chất lượng" },
  { key: "averageDesign", label: "Thiết kế" },
  { key: "averageComfort", label: "Tiện nghi" },
  { key: "averageValue", label: "Đáng tiền" },
] as const;

export default function ReviewSummary({ summary }: ReviewSummaryProps) {
  return (
    <section className="review-summary">
      <div className="review-summary__hero">
        <div>
          <p className="review-summary__kicker">Đánh giá khách hàng</p>
          <div className="review-summary__score">{summary.averageOverall.toFixed(1)}</div>
          <RatingStars value={Math.round(summary.averageOverall)} readOnly size="lg" />
          <p className="review-summary__meta">
            {summary.totalReviews} đánh giá • {summary.recommendationRate}% khuyên mua
          </p>
        </div>
        <RatingBreakdown items={summary.ratingBreakdown} />
      </div>

      <div className="review-summary__criteria">
        {criteria.map((criterion) => (
          <div className="review-summary__criterion" key={criterion.key}>
            <span>{criterion.label}</span>
            <strong>{summary[criterion.key].toFixed(1)}/5</strong>
          </div>
        ))}
      </div>
    </section>
  );
}
