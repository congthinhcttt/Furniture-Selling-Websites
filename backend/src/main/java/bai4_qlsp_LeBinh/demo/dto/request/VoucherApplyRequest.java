package bai4_qlsp_LeBinh.demo.dto.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VoucherApplyRequest {

    private String code;
    private Long subtotal;
}
