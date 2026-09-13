package com.delvex.server.payment;

import java.net.URI;
import java.net.http.HttpClient;

import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
@EnableConfigurationProperties(PaymentProperties.class)
public class PaymentConfiguration {

    @Bean
    public HttpClient paymentHttpClient(PaymentProperties properties) {
        if (!properties.stripeSecretKey().startsWith("sk_test_")) {
            throw new IllegalStateException(
                    "Delvex accepts Stripe test keys only");
        }
        if (!properties.stripeWebhookSecret().startsWith("whsec_")) {
            throw new IllegalStateException(
                    "STRIPE_WEBHOOK_SECRET must start with whsec_");
        }
        validateClientUrl(properties.clientUrl());

        return HttpClient.newHttpClient();
    }

    private void validateClientUrl(String value) {
        URI uri;
        try {
            uri = URI.create(value);
        } catch (IllegalArgumentException exception) {
            throw new IllegalStateException(
                    "PAYMENT_CLIENT_URL must be an absolute origin",
                    exception);
        }

        boolean localhost = "localhost".equalsIgnoreCase(uri.getHost())
                || "127.0.0.1".equals(uri.getHost());
        boolean validScheme = "https".equalsIgnoreCase(uri.getScheme())
                || localhost && "http".equalsIgnoreCase(uri.getScheme());
        boolean hasPath = uri.getRawPath() != null
                && !uri.getRawPath().isEmpty();

        if (!validScheme
                || uri.getHost() == null
                || uri.getRawUserInfo() != null
                || hasPath
                || uri.getRawQuery() != null
                || uri.getRawFragment() != null) {
            throw new IllegalStateException(
                    "PAYMENT_CLIENT_URL must be an HTTPS origin "
                            + "without a path (HTTP is allowed for localhost)");
        }
    }
}
