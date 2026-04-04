package bai4_qlsp_LeBinh.demo.security;

import bai4_qlsp_LeBinh.demo.entity.Account;
import bai4_qlsp_LeBinh.demo.entity.Role;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Base64;
import java.util.Comparator;

@Service
public class AuthTokenService {

    private static final String HMAC_ALGORITHM = "HmacSHA256";

    private final String secret;
    private final long expirationSeconds;

    public AuthTokenService(
            @Value("${app.auth.secret:domora-auth-secret-change-me}") String secret,
            @Value("${app.auth.expiration-seconds:604800}") long expirationSeconds
    ) {
        this.secret = secret;
        this.expirationSeconds = expirationSeconds;
    }

    public TokenPayload generateToken(Account account) {
        long expiresAt = Instant.now().getEpochSecond() + expirationSeconds;
        String role = account.getRoles().stream()
                .map(Role::getName)
                .min(Comparator.naturalOrder())
                .orElse("USER");

        String payload = account.getId() + "|" + account.getLoginName() + "|" + role + "|" + expiresAt;
        String encodedPayload = encodeBase64Url(payload);
        String signature = sign(encodedPayload);
        String token = encodedPayload + "." + signature;

        return new TokenPayload(token, expiresAt, role);
    }

    public ParsedToken validateToken(String token) {
        if (token == null || token.isBlank()) {
            throw new RuntimeException("Token khong hop le");
        }

        String[] parts = token.split("\\.");
        if (parts.length != 2) {
            throw new RuntimeException("Token khong hop le");
        }

        String encodedPayload = parts[0];
        String expectedSignature = sign(encodedPayload);
        if (!expectedSignature.equals(parts[1])) {
            throw new RuntimeException("Chu ky token khong hop le");
        }

        String payload = decodeBase64Url(encodedPayload);
        String[] fields = payload.split("\\|", 4);
        if (fields.length != 4) {
            throw new RuntimeException("Noi dung token khong hop le");
        }

        long expiresAt = Long.parseLong(fields[3]);
        if (Instant.now().getEpochSecond() > expiresAt) {
            throw new RuntimeException("Token da het han");
        }

        return new ParsedToken(
                Integer.parseInt(fields[0]),
                fields[1],
                fields[2],
                expiresAt
        );
    }

    private String sign(String data) {
        try {
            Mac mac = Mac.getInstance(HMAC_ALGORITHM);
            SecretKeySpec keySpec = new SecretKeySpec(secret.getBytes(StandardCharsets.UTF_8), HMAC_ALGORITHM);
            mac.init(keySpec);
            byte[] signatureBytes = mac.doFinal(data.getBytes(StandardCharsets.UTF_8));
            return Base64.getUrlEncoder().withoutPadding().encodeToString(signatureBytes);
        } catch (Exception exception) {
            throw new RuntimeException("Khong the tao chu ky token", exception);
        }
    }

    private String encodeBase64Url(String value) {
        return Base64.getUrlEncoder().withoutPadding().encodeToString(value.getBytes(StandardCharsets.UTF_8));
    }

    private String decodeBase64Url(String value) {
        return new String(Base64.getUrlDecoder().decode(value), StandardCharsets.UTF_8);
    }

    public record TokenPayload(String token, long expiresAt, String role) {
    }

    public record ParsedToken(Integer accountId, String loginName, String role, long expiresAt) {
    }
}
