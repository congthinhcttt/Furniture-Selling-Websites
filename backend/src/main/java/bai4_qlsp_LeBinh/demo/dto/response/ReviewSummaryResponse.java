package bai4_qlsp_LeBinh.demo.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReviewSummaryResponse {
    private Long productId;
    private double averageOverall;
    private double averageQuality;
    private double averageDesign;
    private double averageComfort;
    private double averageValue;
    private long totalReviews;
    private long totalWithImages;
    private double recommendationRate;
    private List<RatingBreakdownItemResponse> ratingBreakdown;
}
