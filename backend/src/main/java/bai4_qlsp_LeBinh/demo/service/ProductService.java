package bai4_qlsp_LeBinh.demo.service;

import bai4_qlsp_LeBinh.demo.dto.request.ProductCreateRequest;
import bai4_qlsp_LeBinh.demo.dto.request.ProductFilterRequest;
import bai4_qlsp_LeBinh.demo.dto.request.ProductUpdateRequest;
import bai4_qlsp_LeBinh.demo.dto.response.LowStockProductResponse;
import bai4_qlsp_LeBinh.demo.dto.response.ProductResponse;
import bai4_qlsp_LeBinh.demo.entity.Category;
import bai4_qlsp_LeBinh.demo.entity.Product;
import bai4_qlsp_LeBinh.demo.exception.BadRequestException;
import bai4_qlsp_LeBinh.demo.exception.ResourceNotFoundException;
import bai4_qlsp_LeBinh.demo.repository.CategoryRepository;
import bai4_qlsp_LeBinh.demo.repository.ProductRepository;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
public class ProductService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;

    public ProductService(ProductRepository productRepository,
                          CategoryRepository categoryRepository) {
        this.productRepository = productRepository;
        this.categoryRepository = categoryRepository;
    }

    @Transactional(readOnly = true)
    public List<ProductResponse> getProducts(ProductFilterRequest filterRequest) {
        Specification<Product> specification = buildProductSpecification(filterRequest);

        return productRepository.findAll(specification)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public ProductResponse getProductById(Long id) {
        return mapToResponse(getProductEntityById(id));
    }

    @Transactional(readOnly = true)
    public List<ProductResponse> getFeaturedProducts(int limit) {
        int safeLimit = Math.max(1, Math.min(limit, 24));

        return productRepository.findAllByOrderByIdDesc(PageRequest.of(0, safeLimit))
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    public ProductResponse createProduct(ProductCreateRequest request) {
        Category category = getCategoryById(request.getCategoryId());

        Product product = new Product();
        applyProductData(product, request.getName(), request.getDescription(), request.getPrice(),
                request.getImage(), request.getColor(), request.getWidth(), request.getLength(),
                request.getStockQuantity(), category);

        return mapToResponse(productRepository.save(product));
    }

    public ProductResponse updateProduct(Long id, ProductUpdateRequest request) {
        Product product = getProductEntityById(id);
        Category category = getCategoryById(request.getCategoryId());

        applyProductData(product, request.getName(), request.getDescription(), request.getPrice(),
                request.getImage(), request.getColor(), request.getWidth(), request.getLength(),
                request.getStockQuantity(), category);

        return mapToResponse(productRepository.save(product));
    }

    @Transactional(readOnly = true)
    public List<LowStockProductResponse> getLowStockProducts(int threshold) {
        int safeThreshold = Math.max(0, threshold);

        return productRepository.findByStockQuantityLessThanEqualOrderByStockQuantityAscIdAsc(safeThreshold)
                .stream()
                .map(product -> LowStockProductResponse.builder()
                        .id(product.getId())
                        .name(product.getName())
                        .color(product.getColor())
                        .width(product.getWidth())
                        .length(product.getLength())
                        .stockQuantity(product.getStockQuantity())
                        .categoryId(product.getCategory().getId())
                        .categoryName(product.getCategory().getName())
                        .build())
                .toList();
    }

    public void ensureStockAvailable(Product product, int requiredQuantity) {
        if (requiredQuantity <= 0) {
            throw new BadRequestException("Sá»‘ lÆ°á»£ng sáº£n pháº©m pháº£i lá»›n hÆ¡n 0");
        }

        if (product.getStockQuantity() < requiredQuantity) {
            throw new BadRequestException(
                    "Sáº£n pháº©m " + product.getName() + " chá»‰ cÃ²n " + product.getStockQuantity() + " sáº£n pháº©m trong kho"
            );
        }
    }

    public void decreaseStock(Product product, int quantity) {
        ensureStockAvailable(product, quantity);
        product.setStockQuantity(product.getStockQuantity() - quantity);
        productRepository.save(product);
    }

    @Transactional
    public ProductResponse restockProduct(Long id, int quantity) {
        if (quantity <= 0) {
            throw new BadRequestException("So luong nhap phai lon hon 0");
        }

        Product product = getProductEntityById(id);
        product.setStockQuantity(product.getStockQuantity() + quantity);
        return mapToResponse(productRepository.save(product));
    }

    public void deleteProduct(Long id) {
        Product product = getProductEntityById(id);
        productRepository.delete(product);
    }

    private Specification<Product> buildProductSpecification(ProductFilterRequest filterRequest) {
        ProductFilterRequest safeFilter = filterRequest != null ? filterRequest : new ProductFilterRequest();

        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            List<Integer> categoryIds = safeFilter.getEffectiveCategoryIds();

            if (safeFilter.getGroupId() != null) {
                predicates.add(cb.equal(root.get("category").get("group").get("id"), safeFilter.getGroupId()));
            }

            if (!categoryIds.isEmpty()) {
                predicates.add(root.get("category").get("id").in(categoryIds));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }

    private Product getProductEntityById(Long id) {
        return productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("KhÃ´ng tÃ¬m tháº¥y sáº£n pháº©m vá»›i id: " + id));
    }

    private Category getCategoryById(Integer categoryId) {
        return categoryRepository.findById(categoryId)
                .orElseThrow(() -> new ResourceNotFoundException("KhÃ´ng tÃ¬m tháº¥y danh má»¥c vá»›i id: " + categoryId));
    }

    private void applyProductData(Product product,
                                  String name,
                                  String description,
                                  Long price,
                                  String image,
                                  String color,
                                  Integer width,
                                  Integer length,
                                  Integer stockQuantity,
                                  Category category) {
        product.setName(name);
        product.setDescription(description);
        product.setPrice(price);
        product.setImage(image);
        product.setColor(color);
        product.setWidth(width);
        product.setLength(length);
        product.setStockQuantity(stockQuantity);
        product.setCategory(category);
    }

    private ProductResponse mapToResponse(Product product) {
        return ProductResponse.builder()
                .id(product.getId())
                .name(product.getName())
                .description(product.getDescription())
                .price(product.getPrice())
                .image(product.getImage())
                .color(product.getColor())
                .width(product.getWidth())
                .length(product.getLength())
                .stockQuantity(product.getStockQuantity())
                .categoryId(product.getCategory().getId())
                .categoryName(product.getCategory().getName())
                .categorySlug(product.getCategory().getSlug())
                .build();
    }
}
