package com.delvex.server.auth;

import java.util.List;

import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.context.annotation.Profile;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;

@Component
@Profile("hosted")
public class ResendPasswordResetEmailSender
        implements PasswordResetEmailSender {

    private final RestClient restClient;

    public ResendPasswordResetEmailSender(
            @Qualifier("resendRestClient") RestClient restClient) {
        this.restClient = restClient;
    }

    @Override
    public void send(PasswordResetEmail email) {
        ResendEmailRequest request = new ResendEmailRequest(
                email.from(),
                List.of(email.to()),
                email.subject(),
                email.text());

        try {
            restClient.post()
                    .uri("/emails")
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(request)
                    .retrieve()
                    .toBodilessEntity();
        } catch (RestClientException exception) {
            throw new EmailDeliveryException(
                    "Resend API request failed",
                    exception);
        }
    }

    private record ResendEmailRequest(
            String from,
            List<String> to,
            String subject,
            String text) {
    }
}
