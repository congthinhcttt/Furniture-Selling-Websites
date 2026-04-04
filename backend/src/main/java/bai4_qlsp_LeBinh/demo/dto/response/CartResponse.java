package bai4_qlsp_LeBinh.demo.dto.response;

import lombok.*;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CartResponse {
    private Long cartId;
    private Integer accountId;
    private List<CartItemResponse> items;
    private Long totalAmount;
}