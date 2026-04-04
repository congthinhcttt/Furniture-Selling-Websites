package bai4_qlsp_LeBinh.demo.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VnpayCreatePaymentRequest {
    @NotNull(message = "Order id khong duoc de trong")
    private Long orderId;
}
