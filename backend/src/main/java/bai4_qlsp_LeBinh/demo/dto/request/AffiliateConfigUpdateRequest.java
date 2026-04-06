package bai4_qlsp_LeBinh.demo.dto.request;

import bai4_qlsp_LeBinh.demo.enums.VoucherDiscountType;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AffiliateConfigUpdateRequest {

    @NotNull
    private Boolean enabled;

    @NotNull
    private VoucherDiscountType referrerRewardType;

    @NotNull
    @DecimalMin(value = "0.01", message = "Gia tri thuong nguoi gioi thieu phai lon hon 0")
    private BigDecimal referrerRewardValue;

    @NotNull
    private VoucherDiscountType refereeRewardType;

    @NotNull
    @DecimalMin(value = "0.01", message = "Gia tri thuong nguoi duoc gioi thieu phai lon hon 0")
    private BigDecimal refereeRewardValue;

    @NotNull
    @Min(value = 1, message = "Voucher expiry days phai lon hon 0")
    private Integer voucherExpiryDays;

    @DecimalMin(value = "0.00", message = "Min order value khong duoc am")
    private BigDecimal minOrderValue;

    @DecimalMin(value = "0.00", message = "Max discount value khong duoc am")
    private BigDecimal maxDiscountValue;

    @NotBlank
    private String referrerVoucherName;

    private String referrerVoucherContent;

    @NotBlank
    private String refereeVoucherName;

    private String refereeVoucherContent;

    private String description;
}
