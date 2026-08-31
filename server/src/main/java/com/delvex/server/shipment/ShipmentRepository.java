package com.delvex.server.shipment;

import java.util.Optional;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ShipmentRepository extends JpaRepository<Shipment, UUID> {

    Page<Shipment> findAllByUser_Id(UUID userId, Pageable pageable);

    Optional<Shipment> findByIdAndUser_Id(UUID id, UUID userId);
}
