package com.delvex.server.auth;

import org.junit.jupiter.api.Test;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.JwtEncoder;

import javax.crypto.SecretKey;
import javax.crypto.spec.SecretKeySpec;
import java.time.Duration;
import java.util.UUID;

import com.delvex.server.user.UserRole;

import static com.delvex.server.auth.TestAuthProperties.authProperties;
import static org.assertj.core.api.Assertions.assertThat;

class TokenServiceTest {

    @Test
    void shouldCreateValidAccessToken() {
        AuthConfiguration configuration = new AuthConfiguration();

        SecretKey secretKey = new SecretKeySpec(
                new byte[32],
                "HmacSHA256");

        JwtEncoder jwtEncoder = configuration.jwtEncoder(secretKey);
        JwtDecoder jwtDecoder = configuration.jwtDecoder(
                secretKey,
                authProperties());

        TokenService tokenService = new TokenService(
                jwtEncoder,
                authProperties());

        UUID userId = UUID.randomUUID();

        String tokenValue = tokenService.createAccessToken(
                userId,
                UserRole.EMPLOYEE);
        Jwt decodedToken = jwtDecoder.decode(tokenValue);

        assertThat(tokenValue).isNotBlank();
        assertThat(decodedToken.getSubject())
                .isEqualTo(userId.toString());
        assertThat(decodedToken.getClaimAsString("iss"))
                .isEqualTo("delvex");
        assertThat(decodedToken.getClaimAsString("type"))
                .isEqualTo("access");
        assertThat(decodedToken.getClaimAsString("role"))
                .isEqualTo("EMPLOYEE");
        assertThat(decodedToken.getIssuedAt()).isNotNull();
        assertThat(decodedToken.getExpiresAt()).isNotNull();

        Duration tokenLifetime = Duration.between(
                decodedToken.getIssuedAt(),
                decodedToken.getExpiresAt());

        assertThat(tokenLifetime).isEqualTo(Duration.ofMinutes(15));
        assertThat(decodedToken.getHeaders().get("alg"))
                .isEqualTo("HS256");
    }
}
