package bai4_qlsp_LeBinh.demo.service;

import bai4_qlsp_LeBinh.demo.config.AiProperties;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.URLEncoder;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.Map;
import java.util.Optional;

@Service
public class GeminiProviderClient implements AiProviderClient {

    private static final Logger log = LoggerFactory.getLogger(GeminiProviderClient.class);

    private final AiProperties aiProperties;
    private final ObjectMapper objectMapper = new ObjectMapper();
    private final HttpClient httpClient;

    public GeminiProviderClient(AiProperties aiProperties) {
        this.aiProperties = aiProperties;
        this.httpClient = HttpClient.newBuilder()
                .connectTimeout(Duration.ofSeconds(Math.max(3, aiProperties.getTimeoutSeconds())))
                .build();
    }

    @Override
    public Optional<String> generateReply(String prompt) {
        if (!aiProperties.isReady() || prompt == null || prompt.isBlank()) {
            return Optional.empty();
        }

        for (String apiVersion : aiProperties.resolveApiVersionCandidates()) {
            for (String model : aiProperties.resolveModelCandidates()) {
                Optional<String> response = generateReplyWithModel(prompt, apiVersion, model);
                if (response.isPresent()) {
                    return response;
                }
            }
        }

        return Optional.empty();
    }

    private Optional<String> generateReplyWithModel(String prompt, String apiVersion, String model) {
        try {
            String url = aiProperties.getBaseUrl()
                    + "/"
                    + apiVersion
                    + "/models/"
                    + model
                    + ":generateContent?key="
                    + URLEncoder.encode(aiProperties.getApiKey(), StandardCharsets.UTF_8);

            Map<String, Object> body = Map.of(
                    "contents", new Object[]{
                            Map.of("parts", new Object[]{Map.of("text", prompt)})
                    },
                    "generationConfig", Map.of(
                            "temperature", aiProperties.getTemperature(),
                            "maxOutputTokens", aiProperties.getMaxOutputTokens()
                    )
            );

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(url))
                    .timeout(Duration.ofSeconds(Math.max(3, aiProperties.getTimeoutSeconds())))
                    .header("Content-Type", "application/json")
                    .POST(HttpRequest.BodyPublishers.ofString(objectMapper.writeValueAsString(body)))
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
            if (response.statusCode() < 200 || response.statusCode() >= 300) {
                log.warn("Gemini API returned non-success status: {} (apiVersion={}, model={}) body={}",
                        response.statusCode(),
                        apiVersion,
                        model,
                        shrink(response.body()));
                return Optional.empty();
            }

            return extractText(response.body());
        } catch (Exception exception) {
            log.warn("Gemini API call failed (apiVersion={}, model={}): {}",
                    apiVersion,
                    model,
                    exception.getMessage());
            return Optional.empty();
        }
    }

    private String shrink(String value) {
        if (value == null) {
            return "";
        }
        String normalized = value.replaceAll("\\s+", " ").trim();
        return normalized.length() <= 280 ? normalized : normalized.substring(0, 280) + "...";
    }

    private Optional<String> extractText(String responseBody) {
        try {
            JsonNode root = objectMapper.readTree(responseBody);
            JsonNode candidates = root.path("candidates");
            if (!candidates.isArray() || candidates.isEmpty()) {
                return Optional.empty();
            }

            JsonNode parts = candidates.get(0).path("content").path("parts");
            if (!parts.isArray() || parts.isEmpty()) {
                return Optional.empty();
            }

            String text = parts.get(0).path("text").asText("");
            if (text == null || text.isBlank()) {
                return Optional.empty();
            }

            return Optional.of(text.trim());
        } catch (Exception exception) {
            log.warn("Failed to parse Gemini response: {}", exception.getMessage());
            return Optional.empty();
        }
    }
}
