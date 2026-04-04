package bai4_qlsp_LeBinh.demo.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class UpdateDeliveryStatusRequest {

    @NotBlank(message = "Trạng thái giao hàng không được để trống")
    private String status;

    private String shippingNote;

    private String failReason;

    private LocalDateTime shippedAt;

    private LocalDateTime deliveredAt;
}
