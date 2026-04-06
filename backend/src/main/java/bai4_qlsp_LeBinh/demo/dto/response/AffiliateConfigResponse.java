package bai4_qlsp_LeBinh.demo.dto.response;

import bai4_qlsp_LeBinh.demo.enums.VoucherDiscountType;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
public class AffiliateConfigResponse {
    private Long id;
    private Boolean enabled;
    private VoucherDiscountType referrerRewardType;
    private BigDecimal referrerRewardValue;
    private VoucherDiscountType refereeRewardType;
    private BigDecimal refereeRewardValue;
    private Integer voucherExpiryDays;
    private BigDecimal minOrderValue;
    private BigDecimal maxDiscountValue;
    private String referrerVoucherName;
    private String referrerVoucherContent;
    private String refereeVoucherName;
    private String refereeVoucherContent;
    private String description;
    private LocalDateTime updatedAt;
    private String updatedBy;
}
