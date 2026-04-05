package bai4_qlsp_LeBinh.demo.dto.request;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.validator.constraints.Length;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductUpdateRequest {

    @NotBlank(message = "Ten san pham khong duoc de trong")
    @Size(max = 255, message = "Ten san pham khong qua 255 ky tu")
    private String name;

    private String description;

    @Length(max = 255, message = "Mo ta ngan khong qua 255 ky tu")
    private String shortDescription;

    @NotNull(message = "Gia san pham khong duoc de trong")
    @Min(value = 1, message = "Gia san pham khong duoc nho hon 1")
    @Max(value = 999999999, message = "Gia san pham khong duoc lon hon 999999999")
    private Long price;

    @Length(max = 200, message = "Ten hinh anh khong qua 200 ky tu")
    private String image;

    @Length(max = 150, message = "Chat lieu khong qua 150 ky tu")
    private String material;

    @Length(max = 50, message = "Mau sac khong qua 50 ky tu")
    private String color;

    @Length(max = 100, message = "Bao hanh khong qua 100 ky tu")
    private String warranty;

    @Length(max = 100, message = "Phong cach khong qua 100 ky tu")
    private String style;

    @NotNull(message = "Chieu rong khong duoc de trong")
    @Min(value = 1, message = "Chieu rong phai lon hon hoac bang 1")
    private Integer width;

    @NotNull(message = "Chieu dai khong duoc de trong")
    @Min(value = 1, message = "Chieu dai phai lon hon hoac bang 1")
    private Integer length;

    @NotNull(message = "Ton kho khong duoc de trong")
    @Min(value = 0, message = "Ton kho khong duoc nho hon 0")
    private Integer stockQuantity;

    @NotNull(message = "Danh muc khong duoc de trong")
    private Integer categoryId;
}
