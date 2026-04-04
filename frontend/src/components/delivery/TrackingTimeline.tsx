import type { DeliveryTimelineItem } from "../../types/delivery";
import {
  formatAbsoluteDateTime,
  getTimelineSteps,
  getTrackingStatusMeta,
} from "../../utils/deliveryTracking";

interface TrackingTimelineProps {
  currentStatus: string;
  items: DeliveryTimelineItem[];
}

function getStepStateLabel(state: string) {
  switch (state) {
    case "completed":
      return "Đã hoàn tất";
    case "current":
      return "Đang diễn ra";
    case "failed":
      return "Cần xử lý";
    default:
      return "Sắp tới";
  }
}

export default function TrackingTimeline({ currentStatus, items }: TrackingTimelineProps) {
  const timeline = getTimelineSteps(currentStatus, items);
  const currentMeta = getTrackingStatusMeta(currentStatus);

  return (
    <article className="tracking-panel">
      <div className="tracking-panel__header">
        <div>
          <p className="tracking-panel__kicker">Hành trình giao hàng</p>
          <h3>Đơn hàng đang ở bước nào</h3>
        </div>
      </div>

      <p className="tracking-panel__lead">{currentMeta.description}</p>

      <div className="tracking-timeline">
        {timeline.steps.map((step, index) => (
          <div className={`tracking-timeline__item tracking-timeline__item--${step.state}`} key={step.key}>
            {index < timeline.steps.length - 1 ? <div className="tracking-timeline__rail" /> : null}
            <div className="tracking-timeline__marker">
              <span className="tracking-timeline__dot" />
            </div>
            <div className="tracking-timeline__content">
              <div className="tracking-timeline__head">
                <div>
                  <strong>{step.label}</strong>
                  <p>{step.description}</p>
                </div>
                <span className={`tracking-timeline__tag tracking-timeline__tag--${step.state}`}>
                  {getStepStateLabel(step.state)}
                </span>
              </div>
              <div className="tracking-timeline__meta">
                <span>{step.timestamp ? formatAbsoluteDateTime(step.timestamp) : "Chưa có mốc thời gian"}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {timeline.warningStep ? (
        <div className="tracking-timeline-alert">
          <div className="tracking-timeline-alert__icon" />
          <div className="tracking-timeline-alert__body">
            <div className="tracking-timeline-alert__head">
              <strong>{timeline.warningStep.label}</strong>
              <span className="tracking-timeline__tag tracking-timeline__tag--failed">
                {getStepStateLabel(timeline.warningStep.state)}
              </span>
            </div>
            <p>{timeline.warningStep.description}</p>
            <small>
              {timeline.warningStep.timestamp
                ? formatAbsoluteDateTime(timeline.warningStep.timestamp)
                : "Chưa có mốc thời gian"}
            </small>
          </div>
        </div>
      ) : null}
    </article>
  );
}
