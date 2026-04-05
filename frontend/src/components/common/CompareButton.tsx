interface CompareButtonProps {
  active: boolean;
  onClick: () => void;
  disabled?: boolean;
  className?: string;
}

export default function CompareButton({
  active,
  onClick,
  disabled = false,
  className = "",
}: CompareButtonProps) {
  return (
    <button
      type="button"
      className={`compare-btn ${active ? "active" : ""} ${className}`.trim()}
      onClick={onClick}
      disabled={disabled}
    >
      <i className="bi bi-sliders2 me-2"></i>
      {active ? "Đã thêm so sánh" : "So sánh"}
    </button>
  );
}
