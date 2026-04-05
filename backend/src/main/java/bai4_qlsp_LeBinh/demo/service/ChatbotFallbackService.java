package bai4_qlsp_LeBinh.demo.service;

import bai4_qlsp_LeBinh.demo.dto.response.ChatbotResponseData;
import bai4_qlsp_LeBinh.demo.dto.response.ChatbotProductItemResponse;
import bai4_qlsp_LeBinh.demo.enums.ChatbotResponseType;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ChatbotFallbackService {

    public ChatbotResponseData fallbackForUnknown() {
        return ChatbotResponseData.builder()
                .type(ChatbotResponseType.FALLBACK)
                .reply("Tôi hiện hỗ trợ tốt các câu hỏi về sản phẩm, giao hàng, thanh toán, bảo hành và liên hệ. Bạn có thể mô tả ngắn gọn nhu cầu như: sofa màu kem dưới 10 triệu hoặc hỏi về chính sách giao hàng.")
                .products(List.of())
                .suggestions(List.of(
                        "Sofa nào phù hợp phòng khách nhỏ?",
                        "Có bàn ăn dưới 5 triệu không?",
                        "Chính sách giao hàng thế nào?"
                ))
                .build();
    }

    public ChatbotResponseData fallbackForAiProductIssue(List<ChatbotProductItemResponse> products) {
        return ChatbotResponseData.builder()
                .type(ChatbotResponseType.FALLBACK)
                .reply("Tôi đang gặp chút trục trặc khi tư vấn tự động. Dưới đây là một số sản phẩm nội thất có thể phù hợp với nhu cầu của bạn.")
                .products(products)
                .suggestions(List.of(
                        "Tìm dưới 10 triệu",
                        "Gợi ý màu sáng",
                        "Có sản phẩm bằng gỗ không?"
                ))
                .build();
    }

    public ChatbotResponseData noResult() {
        return ChatbotResponseData.builder()
                .type(ChatbotResponseType.NO_RESULT)
                .reply("Tôi chưa tìm thấy sản phẩm thật sự phù hợp với yêu cầu này. Bạn có thể thử nới ngân sách, đổi màu sắc, chất liệu hoặc nói rõ hơn loại sản phẩm cần tìm.")
                .products(List.of())
                .suggestions(List.of(
                        "Tìm sản phẩm dưới 15 triệu",
                        "Gợi ý màu kem",
                        "Gợi ý nội thất phòng khách hiện đại"
                ))
                .build();
    }

    public ChatbotResponseData error() {
        return ChatbotResponseData.builder()
                .type(ChatbotResponseType.ERROR)
                .reply("Tôi đang gặp chút trục trặc khi tư vấn tự động. Bạn có thể thử lại sau hoặc mô tả ngắn gọn hơn để tôi gợi ý sản phẩm phù hợp.")
                .products(List.of())
                .suggestions(List.of(
                        "Có sofa dưới 10 triệu không?",
                        "Bảo hành bao lâu?",
                        "Cửa hàng ở đâu?"
                ))
                .build();
    }
}
