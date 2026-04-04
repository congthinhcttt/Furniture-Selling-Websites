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
public class AdminAccountRoleUpdateRequest {
    @NotBlank(message = "Role khong duoc de trong")
    private String role;
}
