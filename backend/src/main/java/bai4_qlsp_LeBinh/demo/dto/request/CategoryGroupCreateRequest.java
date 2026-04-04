package bai4_qlsp_LeBinh.demo.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CategoryGroupCreateRequest {

    @NotBlank(message = "TÃªn nhÃ³m danh má»¥c khÃ´ng Ä‘Æ°á»£c Ä‘á»ƒ trá»‘ng")
    @Size(max = 255, message = "TÃªn nhÃ³m danh má»¥c khÃ´ng quÃ¡ 255 kÃ­ tá»±")
    private String name;

    @Size(max = 255, message = "Slug khÃ´ng quÃ¡ 255 kÃ­ tá»±")
    private String slug;

    @Size(max = 255, message = "Banner image khÃ´ng quÃ¡ 255 kÃ­ tá»±")
    private String bannerImage;
}
