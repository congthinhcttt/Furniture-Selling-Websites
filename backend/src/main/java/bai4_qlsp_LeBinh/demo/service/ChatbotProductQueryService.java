package bai4_qlsp_LeBinh.demo.service;

import bai4_qlsp_LeBinh.demo.dto.response.ChatbotProductItemResponse;
import bai4_qlsp_LeBinh.demo.dto.response.ProductSearchCriteria;
import bai4_qlsp_LeBinh.demo.entity.Product;
import bai4_qlsp_LeBinh.demo.repository.ProductRepository;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Locale;

@Service
public class ChatbotProductQueryService {

    private static final int MAX_RESULTS = 5;
    private static final int SHORT_DESCRIPTION_LIMIT = 140;

    private final ProductRepository productRepository;

    public ChatbotProductQueryService(ProductRepository productRepository) {
        this.productRepository = productRepository;
    }

    @Transactional(readOnly = true)
    public List<Product> findMatchingProducts(ProductSearchCriteria criteria) {
        Specification<Product> specification = buildSpecification(criteria);

        return productRepository.findAll(specification, PageRequest.of(0, MAX_RESULTS * 3))
                .getContent()
                .stream()
                .sorted(Comparator.comparingInt((Product product) -> calculateScore(product, criteria)).reversed())
                .limit(MAX_RESULTS)
                .toList();
    }

    public List<ChatbotProductItemResponse> mapToChatbotItems(List<Product> products) {
        return products.stream()
                .map(product -> ChatbotProductItemResponse.builder()
                        .id(product.getId())
                        .name(product.getName())
                        .price(product.getPrice())
                        .image(product.getImage())
                        .shortDescription(buildShortDescription(product))
                        .detailUrl("/products/" + product.getId())
                        .build())
                .toList();
    }

    private Specification<Product> buildSpecification(ProductSearchCriteria criteria) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (criteria.getMinPrice() != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("price"), criteria.getMinPrice()));
            }

            if (criteria.getMaxPrice() != null) {
                predicates.add(cb.lessThanOrEqualTo(root.get("price"), criteria.getMaxPrice()));
            }

            List<Predicate> searchPredicates = new ArrayList<>();
            addLikePredicate(searchPredicates, cb, root.get("name"), criteria.getProductType());
            addLikePredicate(searchPredicates, cb, root.get("description"), criteria.getProductType());
            addLikePredicate(searchPredicates, cb, root.get("shortDescription"), criteria.getProductType());
            addLikePredicate(searchPredicates, cb, root.get("category").get("name"), criteria.getProductType());

            addLikePredicate(searchPredicates, cb, root.get("color"), criteria.getColor());
            addLikePredicate(searchPredicates, cb, root.get("material"), criteria.getMaterial());
            addLikePredicate(searchPredicates, cb, root.get("style"), criteria.getStyle());

            addLikePredicate(searchPredicates, cb, root.get("name"), criteria.getRoomType());
            addLikePredicate(searchPredicates, cb, root.get("description"), criteria.getRoomType());
            addLikePredicate(searchPredicates, cb, root.get("shortDescription"), criteria.getRoomType());
            addLikePredicate(searchPredicates, cb, root.get("category").get("name"), criteria.getRoomType());

            addLikePredicate(searchPredicates, cb, root.get("name"), criteria.getKeyword());
            addLikePredicate(searchPredicates, cb, root.get("description"), criteria.getKeyword());
            addLikePredicate(searchPredicates, cb, root.get("shortDescription"), criteria.getKeyword());
            addLikePredicate(searchPredicates, cb, root.get("category").get("name"), criteria.getKeyword());

            if (!searchPredicates.isEmpty()) {
                predicates.add(cb.or(searchPredicates.toArray(new Predicate[0])));
            }

            query.orderBy(cb.asc(root.get("price")), cb.desc(root.get("id")));
            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }

    private void addLikePredicate(List<Predicate> predicates,
                                  jakarta.persistence.criteria.CriteriaBuilder cb,
                                  jakarta.persistence.criteria.Path<String> path,
                                  String keyword) {
        if (keyword == null || keyword.isBlank()) {
            return;
        }
        predicates.add(cb.like(cb.lower(path), "%" + keyword.toLowerCase(Locale.ROOT) + "%"));
    }

    private int calculateScore(Product product, ProductSearchCriteria criteria) {
        int score = 0;
        score += scoreText(product.getName(), criteria.getProductType(), 35);
        score += scoreText(product.getCategory() != null ? product.getCategory().getName() : null, criteria.getProductType(), 20);
        score += scoreText(product.getDescription(), criteria.getProductType(), 15);
        score += scoreText(product.getShortDescription(), criteria.getProductType(), 10);
        score += scoreText(product.getColor(), criteria.getColor(), 18);
        score += scoreText(product.getMaterial(), criteria.getMaterial(), 16);
        score += scoreText(product.getStyle(), criteria.getStyle(), 16);
        score += scoreText(product.getName(), criteria.getRoomType(), 14);
        score += scoreText(product.getDescription(), criteria.getRoomType(), 12);
        score += scoreText(product.getShortDescription(), criteria.getRoomType(), 10);
        score += scoreText(product.getDescription(), criteria.getKeyword(), 10);
        score += scoreText(product.getShortDescription(), criteria.getKeyword(), 10);
        return score;
    }

    private int scoreText(String value, String keyword, int score) {
        if (value == null || value.isBlank() || keyword == null || keyword.isBlank()) {
            return 0;
        }
        return value.toLowerCase(Locale.ROOT).contains(keyword.toLowerCase(Locale.ROOT)) ? score : 0;
    }

    private String buildShortDescription(Product product) {
        if (product.getShortDescription() != null && !product.getShortDescription().isBlank()) {
            return product.getShortDescription().trim();
        }

        if (product.getDescription() == null || product.getDescription().isBlank()) {
            return "Thiết kế phù hợp không gian nội thất hiện đại.";
        }

        String normalized = product.getDescription().trim().replaceAll("\\s+", " ");
        if (normalized.length() <= SHORT_DESCRIPTION_LIMIT) {
            return normalized;
        }

        return normalized.substring(0, SHORT_DESCRIPTION_LIMIT).trim() + "...";
    }
}
