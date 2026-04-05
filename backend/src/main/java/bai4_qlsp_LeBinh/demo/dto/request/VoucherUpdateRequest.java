package bai4_qlsp_LeBinh.demo.dto.request;

import bai4_qlsp_LeBinh.demo.enums.VoucherDiscountType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VoucherUpdateRequest {

    private String code;
    private String name;
    private VoucherDiscountType discountType;
    private Long discountValue;
    private Long minOrderValue;
    private Long maxDiscount;
    private LocalDateTime startDate;
    private LocalDateTime endDate;
    private Integer usageLimit;
    private Boolean active;
}
