package com.delvex.server.shipment;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ShipmentStatusEventRepository
        extends JpaRepository<ShipmentStatusEvent, UUID> {

    @EntityGraph(attributePaths = "changedBy")
    List<ShipmentStatusEvent> findAllByShipment_IdOrderByChangedAtAsc(
            UUID shipmentId);
}
