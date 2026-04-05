package bai4_qlsp_LeBinh.demo.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateOrderRequest {
    @NotBlank(message = "Ten nguoi nhan khong duoc de trong")
    private String receiverName;

    @NotBlank(message = "So dien thoai khong duoc de trong")
    private String receiverPhone;

    @NotBlank(message = "Dia chi nhan hang khong duoc de trong")
    private String shippingAddress;

    @NotBlank(message = "Phuong thuc thanh toan khong duoc de trong")
    private String paymentMethod;

    private String note;

    private String voucherCode;
}
