package bai4_qlsp_LeBinh.demo.config;

import bai4_qlsp_LeBinh.demo.service.DeliverySeedService;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class DeliverySeedInitializer {

    @Bean
    @ConditionalOnProperty(name = "app.delivery.seed.enabled", havingValue = "true")
    CommandLineRunner seedDeliveryTrackingData(DeliverySeedService deliverySeedService) {
        return args -> deliverySeedService.seedIfEmpty();
    }
}
