package bai4_qlsp_LeBinh.demo.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductResponse {

    private Long id;
    private String name;
    private String description;
    private String shortDescription;
    private Long price;
    private String image;
    private String material;
    private String color;
    private String warranty;
    private String style;
    private Integer width;
    private Integer length;
    private Integer stockQuantity;

    private Integer categoryId;
    private String categoryName;
    private String categorySlug;
}
