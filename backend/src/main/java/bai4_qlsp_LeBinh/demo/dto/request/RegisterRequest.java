package bai4_qlsp_LeBinh.demo.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RegisterRequest {
    @NotBlank(message = "Ten dang nhap khong duoc de trong")
    private String loginName;

    @NotBlank(message = "Mat khau khong duoc de trong")
    private String password;

    @Email(message = "Email khong dung dinh dang")
    private String email;

    private String fullName;

    @Pattern(regexp = "^[a-zA-Z]{8}$", message = "Ma gioi thieu phai gom 8 ky tu chu cai")
    private String referralCode;
}
