package bai4_qlsp_LeBinh.demo.dto.response;

import lombok.Builder;

import java.time.LocalDateTime;

@Builder
public record DeliveryRealtimeEventResponse(
        String eventType,
        Long orderId,
        LocalDateTime emittedAt,
        DeliveryTrackingResponse tracking
) {
}
