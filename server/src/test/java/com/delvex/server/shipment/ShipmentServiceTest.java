package com.delvex.server.shipment;

import java.math.BigDecimal;
import java.time.Instant;
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
import org.springframework.data.domain.PageRequest;
import org.springframework.test.util.ReflectionTestUtils;

import com.delvex.server.shipment.dto.CreateShipmentRequest;
import com.delvex.server.shipment.dto.ShipmentPageResponse;
import com.delvex.server.shipment.dto.ShipmentResponse;
import com.delvex.server.shipment.dto.UpdateShipmentRequest;
import com.delvex.server.user.User;
import com.delvex.server.user.UserRepository;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.BDDMockito.given;
import static org.mockito.BDDMockito.then;

@ExtendWith(MockitoExtension.class)
class ShipmentServiceTest {

    @Mock
    private ShipmentRepository shipmentRepository;

    @Mock
    private UserRepository userRepository;

    private ShipmentService shipmentService;

    @BeforeEach
    void setUp() {
        shipmentService = new ShipmentService(
                shipmentRepository,
                userRepository);
    }

    @Test
    void shouldCreateShipment() {
        UUID userId = UUID.randomUUID();
        User user = createUser(userId);

        given(userRepository.findById(userId))
                .willReturn(Optional.of(user));
        given(shipmentRepository.saveAndFlush(any(Shipment.class)))
                .willAnswer(invocation -> {
                    Shipment shipment = invocation.getArgument(0);
                    initializeShipment(shipment);
                    return shipment;
                });

        ShipmentResponse response = shipmentService.create(
                userId,
                createRequest());

        assertThat(response.referenceNumber()).startsWith("DLX-");
        assertThat(response.status()).isEqualTo(ShipmentStatus.CREATED);
        assertThat(response.originCountry()).isEqualTo("PL");
        assertThat(response.originCity()).isEqualTo("Legnica");
        assertThat(response.destinationCountry()).isEqualTo("DE");
        assertThat(response.weightKg()).isEqualByComparingTo("12.50");
    }

    @Test
    void shouldReturnPaginatedUserShipments() {
        UUID userId = UUID.randomUUID();
        Shipment shipment = createShipment(createUser(userId));

        given(shipmentRepository.findAllByUser_Id(
                eq(userId),
                any(Pageable.class)))
                .willReturn(new PageImpl<>(
                        List.of(shipment),
                        PageRequest.of(1, 10),
                        25));

        ShipmentPageResponse response = shipmentService.findAll(
                userId,
                1,
                10);

        assertThat(response.content()).hasSize(1);
        assertThat(response.content().getFirst().id())
                .isEqualTo(shipment.getId());
        assertThat(response.page()).isEqualTo(1);
        assertThat(response.size()).isEqualTo(10);
        assertThat(response.totalElements()).isEqualTo(25);
        assertThat(response.totalPages()).isEqualTo(3);

        ArgumentCaptor<Pageable> pageableCaptor = ArgumentCaptor.forClass(
                Pageable.class);

        then(shipmentRepository).should().findAllByUser_Id(
                eq(userId),
                pageableCaptor.capture());

        Pageable pageable = pageableCaptor.getValue();

        assertThat(pageable.getPageNumber()).isEqualTo(1);
        assertThat(pageable.getPageSize()).isEqualTo(10);
        assertThat(pageable.getSort()
                .getOrderFor("createdAt")
                .isDescending())
                .isTrue();
    }

    @Test
    void shouldReturnOwnedShipment() {
        UUID userId = UUID.randomUUID();
        Shipment shipment = createShipment(createUser(userId));

        given(shipmentRepository.findByIdAndUser_Id(
                shipment.getId(),
                userId))
                .willReturn(Optional.of(shipment));

        ShipmentResponse response = shipmentService.findById(
                userId,
                shipment.getId());

        assertThat(response.id()).isEqualTo(shipment.getId());
    }

    @Test
    void shouldPartiallyUpdateOwnedShipment() {
        UUID userId = UUID.randomUUID();
        Shipment shipment = createShipment(createUser(userId));

        given(shipmentRepository.findByIdAndUser_Id(
                shipment.getId(),
                userId))
                .willReturn(Optional.of(shipment));

        ShipmentResponse response = shipmentService.update(
                userId,
                shipment.getId(),
                new UpdateShipmentRequest(
                        ShipmentStatus.IN_TRANSIT,
                        null,
                        null,
                        null,
                        null,
                        null,
                        "  Berlin  ",
                        null,
                        null,
                        null,
                        null,
                        null,
                        null));

        assertThat(response.status()).isEqualTo(ShipmentStatus.IN_TRANSIT);
        assertThat(response.destinationCity()).isEqualTo("Berlin");
        assertThat(response.originCity()).isEqualTo("Legnica");
    }

    @Test
    void shouldDeleteOwnedShipment() {
        UUID userId = UUID.randomUUID();
        Shipment shipment = createShipment(createUser(userId));

        given(shipmentRepository.findByIdAndUser_Id(
                shipment.getId(),
                userId))
                .willReturn(Optional.of(shipment));

        shipmentService.delete(userId, shipment.getId());

        then(shipmentRepository).should().delete(shipment);
    }

    @Test
    void shouldHideUnavailableOrForeignShipment() {
        UUID userId = UUID.randomUUID();
        UUID shipmentId = UUID.randomUUID();

        given(shipmentRepository.findByIdAndUser_Id(shipmentId, userId))
                .willReturn(Optional.empty());

        assertThatThrownBy(() -> shipmentService.findById(userId, shipmentId))
                .isInstanceOf(ShipmentNotFoundException.class)
                .hasMessage("Shipment not found");
    }

    @Test
    void shouldRejectInvalidUpdatedSchedule() {
        UUID userId = UUID.randomUUID();
        Shipment shipment = createShipment(createUser(userId));

        given(shipmentRepository.findByIdAndUser_Id(
                shipment.getId(),
                userId))
                .willReturn(Optional.of(shipment));

        UpdateShipmentRequest request = new UpdateShipmentRequest(
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                Instant.parse("2026-08-05T09:00:00Z"));

        assertThatThrownBy(() -> shipmentService.update(
                userId,
                shipment.getId(),
                request))
                .isInstanceOf(InvalidShipmentScheduleException.class)
                .hasMessage("Delivery time must not be before pickup time");
    }

    private CreateShipmentRequest createRequest() {
        return new CreateShipmentRequest(
                " pl ",
                " Legnica ",
                "59-220",
                "Rynek 1",
                " de ",
                "Berlin",
                "10115",
                "Alexanderplatz 1",
                "Electronics",
                new BigDecimal("12.50"),
                Instant.parse("2026-08-06T10:00:00Z"),
                Instant.parse("2026-08-07T10:00:00Z"));
    }

    private User createUser(UUID userId) {
        User user = new User(
                "john@example.com",
                "password-hash",
                "John",
                "Doe");
        ReflectionTestUtils.setField(user, "id", userId);
        return user;
    }

    private Shipment createShipment(User user) {
        Shipment shipment = new Shipment(
                user,
                "DLX-11111111-1111-1111-1111-111111111111",
                "PL",
                "Legnica",
                "59-220",
                "Rynek 1",
                "DE",
                "Berlin",
                "10115",
                "Alexanderplatz 1",
                "Electronics",
                new BigDecimal("12.50"),
                Instant.parse("2026-08-06T10:00:00Z"),
                Instant.parse("2026-08-07T10:00:00Z"));
        initializeShipment(shipment);
        return shipment;
    }

    private void initializeShipment(Shipment shipment) {
        ReflectionTestUtils.setField(shipment, "id", UUID.randomUUID());
        ReflectionTestUtils.setField(
                shipment,
                "createdAt",
                Instant.parse("2026-08-05T10:00:00Z"));
        ReflectionTestUtils.setField(
                shipment,
                "updatedAt",
                Instant.parse("2026-08-05T10:00:00Z"));
    }
}
