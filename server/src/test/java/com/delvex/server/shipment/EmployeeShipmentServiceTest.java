package com.delvex.server.shipment;

import java.math.BigDecimal;
import java.util.Optional;
import java.util.UUID;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import com.delvex.server.shipment.dto.UpdateShipmentStatusRequest;
import com.delvex.server.user.User;
import com.delvex.server.user.UserRepository;
import com.delvex.server.user.UserRole;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
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
        User employee = user(employeeId, UserRole.EMPLOYEE);
        Shipment shipment = shipment(user(
                UUID.randomUUID(),
                UserRole.CUSTOMER));
        UUID shipmentId = shipment.getId();

        given(userRepository.findById(employeeId))
                .willReturn(Optional.of(employee));
        given(shipmentRepository.findById(shipmentId))
                .willReturn(Optional.of(shipment));
        given(shipmentRepository.saveAndFlush(shipment))
                .willReturn(shipment);

        var response = shipmentService.updateStatus(
                employeeId,
                shipmentId,
                new UpdateShipmentStatusRequest(
                        ShipmentStatus.ACCEPTED,
                        0L));

        assertThat(response.shipment().status())
                .isEqualTo(ShipmentStatus.ACCEPTED);

        ArgumentCaptor<ShipmentStatusEvent> eventCaptor =
                ArgumentCaptor.forClass(ShipmentStatusEvent.class);
        then(eventRepository).should().save(eventCaptor.capture());

        ShipmentStatusEvent event = eventCaptor.getValue();
        assertThat(event.getPreviousStatus())
                .isEqualTo(ShipmentStatus.CREATED);
        assertThat(event.getNewStatus())
                .isEqualTo(ShipmentStatus.ACCEPTED);
        assertThat(event.getChangedBy()).isSameAs(employee);
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
                        UserRole.EMPLOYEE)));
        given(shipmentRepository.findById(shipment.getId()))
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
                        UserRole.EMPLOYEE)));
        given(shipmentRepository.findById(shipment.getId()))
                .willReturn(Optional.of(shipment));

        assertThatThrownBy(() -> shipmentService.updateStatus(
                employeeId,
                shipment.getId(),
                new UpdateShipmentStatusRequest(
                        ShipmentStatus.ACCEPTED,
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
                        UserRole.EMPLOYEE)));
        given(shipmentRepository.findById(shipment.getId()))
                .willReturn(Optional.of(shipment));

        var response = shipmentService.updateStatus(
                employeeId,
                shipment.getId(),
                new UpdateShipmentStatusRequest(
                        ShipmentStatus.CREATED,
                        0L));

        assertThat(response.shipment().status())
                .isEqualTo(ShipmentStatus.CREATED);
        then(shipmentRepository).should().findById(shipment.getId());
        then(eventRepository).shouldHaveNoInteractions();
    }

    private User user(UUID id, UserRole role) {
        User user = new User(
                "user-" + id + "@example.com",
                "hash",
                "John",
                "Doe");
        ReflectionTestUtils.setField(user, "id", id);
        ReflectionTestUtils.setField(user, "role", role);
        return user;
    }

    private Shipment shipment(User customer) {
        Shipment shipment = new Shipment(
                customer,
                "DLX-11111111-1111-1111-1111-111111111111",
                ShipmentLocation.WARSAW,
                ShipmentLocation.GDANSK,
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
}
