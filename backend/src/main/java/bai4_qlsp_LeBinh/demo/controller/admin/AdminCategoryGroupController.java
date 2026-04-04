package bai4_qlsp_LeBinh.demo.controller.admin;

import bai4_qlsp_LeBinh.demo.dto.request.CategoryGroupCreateRequest;
import bai4_qlsp_LeBinh.demo.dto.request.CategoryGroupUpdateRequest;
import bai4_qlsp_LeBinh.demo.dto.response.ApiResponse;
import bai4_qlsp_LeBinh.demo.dto.response.CategoryGroupResponse;
import bai4_qlsp_LeBinh.demo.service.CategoryGroupService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/category-groups")
public class AdminCategoryGroupController {

    private final CategoryGroupService categoryGroupService;

    public AdminCategoryGroupController(CategoryGroupService categoryGroupService) {
        this.categoryGroupService = categoryGroupService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<CategoryGroupResponse>>> getAllGroups() {
        return ResponseEntity.ok(
                ApiResponse.<List<CategoryGroupResponse>>builder()
                        .success(true)
                        .message("Láº¥y danh sÃ¡ch nhÃ³m danh má»¥c thÃ nh cÃ´ng")
                        .data(categoryGroupService.getAllGroups())
                        .build()
        );
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<CategoryGroupResponse>> getGroupById(@PathVariable Integer id) {
        return ResponseEntity.ok(
                ApiResponse.<CategoryGroupResponse>builder()
                        .success(true)
                        .message("Láº¥y chi tiáº¿t nhÃ³m danh má»¥c thÃ nh cÃ´ng")
                        .data(categoryGroupService.getById(id))
                        .build()
        );
    }

    @PostMapping
    public ResponseEntity<ApiResponse<CategoryGroupResponse>> createGroup(@Valid @RequestBody CategoryGroupCreateRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(
                        ApiResponse.<CategoryGroupResponse>builder()
                                .success(true)
                                .message("Táº¡o nhÃ³m danh má»¥c thÃ nh cÃ´ng")
                                .data(categoryGroupService.create(request))
                                .build()
                );
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<CategoryGroupResponse>> updateGroup(@PathVariable Integer id,
                                                                          @Valid @RequestBody CategoryGroupUpdateRequest request) {
        return ResponseEntity.ok(
                ApiResponse.<CategoryGroupResponse>builder()
                        .success(true)
                        .message("Cáº­p nháº­t nhÃ³m danh má»¥c thÃ nh cÃ´ng")
                        .data(categoryGroupService.update(id, request))
                        .build()
        );
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Object>> deleteGroup(@PathVariable Integer id) {
        categoryGroupService.deleteById(id);
        return ResponseEntity.ok(
                ApiResponse.builder()
                        .success(true)
                        .message("XÃ³a nhÃ³m danh má»¥c thÃ nh cÃ´ng")
                        .data(null)
                        .build()
        );
    }
}
