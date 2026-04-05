package bai4_qlsp_LeBinh.demo.service;

import bai4_qlsp_LeBinh.demo.dto.response.FaqAnswer;
import bai4_qlsp_LeBinh.demo.entity.Product;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ChatbotPromptBuilder {

    public String buildFaqPrompt(String userMessage, FaqAnswer faqAnswer) {
        return """
                Bạn là trợ lý tư vấn nội thất của DOMORA.
                Nhiệm vụ: diễn đạt lại ngắn gọn, lịch sự, tự nhiên bằng tiếng Việt.
                Chỉ được dùng dữ liệu được cung cấp dưới đây. Không được bịa thêm hotline, địa chỉ, bảo hành, đổi trả, giao hàng hay ưu đãi.
                Nếu dữ liệu chưa đủ, hãy nói chưa có thêm thông tin.

                Câu hỏi khách:
                %s

                Dữ liệu nội bộ được phép dùng:
                Chủ đề: %s
                Nội dung: %s

                Hãy trả lời trong 2 đến 4 câu, thân thiện, không markdown, không gạch đầu dòng.
                """.formatted(userMessage, faqAnswer.getTopic(), faqAnswer.getAnswer());
    }

    public String buildProductPrompt(String userMessage, List<Product> products) {
        StringBuilder productData = new StringBuilder();
        for (int index = 0; index < products.size(); index++) {
            Product product = products.get(index);
            productData.append(index + 1)
                    .append(". Tên: ").append(product.getName())
                    .append(" | Giá: ").append(product.getPrice()).append(" VND")
                    .append(" | Màu: ").append(safeText(product.getColor()))
                    .append(" | Chất liệu: ").append(safeText(product.getMaterial()))
                    .append(" | Phong cách: ").append(safeText(product.getStyle()))
                    .append(" | Danh mục: ").append(product.getCategory() != null ? safeText(product.getCategory().getName()) : "Đang cập nhật")
                    .append(" | Mô tả ngắn: ").append(safeText(product.getShortDescription()))
                    .append(" | Mô tả: ").append(safeText(product.getDescription()))
                    .append('\n');
        }

        return """
                Bạn là trợ lý tư vấn nội thất của DOMORA.
                Bạn chỉ được tư vấn dựa trên danh sách sản phẩm nội bộ đã cung cấp. Không được bịa giá, tồn kho, giao hàng, bảo hành, đổi trả hay khuyến mãi.
                Nếu chưa chắc, hãy nói rõ là chưa đủ dữ liệu.
                Hãy trả lời ngắn gọn, lịch sự, phù hợp vai trò tư vấn nội thất.

                Câu hỏi khách:
                %s

                Dữ liệu sản phẩm nội bộ:
                %s

                Hãy tạo 1 đoạn trả lời từ 3 đến 5 câu:
                - Mở đầu xác nhận nhu cầu ngắn gọn.
                - Nêu vì sao các sản phẩm này phù hợp.
                - Không dùng markdown, không dùng JSON, không bịa thêm dữ liệu ngoài danh sách.
                """.formatted(userMessage, productData);
    }

    private String safeText(String value) {
        if (value == null || value.isBlank()) {
            return "Đang cập nhật";
        }
        return value.trim();
    }
}
