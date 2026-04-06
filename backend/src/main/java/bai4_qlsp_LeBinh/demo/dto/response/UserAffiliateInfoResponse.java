package bai4_qlsp_LeBinh.demo.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserAffiliateInfoResponse {
    private Integer userId;
    private String referralCode;
    private String referralLink;
    private Long totalSuccessfulReferrals;
    private Long totalRewardsReceived;
    private Boolean affiliateEnabled;
    private AffiliateConfigSummaryResponse currentAffiliateConfigSummary;
}
