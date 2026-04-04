package bai4_qlsp_LeBinh.demo.controller.user;

import bai4_qlsp_LeBinh.demo.dto.request.ProductFilterRequest;
import bai4_qlsp_LeBinh.demo.dto.response.ApiResponse;
import bai4_qlsp_LeBinh.demo.dto.response.ProductResponse;
import bai4_qlsp_LeBinh.demo.service.ProductService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/user/products")
public class UserProductController {

    private final ProductService productService;

    public UserProductController(ProductService productService) {
        this.productService = productService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<ProductResponse>>> getProducts(
            @RequestParam(required = false) Integer groupId,
            @RequestParam(required = false) Integer categoryId,
            @RequestParam(required = false) List<Integer> categoryIds) {
        ProductFilterRequest filterRequest = ProductFilterRequest.builder()
                .groupId(groupId)
                .categoryId(categoryId)
                .categoryIds(categoryIds)
                .build();

        return ResponseEntity.ok(
                ApiResponse.<List<ProductResponse>>builder()
                        .success(true)
                        .message("Láº¥y danh sÃ¡ch sáº£n pháº©m thÃ nh cÃ´ng")
                        .data(productService.getProducts(filterRequest))
                        .build()
        );
    }

    @GetMapping("/featured")
    public ResponseEntity<ApiResponse<List<ProductResponse>>> getFeaturedProducts(
            @RequestParam(defaultValue = "12") Integer limit) {
        return ResponseEntity.ok(
                ApiResponse.<List<ProductResponse>>builder()
                        .success(true)
                        .message("Lấy danh sách sản phẩm nổi bật thành công")
                        .data(productService.getFeaturedProducts(limit))
                        .build()
        );
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ProductResponse>> getProductById(@PathVariable Long id) {
        return ResponseEntity.ok(
                ApiResponse.<ProductResponse>builder()
                        .success(true)
                        .message("Láº¥y chi tiáº¿t sáº£n pháº©m thÃ nh cÃ´ng")
                        .data(productService.getProductById(id))
                        .build()
        );
    }
}
