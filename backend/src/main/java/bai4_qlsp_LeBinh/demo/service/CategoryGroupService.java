package bai4_qlsp_LeBinh.demo.service;

import bai4_qlsp_LeBinh.demo.dto.request.CategoryGroupCreateRequest;
import bai4_qlsp_LeBinh.demo.dto.request.CategoryGroupUpdateRequest;
import bai4_qlsp_LeBinh.demo.dto.response.CategoryGroupResponse;
import bai4_qlsp_LeBinh.demo.entity.CategoryGroup;
import bai4_qlsp_LeBinh.demo.exception.ConflictException;
import bai4_qlsp_LeBinh.demo.exception.ResourceNotFoundException;
import bai4_qlsp_LeBinh.demo.repository.CategoryGroupRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class CategoryGroupService {

    private final CategoryGroupRepository categoryGroupRepository;

    public CategoryGroupService(CategoryGroupRepository categoryGroupRepository) {
        this.categoryGroupRepository = categoryGroupRepository;
    }

    @Transactional(readOnly = true)
    public List<CategoryGroupResponse> getAllGroups() {
        return categoryGroupRepository.findAll()
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public CategoryGroupResponse getById(Integer id) {
        return mapToResponse(getCategoryGroupEntityById(id));
    }

    public CategoryGroupResponse create(CategoryGroupCreateRequest request) {
        validateUniqueSlugForCreate(request.getSlug());

        CategoryGroup group = new CategoryGroup();
        group.setName(request.getName());
        group.setSlug(request.getSlug());
        group.setBannerImage(request.getBannerImage());

        return mapToResponse(categoryGroupRepository.save(group));
    }

    public CategoryGroupResponse update(Integer id, CategoryGroupUpdateRequest request) {
        CategoryGroup group = getCategoryGroupEntityById(id);
        validateUniqueSlugForUpdate(request.getSlug(), id);

        group.setName(request.getName());
        group.setSlug(request.getSlug());
        group.setBannerImage(request.getBannerImage());

        return mapToResponse(categoryGroupRepository.save(group));
    }

    public void deleteById(Integer id) {
        CategoryGroup group = getCategoryGroupEntityById(id);
        categoryGroupRepository.delete(group);
    }

    private CategoryGroup getCategoryGroupEntityById(Integer id) {
        return categoryGroupRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("KhÃ´ng tÃ¬m tháº¥y nhÃ³m danh má»¥c vá»›i id: " + id));
    }

    private void validateUniqueSlugForCreate(String slug) {
        if (slug != null && !slug.isBlank() && categoryGroupRepository.existsBySlug(slug)) {
            throw new ConflictException("Slug nhÃ³m danh má»¥c Ä‘Ã£ tá»“n táº¡i");
        }
    }

    private void validateUniqueSlugForUpdate(String slug, Integer id) {
        if (slug != null && !slug.isBlank() && categoryGroupRepository.existsBySlugAndIdNot(slug, id)) {
            throw new ConflictException("Slug nhÃ³m danh má»¥c Ä‘Ã£ tá»“n táº¡i");
        }
    }

    private CategoryGroupResponse mapToResponse(CategoryGroup group) {
        return CategoryGroupResponse.builder()
                .id(group.getId())
                .name(group.getName())
                .slug(group.getSlug())
                .bannerImage(group.getBannerImage())
                .build();
    }
}
