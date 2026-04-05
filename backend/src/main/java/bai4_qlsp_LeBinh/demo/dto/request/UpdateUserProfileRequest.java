package bai4_qlsp_LeBinh.demo.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UpdateUserProfileRequest {
    @Size(max = 150, message = "Ho ten khong duoc vuot qua 150 ky tu")
    private String fullName;

    @Email(message = "Email khong hop le")
    @Size(max = 150, message = "Email khong duoc vuot qua 150 ky tu")
    private String email;

    @Size(max = 500, message = "Duong dan avatar khong duoc vuot qua 500 ky tu")
    private String avatarUrl;
}
