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
public class ReviewResponse {
    private Long id;
    private Long productId;
    private String productName;
    private Integer userId;
    private String reviewerName;
    private String reviewerAvatar;
    private boolean anonymous;
    private String displayName;
    private Long orderId;
    private Long orderItemId;
    private int overallRating;
    private int qualityRating;
    private int designRating;
    private int comfortRating;
    private int valueRating;
    private String title;
    private String content;
    private List<String> images;
    private ReviewStatus status;
    private int helpfulCount;
    private boolean helpfulByCurrentUser;
    private boolean edited;
    private boolean purchased;
    private boolean featured;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
