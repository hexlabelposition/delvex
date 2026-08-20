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

import com.delvex.server.branch.Branch;
import com.delvex.server.branch.EmployeeBranchRequiredException;
import com.delvex.server.shipment.dto.EmployeeShipmentPageResponse;
import com.delvex.server.shipment.dto.EmployeeShipmentResponse;
import com.delvex.server.shipment.dto.ShipmentStatusEventResponse;
import com.delvex.server.shipment.dto.UpdateShipmentStatusRequest;
import com.delvex.server.user.User;
import com.delvex.server.user.UserNotFoundException;
import com.delvex.server.user.UserRepository;
import com.delvex.server.user.UserRole;

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
            UUID employeeId,
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
        Branch employeeBranch = findEmployeeBranch(employeeId);
        Page<Shipment> shipments = shipmentRepository.findAllForBranch(
                employeeBranch.getId(),
                status,
                normalizedReference,
                pageable);

        LOGGER.debug(
                "employee shipments loaded employeeId={} branchId={} "
                        + "status={} reference={} page={} size={} count={} "
                        + "totalElements={}",
                employeeId,
                employeeBranch.getId(),
                status,
                normalizedReference,
                page,
                size,
                shipments.getNumberOfElements(),
                shipments.getTotalElements());

        return EmployeeShipmentPageResponse.from(
                shipments,
                employeeBranch);
    }

    @Transactional(readOnly = true)
    public EmployeeShipmentResponse findById(
            UUID employeeId,
            UUID shipmentId) {
        Branch employeeBranch = findEmployeeBranch(employeeId);

        return EmployeeShipmentResponse.from(
                findShipment(shipmentId, employeeBranch),
                employeeBranch);
    }

    @Transactional(readOnly = true)
    public List<ShipmentStatusEventResponse> findStatusEvents(
            UUID employeeId,
            UUID shipmentId) {
        Branch employeeBranch = findEmployeeBranch(employeeId);
        findShipment(shipmentId, employeeBranch);

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
        User employee = findEmployee(employeeId);
        Branch employeeBranch = requireActiveBranch(employee);
        Shipment shipment = findShipment(shipmentId, employeeBranch);
        ShipmentStatus previousStatus = shipment.changeStatus(
                request.status(),
                request.version(),
                employeeBranch);

        if (previousStatus == null) {
            return EmployeeShipmentResponse.from(
                    shipment,
                    employeeBranch);
        }

        Shipment savedShipment = shipmentRepository.saveAndFlush(shipment);
        eventRepository.save(new ShipmentStatusEvent(
                savedShipment,
                previousStatus,
                savedShipment.getStatus(),
                employee,
                employeeBranch));

        LOGGER.info(
                "shipment status changed employeeId={} branchId={} "
                        + "shipmentId={} previousStatus={} newStatus={}",
                employeeId,
                employeeBranch.getId(),
                shipmentId,
                previousStatus,
                savedShipment.getStatus());

        return EmployeeShipmentResponse.from(
                savedShipment,
                employeeBranch);
    }

    private Shipment findShipment(
            UUID shipmentId,
            Branch employeeBranch) {
        return shipmentRepository.findByIdForBranch(
                shipmentId,
                employeeBranch.getId())
                .orElseThrow(ShipmentNotFoundException::new);
    }

    private Branch findEmployeeBranch(UUID employeeId) {
        return requireActiveBranch(findEmployee(employeeId));
    }

    private User findEmployee(UUID employeeId) {
        return userRepository.findById(employeeId)
                .orElseThrow(UserNotFoundException::new);
    }

    private Branch requireActiveBranch(User employee) {
        Branch branch = employee.getBranch();

        if (employee.getRole() != UserRole.EMPLOYEE
                || branch == null
                || !branch.isActive()) {
            throw new EmployeeBranchRequiredException();
        }

        return branch;
    }

    private String normalizeReference(String reference) {
        if (reference == null || reference.isBlank()) {
            return null;
        }

        return reference.strip();
    }
}
