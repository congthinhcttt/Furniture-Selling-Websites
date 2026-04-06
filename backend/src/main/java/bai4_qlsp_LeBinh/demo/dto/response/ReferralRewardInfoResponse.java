package bai4_qlsp_LeBinh.demo.dto.response;

import bai4_qlsp_LeBinh.demo.enums.AffiliateRewardRole;
import bai4_qlsp_LeBinh.demo.enums.AffiliateRewardLogStatus;
import bai4_qlsp_LeBinh.demo.enums.VoucherDiscountType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReferralRewardInfoResponse {
    private AffiliateRewardRole rewardRole;
    private AffiliateRewardLogStatus status;
    private VoucherDiscountType rewardType;
    private BigDecimal rewardValue;
    private Long voucherId;
    private String voucherCode;
}
