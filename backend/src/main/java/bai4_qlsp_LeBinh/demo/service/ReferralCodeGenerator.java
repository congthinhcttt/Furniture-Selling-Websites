package bai4_qlsp_LeBinh.demo.service;

import bai4_qlsp_LeBinh.demo.repository.AccountRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import java.security.SecureRandom;

@Component
public class ReferralCodeGenerator {

    private static final Logger log = LoggerFactory.getLogger(ReferralCodeGenerator.class);
    private static final String ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    private static final int CODE_LENGTH = 8;
    private static final int MAX_RETRIES = 20;

    private final SecureRandom random = new SecureRandom();
    private final AccountRepository accountRepository;

    public ReferralCodeGenerator(AccountRepository accountRepository) {
        this.accountRepository = accountRepository;
    }

    public String generateUniqueCode() {
        for (int attempt = 1; attempt <= MAX_RETRIES; attempt++) {
            String code = generateRawCode();
            if (!accountRepository.existsByReferralCode(code)) {
                return code;
            }
            log.warn("Referral code collision detected on attempt {}", attempt);
        }

        throw new IllegalStateException("Khong the sinh referral code duy nhat sau " + MAX_RETRIES + " lan thu");
    }

    public String normalizeCode(String code) {
        if (code == null) {
            return null;
        }
        return code.trim().toUpperCase();
    }

    public boolean isValidFormat(String code) {
        String normalized = normalizeCode(code);
        return normalized != null && normalized.matches("^[A-Z]{8}$");
    }

    private String generateRawCode() {
        StringBuilder builder = new StringBuilder(CODE_LENGTH);
        for (int i = 0; i < CODE_LENGTH; i++) {
            int index = random.nextInt(ALPHABET.length());
            builder.append(ALPHABET.charAt(index));
        }
        return builder.toString();
    }
}
