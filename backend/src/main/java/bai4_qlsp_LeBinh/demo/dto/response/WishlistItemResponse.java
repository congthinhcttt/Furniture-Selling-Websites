package bai4_qlsp_LeBinh.demo.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WishlistItemResponse {

    private Long productId;
    private String productName;
    private Long price;
    private String image;
    private String shortDescription;
    private String categoryName;
    private LocalDateTime createdAt;
    private boolean inWishlist;
}
