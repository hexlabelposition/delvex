package com.delvex.server.shipment;

import java.util.Optional;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ShipmentRepository extends JpaRepository<Shipment, UUID> {

    Page<Shipment> findAllByUser_Id(UUID userId, Pageable pageable);

    Optional<Shipment> findByIdAndUser_Id(UUID id, UUID userId);

    @EntityGraph(attributePaths = {
            "user",
            "originBranch",
            "destinationBranch",
            "currentBranch"
    })
    @Query("""
            SELECT shipment
            FROM Shipment shipment
            WHERE (
                shipment.originBranch.id = :branchId
                OR shipment.destinationBranch.id = :branchId
            )
            AND (:status IS NULL OR shipment.status = :status)
            AND (
                :reference IS NULL
                OR LOWER(shipment.referenceNumber)
                    LIKE LOWER(CONCAT('%', :reference, '%'))
            )
            """)
    Page<Shipment> findAllForBranch(
            @Param("branchId") UUID branchId,
            @Param("status") ShipmentStatus status,
            @Param("reference") String reference,
            Pageable pageable);

    @EntityGraph(attributePaths = {
            "user",
            "originBranch",
            "destinationBranch",
            "currentBranch"
    })
    @Query("""
            SELECT shipment
            FROM Shipment shipment
            WHERE shipment.id = :shipmentId
            AND (
                shipment.originBranch.id = :branchId
                OR shipment.destinationBranch.id = :branchId
            )
            """)
    Optional<Shipment> findByIdForBranch(
            @Param("shipmentId") UUID shipmentId,
            @Param("branchId") UUID branchId);
}
