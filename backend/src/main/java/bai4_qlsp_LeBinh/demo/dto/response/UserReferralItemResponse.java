package bai4_qlsp_LeBinh.demo.dto.response;

import bai4_qlsp_LeBinh.demo.enums.AffiliateReferralStatus;
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
public class UserReferralItemResponse {
    private Long referralId;
    private Integer referredUserId;
    private String referredLoginName;
    private String referredEmailMasked;
    private String referralCodeUsed;
    private AffiliateReferralStatus status;
    private LocalDateTime createdAt;
    private LocalDateTime rewardedAt;
    private List<ReferralRewardInfoResponse> rewards;
}
