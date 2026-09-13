package com.delvex.server.payment;

import java.io.IOException;
import java.net.URI;
import java.net.URLEncoder;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.security.InvalidKeyException;
import java.security.NoSuchAlgorithmException;
import java.time.Instant;
import java.util.Arrays;
import java.util.LinkedHashMap;
import java.util.Map;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;

import org.springframework.stereotype.Component;

import tools.jackson.databind.JsonNode;
import tools.jackson.databind.json.JsonMapper;

@Component
public class StripePaymentGateway implements PaymentGateway {

    private static final URI CHECKOUT_SESSIONS_URI = URI.create(
            "https://api.stripe.com/v1/checkout/sessions");
    private static final long WEBHOOK_TOLERANCE_SECONDS = 300;

    private final HttpClient httpClient;
    private final JsonMapper jsonMapper;
    private final PaymentProperties properties;

    public StripePaymentGateway(
            HttpClient httpClient,
            JsonMapper jsonMapper,
            PaymentProperties properties) {
        this.httpClient = httpClient;
        this.jsonMapper = jsonMapper;
        this.properties = properties;
    }

    @Override
    public HostedCheckout createCheckout(Payment payment) {
        String shipmentId = payment.getShipment().getId().toString();
        long amountInMinorUnits = payment.getAmount().movePointRight(2)
                .longValueExact();

        Map<String, String> fields = new LinkedHashMap<>();
        fields.put("mode", "payment");
        fields.put("success_url", properties.clientUrl()
                + "/shipments/" + shipmentId + "?payment=success");
        fields.put("cancel_url", properties.clientUrl()
                + "/shipments/" + shipmentId + "?payment=cancelled");
        fields.put("client_reference_id", shipmentId);
        fields.put("metadata[shipmentId]", shipmentId);
        fields.put("payment_method_types[0]", "card");
        fields.put("line_items[0][quantity]", "1");
        fields.put("line_items[0][price_data][currency]",
                payment.getCurrency().toLowerCase());
        fields.put("line_items[0][price_data][unit_amount]",
                Long.toString(amountInMinorUnits));
        fields.put("line_items[0][price_data][product_data][name]",
                "Delvex shipment");
        fields.put("line_items[0][price_data][product_data][description]",
                payment.getShipment().getReferenceNumber());

        HttpRequest request = HttpRequest.newBuilder(CHECKOUT_SESSIONS_URI)
                .header("Authorization",
                        "Bearer " + properties.stripeSecretKey())
                .header("Content-Type",
                        "application/x-www-form-urlencoded")
                .header("Idempotency-Key",
                        "payment-checkout-" + payment.getId())
                .POST(HttpRequest.BodyPublishers.ofString(formEncode(fields)))
                .build();

        try {
            HttpResponse<String> response = httpClient.send(
                    request,
                    HttpResponse.BodyHandlers.ofString());
            if (response.statusCode() < 200 || response.statusCode() >= 300) {
                throw new PaymentProviderException(
                        "Stripe rejected Checkout session creation", null);
            }
            JsonNode body = jsonMapper.readTree(response.body());
            String id = requiredText(body, "id");
            String url = requiredText(body, "url");
            return new HostedCheckout(id, url);
        } catch (IOException exception) {
            throw new PaymentProviderException(
                    "Unable to create Stripe Checkout session", exception);
        } catch (InterruptedException exception) {
            Thread.currentThread().interrupt();
            throw new PaymentProviderException(
                    "Stripe Checkout request was interrupted", exception);
        }
    }

    @Override
    public PaymentWebhookEvent parseWebhook(
            String payload,
            String signature) {
        verifyWebhookSignature(payload, signature);

        try {
            JsonNode event = jsonMapper.readTree(payload);
            JsonNode object = event.path("data").path("object");
            return new PaymentWebhookEvent(
                    event.path("type").asText(),
                    textOrNull(object, "id"),
                    textOrNull(object, "payment_status"),
                    textOrNull(object, "payment_intent"));
        } catch (IOException exception) {
            throw new InvalidPaymentStateException(
                    "Malformed Stripe webhook payload");
        }
    }

    private void verifyWebhookSignature(String payload, String header) {
        String timestamp = headerValue(header, "t");
        String expected = hmacSha256(
                timestamp + "." + payload,
                properties.stripeWebhookSecret());
        boolean matches = Arrays.stream(header.split(","))
                .map(String::trim)
                .filter(value -> value.startsWith("v1="))
                .map(value -> value.substring(3))
                .anyMatch(value -> constantTimeEquals(expected, value));

        long signedAt;
        try {
            signedAt = Long.parseLong(timestamp);
        } catch (NumberFormatException exception) {
            throw invalidSignature();
        }

        long age = Math.abs(Instant.now().getEpochSecond() - signedAt);
        if (!matches || age > WEBHOOK_TOLERANCE_SECONDS) {
            throw invalidSignature();
        }
    }

    private String headerValue(String header, String name) {
        return Arrays.stream(header.split(","))
                .map(String::trim)
                .filter(value -> value.startsWith(name + "="))
                .map(value -> value.substring(name.length() + 1))
                .findFirst()
                .orElseThrow(StripePaymentGateway::invalidSignature);
    }

    private String hmacSha256(String value, String secret) {
        try {
            Mac mac = Mac.getInstance("HmacSHA256");
            mac.init(new SecretKeySpec(
                    secret.getBytes(StandardCharsets.UTF_8),
                    "HmacSHA256"));
            return java.util.HexFormat.of().formatHex(
                    mac.doFinal(value.getBytes(StandardCharsets.UTF_8)));
        } catch (NoSuchAlgorithmException | InvalidKeyException exception) {
            throw new IllegalStateException(
                    "Unable to verify Stripe webhook signature", exception);
        }
    }

    private boolean constantTimeEquals(String left, String right) {
        return java.security.MessageDigest.isEqual(
                left.getBytes(StandardCharsets.UTF_8),
                right.getBytes(StandardCharsets.UTF_8));
    }

    private String formEncode(Map<String, String> fields) {
        return fields.entrySet().stream()
                .map(entry -> encode(entry.getKey()) + "="
                        + encode(entry.getValue()))
                .collect(java.util.stream.Collectors.joining("&"));
    }

    private String encode(String value) {
        return URLEncoder.encode(value, StandardCharsets.UTF_8);
    }

    private String requiredText(JsonNode node, String field) {
        String value = textOrNull(node, field);
        if (value == null) {
            throw new PaymentProviderException(
                    "Stripe response is missing " + field, null);
        }
        return value;
    }

    private String textOrNull(JsonNode node, String field) {
        JsonNode value = node.path(field);
        return value.isMissingNode() || value.isNull()
                ? null : value.asText();
    }

    private static InvalidWebhookSignatureException invalidSignature() {
        return new InvalidWebhookSignatureException();
    }
}
