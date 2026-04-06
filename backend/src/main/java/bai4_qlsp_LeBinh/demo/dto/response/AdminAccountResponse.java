package bai4_qlsp_LeBinh.demo.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AdminAccountResponse {
    private Integer id;
    private String loginName;
    private String email;
    private String role;
    private String referralCode;
    private Integer referredByUserId;
    private long successfulReferralCount;
}
