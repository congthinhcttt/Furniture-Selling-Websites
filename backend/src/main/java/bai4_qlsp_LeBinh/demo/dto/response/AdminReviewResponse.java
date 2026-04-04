package bai4_qlsp_LeBinh.demo.dto.response;

import bai4_qlsp_LeBinh.demo.entity.ReviewStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AdminReviewResponse {
    private Long id;
    private Long productId;
    private String productName;
    private Integer userId;
    private String username;
    private Long orderId;
    private Long orderItemId;
    private int overallRating;
    private int qualityRating;
    private int designRating;
    private int comfortRating;
    private int valueRating;
    private String title;
    private String content;
    private boolean anonymous;
    private ReviewStatus status;
    private String adminNote;
    private int helpfulCount;
    private boolean edited;
    private boolean deleted;
    private List<String> images;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDateTime deletedAt;
}
