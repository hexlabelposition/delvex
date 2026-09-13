package com.delvex.server.payment;

import java.util.Set;
import java.util.UUID;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.delvex.server.payment.dto.CheckoutSessionResponse;

@Service
public class PaymentService {

    private static final Logger LOGGER = LoggerFactory.getLogger(
            PaymentService.class);
    private static final Set<String> COMPLETED_EVENTS = Set.of(
            "checkout.session.completed",
            "checkout.session.async_payment_succeeded");

    private final PaymentRepository paymentRepository;
    private final PaymentGateway paymentGateway;

    public PaymentService(
            PaymentRepository paymentRepository,
            PaymentGateway paymentGateway) {
        this.paymentRepository = paymentRepository;
        this.paymentGateway = paymentGateway;
    }

    @Transactional
    public CheckoutSessionResponse createCheckout(
            UUID userId,
            UUID shipmentId) {
        Payment payment = paymentRepository
                .findByShipment_IdAndShipment_User_Id(shipmentId, userId)
                .orElseThrow(PaymentNotFoundException::new);
        payment.validateOnlineCheckout();
        HostedCheckout checkout = paymentGateway.createCheckout(payment);

        payment.startCheckout(checkout.sessionId());
        LOGGER.info(
                "payment checkout created userId={} shipmentId={} paymentId={}",
                userId,
                shipmentId,
                payment.getId());

        return new CheckoutSessionResponse(checkout.url());
    }

    @Transactional
    public void handleWebhook(String payload, String signature) {
        PaymentWebhookEvent event = paymentGateway.parseWebhook(
                payload,
                signature);

        if (!COMPLETED_EVENTS.contains(event.type())
                || event.sessionId() == null
                || !"paid".equals(event.paymentStatus())) {
            return;
        }

        paymentRepository.findByProviderCheckoutSessionId(event.sessionId())
                .ifPresent(payment -> {
                    payment.markPaid(
                            event.sessionId(),
                            event.paymentIntentId());
                    LOGGER.info(
                            "payment completed shipmentId={} paymentId={}",
                            payment.getShipment().getId(),
                            payment.getId());
                });
    }
}
