package bai4_qlsp_LeBinh.demo.controller;

import bai4_qlsp_LeBinh.demo.dto.request.ForgotPasswordEmailRequest;
import bai4_qlsp_LeBinh.demo.dto.request.LoginRequest;
import bai4_qlsp_LeBinh.demo.dto.request.RegisterRequest;
import bai4_qlsp_LeBinh.demo.dto.request.ResetPasswordByTokenRequest;
import bai4_qlsp_LeBinh.demo.dto.response.ApiResponse;
import bai4_qlsp_LeBinh.demo.dto.response.AuthResponse;
import bai4_qlsp_LeBinh.demo.dto.response.UserProfileResponse;
import bai4_qlsp_LeBinh.demo.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<AuthResponse>> register(@Valid @RequestBody RegisterRequest request) {
        return ResponseEntity.ok(
                ApiResponse.<AuthResponse>builder()
                        .success(true)
                        .message("Đăng ký thành công")
                        .data(authService.register(request))
                        .build()
        );
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponse>> login(@Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(
                ApiResponse.<AuthResponse>builder()
                        .success(true)
                        .message("Đăng nhập thành công")
                        .data(authService.login(request))
                        .build()
        );
    }

    @PostMapping("/forgot-password/request")
    public ResponseEntity<ApiResponse<Object>> requestForgotPassword(
            @Valid @RequestBody ForgotPasswordEmailRequest request
    ) {
        authService.requestPasswordReset(request);
        return ResponseEntity.ok(
                ApiResponse.builder()
                        .success(true)
                        .message("Đã gửi email hướng dẫn đặt lại mật khẩu")
                        .data(null)
                        .build()
        );
    }

    // Backward-compatible endpoint for old frontend clients
    @PostMapping("/forgot-password")
    public ResponseEntity<ApiResponse<Object>> requestForgotPasswordLegacy(
            @Valid @RequestBody ForgotPasswordEmailRequest request
    ) {
        return requestForgotPassword(request);
    }

    @PostMapping("/forgot-password/reset")
    public ResponseEntity<ApiResponse<Object>> resetForgotPassword(
            @Valid @RequestBody ResetPasswordByTokenRequest request
    ) {
        authService.resetPasswordByToken(request);
        return ResponseEntity.ok(
                ApiResponse.builder()
                        .success(true)
                        .message("Đặt lại mật khẩu thành công")
                        .data(null)
                        .build()
        );
    }

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<UserProfileResponse>> getCurrentUser(Authentication authentication) {
        return ResponseEntity.ok(
                ApiResponse.<UserProfileResponse>builder()
                        .success(true)
                        .message("Lấy thông tin tài khoản thành công")
                        .data(authService.getCurrentUser(authentication.getName()))
                        .build()
        );
    }
}
