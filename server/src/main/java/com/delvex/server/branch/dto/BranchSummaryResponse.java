package com.delvex.server.branch.dto;

import java.util.UUID;

import com.delvex.server.branch.Branch;

public record BranchSummaryResponse(
        UUID id,
        String code,
        String name,
        String country,
        String city,
        String postalCode,
        String address) {

    public static BranchSummaryResponse from(Branch branch) {
        if (branch == null) {
            return null;
        }

        return new BranchSummaryResponse(
                branch.getId(),
                branch.getCode(),
                branch.getName(),
                branch.getCountry(),
                branch.getCity(),
                branch.getPostalCode(),
                branch.getAddress());
    }
}
