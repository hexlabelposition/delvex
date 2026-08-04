package com.delvex.server.auth;

import java.util.Base64;

import javax.crypto.SecretKey;
import javax.crypto.spec.SecretKeySpec;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.factory.PasswordEncoderFactories;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.JwtValidators;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;
import org.springframework.security.oauth2.jwt.NimbusJwtEncoder;

@Configuration
public class AuthConfiguration {

    @Bean
    public PasswordEncoder passwordEncoder() {
        return PasswordEncoderFactories.createDelegatingPasswordEncoder();
    }

    @Bean
    public JwtEncoder jwtEncoder(SecretKey accessTokenSecretKey) {
        return NimbusJwtEncoder
                .withSecretKey(accessTokenSecretKey)
                .algorithm(MacAlgorithm.HS256)
                .build();
    }

    @Bean
    public JwtDecoder jwtDecoder(SecretKey accessTokenSecretKey, @Value("${auth.issuer}") String issuer) {
        NimbusJwtDecoder decoder = NimbusJwtDecoder
                .withSecretKey(accessTokenSecretKey)
                .macAlgorithm(MacAlgorithm.HS256)
                .build();

        decoder.setJwtValidator(
                JwtValidators.createDefaultWithIssuer(issuer));

        return decoder;
    }

    @Bean
    public SecretKey accessTokenSecretKey(
            @Value("${auth.access-token-secret}") String encodedSecret) {
        byte[] secretBytes;

        try {
            secretBytes = Base64.getDecoder().decode(encodedSecret);
        } catch (IllegalArgumentException exception) {
            throw new IllegalStateException(
                    "ACCESS_TOKEN_SECRET must be Base64 encoded",
                    exception);
        }

        if (secretBytes.length < 32) {
            throw new IllegalStateException(
                    "ACCESS_TOKEN_SECRET must contain at least 32 bytes");
        }

        return new SecretKeySpec(secretBytes, "HmacSHA256");
    }

}
