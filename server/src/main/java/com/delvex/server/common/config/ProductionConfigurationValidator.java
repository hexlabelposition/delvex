package com.delvex.server.common.config;

import java.net.URI;
import java.util.List;

import com.delvex.server.auth.AuthProperties;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Profile;
import org.springframework.core.env.Environment;
import org.springframework.core.env.Profiles;
import org.springframework.stereotype.Component;

/**
 * Fails application startup before traffic is accepted when a higher-priority
 * property source overrides the secure defaults from application-prod.yaml.
 */
@Component
@Profile("prod")
public class ProductionConfigurationValidator {

    public ProductionConfigurationValidator(
            Environment environment,
            CorsProperties corsProperties,
            AuthProperties authProperties,
            @Value("${springdoc.api-docs.enabled}") boolean apiDocsEnabled,
            @Value("${springdoc.swagger-ui.enabled}") boolean swaggerUiEnabled) {
        validate(
                environment.acceptsProfiles(Profiles.of("local", "dev")),
                corsProperties.allowedOrigins(),
                authProperties.refreshCookieSecure(),
                apiDocsEnabled,
                swaggerUiEnabled);
    }

    static void validate(
            boolean conflictingProfileActive,
            String allowedOrigins,
            boolean secureCookie,
            boolean apiDocsEnabled,
            boolean swaggerUiEnabled) {
        if (conflictingProfileActive) {
            throw new IllegalStateException(
                    "The prod profile cannot be combined with local or dev");
        }

        if (!secureCookie) {
            throw new IllegalStateException(
                    "Refresh cookies must be Secure in production");
        }

        if (apiDocsEnabled || swaggerUiEnabled) {
            throw new IllegalStateException(
                    "OpenAPI documentation must be disabled in production");
        }

        List<String> origins =
                WebCorsConfiguration.parseAllowedOrigins(allowedOrigins);

        if (origins.isEmpty()) {
            throw new IllegalStateException(
                    "CORS_ALLOWED_ORIGINS is required in production");
        }

        origins.forEach(ProductionConfigurationValidator::validateOrigin);
    }

    private static void validateOrigin(String origin) {
        URI uri;

        try {
            uri = URI.create(origin);
        } catch (IllegalArgumentException exception) {
            throw invalidOrigin(origin, exception);
        }

        String host = uri.getHost();
        boolean hasPath = uri.getRawPath() != null
                && !uri.getRawPath().isEmpty();

        if (!"https".equalsIgnoreCase(uri.getScheme())
                || host == null
                || uri.getRawUserInfo() != null
                || hasPath
                || uri.getRawQuery() != null
                || uri.getRawFragment() != null
                || isLocalHost(host)) {
            throw invalidOrigin(origin, null);
        }
    }

    private static boolean isLocalHost(String host) {
        return host.equalsIgnoreCase("localhost")
                || host.equals("127.0.0.1")
                || host.equals("::1");
    }

    private static IllegalStateException invalidOrigin(
            String origin,
            Exception cause) {
        String message = "Production CORS origin must be a valid "
                + "HTTPS origin: " + origin;

        return cause == null
                ? new IllegalStateException(message)
                : new IllegalStateException(message, cause);
    }
}
