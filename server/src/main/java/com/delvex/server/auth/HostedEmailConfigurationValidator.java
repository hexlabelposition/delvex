package com.delvex.server.auth;

import java.net.URI;
import java.util.Locale;

import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;

import jakarta.mail.internet.AddressException;
import jakarta.mail.internet.InternetAddress;

@Component
@Profile("hosted")
public class HostedEmailConfigurationValidator {

    public HostedEmailConfigurationValidator(
            PasswordResetProperties properties) {
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
        try {
            InternetAddress address = new InternetAddress(mailFrom, true);
            String emailAddress = address.getAddress();
            int separator = emailAddress.lastIndexOf('@');
            String domain = separator < 0
                    ? ""
                    : emailAddress
                            .substring(separator + 1)
                            .toLowerCase(Locale.ROOT);

            if (domain.isBlank() || domain.endsWith(".local")) {
                throw invalidSender();
            }
        } catch (AddressException exception) {
            throw invalidSender();
        }
    }

    private static IllegalStateException invalidSender() {
        return new IllegalStateException(
                "Hosted profiles require MAIL_FROM to use a verified public domain");
    }
}
