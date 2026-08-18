package com.delvex.server.shipment;

import java.util.List;
import java.util.UUID;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.core.TypedPropertyPath;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.delvex.server.shipment.dto.EmployeeShipmentPageResponse;
import com.delvex.server.shipment.dto.EmployeeShipmentResponse;
import com.delvex.server.shipment.dto.ShipmentStatusEventResponse;
import com.delvex.server.shipment.dto.UpdateShipmentStatusRequest;
import com.delvex.server.user.User;
import com.delvex.server.user.UserNotFoundException;
import com.delvex.server.user.UserRepository;

@Service
public class EmployeeShipmentService {

    private static final Logger LOGGER = LoggerFactory.getLogger(
            EmployeeShipmentService.class);

    private final ShipmentRepository shipmentRepository;
    private final ShipmentStatusEventRepository eventRepository;
    private final UserRepository userRepository;

    public EmployeeShipmentService(
            ShipmentRepository shipmentRepository,
            ShipmentStatusEventRepository eventRepository,
            UserRepository userRepository) {
        this.shipmentRepository = shipmentRepository;
        this.eventRepository = eventRepository;
        this.userRepository = userRepository;
    }

    @Transactional(readOnly = true)
    public EmployeeShipmentPageResponse findAll(
            ShipmentStatus status,
            String reference,
            int page,
            int size) {
        Pageable pageable = PageRequest.of(
                page,
                size,
                Sort.by(
                        Sort.Direction.DESC,
                        TypedPropertyPath.path(Shipment::getCreatedAt)));
        String normalizedReference = normalizeReference(reference);
        Page<Shipment> shipments;

        if (status != null && normalizedReference != null) {
            shipments = shipmentRepository
                    .findAllByStatusAndReferenceNumberContainingIgnoreCase(
                            status,
                            normalizedReference,
                            pageable);
        } else if (status != null) {
            shipments = shipmentRepository.findAllByStatus(
                    status,
                    pageable);
        } else if (normalizedReference != null) {
            shipments = shipmentRepository
                    .findAllByReferenceNumberContainingIgnoreCase(
                            normalizedReference,
                            pageable);
        } else {
            shipments = shipmentRepository.findAll(pageable);
        }

        LOGGER.debug(
                "employee shipments loaded status={} reference={} page={} "
                        + "size={} count={} totalElements={}",
                status,
                normalizedReference,
                page,
                size,
                shipments.getNumberOfElements(),
                shipments.getTotalElements());

        return EmployeeShipmentPageResponse.from(shipments);
    }

    @Transactional(readOnly = true)
    public EmployeeShipmentResponse findById(UUID shipmentId) {
        return EmployeeShipmentResponse.from(findShipment(shipmentId));
    }

    @Transactional(readOnly = true)
    public List<ShipmentStatusEventResponse> findStatusEvents(
            UUID shipmentId) {
        findShipment(shipmentId);

        return eventRepository
                .findAllByShipment_IdOrderByChangedAtAsc(shipmentId)
                .stream()
                .map(ShipmentStatusEventResponse::from)
                .toList();
    }

    @Transactional
    public EmployeeShipmentResponse updateStatus(
            UUID employeeId,
            UUID shipmentId,
            UpdateShipmentStatusRequest request) {
        User employee = userRepository.findById(employeeId)
                .orElseThrow(UserNotFoundException::new);
        Shipment shipment = findShipment(shipmentId);
        ShipmentStatus previousStatus = shipment.changeStatus(
                request.status(),
                request.version());

        if (previousStatus == null) {
            return EmployeeShipmentResponse.from(shipment);
        }

        Shipment savedShipment = shipmentRepository.saveAndFlush(shipment);
        eventRepository.save(new ShipmentStatusEvent(
                savedShipment,
                previousStatus,
                savedShipment.getStatus(),
                employee));

        LOGGER.info(
                "shipment status changed employeeId={} shipmentId={} "
                        + "previousStatus={} newStatus={}",
                employeeId,
                shipmentId,
                previousStatus,
                savedShipment.getStatus());

        return EmployeeShipmentResponse.from(savedShipment);
    }

    private Shipment findShipment(UUID shipmentId) {
        return shipmentRepository.findById(shipmentId)
                .orElseThrow(ShipmentNotFoundException::new);
    }

    private String normalizeReference(String reference) {
        if (reference == null || reference.isBlank()) {
            return null;
        }

        return reference.strip();
    }
}
