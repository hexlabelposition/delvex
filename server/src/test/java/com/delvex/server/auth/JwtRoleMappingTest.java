package com.delvex.server.auth;

import java.time.Instant;
import java.util.Map;

import org.junit.jupiter.api.Test;
import org.springframework.security.oauth2.jwt.Jwt;

import static org.assertj.core.api.Assertions.assertThat;

class JwtRoleMappingTest {

    @Test
    void shouldMapSignedRoleClaimToSpringAuthority() {
        SecurityConfiguration configuration = new SecurityConfiguration();
        Jwt jwt = new Jwt(
                "token",
                Instant.now(),
                Instant.now().plusSeconds(60),
                Map.of("alg", "HS256"),
                Map.of(
                        "sub",
                        "00000000-0000-0000-0000-000000000000",
                        "type",
                        "access",
                        "role",
                        "EMPLOYEE"));

        var authentication = configuration
                .jwtAuthenticationConverter()
                .convert(jwt);

        assertThat(authentication).isNotNull();
        assertThat(authentication.getAuthorities())
                .extracting("authority")
                .containsExactly("ROLE_EMPLOYEE");
    }
}
