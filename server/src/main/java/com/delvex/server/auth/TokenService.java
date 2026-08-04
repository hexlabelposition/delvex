package com.delvex.server.auth;

import java.time.Duration;
import java.time.Instant;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.oauth2.jwt.JwtClaimsSet;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.JwtEncoderParameters;
import org.springframework.stereotype.Service;

@Service
public class TokenService {

    private final JwtEncoder jwtEncoder;
    private final String issuer;
    private final Duration accessTokenTtl;

    public TokenService(
            JwtEncoder jwtEncoder,
            @Value("${auth.issuer}") String issuer,
            @Value("${auth.access-token-ttl}") Duration accessTokenTtl) {
        this.jwtEncoder = jwtEncoder;
        this.issuer = issuer;
        this.accessTokenTtl = accessTokenTtl;
    }

    public String createAccessToken(UUID userId) {
        Instant issuedAt = Instant.now();

        JwtClaimsSet claims = JwtClaimsSet.builder()
                .issuer(issuer)
                .subject(userId.toString())
                .issuedAt(issuedAt)
                .expiresAt(issuedAt.plus(accessTokenTtl))
                .claim("type", "access")
                .build();

        return jwtEncoder
                .encode(JwtEncoderParameters.from(claims))
                .getTokenValue();
    }

}
