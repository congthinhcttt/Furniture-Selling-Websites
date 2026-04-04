package bai4_qlsp_LeBinh.demo.service;

import bai4_qlsp_LeBinh.demo.dto.request.CategoryCreateRequest;
import bai4_qlsp_LeBinh.demo.dto.request.CategoryUpdateRequest;
import bai4_qlsp_LeBinh.demo.dto.response.CategoryResponse;
import bai4_qlsp_LeBinh.demo.entity.Category;
import bai4_qlsp_LeBinh.demo.entity.CategoryGroup;
import bai4_qlsp_LeBinh.demo.exception.ConflictException;
import bai4_qlsp_LeBinh.demo.exception.ResourceNotFoundException;
import bai4_qlsp_LeBinh.demo.repository.CategoryGroupRepository;
import bai4_qlsp_LeBinh.demo.repository.CategoryRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class CategoryService {

    private final CategoryRepository categoryRepository;
    private final CategoryGroupRepository categoryGroupRepository;

    public CategoryService(CategoryRepository categoryRepository,
                           CategoryGroupRepository categoryGroupRepository) {
        this.categoryRepository = categoryRepository;
        this.categoryGroupRepository = categoryGroupRepository;
    }

    @Transactional(readOnly = true)
    public List<CategoryResponse> getCategories(Integer groupId) {
        List<Category> categories = groupId != null
                ? categoryRepository.findByGroupId(groupId)
                : categoryRepository.findAll();

        return categories.stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public CategoryResponse getCategoryById(Integer id) {
        return mapToResponse(getCategoryEntityById(id));
    }

    public CategoryResponse createCategory(CategoryCreateRequest request) {
        validateUniqueSlugForCreate(request.getSlug());

        CategoryGroup group = getCategoryGroupById(request.getGroupId());

        Category category = new Category();
        category.setName(request.getName());
        category.setSlug(request.getSlug());
        category.setGroup(group);

        return mapToResponse(categoryRepository.save(category));
    }

    public CategoryResponse updateCategory(Integer id, CategoryUpdateRequest request) {
        Category category = getCategoryEntityById(id);
        validateUniqueSlugForUpdate(request.getSlug(), id);

        CategoryGroup group = getCategoryGroupById(request.getGroupId());

        category.setName(request.getName());
        category.setSlug(request.getSlug());
        category.setGroup(group);

        return mapToResponse(categoryRepository.save(category));
    }

    public void deleteCategory(Integer id) {
        Category category = getCategoryEntityById(id);
        categoryRepository.delete(category);
    }

    private Category getCategoryEntityById(Integer id) {
        return categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("KhÃ´ng tÃ¬m tháº¥y danh má»¥c vá»›i id: " + id));
    }

    private CategoryGroup getCategoryGroupById(Integer id) {
        return categoryGroupRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("KhÃ´ng tÃ¬m tháº¥y nhÃ³m danh má»¥c vá»›i id: " + id));
    }

    private void validateUniqueSlugForCreate(String slug) {
        if (slug != null && !slug.isBlank() && categoryRepository.existsBySlug(slug)) {
            throw new ConflictException("Slug danh má»¥c Ä‘Ã£ tá»“n táº¡i");
        }
    }

    private void validateUniqueSlugForUpdate(String slug, Integer id) {
        if (slug != null && !slug.isBlank() && categoryRepository.existsBySlugAndIdNot(slug, id)) {
            throw new ConflictException("Slug danh má»¥c Ä‘Ã£ tá»“n táº¡i");
        }
    }

    private CategoryResponse mapToResponse(Category category) {
        return CategoryResponse.builder()
                .id(category.getId())
                .name(category.getName())
                .slug(category.getSlug())
                .groupId(category.getGroup().getId())
                .groupName(category.getGroup().getName())
                .groupSlug(category.getGroup().getSlug())
                .build();
    }
}
