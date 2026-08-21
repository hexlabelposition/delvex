package com.delvex.server.auth;

import org.junit.jupiter.api.Test;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.test.web.client.MockRestServiceServer;
import org.springframework.web.client.RestClient;

import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.content;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.header;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.method;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.requestTo;
import static org.springframework.test.web.client.response.MockRestResponseCreators.withStatus;
import static org.springframework.test.web.client.response.MockRestResponseCreators.withSuccess;

class ResendPasswordResetEmailSenderTest {

    @Test
    void shouldSendEmailThroughResendApi() {
        RestClient.Builder builder = RestClient.builder();
        MockRestServiceServer server =
                MockRestServiceServer.bindTo(builder).build();
        ResendPasswordResetEmailSender sender =
                new ResendPasswordResetEmailSender(
                        resendClient(builder));

        server.expect(requestTo("https://api.resend.com/emails"))
                .andExpect(method(HttpMethod.POST))
                .andExpect(header(
                        HttpHeaders.AUTHORIZATION,
                        "Bearer re_test-api-key"))
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(content().json("""
                        {
                          "from": "no-reply@delvex.example",
                          "to": ["john@example.com"],
                          "subject": "Reset password",
                          "text": "Reset link"
                        }
                        """))
                .andRespond(withSuccess(
                        """
                        {"id":"email-id"}
                        """,
                        MediaType.APPLICATION_JSON));

        sender.send(email());

        server.verify();
    }

    @Test
    void shouldWrapResendApiErrors() {
        RestClient.Builder builder = RestClient.builder();
        MockRestServiceServer server =
                MockRestServiceServer.bindTo(builder).build();
        ResendPasswordResetEmailSender sender =
                new ResendPasswordResetEmailSender(
                        resendClient(builder));

        server.expect(requestTo("https://api.resend.com/emails"))
                .andRespond(withStatus(HttpStatus.UNPROCESSABLE_ENTITY)
                        .contentType(MediaType.APPLICATION_JSON)
                        .body("""
                                {"message":"Invalid from field"}
                                """));

        assertThatThrownBy(() -> sender.send(email()))
                .isInstanceOf(EmailDeliveryException.class)
                .hasMessage("Resend API request failed");

        server.verify();
    }

    private static RestClient resendClient(RestClient.Builder builder) {
        return builder
                .baseUrl("https://api.resend.com")
                .defaultHeader(
                        HttpHeaders.AUTHORIZATION,
                        "Bearer re_test-api-key")
                .build();
    }

    private static PasswordResetEmail email() {
        return new PasswordResetEmail(
                "no-reply@delvex.example",
                "john@example.com",
                "Reset password",
                "Reset link");
    }
}
