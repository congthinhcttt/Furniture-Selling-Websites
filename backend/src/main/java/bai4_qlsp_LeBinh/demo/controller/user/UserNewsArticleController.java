package bai4_qlsp_LeBinh.demo.controller.user;

import bai4_qlsp_LeBinh.demo.dto.response.ApiResponse;
import bai4_qlsp_LeBinh.demo.dto.response.NewsArticleResponse;
import bai4_qlsp_LeBinh.demo.service.NewsArticleService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/user/news")
public class UserNewsArticleController {

    private final NewsArticleService newsArticleService;

    public UserNewsArticleController(NewsArticleService newsArticleService) {
        this.newsArticleService = newsArticleService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<NewsArticleResponse>>> getAllNews() {
        return ResponseEntity.ok(
                ApiResponse.<List<NewsArticleResponse>>builder()
                        .success(true)
                        .message("Lấy danh sách tin tức thành công")
                        .data(newsArticleService.getAllNews())
                        .build()
        );
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<NewsArticleResponse>> getNewsById(@PathVariable Long id) {
        return ResponseEntity.ok(
                ApiResponse.<NewsArticleResponse>builder()
                        .success(true)
                        .message("Lấy chi tiết tin tức thành công")
                        .data(newsArticleService.getNewsById(id))
                        .build()
        );
    }
}
