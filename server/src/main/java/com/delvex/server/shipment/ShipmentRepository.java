package com.delvex.server.shipment;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

public interface ShipmentRepository extends JpaRepository<Shipment, UUID> {

    List<Shipment> findAllByUser_IdOrderByCreatedAtDesc(UUID userId);

    Optional<Shipment> findByIdAndUser_Id(UUID id, UUID userId);
}
