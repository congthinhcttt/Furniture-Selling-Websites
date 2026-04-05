package bai4_qlsp_LeBinh.demo.controller.user;

import bai4_qlsp_LeBinh.demo.dto.request.CompareProductsRequest;
import bai4_qlsp_LeBinh.demo.dto.request.ProductFilterRequest;
import bai4_qlsp_LeBinh.demo.dto.response.ApiResponse;
import bai4_qlsp_LeBinh.demo.dto.response.CompareProductResponse;
import bai4_qlsp_LeBinh.demo.dto.response.ProductResponse;
import bai4_qlsp_LeBinh.demo.service.ProductService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

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
                        .message("Lấy danh sách sản phẩm thành công")
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
                        .message("Lấy chi tiết sản phẩm thành công")
                        .data(productService.getProductById(id))
                        .build()
        );
    }

    @PostMapping("/compare")
    public ResponseEntity<ApiResponse<List<CompareProductResponse>>> compareProducts(
            @RequestBody CompareProductsRequest request) {
        return ResponseEntity.ok(
                ApiResponse.<List<CompareProductResponse>>builder()
                        .success(true)
                        .message("Lấy dữ liệu so sánh thành công")
                        .data(productService.compareProducts(request))
                        .build()
        );
    }
}
