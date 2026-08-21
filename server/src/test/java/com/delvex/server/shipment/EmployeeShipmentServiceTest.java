package com.delvex.server.shipment;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.test.util.ReflectionTestUtils;

import com.delvex.server.branch.Branch;
import com.delvex.server.branch.EmployeeBranchRequiredException;
import com.delvex.server.shipment.dto.UpdateShipmentStatusRequest;
import com.delvex.server.user.User;
import com.delvex.server.user.UserRepository;
import com.delvex.server.user.UserRole;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.ArgumentMatchers.isNull;
import static org.mockito.BDDMockito.given;
import static org.mockito.BDDMockito.then;

@ExtendWith(MockitoExtension.class)
class EmployeeShipmentServiceTest {

    @Mock
    private ShipmentRepository shipmentRepository;

    @Mock
    private ShipmentStatusEventRepository eventRepository;

    @Mock
    private UserRepository userRepository;

    private EmployeeShipmentService shipmentService;

    @BeforeEach
    void setUp() {
        shipmentService = new EmployeeShipmentService(
                shipmentRepository,
                eventRepository,
                userRepository);
    }

    @Test
    void shouldAcceptCreatedShipmentAndRecordEmployee() {
        UUID employeeId = UUID.randomUUID();
        Shipment shipment = shipment(user(
                UUID.randomUUID(),
                UserRole.CUSTOMER));
        User employee = user(
                employeeId,
                UserRole.EMPLOYEE,
                shipment.getOriginBranch());
        UUID shipmentId = shipment.getId();

        given(userRepository.findById(employeeId))
                .willReturn(Optional.of(employee));
        given(shipmentRepository.findByIdForBranch(
                shipmentId,
                shipment.getOriginBranch().getId()))
                .willReturn(Optional.of(shipment));
        given(shipmentRepository.saveAndFlush(shipment))
                .willReturn(shipment);

        var response = shipmentService.updateStatus(
                employeeId,
                shipmentId,
                new UpdateShipmentStatusRequest(
                        ShipmentStatus.ACCEPTED_AT_ORIGIN,
                        0L));

        assertThat(response.shipment().status())
                .isEqualTo(ShipmentStatus.ACCEPTED_AT_ORIGIN);
        assertThat(response.allowedStatuses())
                .containsExactly(
                        ShipmentStatus.IN_TRANSIT,
                        ShipmentStatus.CANCELLED);

        ArgumentCaptor<ShipmentStatusEvent> eventCaptor =
                ArgumentCaptor.forClass(ShipmentStatusEvent.class);
        then(eventRepository).should().save(eventCaptor.capture());

        ShipmentStatusEvent event = eventCaptor.getValue();
        assertThat(event.getPreviousStatus())
                .isEqualTo(ShipmentStatus.CREATED);
        assertThat(event.getNewStatus())
                .isEqualTo(ShipmentStatus.ACCEPTED_AT_ORIGIN);
        assertThat(event.getChangedBy()).isSameAs(employee);
        assertThat(event.getBranch()).isSameAs(shipment.getOriginBranch());
    }

    @Test
    void shouldListOnlyShipmentsSelectedForEmployeeBranch() {
        UUID employeeId = UUID.randomUUID();
        Shipment shipment = shipment(user(
                UUID.randomUUID(),
                UserRole.CUSTOMER));
        Branch branch = shipment.getOriginBranch();
        User employee = user(
                employeeId,
                UserRole.EMPLOYEE,
                branch);

        given(userRepository.findById(employeeId))
                .willReturn(Optional.of(employee));
        given(shipmentRepository.findAllForBranch(
                eq(branch.getId()),
                isNull(),
                eq("DLX-11"),
                any(Pageable.class)))
                .willReturn(new PageImpl<>(List.of(shipment)));

        var response = shipmentService.findAll(
                employeeId,
                null,
                "  DLX-11  ",
                0,
                20);

        assertThat(response.content()).hasSize(1);
        assertThat(response.content().getFirst().shipment().id())
                .isEqualTo(shipment.getId());
    }

    @Test
    void shouldRejectSkippedStatusTransition() {
        UUID employeeId = UUID.randomUUID();
        Shipment shipment = shipment(user(
                UUID.randomUUID(),
                UserRole.CUSTOMER));

        given(userRepository.findById(employeeId))
                .willReturn(Optional.of(user(
                        employeeId,
                        UserRole.EMPLOYEE,
                        shipment.getOriginBranch())));
        given(shipmentRepository.findByIdForBranch(
                shipment.getId(),
                shipment.getOriginBranch().getId()))
                .willReturn(Optional.of(shipment));

        assertThatThrownBy(() -> shipmentService.updateStatus(
                employeeId,
                shipment.getId(),
                new UpdateShipmentStatusRequest(
                        ShipmentStatus.IN_TRANSIT,
                        0L)))
                .isInstanceOf(InvalidShipmentStateException.class)
                .hasMessage(
                        "CREATED shipments cannot transition to IN_TRANSIT");

        then(eventRepository).shouldHaveNoInteractions();
    }

    @Test
    void shouldRejectStaleShipmentVersion() {
        UUID employeeId = UUID.randomUUID();
        Shipment shipment = shipment(user(
                UUID.randomUUID(),
                UserRole.CUSTOMER));
        ReflectionTestUtils.setField(shipment, "version", 3L);

        given(userRepository.findById(employeeId))
                .willReturn(Optional.of(user(
                        employeeId,
                        UserRole.EMPLOYEE,
                        shipment.getOriginBranch())));
        given(shipmentRepository.findByIdForBranch(
                shipment.getId(),
                shipment.getOriginBranch().getId()))
                .willReturn(Optional.of(shipment));

        assertThatThrownBy(() -> shipmentService.updateStatus(
                employeeId,
                shipment.getId(),
                new UpdateShipmentStatusRequest(
                        ShipmentStatus.ACCEPTED_AT_ORIGIN,
                        2L)))
                .isInstanceOf(StaleShipmentVersionException.class);

        then(eventRepository).shouldHaveNoInteractions();
    }

    @Test
    void shouldKeepIdempotentStatusUpdateOutOfHistory() {
        UUID employeeId = UUID.randomUUID();
        Shipment shipment = shipment(user(
                UUID.randomUUID(),
                UserRole.CUSTOMER));

        given(userRepository.findById(employeeId))
                .willReturn(Optional.of(user(
                        employeeId,
                        UserRole.EMPLOYEE,
                        shipment.getOriginBranch())));
        given(shipmentRepository.findByIdForBranch(
                shipment.getId(),
                shipment.getOriginBranch().getId()))
                .willReturn(Optional.of(shipment));

        var response = shipmentService.updateStatus(
                employeeId,
                shipment.getId(),
                new UpdateShipmentStatusRequest(
                        ShipmentStatus.CREATED,
                        0L));

        assertThat(response.shipment().status())
                .isEqualTo(ShipmentStatus.CREATED);
        then(shipmentRepository).should().findByIdForBranch(
                shipment.getId(),
                shipment.getOriginBranch().getId());
        then(eventRepository).shouldHaveNoInteractions();
    }

    @Test
    void shouldRejectEmployeeWithoutAssignedBranch() {
        UUID employeeId = UUID.randomUUID();
        given(userRepository.findById(employeeId))
                .willReturn(Optional.of(user(
                        employeeId,
                        UserRole.EMPLOYEE)));

        assertThatThrownBy(() -> shipmentService.findById(
                employeeId,
                UUID.randomUUID()))
                .isInstanceOf(EmployeeBranchRequiredException.class)
                .hasMessage("Employee is not assigned to an active branch");

        then(shipmentRepository).shouldHaveNoInteractions();
    }

    @Test
    void shouldRejectEmployeeAssignedToInactiveBranch() {
        UUID employeeId = UUID.randomUUID();
        Branch branch = branch("WARSAW", "Warszawa");
        ReflectionTestUtils.setField(branch, "active", false);
        given(userRepository.findById(employeeId))
                .willReturn(Optional.of(user(
                        employeeId,
                        UserRole.EMPLOYEE,
                        branch)));

        assertThatThrownBy(() -> shipmentService.findById(
                employeeId,
                UUID.randomUUID()))
                .isInstanceOf(EmployeeBranchRequiredException.class)
                .hasMessage("Employee is not assigned to an active branch");

        then(shipmentRepository).shouldHaveNoInteractions();
    }

    @Test
    void shouldHideShipmentOutsideEmployeeBranch() {
        UUID employeeId = UUID.randomUUID();
        UUID shipmentId = UUID.randomUUID();
        Branch employeeBranch = branch("KRAKOW", "Kraków");

        given(userRepository.findById(employeeId))
                .willReturn(Optional.of(user(
                        employeeId,
                        UserRole.EMPLOYEE,
                        employeeBranch)));
        given(shipmentRepository.findByIdForBranch(
                shipmentId,
                employeeBranch.getId()))
                .willReturn(Optional.empty());

        assertThatThrownBy(() -> shipmentService.findById(
                employeeId,
                shipmentId))
                .isInstanceOf(ShipmentNotFoundException.class);

        then(shipmentRepository).should().findByIdForBranch(
                shipmentId,
                employeeBranch.getId());
    }

    @Test
    void shouldHideStatusHistoryOutsideEmployeeBranch() {
        UUID employeeId = UUID.randomUUID();
        UUID shipmentId = UUID.randomUUID();
        Branch employeeBranch = branch("KRAKOW", "Kraków");

        given(userRepository.findById(employeeId))
                .willReturn(Optional.of(user(
                        employeeId,
                        UserRole.EMPLOYEE,
                        employeeBranch)));
        given(shipmentRepository.findByIdForBranch(
                shipmentId,
                employeeBranch.getId()))
                .willReturn(Optional.empty());

        assertThatThrownBy(() -> shipmentService.findStatusEvents(
                employeeId,
                shipmentId))
                .isInstanceOf(ShipmentNotFoundException.class);

        then(eventRepository).shouldHaveNoInteractions();
    }

    @Test
    void shouldRejectOriginTransitionFromDestinationBranch() {
        UUID employeeId = UUID.randomUUID();
        Shipment shipment = shipment(user(
                UUID.randomUUID(),
                UserRole.CUSTOMER));
        Branch destinationBranch = shipment.getDestinationBranch();

        given(userRepository.findById(employeeId))
                .willReturn(Optional.of(user(
                        employeeId,
                        UserRole.EMPLOYEE,
                        destinationBranch)));
        given(shipmentRepository.findByIdForBranch(
                shipment.getId(),
                destinationBranch.getId()))
                .willReturn(Optional.of(shipment));

        assertThatThrownBy(() -> shipmentService.updateStatus(
                employeeId,
                shipment.getId(),
                new UpdateShipmentStatusRequest(
                        ShipmentStatus.ACCEPTED_AT_ORIGIN,
                        0L)))
                .isInstanceOf(InvalidShipmentStateException.class)
                .hasMessage(
                        "Shipment transition is not allowed from this branch");

        then(eventRepository).shouldHaveNoInteractions();
    }

    private User user(UUID id, UserRole role) {
        return user(id, role, null);
    }

    private User user(UUID id, UserRole role, Branch branch) {
        User user = new User(
                "user-" + id + "@example.com",
                "hash",
                "John",
                "Doe");
        ReflectionTestUtils.setField(user, "id", id);
        ReflectionTestUtils.setField(user, "role", role);
        ReflectionTestUtils.setField(user, "branch", branch);
        return user;
    }

    private Shipment shipment(User customer) {
        Shipment shipment = new Shipment(
                customer,
                "DLX-11111111-1111-1111-1111-111111111111",
                branch("WARSAW", "Warszawa"),
                branch("GDANSK", "Gdańsk"),
                "Books",
                new BigDecimal("1.00"),
                null,
                null);
        ReflectionTestUtils.setField(
                shipment,
                "id",
                UUID.randomUUID());
        return shipment;
    }

    private Branch branch(String code, String city) {
        Branch branch = new Branch(
                code,
                city + " Central",
                "PL",
                city,
                "00-001",
                "Main 1");
        ReflectionTestUtils.setField(branch, "id", UUID.randomUUID());
        return branch;
    }
}
