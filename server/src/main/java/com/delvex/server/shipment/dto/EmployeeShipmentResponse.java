package com.delvex.server.shipment.dto;

import java.util.List;
import java.util.UUID;

import com.delvex.server.branch.Branch;
import com.delvex.server.branch.dto.BranchSummaryResponse;
import com.delvex.server.shipment.Shipment;
import com.delvex.server.shipment.ShipmentStatus;

public record EmployeeShipmentResponse(
        ShipmentResponse shipment,
        CustomerSummary customer,
        BranchSummaryResponse originBranch,
        BranchSummaryResponse destinationBranch,
        BranchSummaryResponse currentBranch,
        List<ShipmentStatus> allowedStatuses) {

    public static EmployeeShipmentResponse from(
            Shipment shipment,
            Branch employeeBranch) {
        return new EmployeeShipmentResponse(
                ShipmentResponse.from(shipment),
                new CustomerSummary(
                        shipment.getUser().getId(),
                        shipment.getUser().getEmail(),
                        shipment.getUser().getFirstName(),
                        shipment.getUser().getLastName()),
                BranchSummaryResponse.from(shipment.getOriginBranch()),
                BranchSummaryResponse.from(shipment.getDestinationBranch()),
                BranchSummaryResponse.from(shipment.getCurrentBranch()),
                shipment.allowedTransitionsFor(employeeBranch));
    }

    public record CustomerSummary(
            UUID id,
            String email,
            String firstName,
            String lastName) {
    }
}
