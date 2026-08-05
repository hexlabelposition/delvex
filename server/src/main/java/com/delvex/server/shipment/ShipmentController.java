package com.delvex.server.shipment;

import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.delvex.server.shipment.dto.CreateShipmentRequest;
import com.delvex.server.shipment.dto.ShipmentPageResponse;
import com.delvex.server.shipment.dto.ShipmentResponse;
import com.delvex.server.shipment.dto.UpdateShipmentRequest;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;

@RestController
@RequestMapping("/api/shipments")
public class ShipmentController {

    private final ShipmentService shipmentService;

    public ShipmentController(ShipmentService shipmentService) {
        this.shipmentService = shipmentService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ShipmentResponse create(
            @AuthenticationPrincipal Jwt jwt,
            @Valid @RequestBody CreateShipmentRequest request) {
        return shipmentService.create(userId(jwt), request);
    }

    @GetMapping
    public ShipmentPageResponse findAll(
            @AuthenticationPrincipal Jwt jwt,
            @RequestParam(defaultValue = "0")
            @Min(value = 0, message = "Page must not be negative")
            int page,
            @RequestParam(defaultValue = "20")
            @Min(value = 1, message = "Size must be at least 1")
            @Max(value = 100, message = "Size must not exceed 100")
            int size) {
        return shipmentService.findAll(
                userId(jwt),
                page,
                size);
    }

    @GetMapping("/{shipmentId}")
    public ShipmentResponse findById(
            @AuthenticationPrincipal Jwt jwt,
            @PathVariable UUID shipmentId) {
        return shipmentService.findById(userId(jwt), shipmentId);
    }

    @PatchMapping("/{shipmentId}")
    public ShipmentResponse update(
            @AuthenticationPrincipal Jwt jwt,
            @PathVariable UUID shipmentId,
            @Valid @RequestBody UpdateShipmentRequest request) {
        return shipmentService.update(
                userId(jwt),
                shipmentId,
                request);
    }

    @DeleteMapping("/{shipmentId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(
            @AuthenticationPrincipal Jwt jwt,
            @PathVariable UUID shipmentId) {
        shipmentService.delete(userId(jwt), shipmentId);
    }

    private UUID userId(Jwt jwt) {
        return UUID.fromString(jwt.getSubject());
    }
}
