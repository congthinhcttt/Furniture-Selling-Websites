package bai4_qlsp_LeBinh.demo.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChatbotProductItemResponse {

    private Long id;
    private String name;
    private Long price;
    private String image;
    private String shortDescription;
    private String detailUrl;
}
