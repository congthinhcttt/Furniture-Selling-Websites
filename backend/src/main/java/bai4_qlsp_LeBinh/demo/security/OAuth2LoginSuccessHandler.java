package bai4_qlsp_LeBinh.demo.security;

import bai4_qlsp_LeBinh.demo.dto.response.AuthResponse;
import bai4_qlsp_LeBinh.demo.service.AuthService;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;
import org.springframework.web.util.UriComponentsBuilder;

import java.io.IOException;

@Component
public class OAuth2LoginSuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

    private final AuthService authService;
    private final String frontendRedirectUri;

    public OAuth2LoginSuccessHandler(AuthService authService,
                                     @Value("${app.oauth2.redirect-uri}") String frontendRedirectUri) {
        this.authService = authService;
        this.frontendRedirectUri = frontendRedirectUri;
    }

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request,
                                        HttpServletResponse response,
                                        Authentication authentication) throws IOException, ServletException {
        OAuth2User oauthUser = (OAuth2User) authentication.getPrincipal();
        String email = oauthUser.getAttribute("email");
        if (email == null || email.isBlank()) {
            throw new RuntimeException("Tai khoan Google khong co email hop le");
        }

        String fullName = oauthUser.getAttribute("name");
        String avatarUrl = oauthUser.getAttribute("picture");
        AuthResponse authResponse = authService.loginWithGoogle(email, fullName, avatarUrl);

        String targetUrl = UriComponentsBuilder.fromUriString(frontendRedirectUri)
                .queryParam("token", authResponse.getToken())
                .build()
                .toUriString();

        clearAuthenticationAttributes(request);
        getRedirectStrategy().sendRedirect(request, response, targetUrl);
    }
}
