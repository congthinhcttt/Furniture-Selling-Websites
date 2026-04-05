package bai4_qlsp_LeBinh.demo.service;

import bai4_qlsp_LeBinh.demo.dto.response.ProductSearchCriteria;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

class ProductIntentParserServiceTests {

    private final ProductIntentParserService parserService = new ProductIntentParserService();
    private final ChatbotFaqService faqService = new ChatbotFaqService();

    @Test
    void shouldMatchFaqForStoreAddress() {
        assertTrue(faqService.findAnswer("Cửa hàng ở đâu?").isPresent());
    }

    @Test
    void shouldParseSofaBudgetAndColor() {
        ProductSearchCriteria criteria = parserService.parse("Tôi cần sofa màu kem dưới 10 triệu");

        assertTrue(criteria.isProductIntent());
        assertEquals("sofa", criteria.getProductType());
        assertEquals("kem", criteria.getColor());
        assertEquals(10_000_000L, criteria.getMaxPrice());
    }

    @Test
    void shouldParseWoodDiningTable() {
        ProductSearchCriteria criteria = parserService.parse("Có bàn ăn gỗ cho 4 người không?");

        assertEquals("bàn ăn", criteria.getProductType());
        assertEquals("gỗ", criteria.getMaterial());
    }

    @Test
    void shouldParseBedroomModernStyle() {
        ProductSearchCriteria criteria = parserService.parse("Gợi ý nội thất phòng ngủ hiện đại");

        assertTrue(criteria.isProductIntent());
        assertEquals("phòng ngủ", criteria.getRoomType());
        assertEquals("hiện đại", criteria.getStyle());
    }

    @Test
    void shouldParseOfficeChairBlack() {
        ProductSearchCriteria criteria = parserService.parse("Tôi muốn ghế văn phòng màu đen");

        assertEquals("ghế văn phòng", criteria.getProductType());
        assertNotNull(criteria.getColor());
        assertEquals("đen", criteria.getColor());
    }
}
