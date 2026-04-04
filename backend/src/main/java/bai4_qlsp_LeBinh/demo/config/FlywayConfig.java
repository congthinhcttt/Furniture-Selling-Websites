package bai4_qlsp_LeBinh.demo.config;

import jakarta.persistence.EntityManagerFactory;
import org.flywaydb.core.Flyway;
import org.springframework.beans.factory.config.BeanFactoryPostProcessor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import javax.sql.DataSource;

@Configuration
public class FlywayConfig {

    @Bean(name = "flyway", initMethod = "migrate")
    Flyway flyway(DataSource dataSource) {
        return Flyway.configure()
                .dataSource(dataSource)
                .locations("classpath:db/migration")
                .baselineOnMigrate(true)
                .baselineVersion("0")
                .load();
    }

    @Bean
    static BeanFactoryPostProcessor entityManagerFactoryDependsOnFlyway() {
        return beanFactory -> {
            String[] beanNames = beanFactory.getBeanNamesForType(EntityManagerFactory.class, true, false);
            for (String beanName : beanNames) {
                var beanDefinition = beanFactory.getBeanDefinition(beanName);
                beanDefinition.setDependsOn("flyway");
            }
        };
    }
}
