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
@Table(name = "category_group")
public class CategoryGroup {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @NotBlank(message = "Tên nhóm danh mục không được để trống")
    @Column(nullable = false, length = 255)
    private String name;

    @Column(length = 255, unique = true)
    private String slug;

    @Column(name = "banner_image", length = 255)
    private String bannerImage;
}