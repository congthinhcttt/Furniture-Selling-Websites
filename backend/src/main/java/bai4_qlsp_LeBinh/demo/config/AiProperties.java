package bai4_qlsp_LeBinh.demo.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Getter
@Setter
@Component
@ConfigurationProperties(prefix = "app.ai")
public class AiProperties {

    private boolean enabled;
    private String apiKey;
    private String baseUrl;
    private String apiVersion = "v1beta";
    private String fallbackApiVersions;
    private String model;
    private String fallbackModels;
    private int timeoutSeconds = 15;
    private double temperature = 0.4;
    private int maxOutputTokens = 500;

    public boolean isReady() {
        return enabled
                && apiKey != null
                && !apiKey.isBlank()
                && baseUrl != null
                && !baseUrl.isBlank()
                && model != null
                && !model.isBlank();
    }

    public String[] resolveModelCandidates() {
        if (fallbackModels == null || fallbackModels.isBlank()) {
            return new String[]{model};
        }

        return java.util.stream.Stream.concat(
                        java.util.stream.Stream.of(model),
                        java.util.Arrays.stream(fallbackModels.split(","))
                                .map(String::trim)
                                .filter(value -> !value.isBlank())
                )
                .distinct()
                .toArray(String[]::new);
    }

    public String[] resolveApiVersionCandidates() {
        if (fallbackApiVersions == null || fallbackApiVersions.isBlank()) {
            return new String[]{apiVersion};
        }

        return java.util.stream.Stream.concat(
                        java.util.stream.Stream.of(apiVersion),
                        java.util.Arrays.stream(fallbackApiVersions.split(","))
                                .map(String::trim)
                                .filter(value -> !value.isBlank())
                )
                .distinct()
                .toArray(String[]::new);
    }
}
