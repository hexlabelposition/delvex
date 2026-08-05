package com.delvex.server.shipment;

import java.util.List;
import java.util.Locale;
import java.util.UUID;

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

        return ShipmentResponse.from(
                shipmentRepository.saveAndFlush(shipment));
    }

    @Transactional(readOnly = true)
    public List<ShipmentResponse> findAll(UUID userId) {
        return shipmentRepository
                .findAllByUser_IdOrderByCreatedAtDesc(userId)
                .stream()
                .map(ShipmentResponse::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public ShipmentResponse findById(UUID userId, UUID shipmentId) {
        return ShipmentResponse.from(
                findOwnedShipment(userId, shipmentId));
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

        return ShipmentResponse.from(shipment);
    }

    @Transactional
    public void delete(UUID userId, UUID shipmentId) {
        shipmentRepository.delete(
                findOwnedShipment(userId, shipmentId));
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
