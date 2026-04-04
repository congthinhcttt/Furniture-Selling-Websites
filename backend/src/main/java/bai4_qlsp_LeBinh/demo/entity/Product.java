package bai4_qlsp_LeBinh.demo.entity;

import jakarta.persistence.*;
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

    @NotNull(message = "Giá sản phẩm không được để trống")
    @Min(value = 1, message = "Giá sản phẩm không được nhỏ hơn 1")
    @Max(value = 999999999, message = "Giá sản phẩm không được lớn hơn 999999999")
    @Column(nullable = false)
    private Long price;

    @Length(max = 200, message = "Tên hình ảnh không quá 200 kí tự")
    @Column(length = 200)
    private String image;

    @Column(length = 50)
    private String color;

    @NotNull(message = "Chiá»u rá»™ng khÃ´ng Ä‘Æ°á»£c Ä‘á»ƒ trá»‘ng")
    @Min(value = 1, message = "Chiá»u rá»™ng pháº£i lá»›n hÆ¡n hoáº·c báº±ng 1")
    @Column(nullable = false)
    private Integer width;

    @NotNull(message = "Chiá»u dÃ i khÃ´ng Ä‘Æ°á»£c Ä‘á»ƒ trá»‘ng")
    @Min(value = 1, message = "Chiá»u dÃ i pháº£i lá»›n hÆ¡n hoáº·c báº±ng 1")
    @Column(nullable = false)
    private Integer length;

    @NotNull(message = "Tá»“n kho khÃ´ng Ä‘Æ°á»£c Ä‘á»ƒ trá»‘ng")
    @Min(value = 0, message = "Tá»“n kho khÃ´ng Ä‘Æ°á»£c nhá» hÆ¡n 0")
    @Column(name = "stock_quantity", nullable = false)
    private Integer stockQuantity;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id", nullable = false)
    private Category category;
}
