package bai4_qlsp_LeBinh.demo.config;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.jdbc.core.JdbcTemplate;

@Configuration
public class AccountSchemaInitializer {

    @Bean
    CommandLineRunner ensureAccountPasswordColumn(JdbcTemplate jdbcTemplate) {
        return args -> jdbcTemplate.execute(
                "ALTER TABLE account MODIFY COLUMN password VARCHAR(255) NOT NULL"
        );
    }
}
