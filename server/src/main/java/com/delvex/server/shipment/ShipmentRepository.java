package com.delvex.server.shipment;

import java.util.Optional;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ShipmentRepository extends JpaRepository<Shipment, UUID> {

    Page<Shipment> findAllByUser_Id(UUID userId, Pageable pageable);

    Optional<Shipment> findByIdAndUser_Id(UUID id, UUID userId);

    @Override
    @EntityGraph(attributePaths = "user")
    Page<Shipment> findAll(Pageable pageable);

    @EntityGraph(attributePaths = "user")
    Page<Shipment> findAllByStatus(
            ShipmentStatus status,
            Pageable pageable);

    @EntityGraph(attributePaths = "user")
    Page<Shipment> findAllByReferenceNumberContainingIgnoreCase(
            String reference,
            Pageable pageable);

    @EntityGraph(attributePaths = "user")
    Page<Shipment> findAllByStatusAndReferenceNumberContainingIgnoreCase(
            ShipmentStatus status,
            String reference,
            Pageable pageable);
}
