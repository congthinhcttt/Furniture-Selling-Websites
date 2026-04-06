package bai4_qlsp_LeBinh.demo.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AffiliateBackfillResponse {
    private int updatedCount;
}
