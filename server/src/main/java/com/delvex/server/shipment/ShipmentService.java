package com.delvex.server.shipment;

import java.util.List;
import java.util.Locale;
import java.util.UUID;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.delvex.server.shipment.dto.CreateShipmentRequest;
import com.delvex.server.shipment.dto.ShipmentResponse;
import com.delvex.server.shipment.dto.UpdateShipmentRequest;
import com.delvex.server.user.User;
import com.delvex.server.user.UserNotFoundException;
import com.delvex.server.user.UserRepository;

@Service
public class ShipmentService {

    private static final Logger LOGGER = LoggerFactory.getLogger(
            ShipmentService.class);

    private final ShipmentRepository shipmentRepository;
    private final UserRepository userRepository;

    public ShipmentService(
            ShipmentRepository shipmentRepository,
            UserRepository userRepository) {
        this.shipmentRepository = shipmentRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public ShipmentResponse create(
            UUID userId,
            CreateShipmentRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(UserNotFoundException::new);

        Shipment shipment = new Shipment(
                user,
                createReferenceNumber(),
                normalizeCountry(request.originCountry()),
                strip(request.originCity()),
                strip(request.originPostalCode()),
                strip(request.originAddress()),
                normalizeCountry(request.destinationCountry()),
                strip(request.destinationCity()),
                strip(request.destinationPostalCode()),
                strip(request.destinationAddress()),
                strip(request.cargoDescription()),
                request.weightKg(),
                request.pickupAt(),
                request.deliveryAt());

        Shipment savedShipment = shipmentRepository.saveAndFlush(shipment);

        LOGGER.info(
                "shipment created userId={} shipmentId={}",
                userId,
                savedShipment.getId());

        return ShipmentResponse.from(savedShipment);
    }

    @Transactional(readOnly = true)
    public List<ShipmentResponse> findAll(UUID userId) {
        List<ShipmentResponse> shipments = shipmentRepository
                .findAllByUser_IdOrderByCreatedAtDesc(userId)
                .stream()
                .map(ShipmentResponse::from)
                .toList();

        LOGGER.debug(
                "shipments loaded userId={} count={}",
                userId,
                shipments.size());

        return shipments;
    }

    @Transactional(readOnly = true)
    public ShipmentResponse findById(UUID userId, UUID shipmentId) {
        ShipmentResponse response = ShipmentResponse.from(
                findOwnedShipment(userId, shipmentId));

        LOGGER.debug(
                "shipment loaded userId={} shipmentId={}",
                userId,
                shipmentId);

        return response;
    }

    @Transactional
    public ShipmentResponse update(
            UUID userId,
            UUID shipmentId,
            UpdateShipmentRequest request) {
        Shipment shipment = findOwnedShipment(userId, shipmentId);

        shipment.update(
                request.status(),
                normalizeCountry(request.originCountry()),
                strip(request.originCity()),
                strip(request.originPostalCode()),
                strip(request.originAddress()),
                normalizeCountry(request.destinationCountry()),
                strip(request.destinationCity()),
                strip(request.destinationPostalCode()),
                strip(request.destinationAddress()),
                strip(request.cargoDescription()),
                request.weightKg(),
                request.pickupAt(),
                request.deliveryAt());

        LOGGER.info(
                "shipment updated userId={} shipmentId={}",
                userId,
                shipmentId);

        return ShipmentResponse.from(shipment);
    }

    @Transactional
    public void delete(UUID userId, UUID shipmentId) {
        Shipment shipment = findOwnedShipment(userId, shipmentId);

        shipmentRepository.delete(shipment);

        LOGGER.info(
                "shipment deleted userId={} shipmentId={}",
                userId,
                shipmentId);
    }

    private Shipment findOwnedShipment(UUID userId, UUID shipmentId) {
        return shipmentRepository
                .findByIdAndUser_Id(shipmentId, userId)
                .orElseThrow(ShipmentNotFoundException::new);
    }

    private String createReferenceNumber() {
        return "DLX-" + UUID.randomUUID().toString().toUpperCase(Locale.ROOT);
    }

    private String normalizeCountry(String value) {
        return value == null
                ? null
                : value.strip().toUpperCase(Locale.ROOT);
    }

    private String strip(String value) {
        return value == null ? null : value.strip();
    }
}
