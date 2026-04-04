package bai4_qlsp_LeBinh.demo.dto.response;

import lombok.Builder;

import java.time.LocalDateTime;
import java.util.List;

@Builder
public record DeliveryTrackingResponse(
        Long orderId,
        String orderCode,
        String shippingStatus,
        String statusLabel,
        LocalDateTime shippedAt,
        LocalDateTime deliveredAt,
        String shippingProvider,
        String trackingCode,
        String trackingUrl,
        String shippingNote,
        String failReason,
        String receiverName,
        String receiverPhone,
        String shippingAddress,
        String paymentMethod,
        String paymentStatus,
        List<DeliveryTimelineItemResponse> trackingTimeline
) {
}
