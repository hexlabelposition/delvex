package com.delvex.server.shipment.dto;

import java.util.List;

import org.springframework.data.domain.Page;

import com.delvex.server.shipment.Shipment;

public record ShipmentPageResponse(
        List<ShipmentResponse> content,
        int page,
        int size,
        long totalElements,
        int totalPages) {

    public static ShipmentPageResponse from(Page<Shipment> shipments) {
        return new ShipmentPageResponse(
                shipments.getContent()
                        .stream()
                        .map(ShipmentResponse::from)
                        .toList(),
                shipments.getNumber(),
                shipments.getSize(),
                shipments.getTotalElements(),
                shipments.getTotalPages());
    }
}
