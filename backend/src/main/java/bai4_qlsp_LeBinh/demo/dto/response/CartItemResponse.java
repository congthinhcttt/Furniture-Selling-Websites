package bai4_qlsp_LeBinh.demo.dto.response;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CartItemResponse {
    private Long productId;
    private String productName;
    private String image;
    private Long price;
    private Integer quantity;
    private Long subtotal;
}