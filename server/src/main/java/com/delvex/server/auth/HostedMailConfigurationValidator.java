package com.delvex.server.auth;

import java.net.URI;
import java.util.Locale;

import org.springframework.context.annotation.Profile;
import org.springframework.core.env.Environment;
import org.springframework.stereotype.Component;

@Component
@Profile("prod")
public class HostedMailConfigurationValidator {

    private static final String RESEND_HOST = "smtp.resend.com";

    public HostedMailConfigurationValidator(
            Environment environment,
            PasswordResetProperties properties) {
        String host = property(environment, "spring.mail.host");

        if (host.isBlank()) {
            return;
        }

        requireNonBlank(
                property(environment, "spring.mail.username"),
                "Hosted SMTP requires MAIL_USERNAME");
        requireNonBlank(
                property(environment, "spring.mail.password"),
                "Hosted SMTP requires MAIL_PASSWORD");
        requirePublicResetUrl(properties.clientUrl());
        requirePublicSender(properties.mailFrom());

        if (RESEND_HOST.equalsIgnoreCase(host)) {
            validateResend(environment);
        }
    }

    private static void validateResend(Environment environment) {
        String username = property(environment, "spring.mail.username");
        int port = environment.getProperty("spring.mail.port", Integer.class, 587);
        boolean authentication = environment.getProperty(
                "spring.mail.properties[mail.smtp.auth]",
                Boolean.class,
                false);
        boolean startTls = environment.getProperty(
                "spring.mail.properties[mail.smtp.starttls.enable]",
                Boolean.class,
                false);

        if (!"resend".equals(username)) {
            throw new IllegalStateException(
                    "Resend SMTP requires MAIL_USERNAME=resend");
        }
        if (port != 587) {
            throw new IllegalStateException(
                    "Resend SMTP requires MAIL_PORT=587");
        }
        if (!authentication) {
            throw new IllegalStateException(
                    "Resend SMTP requires MAIL_SMTP_AUTH=true");
        }
        if (!startTls) {
            throw new IllegalStateException(
                    "Resend SMTP requires MAIL_SMTP_STARTTLS=true");
        }
    }

    private static void requirePublicResetUrl(URI clientUrl) {
        if (clientUrl == null
                || !"https".equalsIgnoreCase(clientUrl.getScheme())
                || clientUrl.getHost() == null) {
            throw new IllegalStateException(
                    "Hosted SMTP requires PASSWORD_RESET_CLIENT_URL to use HTTPS");
        }
    }

    private static void requirePublicSender(String mailFrom) {
        int separator = mailFrom == null ? -1 : mailFrom.lastIndexOf('@');
        String domain = separator < 0
                ? ""
                : mailFrom.substring(separator + 1).toLowerCase(Locale.ROOT);

        if (domain.isBlank() || domain.endsWith(".local")) {
            throw new IllegalStateException(
                    "Hosted SMTP requires MAIL_FROM to use a verified public domain");
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
}
