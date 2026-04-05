interface WishlistButtonProps {
  active: boolean;
  loading?: boolean;
  onClick: () => void;
  title?: string;
  className?: string;
}

export default function WishlistButton({
  active,
  loading = false,
  onClick,
  title,
  className = "",
}: WishlistButtonProps) {
  return (
    <button
      type="button"
      className={`wishlist-btn ${active ? "active" : ""} ${className}`.trim()}
      onClick={onClick}
      disabled={loading}
      aria-label={title || (active ? "Xóa khỏi yêu thích" : "Thêm vào yêu thích")}
      title={title || (active ? "Xóa khỏi yêu thích" : "Thêm vào yêu thích")}
    >
      <i className={`bi ${active ? "bi-heart-fill" : "bi-heart"}`}></i>
    </button>
  );
}
