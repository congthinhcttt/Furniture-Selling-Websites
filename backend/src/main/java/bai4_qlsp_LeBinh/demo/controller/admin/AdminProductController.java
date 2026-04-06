package bai4_qlsp_LeBinh.demo.controller.admin;

import bai4_qlsp_LeBinh.demo.dto.request.ProductCreateRequest;
import bai4_qlsp_LeBinh.demo.dto.request.ProductFilterRequest;
import bai4_qlsp_LeBinh.demo.dto.request.ProductBulkRestockRequest;
import bai4_qlsp_LeBinh.demo.dto.request.ProductRestockRequest;
import bai4_qlsp_LeBinh.demo.dto.request.ProductUpdateRequest;
import bai4_qlsp_LeBinh.demo.dto.response.ApiResponse;
import bai4_qlsp_LeBinh.demo.dto.response.LowStockProductResponse;
import bai4_qlsp_LeBinh.demo.dto.response.ProductResponse;
import bai4_qlsp_LeBinh.demo.service.ProductService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/products")
public class AdminProductController {

    private final ProductService productService;

    public AdminProductController(ProductService productService) {
        this.productService = productService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<ProductResponse>>> getAllProducts() {
        return ResponseEntity.ok(
                ApiResponse.<List<ProductResponse>>builder()
                        .success(true)
                        .message("Láº¥y danh sÃ¡ch sáº£n pháº©m thÃ nh cÃ´ng")
                        .data(productService.getProducts(ProductFilterRequest.builder().build()))
                        .build()
        );
    }

    @GetMapping("/low-stock")
    public ResponseEntity<ApiResponse<List<LowStockProductResponse>>> getLowStockProducts(
            @RequestParam(defaultValue = "5") int threshold
    ) {
        return ResponseEntity.ok(
                ApiResponse.<List<LowStockProductResponse>>builder()
                        .success(true)
                        .message("Láº¥y danh sÃ¡ch sáº£n pháº©m sáº¯p háº¿t hÃ ng thÃ nh cÃ´ng")
                        .data(productService.getLowStockProducts(threshold))
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

    @PostMapping
    public ResponseEntity<ApiResponse<ProductResponse>> createProduct(@Valid @RequestBody ProductCreateRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(
                        ApiResponse.<ProductResponse>builder()
                                .success(true)
                                .message("Táº¡o sáº£n pháº©m thÃ nh cÃ´ng")
                                .data(productService.createProduct(request))
                                .build()
                );
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<ProductResponse>> updateProduct(@PathVariable Long id,
                                                                      @Valid @RequestBody ProductUpdateRequest request) {
        return ResponseEntity.ok(
                ApiResponse.<ProductResponse>builder()
                        .success(true)
                        .message("Cáº­p nháº­t sáº£n pháº©m thÃ nh cÃ´ng")
                        .data(productService.updateProduct(id, request))
                        .build()
        );
    }

    @PostMapping("/{id}/restock")
    public ResponseEntity<ApiResponse<ProductResponse>> restockProduct(@PathVariable Long id,
                                                                       @Valid @RequestBody ProductRestockRequest request) {
        return ResponseEntity.ok(
                ApiResponse.<ProductResponse>builder()
                        .success(true)
                        .message("Nhap hang thanh cong")
                        .data(productService.restockProduct(id, request.getQuantity()))
                        .build()
        );
    }

    @PostMapping("/restock/bulk")
    public ResponseEntity<ApiResponse<List<ProductResponse>>> restockProductsBulk(
            @Valid @RequestBody ProductBulkRestockRequest request
    ) {
        return ResponseEntity.ok(
                ApiResponse.<List<ProductResponse>>builder()
                        .success(true)
                        .message("Nhap hang hang loat thanh cong")
                        .data(productService.restockProductsBulk(request))
                        .build()
        );
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Object>> deleteProduct(@PathVariable Long id) {
        productService.deleteProduct(id);
        return ResponseEntity.ok(
                ApiResponse.builder()
                        .success(true)
                        .message("XÃ³a sáº£n pháº©m thÃ nh cÃ´ng")
                        .data(null)
                        .build()
        );
    }
}
