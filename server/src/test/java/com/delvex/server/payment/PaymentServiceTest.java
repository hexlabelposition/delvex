package com.delvex.server.payment;

import java.math.BigDecimal;
import java.util.Optional;
import java.util.UUID;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import com.delvex.server.branch.Branch;
import com.delvex.server.shipment.Shipment;
import com.delvex.server.user.User;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.BDDMockito.given;
import static org.mockito.BDDMockito.then;

@ExtendWith(MockitoExtension.class)
class PaymentServiceTest {

    @Mock private PaymentRepository paymentRepository;
    @Mock private PaymentGateway paymentGateway;
    private PaymentService paymentService;

    @BeforeEach
    void setUp() {
        paymentService = new PaymentService(paymentRepository, paymentGateway);
    }

    @Test
    void shouldCreateCheckoutForOwnedCardPayment() {
        UUID userId = UUID.randomUUID();
        Shipment shipment = shipment(userId, PaymentMethod.CARD);
        Payment payment = shipment.getPayment();
        given(paymentRepository.findByShipment_IdAndShipment_User_Id(
                shipment.getId(), userId)).willReturn(Optional.of(payment));
        given(paymentGateway.createCheckout(payment)).willReturn(
                new HostedCheckout("cs_test_123", "https://checkout.stripe.test"));

        var response = paymentService.createCheckout(userId, shipment.getId());

        assertThat(response.checkoutUrl())
                .isEqualTo("https://checkout.stripe.test");
        assertThat(payment.getStatus()).isEqualTo(PaymentStatus.PROCESSING);
        assertThat(payment.getProviderCheckoutSessionId())
                .isEqualTo("cs_test_123");
    }

    @Test
    void shouldNotContactStripeForBranchPayment() {
        UUID userId = UUID.randomUUID();
        Shipment shipment = shipment(userId, PaymentMethod.AT_BRANCH);
        Payment payment = shipment.getPayment();
        given(paymentRepository.findByShipment_IdAndShipment_User_Id(
                shipment.getId(), userId)).willReturn(Optional.of(payment));

        assertThatThrownBy(() -> paymentService.createCheckout(
                userId,
                shipment.getId()))
                .isInstanceOf(InvalidPaymentStateException.class);

        then(paymentGateway).shouldHaveNoInteractions();
    }

    @Test
    void shouldCompletePaymentFromPaidCheckoutWebhook() {
        UUID userId = UUID.randomUUID();
        Payment payment = shipment(userId, PaymentMethod.CARD).getPayment();
        payment.startCheckout("cs_test_123");
        given(paymentGateway.parseWebhook("payload", "signature"))
                .willReturn(new PaymentWebhookEvent(
                        "checkout.session.completed",
                        "cs_test_123",
                        "paid",
                        "pi_test_123"));
        given(paymentRepository.findByProviderCheckoutSessionId("cs_test_123"))
                .willReturn(Optional.of(payment));

        paymentService.handleWebhook("payload", "signature");

        assertThat(payment.getStatus()).isEqualTo(PaymentStatus.PAID);
        assertThat(payment.getProviderPaymentIntentId())
                .isEqualTo("pi_test_123");
        assertThat(payment.getPaidAt()).isNotNull();
    }

    private Shipment shipment(UUID userId, PaymentMethod method) {
        User user = new User("john@example.com", "hash", "John", "Doe");
        ReflectionTestUtils.setField(user, "id", userId);
        Branch origin = branch("WARSAW", "Warszawa");
        Branch destination = branch("GDANSK", "Gdańsk");
        Shipment shipment = new Shipment(
                user,
                "DLX-11111111-1111-1111-1111-111111111111",
                origin,
                destination,
                "Books",
                BigDecimal.TEN,
                null,
                null,
                method,
                new BigDecimal("29.00"));
        ReflectionTestUtils.setField(shipment, "id", UUID.randomUUID());
        ReflectionTestUtils.setField(shipment.getPayment(), "id", UUID.randomUUID());
        return shipment;
    }

    private Branch branch(String code, String city) {
        Branch branch = new Branch(
                code,
                city + " Central",
                "PL",
                city,
                "00-001",
                "Main 1");
        ReflectionTestUtils.setField(branch, "id", UUID.randomUUID());
        return branch;
    }
}
