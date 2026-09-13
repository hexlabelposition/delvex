package com.delvex.server.payment;

import java.util.UUID;

import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.delvex.server.payment.dto.CheckoutSessionResponse;

import io.swagger.v3.oas.annotations.security.SecurityRequirement;

@RestController
@SecurityRequirement(name = "bearerAuth")
@RequestMapping("/api/shipments/{shipmentId}/payment")
public class PaymentController {

    private final PaymentService paymentService;

    public PaymentController(PaymentService paymentService) {
        this.paymentService = paymentService;
    }

    @PostMapping("/checkout")
    public CheckoutSessionResponse createCheckout(
            @AuthenticationPrincipal Jwt jwt,
            @PathVariable UUID shipmentId) {
        return paymentService.createCheckout(
                UUID.fromString(jwt.getSubject()),
                shipmentId);
    }
}
