package bai4_qlsp_LeBinh.demo.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuthResponse {
    private Integer id;
    private String loginName;
    private String email;
    private String fullName;
    private String avatarUrl;
    private String role;
    private String authProvider;
    private String token;
    private String tokenType;
    private Long expiresAt;
    private String message;
}
