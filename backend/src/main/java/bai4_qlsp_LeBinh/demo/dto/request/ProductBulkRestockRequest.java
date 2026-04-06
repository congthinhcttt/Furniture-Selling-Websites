package bai4_qlsp_LeBinh.demo.dto.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductBulkRestockRequest {

    @Valid
    @NotEmpty(message = "Danh sach nhap hang khong duoc de trong")
    private List<ProductBulkRestockItemRequest> items;
}
