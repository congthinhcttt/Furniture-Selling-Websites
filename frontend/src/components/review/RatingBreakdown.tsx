import type { RatingBreakdownItem } from "../../types/review";

interface RatingBreakdownProps {
  items: RatingBreakdownItem[];
}

export default function RatingBreakdown({ items }: RatingBreakdownProps) {
  return (
    <div className="rating-breakdown">
      {items.map((item) => (
        <div className="rating-breakdown__row" key={item.star}>
          <span className="rating-breakdown__label">{item.star} sao</span>
          <div className="rating-breakdown__bar">
            <span
              className="rating-breakdown__fill"
              style={{ width: `${Math.max(item.percentage, 4)}%` }}
            ></span>
          </div>
          <span className="rating-breakdown__meta">
            {item.count} ({item.percentage}%)
          </span>
        </div>
      ))}
    </div>
  );
}
