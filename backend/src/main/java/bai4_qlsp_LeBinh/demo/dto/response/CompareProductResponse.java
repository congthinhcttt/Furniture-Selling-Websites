package bai4_qlsp_LeBinh.demo.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CompareProductResponse {

    private Long id;
    private String name;
    private String image;
    private Long price;
    private String material;
    private String dimensions;
    private String color;
    private String warranty;
    private String categoryName;
    private String shortDescription;
    private Integer stockQuantity;
}
