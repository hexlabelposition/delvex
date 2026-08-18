package com.delvex.server.shipment;

import java.util.List;
import java.util.UUID;

import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.delvex.server.shipment.dto.EmployeeShipmentPageResponse;
import com.delvex.server.shipment.dto.EmployeeShipmentResponse;
import com.delvex.server.shipment.dto.ShipmentStatusEventResponse;
import com.delvex.server.shipment.dto.UpdateShipmentStatusRequest;

import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Size;

@RestController
@SecurityRequirement(name = "bearerAuth")
@RequestMapping("/api/employee/shipments")
public class EmployeeShipmentController {

    private final EmployeeShipmentService shipmentService;

    public EmployeeShipmentController(
            EmployeeShipmentService shipmentService) {
        this.shipmentService = shipmentService;
    }

    @GetMapping
    public EmployeeShipmentPageResponse findAll(
            @RequestParam(required = false)
            ShipmentStatus status,
            @RequestParam(required = false)
            @Size(
                    max = 40,
                    message = "Reference must not exceed 40 characters")
            String reference,
            @RequestParam(defaultValue = "0")
            @Min(value = 0, message = "Page must not be negative")
            int page,
            @RequestParam(defaultValue = "20")
            @Min(value = 1, message = "Size must be at least 1")
            @Max(value = 100, message = "Size must not exceed 100")
            int size) {
        return shipmentService.findAll(
                status,
                reference,
                page,
                size);
    }

    @GetMapping("/{shipmentId}")
    public EmployeeShipmentResponse findById(
            @PathVariable UUID shipmentId) {
        return shipmentService.findById(shipmentId);
    }

    @GetMapping("/{shipmentId}/status-events")
    public List<ShipmentStatusEventResponse> findStatusEvents(
            @PathVariable UUID shipmentId) {
        return shipmentService.findStatusEvents(shipmentId);
    }

    @PatchMapping("/{shipmentId}/status")
    public EmployeeShipmentResponse updateStatus(
            @AuthenticationPrincipal Jwt jwt,
            @PathVariable UUID shipmentId,
            @Valid @RequestBody UpdateShipmentStatusRequest request) {
        return shipmentService.updateStatus(
                UUID.fromString(jwt.getSubject()),
                shipmentId,
                request);
    }
}
