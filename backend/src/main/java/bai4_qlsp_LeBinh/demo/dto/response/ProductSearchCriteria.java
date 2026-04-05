package bai4_qlsp_LeBinh.demo.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductSearchCriteria {

    private String productType;
    private Long minPrice;
    private Long maxPrice;
    private String color;
    private String material;
    private String roomType;
    private String style;
    private String keyword;
    private boolean productIntent;
}
