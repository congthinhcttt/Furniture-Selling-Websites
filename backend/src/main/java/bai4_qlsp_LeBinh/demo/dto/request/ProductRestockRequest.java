package bai4_qlsp_LeBinh.demo.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductRestockRequest {

    @NotNull(message = "So luong nhap khong duoc de trong")
    @Min(value = 1, message = "So luong nhap phai lon hon hoac bang 1")
    private Integer quantity;
}
