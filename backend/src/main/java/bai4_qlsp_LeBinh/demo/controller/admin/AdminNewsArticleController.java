package bai4_qlsp_LeBinh.demo.controller.admin;

import bai4_qlsp_LeBinh.demo.dto.request.NewsArticleCreateRequest;
import bai4_qlsp_LeBinh.demo.dto.request.NewsArticleUpdateRequest;
import bai4_qlsp_LeBinh.demo.dto.response.ApiResponse;
import bai4_qlsp_LeBinh.demo.dto.response.NewsArticleResponse;
import bai4_qlsp_LeBinh.demo.service.NewsArticleService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/news")
public class AdminNewsArticleController {

    private final NewsArticleService newsArticleService;

    public AdminNewsArticleController(NewsArticleService newsArticleService) {
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

    @PostMapping
    public ResponseEntity<ApiResponse<NewsArticleResponse>> createNews(@Valid @RequestBody NewsArticleCreateRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.<NewsArticleResponse>builder()
                        .success(true)
                        .message("Tạo tin tức thành công")
                        .data(newsArticleService.create(request))
                        .build());
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<NewsArticleResponse>> updateNews(@PathVariable Long id,
                                                                       @Valid @RequestBody NewsArticleUpdateRequest request) {
        return ResponseEntity.ok(
                ApiResponse.<NewsArticleResponse>builder()
                        .success(true)
                        .message("Cập nhật tin tức thành công")
                        .data(newsArticleService.update(id, request))
                        .build()
        );
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Object>> deleteNews(@PathVariable Long id) {
        newsArticleService.deleteById(id);
        return ResponseEntity.ok(
                ApiResponse.builder()
                        .success(true)
                        .message("Xóa tin tức thành công")
                        .data(null)
                        .build()
        );
    }
}
