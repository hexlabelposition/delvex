package com.delvex.server.payment;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

import com.delvex.server.shipment.Shipment;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;

@Entity
@Table(name = "payments")
public class Payment {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "shipment_id", nullable = false, unique = true)
    private Shipment shipment;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private PaymentMethod method;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private PaymentStatus status;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal amount;

    @Column(nullable = false, length = 3)
    private String currency;

    @Column(name = "provider_checkout_session_id", unique = true, length = 255)
    private String providerCheckoutSessionId;

    @Column(name = "provider_payment_intent_id", unique = true, length = 255)
    private String providerPaymentIntentId;

    @Column(name = "paid_at")
    private Instant paidAt;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    protected Payment() {
    }

    public Payment(
            Shipment shipment,
            PaymentMethod method,
            BigDecimal amount,
            String currency) {
        this.shipment = shipment;
        this.method = method;
        this.status = PaymentStatus.UNPAID;
        this.amount = amount;
        this.currency = currency;
    }

    @PrePersist
    private void onCreate() {
        Instant now = Instant.now();
        createdAt = now;
        updatedAt = now;
    }

    @PreUpdate
    private void onUpdate() {
        updatedAt = Instant.now();
    }

    public void startCheckout(String checkoutSessionId) {
        validateOnlineCheckout();

        providerCheckoutSessionId = checkoutSessionId;
        status = PaymentStatus.PROCESSING;
    }

    public void validateOnlineCheckout() {
        if (method != PaymentMethod.CARD) {
            throw new InvalidPaymentStateException(
                    "Only card payments can start online checkout");
        }
        if (status == PaymentStatus.PAID || status == PaymentStatus.REFUNDED) {
            throw new InvalidPaymentStateException(
                    "This payment can no longer start checkout");
        }

    }

    public void markPaid(String checkoutSessionId, String paymentIntentId) {
        if (!checkoutSessionId.equals(providerCheckoutSessionId)) {
            throw new InvalidPaymentStateException(
                    "Checkout session does not match this payment");
        }
        if (status == PaymentStatus.PAID) {
            return;
        }

        providerPaymentIntentId = paymentIntentId;
        paidAt = Instant.now();
        status = PaymentStatus.PAID;
    }

    public void updateAmount(BigDecimal amount) {
        if (status != PaymentStatus.UNPAID) {
            throw new InvalidPaymentStateException(
                    "A shipment with a started payment cannot be repriced");
        }
        this.amount = amount;
    }

    public void validateShipmentDeletion() {
        if (status == PaymentStatus.PAID || status == PaymentStatus.REFUNDED) {
            throw new InvalidPaymentStateException(
                    "A shipment with a completed payment cannot be deleted");
        }
    }

    public UUID getId() {
        return id;
    }

    public Shipment getShipment() {
        return shipment;
    }

    public PaymentMethod getMethod() {
        return method;
    }

    public PaymentStatus getStatus() {
        return status;
    }

    public BigDecimal getAmount() {
        return amount;
    }

    public String getCurrency() {
        return currency;
    }

    public String getProviderCheckoutSessionId() {
        return providerCheckoutSessionId;
    }

    public String getProviderPaymentIntentId() {
        return providerPaymentIntentId;
    }

    public Instant getPaidAt() {
        return paidAt;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }
}
