import type { ReactNode } from "react";

interface AdminFormModalProps {
  title: string;
  open: boolean;
  onClose: () => void;
  children: ReactNode;
}

export default function AdminFormModal({
  title,
  open,
  onClose,
  children,
}: AdminFormModalProps) {
  if (!open) {
    return null;
  }

  return (
    <div className="admin-modal-backdrop" role="dialog" aria-modal="true" aria-label={title}>
      <div className="admin-modal-card">
        <div className="admin-modal-head">
          <h2>{title}</h2>
          <button
            type="button"
            className="admin-modal-close"
            aria-label="Đóng"
            onClick={onClose}
          >
            ×
          </button>
        </div>
        <div className="admin-modal-body">{children}</div>
      </div>
      <button
        type="button"
        className="admin-modal-overlay-dismiss"
        aria-label="Đóng"
        onClick={onClose}
      />
    </div>
  );
}
