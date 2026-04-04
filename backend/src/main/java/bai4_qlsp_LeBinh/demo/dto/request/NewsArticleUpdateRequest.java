package bai4_qlsp_LeBinh.demo.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class NewsArticleUpdateRequest {
    @NotBlank(message = "Chủ đề tin tức không được để trống")
    private String topic;

    @NotBlank(message = "Tiêu đề tin tức không được để trống")
    private String title;

    private String image;

    @NotBlank(message = "Nội dung chính không được để trống")
    private String content;
}
