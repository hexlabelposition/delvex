package com.delvex.server.auth;

import org.junit.jupiter.api.Test;
import org.springframework.mock.env.MockEnvironment;

import static org.assertj.core.api.Assertions.assertThatCode;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class LocalMailConfigurationValidatorTest {

    @Test
    void shouldAcceptHostAndComposeMailpitAddresses() {
        for (String host : new String[] {"localhost", "127.0.0.1", "mailpit"}) {
            MockEnvironment environment = new MockEnvironment()
                    .withProperty("spring.mail.host", host)
                    .withProperty("spring.mail.port", "1025");

            assertThatCode(() ->
                    new LocalMailConfigurationValidator(environment))
                    .doesNotThrowAnyException();
        }
    }

    @Test
    void shouldRejectHostedSmtpInLocalProfile() {
        MockEnvironment environment = new MockEnvironment()
                .withProperty("spring.mail.host", "smtp.resend.com")
                .withProperty("spring.mail.port", "587");

        assertThatThrownBy(() ->
                new LocalMailConfigurationValidator(environment))
                .isInstanceOf(IllegalStateException.class)
                .hasMessage(
                        "The local profile only permits Mailpit SMTP hosts");
    }

    @Test
    void shouldRequireMailpitPort() {
        MockEnvironment environment = new MockEnvironment()
                .withProperty("spring.mail.host", "localhost")
                .withProperty("spring.mail.port", "587");

        assertThatThrownBy(() ->
                new LocalMailConfigurationValidator(environment))
                .isInstanceOf(IllegalStateException.class)
                .hasMessage(
                        "The local profile requires Mailpit SMTP port 1025");
    }
}
