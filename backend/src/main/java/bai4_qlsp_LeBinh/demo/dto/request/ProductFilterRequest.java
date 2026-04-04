package bai4_qlsp_LeBinh.demo.dto.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductFilterRequest {

    private Integer groupId;
    private Integer categoryId;
    private List<Integer> categoryIds;

    public List<Integer> getEffectiveCategoryIds() {
        LinkedHashSet<Integer> ids = new LinkedHashSet<>();

        if (categoryId != null) {
            ids.add(categoryId);
        }

        if (categoryIds != null) {
            ids.addAll(categoryIds);
        }

        return new ArrayList<>(ids);
    }
}
