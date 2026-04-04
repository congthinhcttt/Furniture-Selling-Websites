import { useMemo, useState } from "react";
import type { DeliveryTimelineItem } from "../../types/delivery";
import { formatAbsoluteDateTime } from "../../utils/deliveryTracking";

interface TrackingHistoryListProps {
  items: DeliveryTimelineItem[];
}

const DEFAULT_VISIBLE_ITEMS = 5;

export default function TrackingHistoryList({ items }: TrackingHistoryListProps) {
  const [expanded, setExpanded] = useState(false);
  const historyItems = useMemo(() => items, [items]);
  const visibleItems = expanded ? historyItems : historyItems.slice(0, DEFAULT_VISIBLE_ITEMS);

  return (
    <article className="tracking-panel">
      <div className="tracking-panel__header">
        <div>
          <p className="tracking-panel__kicker">Lịch sử cập nhật</p>
          <h3>Những thay đổi gần nhất</h3>
        </div>
      </div>

      {historyItems.length === 0 ? (
        <div className="tracking-empty-block">
          <div className="tracking-empty-block__icon" />
          <div>
            <strong>Chưa có lịch sử giao hàng</strong>
            <p>Hệ thống sẽ hiển thị các mốc cập nhật ngay khi đơn hàng bắt đầu được xử lý.</p>
          </div>
        </div>
      ) : (
        <>
          <div className="tracking-history">
            {visibleItems.map((item) => (
              <div className="tracking-history__item" key={`${item.status}-${item.changedAt}`}>
                <div className="tracking-history__line" />
                <div className="tracking-history__dot" />
                <div className="tracking-history__content">
                  <div className="tracking-history__head">
                    <strong>{item.statusLabel}</strong>
                    <time>{formatAbsoluteDateTime(item.changedAt)}</time>
                  </div>
                  <p>{item.note || item.description}</p>
                  {item.changedBy || item.changedByRole ? (
                    <small>
                      Cập nhật bởi {item.changedBy || "hệ thống"}
                      {item.changedByRole ? ` · ${item.changedByRole}` : ""}
                    </small>
                  ) : null}
                </div>
              </div>
            ))}
          </div>

          {historyItems.length > DEFAULT_VISIBLE_ITEMS ? (
            <button
              type="button"
              className="btn btn-domora-outline tracking-history__toggle"
              onClick={() => setExpanded((value) => !value)}
            >
              {expanded ? "Thu gọn lịch sử" : "Xem thêm lịch sử"}
            </button>
          ) : null}
        </>
      )}
    </article>
  );
}
