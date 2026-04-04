package bai4_qlsp_LeBinh.demo.dto.response;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderItemResponse {
    private Long productId;
    private String productName;
    private String image;
    private Integer quantity;
    private Long unitPrice;
    private Long subtotal;
}