package com.delvex.server.payment;

import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThatThrownBy;

class PaymentConfigurationTest {

    private final PaymentConfiguration configuration =
            new PaymentConfiguration();

    @Test
    void shouldRejectLiveStripeKeys() {
        PaymentProperties properties = new PaymentProperties(
                "sk_live_forbidden",
                "whsec_test",
                "https://delvex.dev");

        assertThatThrownBy(() -> configuration.paymentHttpClient(properties))
                .isInstanceOf(IllegalStateException.class)
                .hasMessage("Delvex accepts Stripe test keys only");
    }

    @Test
    void shouldRejectInsecureHostedReturnUrl() {
        PaymentProperties properties = new PaymentProperties(
                "sk_test_safe",
                "whsec_test",
                "http://delvex.dev");

        assertThatThrownBy(() -> configuration.paymentHttpClient(properties))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("PAYMENT_CLIENT_URL");
    }
}
