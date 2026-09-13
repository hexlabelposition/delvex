package com.delvex.server.payment;

import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

public interface PaymentRepository extends JpaRepository<Payment, UUID> {
    Optional<Payment> findByShipment_IdAndShipment_User_Id(
            UUID shipmentId,
            UUID userId);

    Optional<Payment> findByProviderCheckoutSessionId(String sessionId);
}
