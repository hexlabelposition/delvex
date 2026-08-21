package com.delvex.server.auth;

import java.net.URI;
import java.util.Locale;

import org.springframework.context.annotation.Profile;
import org.springframework.core.env.Environment;
import org.springframework.stereotype.Component;

@Component
@Profile("hosted")
public class ResendMailConfigurationValidator {

    private static final String RESEND_HOST = "smtp.resend.com";

    public ResendMailConfigurationValidator(
            Environment environment,
            PasswordResetProperties properties) {
        requireEquals(
                property(environment, "spring.mail.host"),
                RESEND_HOST,
                "Hosted profiles require Resend SMTP");
        requireEquals(
                environment.getProperty("spring.mail.port", Integer.class, 0),
                587,
                "Resend SMTP requires port 587");
        requireEquals(
                property(environment, "spring.mail.username"),
                "resend",
                "Resend SMTP requires username resend");
        requireNonBlank(
                property(environment, "spring.mail.password"),
                "Resend SMTP requires RESEND_API_KEY");
        requireEnabled(
                environment,
                "spring.mail.properties[mail.smtp.auth]",
                "Resend SMTP requires authentication");
        requireEnabled(
                environment,
                "spring.mail.properties[mail.smtp.starttls.enable]",
                "Resend SMTP requires STARTTLS");
        requirePublicResetUrl(properties.clientUrl());
        requirePublicSender(properties.mailFrom());
    }

    private static void requirePublicResetUrl(URI clientUrl) {
        if (clientUrl == null
                || !"https".equalsIgnoreCase(clientUrl.getScheme())
                || clientUrl.getHost() == null) {
            throw new IllegalStateException(
                    "Hosted profiles require PASSWORD_RESET_CLIENT_URL to use HTTPS");
        }
    }

    private static void requirePublicSender(String mailFrom) {
        int separator = mailFrom == null ? -1 : mailFrom.lastIndexOf('@');
        String domain = separator < 0
                ? ""
                : mailFrom.substring(separator + 1).toLowerCase(Locale.ROOT);

        if (domain.isBlank() || domain.endsWith(".local")) {
            throw new IllegalStateException(
                    "Hosted profiles require MAIL_FROM to use a verified public domain");
        }
    }

    private static void requireEnabled(
            Environment environment,
            String property,
            String message) {
        if (!environment.getProperty(property, Boolean.class, false)) {
            throw new IllegalStateException(message);
        }
    }

    private static String property(Environment environment, String name) {
        return environment.getProperty(name, "").trim();
    }

    private static void requireNonBlank(String value, String message) {
        if (value.isBlank()) {
            throw new IllegalStateException(message);
        }
    }

    private static void requireEquals(
            Object actual,
            Object expected,
            String message) {
        if (!expected.equals(actual)) {
            throw new IllegalStateException(message);
        }
    }
}
