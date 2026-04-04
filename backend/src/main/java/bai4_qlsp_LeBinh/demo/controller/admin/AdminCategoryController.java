package bai4_qlsp_LeBinh.demo.controller.admin;

import bai4_qlsp_LeBinh.demo.dto.request.CategoryCreateRequest;
import bai4_qlsp_LeBinh.demo.dto.request.CategoryUpdateRequest;
import bai4_qlsp_LeBinh.demo.dto.response.ApiResponse;
import bai4_qlsp_LeBinh.demo.dto.response.CategoryResponse;
import bai4_qlsp_LeBinh.demo.service.CategoryService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/categories")
public class AdminCategoryController {

    private final CategoryService categoryService;

    public AdminCategoryController(CategoryService categoryService) {
        this.categoryService = categoryService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<CategoryResponse>>> getAllCategories() {
        return ResponseEntity.ok(
                ApiResponse.<List<CategoryResponse>>builder()
                        .success(true)
                        .message("Láº¥y danh sÃ¡ch danh má»¥c thÃ nh cÃ´ng")
                        .data(categoryService.getCategories(null))
                        .build()
        );
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<CategoryResponse>> getCategoryById(@PathVariable Integer id) {
        return ResponseEntity.ok(
                ApiResponse.<CategoryResponse>builder()
                        .success(true)
                        .message("Láº¥y chi tiáº¿t danh má»¥c thÃ nh cÃ´ng")
                        .data(categoryService.getCategoryById(id))
                        .build()
        );
    }

    @PostMapping
    public ResponseEntity<ApiResponse<CategoryResponse>> createCategory(@Valid @RequestBody CategoryCreateRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(
                        ApiResponse.<CategoryResponse>builder()
                                .success(true)
                                .message("Táº¡o danh má»¥c thÃ nh cÃ´ng")
                                .data(categoryService.createCategory(request))
                                .build()
                );
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<CategoryResponse>> updateCategory(@PathVariable Integer id,
                                                                        @Valid @RequestBody CategoryUpdateRequest request) {
        return ResponseEntity.ok(
                ApiResponse.<CategoryResponse>builder()
                        .success(true)
                        .message("Cáº­p nháº­t danh má»¥c thÃ nh cÃ´ng")
                        .data(categoryService.updateCategory(id, request))
                        .build()
        );
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Object>> deleteCategory(@PathVariable Integer id) {
        categoryService.deleteCategory(id);
        return ResponseEntity.ok(
                ApiResponse.builder()
                        .success(true)
                        .message("XÃ³a danh má»¥c thÃ nh cÃ´ng")
                        .data(null)
                        .build()
        );
    }
}
