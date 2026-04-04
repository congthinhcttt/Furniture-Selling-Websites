package bai4_qlsp_LeBinh.demo.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LoginRequest {
    @NotBlank(message = "Tên đăng nhập không được để trống")
    private String loginName;

    @NotBlank(message = "Mật khẩu không được để trống")
    private String password;
}