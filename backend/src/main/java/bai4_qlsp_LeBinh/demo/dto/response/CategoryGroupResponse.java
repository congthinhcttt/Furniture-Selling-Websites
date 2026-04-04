package bai4_qlsp_LeBinh.demo.dto.response;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CategoryGroupResponse {
    private Integer id;
    private String name;
    private String slug;
    private String bannerImage;
}