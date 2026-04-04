package bai4_qlsp_LeBinh.demo.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name = "news_article")
public class NewsArticle {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Chủ đề tin tức không được để trống")
    @Column(nullable = false, length = 120)
    private String topic;

    @NotBlank(message = "Tiêu đề tin tức không được để trống")
    @Column(nullable = false, length = 255)
    private String title;

    @Column(length = 500)
    private String image;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String content;
}
