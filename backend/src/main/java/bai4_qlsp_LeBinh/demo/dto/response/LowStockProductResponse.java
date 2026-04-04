package bai4_qlsp_LeBinh.demo.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LowStockProductResponse {
    private Long id;
    private String name;
    private String color;
    private Integer width;
    private Integer length;
    private Integer stockQuantity;
    private Integer categoryId;
    private String categoryName;
}
