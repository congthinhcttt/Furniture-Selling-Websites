package bai4_qlsp_LeBinh.demo.config;

import bai4_qlsp_LeBinh.demo.service.NewsArticleService;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class NewsDataInitializer {

    @Bean
    CommandLineRunner seedNewsArticles(NewsArticleService newsArticleService) {
        return args -> newsArticleService.seedIfEmpty();
    }
}
