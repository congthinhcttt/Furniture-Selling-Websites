package bai4_qlsp_LeBinh.demo.service;

import bai4_qlsp_LeBinh.demo.dto.response.ProductSearchCriteria;
import org.springframework.stereotype.Service;

import java.text.Normalizer;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
public class ProductIntentParserService {

    private static final Map<String, String> PRODUCT_TYPES = new LinkedHashMap<>();
    private static final Map<String, String> COLORS = new LinkedHashMap<>();
    private static final Map<String, String> MATERIALS = new LinkedHashMap<>();
    private static final Map<String, String> ROOM_TYPES = new LinkedHashMap<>();
    private static final Map<String, String> STYLES = new LinkedHashMap<>();

    static {
        PRODUCT_TYPES.put("sofa", "sofa");
        PRODUCT_TYPES.put("ban an", "bàn ăn");
        PRODUCT_TYPES.put("ban tra", "bàn trà");
        PRODUCT_TYPES.put("ban", "bàn");
        PRODUCT_TYPES.put("giuong", "giường");
        PRODUCT_TYPES.put("tu", "tủ");
        PRODUCT_TYPES.put("ghe van phong", "ghế văn phòng");
        PRODUCT_TYPES.put("ghe", "ghế");
        PRODUCT_TYPES.put("ke", "kệ");
        PRODUCT_TYPES.put("den", "đèn");
        PRODUCT_TYPES.put("guong", "gương");
        PRODUCT_TYPES.put("tham", "thảm");
        PRODUCT_TYPES.put("noi that", "nội thất");

        COLORS.put("mau kem", "kem");
        COLORS.put("kem", "kem");
        COLORS.put("trang", "trắng");
        COLORS.put("den", "đen");
        COLORS.put("xam", "xám");
        COLORS.put("nau", "nâu");
        COLORS.put("go oc cho", "gỗ óc chó");
        COLORS.put("be", "be");

        MATERIALS.put("go", "gỗ");
        MATERIALS.put("go tu nhien", "gỗ tự nhiên");
        MATERIALS.put("go cong nghiep", "gỗ công nghiệp");
        MATERIALS.put("vai", "vải");
        MATERIALS.put("da", "da");
        MATERIALS.put("kim loai", "kim loại");
        MATERIALS.put("mat da", "mặt đá");

        ROOM_TYPES.put("phong khach", "phòng khách");
        ROOM_TYPES.put("phong ngu", "phòng ngủ");
        ROOM_TYPES.put("phong an", "phòng ăn");
        ROOM_TYPES.put("van phong", "văn phòng");
        ROOM_TYPES.put("can ho nho", "căn hộ nhỏ");
        ROOM_TYPES.put("nha nho", "căn hộ nhỏ");

        STYLES.put("hien dai", "hiện đại");
        STYLES.put("toi gian", "tối giản");
        STYLES.put("bac au", "Bắc Âu");
        STYLES.put("sang trong", "sang trọng");
        STYLES.put("co dien", "cổ điển");
    }

    public ProductSearchCriteria parse(String message) {
        String normalized = normalize(message);

        String productType = findFirstMatch(normalized, PRODUCT_TYPES);
        String color = findFirstMatch(normalized, COLORS);
        String material = findFirstMatch(normalized, MATERIALS);
        String roomType = findFirstMatch(normalized, ROOM_TYPES);
        String style = findFirstMatch(normalized, STYLES);
        Long maxPrice = extractMaxPrice(normalized);
        Long minPrice = extractMinPrice(normalized);

        boolean productIntent = productType != null
                || color != null
                || material != null
                || roomType != null
                || style != null
                || normalized.contains("goi y")
                || normalized.contains("co san pham")
                || normalized.contains("duoi")
                || normalized.contains("tren")
                || normalized.contains("noi that");

        String keyword = buildKeyword(message, productType, color, material, roomType, style);

        return ProductSearchCriteria.builder()
                .productType(productType)
                .minPrice(minPrice)
                .maxPrice(maxPrice)
                .color(color)
                .material(material)
                .roomType(roomType)
                .style(style)
                .keyword(keyword)
                .productIntent(productIntent)
                .build();
    }

    private String buildKeyword(String originalMessage,
                                String productType,
                                String color,
                                String material,
                                String roomType,
                                String style) {
        if (originalMessage == null || originalMessage.isBlank()) {
            return null;
        }

        String keyword = originalMessage.trim();
        keyword = removeKeyword(keyword, productType);
        keyword = removeKeyword(keyword, color);
        keyword = removeKeyword(keyword, material);
        keyword = removeKeyword(keyword, roomType);
        keyword = removeKeyword(keyword, style);
        keyword = keyword.replaceAll("(?i)dưới\\s+\\d+[\\d\\s,.]*\\s*(triệu|trieu|k|nghìn|nghin|đ|dong)?", "");
        keyword = keyword.replaceAll("(?i)trên\\s+\\d+[\\d\\s,.]*\\s*(triệu|trieu|k|nghìn|nghin|đ|dong)?", "");
        keyword = keyword.replaceAll("(?i)từ\\s+\\d+[\\d\\s,.]*\\s*đến\\s+\\d+[\\d\\s,.]*\\s*(triệu|trieu|k|nghìn|nghin|đ|dong)?", "");
        keyword = keyword.replaceAll("\\s+", " ").trim();
        return keyword.isBlank() ? null : keyword;
    }

    private String removeKeyword(String content, String keyword) {
        if (content == null || keyword == null || keyword.isBlank()) {
            return content;
        }
        return content.replaceAll("(?i)" + Pattern.quote(keyword), " ");
    }

    private String findFirstMatch(String normalized, Map<String, String> dictionary) {
        return dictionary.entrySet().stream()
                .filter(entry -> normalized.contains(entry.getKey()))
                .map(Map.Entry::getValue)
                .findFirst()
                .orElse(null);
    }

    private Long extractMaxPrice(String normalized) {
        Matcher betweenMatcher = Pattern.compile("tu\\s+(\\d+[\\d.,]*)\\s*(trieu|trieu dong|k|nghin|dong)?\\s+den\\s+(\\d+[\\d.,]*)\\s*(trieu|trieu dong|k|nghin|dong)?").matcher(normalized);
        if (betweenMatcher.find()) {
            return parseMoney(betweenMatcher.group(3), betweenMatcher.group(4));
        }

        Matcher underMatcher = Pattern.compile("(duoi|toi da|khong qua)\\s+(\\d+[\\d.,]*)\\s*(trieu|trieu dong|k|nghin|dong)?").matcher(normalized);
        if (underMatcher.find()) {
            return parseMoney(underMatcher.group(2), underMatcher.group(3));
        }
        return null;
    }

    private Long extractMinPrice(String normalized) {
        Matcher betweenMatcher = Pattern.compile("tu\\s+(\\d+[\\d.,]*)\\s*(trieu|trieu dong|k|nghin|dong)?\\s+den\\s+(\\d+[\\d.,]*)\\s*(trieu|trieu dong|k|nghin|dong)?").matcher(normalized);
        if (betweenMatcher.find()) {
            return parseMoney(betweenMatcher.group(1), betweenMatcher.group(2));
        }

        Matcher overMatcher = Pattern.compile("(tren|hon|tu)\\s+(\\d+[\\d.,]*)\\s*(trieu|trieu dong|k|nghin|dong)?").matcher(normalized);
        if (overMatcher.find()) {
            return parseMoney(overMatcher.group(2), overMatcher.group(3));
        }
        return null;
    }

    private Long parseMoney(String numberPart, String unitPart) {
        if (numberPart == null || numberPart.isBlank()) {
            return null;
        }

        String normalizedNumber = numberPart.replace(",", ".").replaceAll("[^\\d.]", "");
        if (normalizedNumber.isBlank()) {
            return null;
        }

        double numericValue = Double.parseDouble(normalizedNumber);
        String unit = unitPart == null ? "" : unitPart.trim();

        if (unit.contains("trieu")) {
            return Math.round(numericValue * 1_000_000L);
        }

        if (unit.contains("k") || unit.contains("nghin")) {
            return Math.round(numericValue * 1_000L);
        }

        return Math.round(numericValue);
    }

    private String normalize(String value) {
        if (value == null) {
            return "";
        }

        return Normalizer.normalize(value.toLowerCase(), Normalizer.Form.NFD)
                .replaceAll("\\p{M}", "")
                .replace('đ', 'd')
                .replaceAll("\\s+", " ")
                .trim();
    }
}
