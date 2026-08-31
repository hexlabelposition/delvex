package com.delvex.server.shipment;

import java.util.Locale;
import java.util.UUID;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.core.TypedPropertyPath;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.delvex.server.branch.Branch;
import com.delvex.server.branch.BranchRepository;
import com.delvex.server.shipment.dto.CreateShipmentRequest;
import com.delvex.server.shipment.dto.ShipmentPageResponse;
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
    private final BranchRepository branchRepository;

    public ShipmentService(
            ShipmentRepository shipmentRepository,
            UserRepository userRepository,
            BranchRepository branchRepository) {
        this.shipmentRepository = shipmentRepository;
        this.userRepository = userRepository;
        this.branchRepository = branchRepository;
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
                findBranch(request.originLocationId()),
                findBranch(request.destinationLocationId()),
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
    public ShipmentPageResponse findAll(
            UUID userId,
            int page,
            int size) {
        Page<Shipment> shipments = shipmentRepository.findAllByUser_Id(
                userId,
                PageRequest.of(
                        page,
                        size,
                        Sort.by(
                                Sort.Direction.DESC,
                                TypedPropertyPath.path(Shipment::getCreatedAt))));

        LOGGER.debug(
                "shipments loaded userId={} page={} size={} count={} "
                        + "totalElements={}",
                userId,
                page,
                size,
                shipments.getNumberOfElements(),
                shipments.getTotalElements());

        return ShipmentPageResponse.from(shipments);
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

        Branch originBranch = request.originLocationId() == null
                ? null : findBranch(request.originLocationId());
        Branch destinationBranch = request.destinationLocationId() == null
                ? null : findBranch(request.destinationLocationId());

        shipment.update(
                originBranch,
                destinationBranch,
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

        shipment.validateDeletion();
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

    private Branch findBranch(String code) {
        return branchRepository.findByCodeAndActiveTrue(code)
                .orElseThrow(() -> new InvalidShipmentLocationException(code));
    }

    private String strip(String value) {
        return value == null ? null : value.strip();
    }
}
