package bai4_qlsp_LeBinh.demo.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReviewableItemResponse {
    private Long orderId;
    private Long orderItemId;
    private Long productId;
    private String productName;
    private String productImage;
    private Integer quantity;
    private boolean canReview;
    private boolean reviewed;
    private Long reviewId;
}
