package bai4_qlsp_LeBinh.demo.service;

import bai4_qlsp_LeBinh.demo.config.AiProperties;
import bai4_qlsp_LeBinh.demo.dto.request.ChatbotAskRequest;
import bai4_qlsp_LeBinh.demo.dto.response.ChatbotProductItemResponse;
import bai4_qlsp_LeBinh.demo.dto.response.ChatbotResponseData;
import bai4_qlsp_LeBinh.demo.dto.response.FaqAnswer;
import bai4_qlsp_LeBinh.demo.dto.response.ProductSearchCriteria;
import bai4_qlsp_LeBinh.demo.entity.Product;
import bai4_qlsp_LeBinh.demo.enums.ChatbotResponseType;
import bai4_qlsp_LeBinh.demo.exception.BadRequestException;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class ChatbotService {

    private final ChatbotFaqService chatbotFaqService;
    private final ProductIntentParserService productIntentParserService;
    private final ChatbotProductQueryService chatbotProductQueryService;
    private final ChatbotPromptBuilder chatbotPromptBuilder;
    private final ChatbotFallbackService chatbotFallbackService;
    private final AiProviderClient aiProviderClient;
    private final AiProperties aiProperties;

    public ChatbotService(ChatbotFaqService chatbotFaqService,
                          ProductIntentParserService productIntentParserService,
                          ChatbotProductQueryService chatbotProductQueryService,
                          ChatbotPromptBuilder chatbotPromptBuilder,
                          ChatbotFallbackService chatbotFallbackService,
                          AiProviderClient aiProviderClient,
                          AiProperties aiProperties) {
        this.chatbotFaqService = chatbotFaqService;
        this.productIntentParserService = productIntentParserService;
        this.chatbotProductQueryService = chatbotProductQueryService;
        this.chatbotPromptBuilder = chatbotPromptBuilder;
        this.chatbotFallbackService = chatbotFallbackService;
        this.aiProviderClient = aiProviderClient;
        this.aiProperties = aiProperties;
    }

    public ChatbotResponseData ask(ChatbotAskRequest request) {
        String message = request != null && request.getMessage() != null ? request.getMessage().trim() : "";
        if (message.isBlank()) {
            throw new BadRequestException("Vui lòng nhập nội dung cần tư vấn.");
        }

        Optional<FaqAnswer> faqAnswer = chatbotFaqService.findAnswer(message);
        if (faqAnswer.isPresent()) {
            return buildFaqResponse(message, faqAnswer.get());
        }

        ProductSearchCriteria criteria = productIntentParserService.parse(message);
        if (!criteria.isProductIntent()) {
            return chatbotFallbackService.fallbackForUnknown();
        }

        List<Product> matchedProducts = chatbotProductQueryService.findMatchingProducts(criteria);
        if (matchedProducts.isEmpty()) {
            return chatbotFallbackService.noResult();
        }

        List<ChatbotProductItemResponse> products = chatbotProductQueryService.mapToChatbotItems(matchedProducts);
        String defaultReply = buildDefaultProductReply(criteria, matchedProducts);

        if (!aiProperties.isReady()) {
            return buildResponse(ChatbotResponseType.PRODUCT_SUGGESTION, defaultReply, products, buildSuggestions(criteria));
        }

        String prompt = chatbotPromptBuilder.buildProductPrompt(message, matchedProducts);
        Optional<String> aiReply = aiProviderClient.generateReply(prompt)
                .filter(this::isSafeAiReply);

        if (aiReply.isPresent()) {
            return buildResponse(ChatbotResponseType.PRODUCT_SUGGESTION, aiReply.get(), products, buildSuggestions(criteria));
        }

        // Nếu AI tạm lỗi, vẫn trả lời theo dữ liệu sản phẩm để UX không bị "trục trặc" lặp lại.
        return buildResponse(ChatbotResponseType.PRODUCT_SUGGESTION, defaultReply, products, buildSuggestions(criteria));
    }

    public List<String> getQuickQuestions() {
        return chatbotFaqService.getQuickQuestions();
    }

    private ChatbotResponseData buildFaqResponse(String userMessage, FaqAnswer faqAnswer) {
        String reply = faqAnswer.getAnswer();

        if (aiProperties.isReady()) {
            Optional<String> aiReply = aiProviderClient.generateReply(
                    chatbotPromptBuilder.buildFaqPrompt(userMessage, faqAnswer)
            ).filter(this::isSafeAiReply);
            if (aiReply.isPresent()) {
                reply = aiReply.get();
            }
        }

        return buildResponse(ChatbotResponseType.FAQ, reply, List.of(), faqAnswer.getSuggestions());
    }

    private ChatbotResponseData buildResponse(ChatbotResponseType type,
                                              String reply,
                                              List<ChatbotProductItemResponse> products,
                                              List<String> suggestions) {
        return ChatbotResponseData.builder()
                .type(type)
                .reply(reply)
                .products(products)
                .suggestions(suggestions)
                .build();
    }

    private String buildDefaultProductReply(ProductSearchCriteria criteria, List<Product> products) {
        StringBuilder reply = new StringBuilder("Dựa trên nhu cầu của bạn, tôi gợi ý một số sản phẩm phù hợp từ dữ liệu hiện có");

        if (criteria.getProductType() != null) {
            reply.append(" cho nhóm ").append(criteria.getProductType());
        }

        if (criteria.getColor() != null) {
            reply.append(", màu ").append(criteria.getColor());
        }

        if (criteria.getMaterial() != null) {
            reply.append(", chất liệu ").append(criteria.getMaterial());
        }

        if (criteria.getMaxPrice() != null) {
            reply.append(", ngân sách dưới ").append(formatCurrency(criteria.getMaxPrice()));
        }

        reply.append(". ");
        reply.append("Bạn có thể tham khảo ");
        reply.append(products.stream().limit(3).map(Product::getName).reduce((a, b) -> a + ", " + b).orElse("một số sản phẩm phù hợp"));
        reply.append(".");
        return reply.toString();
    }

    private List<String> buildSuggestions(ProductSearchCriteria criteria) {
        if (criteria.getProductType() != null) {
            return List.of(
                    "Xem thêm " + criteria.getProductType() + " màu sáng",
                    "Tìm " + criteria.getProductType() + " dưới 15 triệu",
                    "Gợi ý sản phẩm đi kèm"
            );
        }

        if (criteria.getRoomType() != null) {
            return List.of(
                    "Gợi ý thêm cho " + criteria.getRoomType(),
                    "Tìm phong cách hiện đại",
                    "Sản phẩm phù hợp căn hộ nhỏ"
            );
        }

        return List.of(
                "Tìm sản phẩm dưới 10 triệu",
                "Gợi ý nội thất màu kem",
                "Có sản phẩm bằng gỗ không?"
        );
    }

    private String formatCurrency(Long value) {
        if (value == null) {
            return "";
        }
        return String.format("%,d đ", value).replace(',', '.');
    }

    private boolean isSafeAiReply(String reply) {
        if (reply == null || reply.isBlank()) {
            return false;
        }

        String normalized = reply.trim();
        if (normalized.length() > 1200) {
            return false;
        }

        return !normalized.contains("```")
                && !normalized.contains("{")
                && !normalized.toLowerCase().contains("http://")
                && !normalized.toLowerCase().contains("https://");
    }
}
