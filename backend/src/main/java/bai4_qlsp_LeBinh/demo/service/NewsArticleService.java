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
                "Bảng màu hiện đại",
                "Những gam màu giúp căn hộ hiện đại trông ấm và dễ ở hơn",
                "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&q=80&w=1200",
                """
                Một căn hộ hiện đại sẽ dễ sống hơn khi bảng màu được tiết chế và có độ ấm vừa đủ. Những gam be cát, trắng kem, nâu gỗ nhạt hay xanh xám dịu giúp không gian giữ được vẻ tinh gọn mà không tạo cảm giác lạnh.

                Khi chọn màu nền, nên ưu tiên một tông chủ đạo chiếm phần lớn diện tích rồi bổ sung thêm hai đến ba sắc độ gần nhau cho nội thất. Cách làm này giúp tổng thể liền mạch, dễ phối đồ và giữ được nhịp thị giác nhẹ nhàng.

                Điểm quan trọng là chất liệu phải đi cùng màu sắc. Một mảng tường sáng kết hợp gỗ sồi, vải dệt thô và ánh sáng vàng ấm sẽ tạo cảm giác đủ đầy hơn rất nhiều so với việc chỉ thay đổi màu sơn.
                """
        ));

        newsArticleRepository.save(buildSeed(
                "Phòng khách hài hòa",
                "Phối sofa, bàn trà và thảm để phòng khách hài hòa hơn",
                "https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&q=80&w=1200",
                """
                Một phòng khách đẹp hiếm khi đến từ việc chọn từng món thật nổi bật. Cảm giác hài hòa thường bắt đầu ở tỷ lệ giữa sofa, bàn trà và thảm, nơi mọi chi tiết nâng đỡ lẫn nhau thay vì cạnh tranh.

                Sofa nên là khối chính tạo nhịp cho căn phòng. Bàn trà vì thế cần gọn hơn một nhịp, đủ dùng nhưng không cản luồng di chuyển. Thảm nên lớn vừa đủ để ôm lấy khu vực tiếp khách, giúp bố cục trông có chủ đích và ấm hơn.

                Nếu chưa chắc nên phối ra sao, hãy bắt đầu từ một bảng màu trung tính rồi thêm điểm nhấn bằng chất liệu như gỗ, đá hoặc vải dệt. Chính sự tiết chế này làm cho phòng khách trông sang hơn và sống lâu với thời gian.
                """
        ));

        newsArticleRepository.save(buildSeed(
                "Phòng ngủ gọn đẹp",
                "Cách chọn giường ngủ và tủ áo cho phòng nhỏ mà vẫn thoáng",
                "https://images.unsplash.com/photo-1505693535144-3f0b7550e0f2?auto=format&fit=crop&q=80&w=1200",
                """
                Với phòng ngủ nhỏ, điều cần tránh nhất là những món nội thất quá nặng thị giác. Một chiếc giường thấp, đường nét gọn và bề mặt sáng màu sẽ giúp căn phòng trông nhẹ hơn ngay cả khi diện tích không đổi.

                Tủ áo nên ưu tiên kích thước vừa nhu cầu sử dụng thay vì cố tăng sức chứa bằng mọi giá. Cánh lùa, tay nắm ẩn hoặc bề mặt phẳng sẽ khiến khối tủ bớt áp lực hơn, đồng thời giữ được vẻ hiện đại cho toàn bộ không gian.

                Khi giường, tab đầu giường và tủ áo cùng đi theo một ngôn ngữ vật liệu, căn phòng sẽ trông ngăn nắp và có chiều sâu hơn. Đây là kiểu đồng bộ tinh tế, rất phù hợp với những không gian sống cần sự thư thái mỗi ngày.
                """
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
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy bài viết với id: " + id));
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
