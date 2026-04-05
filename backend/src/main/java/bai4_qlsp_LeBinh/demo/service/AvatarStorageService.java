package bai4_qlsp_LeBinh.demo.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.util.Locale;
import java.util.Set;
import java.util.UUID;

@Service
public class AvatarStorageService {

    private static final long MAX_FILE_SIZE_BYTES = 2 * 1024 * 1024;
    private static final Set<String> ALLOWED_CONTENT_TYPES = Set.of(
            "image/jpeg",
            "image/jpg",
            "image/png",
            "image/webp"
    );
    private static final Set<String> ALLOWED_EXTENSIONS = Set.of(".jpg", ".jpeg", ".png", ".webp");

    private final Path avatarDirectory;

    public AvatarStorageService(@Value("${app.upload.dir:uploads}") String uploadDir) {
        this.avatarDirectory = Path.of(uploadDir).toAbsolutePath().normalize().resolve("images").resolve("avatars");
        try {
            Files.createDirectories(avatarDirectory);
        } catch (IOException exception) {
            throw new RuntimeException("Khong the tao thu muc luu avatar", exception);
        }
    }

    public String storeAvatar(MultipartFile file, String previousAvatarUrl) {
        validateFile(file);

        String extension = detectExtension(file);
        String fileName = UUID.randomUUID() + extension;
        Path targetPath = avatarDirectory.resolve(fileName);

        try (InputStream inputStream = file.getInputStream()) {
            Files.copy(inputStream, targetPath, StandardCopyOption.REPLACE_EXISTING);
            deleteOldAvatar(previousAvatarUrl);
            return "/images/avatars/" + fileName;
        } catch (IOException exception) {
            throw new RuntimeException("Khong the luu hinh dai dien", exception);
        }
    }

    private void validateFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new RuntimeException("Vui long chon hinh dai dien");
        }

        if (file.getSize() > MAX_FILE_SIZE_BYTES) {
            throw new RuntimeException("Dung luong hinh dai dien toi da 2MB");
        }

        String contentType = file.getContentType();
        if (!StringUtils.hasText(contentType) || !ALLOWED_CONTENT_TYPES.contains(contentType.toLowerCase(Locale.ROOT))) {
            throw new RuntimeException("Chi ho tro anh JPG, JPEG, PNG hoac WEBP");
        }
    }

    private String detectExtension(MultipartFile file) {
        String originalFilename = file.getOriginalFilename();
        if (StringUtils.hasText(originalFilename)) {
            String lowered = originalFilename.toLowerCase(Locale.ROOT);
            int dotIndex = lowered.lastIndexOf(".");
            if (dotIndex >= 0) {
                String extension = lowered.substring(dotIndex);
                if (ALLOWED_EXTENSIONS.contains(extension)) {
                    return extension;
                }
            }
        }

        String contentType = file.getContentType() == null ? "" : file.getContentType().toLowerCase(Locale.ROOT);
        return switch (contentType) {
            case "image/png" -> ".png";
            case "image/webp" -> ".webp";
            default -> ".jpg";
        };
    }

    private void deleteOldAvatar(String previousAvatarUrl) {
        if (!StringUtils.hasText(previousAvatarUrl) || !previousAvatarUrl.startsWith("/images/avatars/")) {
            return;
        }

        String fileName = previousAvatarUrl.substring("/images/avatars/".length());
        if (!StringUtils.hasText(fileName)) {
            return;
        }

        Path oldPath = avatarDirectory.resolve(fileName).normalize();
        if (!oldPath.startsWith(avatarDirectory)) {
            return;
        }

        try {
            Files.deleteIfExists(oldPath);
        } catch (IOException ignored) {
        }
    }
}
