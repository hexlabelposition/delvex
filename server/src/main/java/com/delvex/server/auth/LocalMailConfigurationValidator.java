package com.delvex.server.auth;

import java.util.Locale;
import java.util.Set;

import org.springframework.context.annotation.Profile;
import org.springframework.core.env.Environment;
import org.springframework.stereotype.Component;

@Component
@Profile("local")
public class LocalMailConfigurationValidator {

    private static final Set<String> LOCAL_HOSTS = Set.of(
            "localhost",
            "127.0.0.1",
            "::1",
            "mailpit");

    public LocalMailConfigurationValidator(Environment environment) {
        String host = environment
                .getProperty("spring.mail.host", "")
                .trim()
                .toLowerCase(Locale.ROOT);
        int port = environment.getProperty(
                "spring.mail.port",
                Integer.class,
                0);

        if (!LOCAL_HOSTS.contains(host)) {
            throw new IllegalStateException(
                    "The local profile only permits Mailpit SMTP hosts");
        }
        if (port != 1025) {
            throw new IllegalStateException(
                    "The local profile requires Mailpit SMTP port 1025");
        }
    }
}
