package bai4_qlsp_LeBinh.demo.service;

import bai4_qlsp_LeBinh.demo.dto.request.NewsArticleCreateRequest;
import bai4_qlsp_LeBinh.demo.dto.request.NewsArticleUpdateRequest;
import bai4_qlsp_LeBinh.demo.dto.response.NewsArticleResponse;
import bai4_qlsp_LeBinh.demo.entity.NewsArticle;
import bai4_qlsp_LeBinh.demo.exception.ResourceNotFoundException;
import bai4_qlsp_LeBinh.demo.repository.NewsArticleRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class NewsArticleService {

    private final NewsArticleRepository newsArticleRepository;

    public NewsArticleService(NewsArticleRepository newsArticleRepository) {
        this.newsArticleRepository = newsArticleRepository;
    }

    @Transactional(readOnly = true)
    public List<NewsArticleResponse> getAllNews() {
        return newsArticleRepository.findAllByOrderByIdDesc()
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public NewsArticleResponse getNewsById(Long id) {
        return mapToResponse(getNewsEntityById(id));
    }

    public NewsArticleResponse create(NewsArticleCreateRequest request) {
        NewsArticle article = new NewsArticle();
        applyArticleData(article, request.getTopic(), request.getTitle(), request.getImage(), request.getContent());
        return mapToResponse(newsArticleRepository.save(article));
    }

    public NewsArticleResponse update(Long id, NewsArticleUpdateRequest request) {
        NewsArticle article = getNewsEntityById(id);
        applyArticleData(article, request.getTopic(), request.getTitle(), request.getImage(), request.getContent());
        return mapToResponse(newsArticleRepository.save(article));
    }

    public void deleteById(Long id) {
        NewsArticle article = getNewsEntityById(id);
        newsArticleRepository.delete(article);
    }

    public void seedIfEmpty() {
        if (newsArticleRepository.count() > 0) {
            return;
        }

        newsArticleRepository.save(buildSeed(
                "Xu hướng",
                "Xu hướng nội thất 2026 cho căn hộ hiện đại",
                "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&q=80&w=1200",
                "Năm 2026 tiếp tục ưu tiên không gian sống gọn, ấm và dễ ứng dụng. Các thiết kế nổi bật tập trung vào bảng màu trung tính, chất liệu gỗ sáng và những món nội thất có tỷ lệ vừa phải cho căn hộ thành thị. Đây là hướng đi phù hợp với nhu cầu sống linh hoạt, thẩm mỹ nhưng vẫn chú trọng công năng hằng ngày."
        ));

        newsArticleRepository.save(buildSeed(
                "Mẹo bài trí",
                "Cách phối sofa, bàn trà và thảm để phòng khách hài hòa",
                "https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&q=80&w=1200",
                "Một phòng khách cân đối nên bắt đầu từ tỷ lệ giữa sofa, bàn trà và thảm. Sofa nên là điểm tựa chính, bàn trà nhỏ hơn vừa đủ để tạo khoảng thở, còn thảm nên ôm trọn khu vực tiếp khách để liên kết tổng thể. Chọn cùng tông màu hoặc các sắc độ gần nhau sẽ giúp không gian gọn và cao cấp hơn."
        ));

        newsArticleRepository.save(buildSeed(
                "Không gian sống",
                "Bí quyết chọn giường ngủ và tủ quần áo cho phòng nhỏ",
                "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&q=80&w=1200",
                "Với phòng ngủ diện tích nhỏ, ưu tiên những mẫu giường có thiết kế thanh thoát, màu sáng và chiều cao hợp lý để không tạo cảm giác nặng nề. Tủ quần áo nên chọn dạng cánh lùa hoặc chiều sâu gọn để tiết kiệm diện tích sử dụng. Sự đồng bộ về vật liệu và màu sắc giữa giường, tab đầu giường và tủ sẽ giúp căn phòng trông rộng và dễ chịu hơn."
        ));
    }

    private NewsArticle buildSeed(String topic, String title, String image, String content) {
        NewsArticle article = new NewsArticle();
        applyArticleData(article, topic, title, image, content);
        return article;
    }

    private void applyArticleData(NewsArticle article, String topic, String title, String image, String content) {
        article.setTopic(topic);
        article.setTitle(title);
        article.setImage(image);
        article.setContent(content);
    }

    private NewsArticle getNewsEntityById(Long id) {
        return newsArticleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy tin tức với id: " + id));
    }

    private NewsArticleResponse mapToResponse(NewsArticle article) {
        return NewsArticleResponse.builder()
                .id(article.getId())
                .topic(article.getTopic())
                .title(article.getTitle())
                .image(article.getImage())
                .content(article.getContent())
                .build();
    }
}
