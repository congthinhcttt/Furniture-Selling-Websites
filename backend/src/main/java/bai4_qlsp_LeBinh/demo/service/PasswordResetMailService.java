package bai4_qlsp_LeBinh.demo.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.MailException;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

@Service
public class PasswordResetMailService {

    private static final Logger log = LoggerFactory.getLogger(PasswordResetMailService.class);

    private final JavaMailSender mailSender;
    private final String fromEmail;
    private final String frontendBaseUrl;
    private final String smtpUsername;
    private final String smtpPassword;

    public PasswordResetMailService(
            JavaMailSender mailSender,
            @Value("${app.mail.from:${spring.mail.username}}") String fromEmail,
            @Value("${spring.mail.username:}") String smtpUsername,
            @Value("${spring.mail.password:}") String smtpPassword,
            @Value("${app.frontend.base-url:http://localhost:5173}") String frontendBaseUrl
    ) {
        this.mailSender = mailSender;
        this.fromEmail = safeTrim(fromEmail);
        this.smtpUsername = safeTrim(smtpUsername);
        this.smtpPassword = normalizePassword(smtpPassword);
        this.frontendBaseUrl = safeTrim(frontendBaseUrl);
    }

    public void sendPasswordResetEmail(String toEmail, String token) {
        if (!StringUtils.hasText(smtpUsername) || !StringUtils.hasText(smtpPassword)) {
            throw new RuntimeException("Chưa cấu hình MAIL_USERNAME và MAIL_PASSWORD để gửi email");
        }

        String resetLink = frontendBaseUrl.replaceAll("/+$", "") + "/reset-password?token=" + token;

        SimpleMailMessage message = new SimpleMailMessage();
        if (StringUtils.hasText(fromEmail)) {
            message.setFrom(fromEmail);
        }
        message.setTo(toEmail);
        message.setSubject("DOMORA - Đặt lại mật khẩu");
        message.setText("""
                Xin chào,

                Bạn vừa yêu cầu đặt lại mật khẩu cho tài khoản DOMORA.
                Nhấn vào liên kết bên dưới để đặt lại mật khẩu:
                %s

                Liên kết có hiệu lực trong 15 phút.
                Nếu bạn không yêu cầu thao tác này, vui lòng bỏ qua email.
                """.formatted(resetLink));

        try {
            mailSender.send(message);
        } catch (MailException ex) {
            log.error("Gửi email reset mật khẩu thất bại tới '{}'. username='{}', from='{}'",
                    toEmail, smtpUsername, fromEmail, ex);
            String detail = ex.getMostSpecificCause() != null
                    ? ex.getMostSpecificCause().getMessage()
                    : ex.getMessage();
            throw new RuntimeException("Không gửi được email reset mật khẩu. Chi tiết SMTP: " + detail);
        }
    }

    private String safeTrim(String value) {
        return value == null ? "" : value.trim();
    }

    private String normalizePassword(String value) {
        if (value == null) {
            return "";
        }
        // App Password từ Gmail thường hiển thị theo cụm có dấu cách.
        return value.replaceAll("\\s+", "").trim();
    }
}
