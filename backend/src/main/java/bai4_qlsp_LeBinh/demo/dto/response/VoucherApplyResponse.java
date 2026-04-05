package bai4_qlsp_LeBinh.demo.dto.response;

import bai4_qlsp_LeBinh.demo.enums.VoucherDiscountType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VoucherApplyResponse {

    private Long voucherId;
    private String code;
    private String name;
    private VoucherDiscountType discountType;
    private Long discountValue;
    private Long subtotal;
    private Long discountAmount;
    private Long finalTotal;
}
