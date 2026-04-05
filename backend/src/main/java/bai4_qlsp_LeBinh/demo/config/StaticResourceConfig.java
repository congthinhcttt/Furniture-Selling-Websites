package bai4_qlsp_LeBinh.demo.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;

@Configuration
public class StaticResourceConfig implements WebMvcConfigurer {

    private final String imagesUploadLocation;

    public StaticResourceConfig(@Value("${app.upload.dir:uploads}") String uploadDir) {
        Path imageDirectory = Path.of(uploadDir).toAbsolutePath().normalize().resolve("images");
        try {
            Files.createDirectories(imageDirectory.resolve("avatars"));
        } catch (IOException exception) {
            throw new RuntimeException("Khong the khoi tao thu muc static", exception);
        }
        this.imagesUploadLocation = imageDirectory.toUri().toString();
    }

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        registry.addResourceHandler("/images/**")
                .addResourceLocations(imagesUploadLocation, "classpath:/static/images/");
    }
}
