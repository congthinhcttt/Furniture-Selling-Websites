package bai4_qlsp_LeBinh.demo.dto.response;

import lombok.Builder;

import java.time.LocalDateTime;

@Builder
public record DeliveryTimelineItemResponse(
        String status,
        String statusLabel,
        String description,
        String note,
        String changedBy,
        String changedByRole,
        LocalDateTime changedAt
) {
}
