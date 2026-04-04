package bai4_qlsp_LeBinh.demo.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserAddressRequest {
    @NotBlank(message = "Ho ten nguoi nhan khong duoc de trong")
    private String fullName;

    @NotBlank(message = "So dien thoai khong duoc de trong")
    private String phone;

    @NotBlank(message = "Dia chi khong duoc de trong")
    private String addressLine;

    private String label;

    private boolean isDefault;
}
