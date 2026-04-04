package bai4_qlsp_LeBinh.demo.dto.request;

import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AdminReviewModerationRequest {

    @Size(max = 500, message = "Ghi chú quản trị tối đa 500 ký tự")
    private String adminNote;
}
