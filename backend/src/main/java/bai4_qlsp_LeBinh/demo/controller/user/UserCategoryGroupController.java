package bai4_qlsp_LeBinh.demo.controller.user;

import bai4_qlsp_LeBinh.demo.dto.response.ApiResponse;
import bai4_qlsp_LeBinh.demo.dto.response.CategoryGroupResponse;
import bai4_qlsp_LeBinh.demo.service.CategoryGroupService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/user/category-groups")
public class UserCategoryGroupController {

    private final CategoryGroupService categoryGroupService;

    public UserCategoryGroupController(CategoryGroupService categoryGroupService) {
        this.categoryGroupService = categoryGroupService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<CategoryGroupResponse>>> getAllGroups() {
        return ResponseEntity.ok(
                ApiResponse.<List<CategoryGroupResponse>>builder()
                        .success(true)
                        .message("Lấy danh sách nhóm danh mục thành công")
                        .data(categoryGroupService.getAllGroups())
                        .build()
        );
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<CategoryGroupResponse>> getGroupById(@PathVariable Integer id) {
        return ResponseEntity.ok(
                ApiResponse.<CategoryGroupResponse>builder()
                        .success(true)
                        .message("Lấy chi tiết nhóm danh mục thành công")
                        .data(categoryGroupService.getById(id))
                        .build()
        );
    }
}