interface RatingStarsProps {
  value: number;
  onChange?: (value: number) => void;
  size?: "sm" | "md" | "lg";
  readOnly?: boolean;
}

export default function RatingStars({
  value,
  onChange,
  size = "md",
  readOnly = false,
}: RatingStarsProps) {
  return (
    <div className={`rating-stars rating-stars--${size} ${readOnly ? "readonly" : ""}`}>
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          className={`rating-stars__item ${star <= value ? "active" : ""}`}
          onClick={() => !readOnly && onChange?.(star)}
          disabled={readOnly}
          aria-label={`${star} sao`}
        >
          ★
        </button>
      ))}
    </div>
  );
}
