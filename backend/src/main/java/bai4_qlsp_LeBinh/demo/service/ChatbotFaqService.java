package bai4_qlsp_LeBinh.demo.service;

import bai4_qlsp_LeBinh.demo.dto.response.FaqAnswer;
import org.springframework.stereotype.Service;

import java.text.Normalizer;
import java.util.List;
import java.util.Optional;

@Service
public class ChatbotFaqService {

    private static final List<FaqRule> FAQ_RULES = List.of(
            new FaqRule(
                    "Địa chỉ cửa hàng",
                    List.of("dia chi", "cua hang", "shop o dau", "showroom", "o dau"),
                    "DOMORA hiện có showroom tại 123 Nguyễn Văn Cừ, Quận 5, TP. Hồ Chí Minh. Thời gian đón khách từ 08:00 đến 21:00 mỗi ngày.",
                    List.of("Giờ mở cửa thế nào?", "Có chỗ đậu xe không?", "Tôi muốn xem sofa tại showroom")
            ),
            new FaqRule(
                    "Giao hàng",
                    List.of("giao hang", "ship", "van chuyen", "ship toan quoc", "delivery"),
                    "DOMORA có hỗ trợ giao hàng tại TP. Hồ Chí Minh và các tỉnh thành khác. Sau khi đặt hàng, nhân viên sẽ xác nhận lại phí và thời gian giao phù hợp với khu vực của bạn.",
                    List.of("Có giao toàn quốc không?", "Thanh toán khi nhận hàng được không?", "Tôi muốn hỏi thêm về lắp đặt")
            ),
            new FaqRule(
                    "Thanh toán",
                    List.of("thanh toan", "tra tien", "cod", "chuyen khoan", "payment"),
                    "Bạn có thể thanh toán khi nhận hàng hoặc thanh toán online nếu website đang hỗ trợ cổng thanh toán. Thông tin chính xác sẽ hiển thị ở bước thanh toán đơn hàng.",
                    List.of("Có COD không?", "Tôi muốn xem cách đặt hàng", "Giao hàng mất bao lâu?")
            ),
            new FaqRule(
                    "Bảo hành",
                    List.of("bao hanh", "bao lau", "warranty", "bao tri"),
                    "DOMORA có chính sách bảo hành theo từng dòng sản phẩm. Thời gian bảo hành cụ thể sẽ được ghi tại trang chi tiết sản phẩm hoặc được nhân viên xác nhận khi tư vấn.",
                    List.of("Đổi trả thế nào?", "Liên hệ bảo hành ở đâu?", "Gợi ý sản phẩm bền cho gia đình")
            ),
            new FaqRule(
                    "Đổi trả",
                    List.of("doi tra", "tra hang", "hoan hang", "return"),
                    "Nếu sản phẩm có lỗi hoặc gặp vấn đề trong điều kiện áp dụng, DOMORA sẽ hỗ trợ kiểm tra và hướng dẫn đổi trả theo chính sách hiện hành. Bạn nên giữ lại hóa đơn hoặc mã đơn hàng để được hỗ trợ nhanh hơn.",
                    List.of("Liên hệ hỗ trợ ở đâu?", "Bảo hành bao lâu?", "Tôi muốn xem sản phẩm đang có")
            ),
            new FaqRule(
                    "Liên hệ",
                    List.of("lien he", "hotline", "zalo", "so dien thoai"),
                    "Bạn có thể liên hệ DOMORA qua hotline 0123 456 789 hoặc Zalo 0123456789 trong khung giờ 08:00 đến 21:00 để được hỗ trợ nhanh.",
                    List.of("Cửa hàng ở đâu?", "Có giao hàng không?", "Tôi cần tư vấn sofa")
            )
    );

    public Optional<FaqAnswer> findAnswer(String message) {
        String normalized = normalize(message);
        if (normalized.isBlank()) {
            return Optional.empty();
        }

        return FAQ_RULES.stream()
                .filter(rule -> rule.matches(normalized))
                .findFirst()
                .map(rule -> FaqAnswer.builder()
                        .topic(rule.topic())
                        .answer(rule.answer())
                        .suggestions(rule.suggestions())
                        .build());
    }

    public List<String> getQuickQuestions() {
        return List.of(
                "Sofa nào phù hợp phòng khách nhỏ?",
                "Có bàn ăn dưới 5 triệu không?",
                "Tôi muốn nội thất màu kem",
                "Gợi ý sản phẩm bằng gỗ",
                "Chính sách giao hàng thế nào?",
                "Bảo hành bao lâu?",
                "Gợi ý nội thất phòng ngủ hiện đại"
        );
    }

    private String normalize(String value) {
        if (value == null) {
            return "";
        }

        return Normalizer.normalize(value.toLowerCase(), Normalizer.Form.NFD)
                .replaceAll("\\p{M}", "")
                .replace('đ', 'd')
                .trim();
    }

    private record FaqRule(String topic, List<String> keywords, String answer, List<String> suggestions) {
        private boolean matches(String normalizedMessage) {
            return keywords.stream().anyMatch(normalizedMessage::contains);
        }
    }
}
