package bai4_qlsp_LeBinh.demo.service;

import bai4_qlsp_LeBinh.demo.dto.request.CompareProductsRequest;
import bai4_qlsp_LeBinh.demo.dto.request.ProductBulkRestockRequest;
import bai4_qlsp_LeBinh.demo.dto.request.ProductCreateRequest;
import bai4_qlsp_LeBinh.demo.dto.request.ProductFilterRequest;
import bai4_qlsp_LeBinh.demo.dto.request.ProductUpdateRequest;
import bai4_qlsp_LeBinh.demo.dto.response.CompareProductResponse;
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
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
public class ProductService {

    private static final int MAX_COMPARE_PRODUCTS = 4;
    private static final int SHORT_DESCRIPTION_LIMIT = 140;

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

    @Transactional(readOnly = true)
    public List<CompareProductResponse> compareProducts(CompareProductsRequest request) {
        List<Long> productIds = request != null ? request.getProductIds() : null;

        if (productIds == null || productIds.isEmpty()) {
            throw new BadRequestException("Danh sách sản phẩm so sánh không được để trống.");
        }

        List<Long> sanitizedIds = productIds.stream()
                .filter(id -> id != null && id > 0)
                .distinct()
                .toList();

        if (sanitizedIds.isEmpty()) {
            throw new BadRequestException("Danh sách sản phẩm so sánh không hợp lệ.");
        }

        if (sanitizedIds.size() > MAX_COMPARE_PRODUCTS) {
            throw new BadRequestException("Chỉ được so sánh tối đa 4 sản phẩm.");
        }

        Map<Long, Product> productMap = new LinkedHashMap<>();
        productRepository.findAllById(sanitizedIds)
                .forEach(product -> productMap.put(product.getId(), product));

        List<CompareProductResponse> compareProducts = sanitizedIds.stream()
                .map(productMap::get)
                .filter(product -> product != null)
                .map(this::mapToCompareResponse)
                .toList();

        if (compareProducts.isEmpty()) {
            throw new ResourceNotFoundException("Không tìm thấy sản phẩm hợp lệ để so sánh.");
        }

        return compareProducts;
    }

    public ProductResponse createProduct(ProductCreateRequest request) {
        Category category = getCategoryById(request.getCategoryId());

        Product product = new Product();
        applyProductData(product, request.getName(), request.getDescription(), request.getPrice(),
                request.getShortDescription(), request.getImage(), request.getMaterial(), request.getColor(), request.getWarranty(), request.getStyle(),
                request.getWidth(), request.getLength(), request.getStockQuantity(), category);

        return mapToResponse(productRepository.save(product));
    }

    public ProductResponse updateProduct(Long id, ProductUpdateRequest request) {
        Product product = getProductEntityById(id);
        Category category = getCategoryById(request.getCategoryId());

        applyProductData(product, request.getName(), request.getDescription(), request.getPrice(),
                request.getShortDescription(), request.getImage(), request.getMaterial(), request.getColor(), request.getWarranty(), request.getStyle(),
                request.getWidth(), request.getLength(), request.getStockQuantity(), category);

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
            throw new BadRequestException("Số lượng sản phẩm phải lớn hơn 0");
        }

        if (product.getStockQuantity() < requiredQuantity) {
            throw new BadRequestException(
                    "Sản phẩm " + product.getName() + " chỉ còn " + product.getStockQuantity() + " sản phẩm trong kho"
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

    @Transactional
    public List<ProductResponse> restockProductsBulk(ProductBulkRestockRequest request) {
        if (request == null || request.getItems() == null || request.getItems().isEmpty()) {
            throw new BadRequestException("Danh sach nhap hang khong hop le");
        }

        Map<Long, Integer> quantityByProductId = new LinkedHashMap<>();
        List<ProductResponse> updatedProducts = new ArrayList<>();

        for (var item : request.getItems()) {
            if (item.getProductId() == null) {
                throw new BadRequestException("Product id khong duoc de trong");
            }
            if (item.getQuantity() == null || item.getQuantity() <= 0) {
                throw new BadRequestException("So luong nhap phai lon hon 0");
            }
            quantityByProductId.merge(item.getProductId(), item.getQuantity(), Integer::sum);
        }

        for (Map.Entry<Long, Integer> entry : quantityByProductId.entrySet()) {
            Product product = getProductEntityById(entry.getKey());
            product.setStockQuantity(product.getStockQuantity() + entry.getValue());
            updatedProducts.add(mapToResponse(productRepository.save(product)));
        }

        return updatedProducts;
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
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy sản phẩm với id: " + id));
    }

    private Category getCategoryById(Integer categoryId) {
        return categoryRepository.findById(categoryId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy danh mục với id: " + categoryId));
    }

    private void applyProductData(Product product,
                                  String name,
                                  String description,
                                  Long price,
                                  String shortDescription,
                                  String image,
                                  String material,
                                  String color,
                                  String warranty,
                                  String style,
                                  Integer width,
                                  Integer length,
                                  Integer stockQuantity,
                                  Category category) {
        product.setName(name);
        product.setDescription(description);
        product.setShortDescription(normalizeShortDescription(shortDescription, description));
        product.setPrice(price);
        product.setImage(image);
        product.setMaterial(material);
        product.setColor(color);
        product.setWarranty(warranty);
        product.setStyle(style);
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
                .shortDescription(normalizeShortDescription(product.getShortDescription(), product.getDescription()))
                .price(product.getPrice())
                .image(product.getImage())
                .material(product.getMaterial())
                .color(product.getColor())
                .warranty(product.getWarranty())
                .style(product.getStyle())
                .width(product.getWidth())
                .length(product.getLength())
                .stockQuantity(product.getStockQuantity())
                .categoryId(product.getCategory().getId())
                .categoryName(product.getCategory().getName())
                .categorySlug(product.getCategory().getSlug())
                .build();
    }

    private CompareProductResponse mapToCompareResponse(Product product) {
        return CompareProductResponse.builder()
                .id(product.getId())
                .name(product.getName())
                .image(product.getImage())
                .price(product.getPrice())
                .material(product.getMaterial())
                .dimensions(product.getWidth() + " x " + product.getLength() + " cm")
                .color(product.getColor())
                .warranty(product.getWarranty())
                .categoryName(product.getCategory() != null ? product.getCategory().getName() : null)
                .shortDescription(normalizeShortDescription(product.getShortDescription(), product.getDescription()))
                .stockQuantity(product.getStockQuantity())
                .build();
    }

    private String normalizeShortDescription(String shortDescription, String description) {
        if (shortDescription != null && !shortDescription.isBlank()) {
            return shortDescription.trim();
        }

        if (description == null || description.isBlank()) {
            return null;
        }

        String normalized = description.trim().replaceAll("\\s+", " ");
        if (normalized.length() <= SHORT_DESCRIPTION_LIMIT) {
            return normalized;
        }

        return normalized.substring(0, SHORT_DESCRIPTION_LIMIT).trim() + "...";
    }
}
