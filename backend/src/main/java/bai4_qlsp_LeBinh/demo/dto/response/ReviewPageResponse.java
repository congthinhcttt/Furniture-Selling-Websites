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
public class ReviewPageResponse {
    private List<ReviewResponse> items;
    private int currentPage;
    private int pageSize;
    private long totalItems;
    private int totalPages;
}
