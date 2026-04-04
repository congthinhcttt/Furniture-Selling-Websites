package bai4_qlsp_LeBinh.demo.dto.request;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class UpdateShippingDetailsRequest {

    private String shippingProvider;

    private String trackingCode;

    private String trackingUrl;

    private LocalDateTime shippedAt;

    private String shippingNote;
}
