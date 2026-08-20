package com.delvex.server.shipment.dto;

import java.util.List;

import org.springframework.data.domain.Page;

import com.delvex.server.branch.Branch;
import com.delvex.server.shipment.Shipment;

public record EmployeeShipmentPageResponse(
        List<EmployeeShipmentResponse> content,
        int page,
        int size,
        long totalElements,
        int totalPages) {

    public static EmployeeShipmentPageResponse from(
            Page<Shipment> shipments,
            Branch employeeBranch) {
        return new EmployeeShipmentPageResponse(
                shipments.getContent()
                        .stream()
                        .map(shipment -> EmployeeShipmentResponse.from(
                                shipment,
                                employeeBranch))
                        .toList(),
                shipments.getNumber(),
                shipments.getSize(),
                shipments.getTotalElements(),
                shipments.getTotalPages());
    }
}
