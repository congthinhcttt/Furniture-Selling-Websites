package bai4_qlsp_LeBinh.demo.dto.response;

import lombok.Builder;

import java.time.LocalDateTime;

@Builder
public record DeliverySummaryResponse(
        Long orderId,
        String orderCode,
        String shippingStatus,
        String statusLabel,
        String shippingProvider,
        String trackingCode,
        LocalDateTime shippedAt,
        LocalDateTime deliveredAt,
        String shippingNote
) {
}
