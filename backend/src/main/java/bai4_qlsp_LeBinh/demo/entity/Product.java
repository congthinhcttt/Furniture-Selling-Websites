package bai4_qlsp_LeBinh.demo.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.validator.constraints.Length;

@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name = "product")
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Tên sản phẩm không được để trống")
    @Column(nullable = false, length = 255)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "short_description", length = 255)
    private String shortDescription;

    @NotNull(message = "Giá sản phẩm không được để trống")
    @Min(value = 1, message = "Giá sản phẩm không được nhỏ hơn 1")
    @Max(value = 999999999, message = "Giá sản phẩm không được lớn hơn 999999999")
    @Column(nullable = false)
    private Long price;

    @Length(max = 200, message = "Tên hình ảnh không quá 200 ký tự")
    @Column(length = 200)
    private String image;

    @Column(length = 150)
    private String material;

    @Column(length = 50)
    private String color;

    @Column(length = 100)
    private String warranty;

    @Column(length = 100)
    private String style;

    @NotNull(message = "Chiều rộng không được để trống")
    @Min(value = 1, message = "Chiều rộng phải lớn hơn hoặc bằng 1")
    @Column(nullable = false)
    private Integer width;

    @NotNull(message = "Chiều dài không được để trống")
    @Min(value = 1, message = "Chiều dài phải lớn hơn hoặc bằng 1")
    @Column(nullable = false)
    private Integer length;

    @NotNull(message = "Tồn kho không được để trống")
    @Min(value = 0, message = "Tồn kho không được nhỏ hơn 0")
    @Column(name = "stock_quantity", nullable = false)
    private Integer stockQuantity;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id", nullable = false)
    private Category category;
}
