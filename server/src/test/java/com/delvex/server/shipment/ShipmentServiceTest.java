package com.delvex.server.shipment;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import com.delvex.server.shipment.dto.CreateShipmentRequest;
import com.delvex.server.shipment.dto.UpdateShipmentRequest;
import com.delvex.server.user.User;
import com.delvex.server.user.UserRepository;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.BDDMockito.given;
import static org.mockito.BDDMockito.then;

@ExtendWith(MockitoExtension.class)
class ShipmentServiceTest {
    @Mock private ShipmentRepository shipmentRepository;
    @Mock private UserRepository userRepository;
    private ShipmentService shipmentService;

    @BeforeEach
    void setUp() { shipmentService = new ShipmentService(shipmentRepository, userRepository); }

    @Test
    void shouldCreateShipmentFromFixedLocations() {
        UUID userId = UUID.randomUUID();
        given(userRepository.findById(userId)).willReturn(Optional.of(user(userId)));
        given(shipmentRepository.saveAndFlush(any())).willAnswer(invocation -> {
            Shipment shipment = invocation.getArgument(0);
            ReflectionTestUtils.setField(shipment, "id", UUID.randomUUID());
            return shipment;
        });

        var response = shipmentService.create(userId, createRequest());

        assertThat(response.originCountry()).isEqualTo("PL");
        assertThat(response.originCity()).isEqualTo("Warszawa");
        assertThat(response.destinationCity()).isEqualTo("Gdańsk");
    }

    @Test
    void shouldRejectUnknownLocation() {
        UUID userId = UUID.randomUUID();
        given(userRepository.findById(userId)).willReturn(Optional.of(user(userId)));
        assertThatThrownBy(() -> shipmentService.create(userId, new CreateShipmentRequest(
                "UNKNOWN", "GDANSK", "Books", new BigDecimal("1.00"), null, null)))
                .isInstanceOf(InvalidShipmentLocationException.class);
    }

    @Test
    void shouldRejectUpdateWhenProcessingHasStarted() {
        UUID userId = UUID.randomUUID();
        Shipment shipment = shipment(user(userId));
        ReflectionTestUtils.setField(shipment, "status", ShipmentStatus.IN_TRANSIT);
        given(shipmentRepository.findByIdAndUser_Id(shipment.getId(), userId)).willReturn(Optional.of(shipment));

        assertThatThrownBy(() -> shipmentService.update(userId, shipment.getId(),
                new UpdateShipmentRequest("KRAKOW", null, null, null, null, null)))
                .isInstanceOf(InvalidShipmentStateException.class)
                .hasMessage("IN_TRANSIT shipments cannot be updated");
    }

    @Test
    void shouldOnlyDeleteCreatedShipment() {
        UUID userId = UUID.randomUUID();
        Shipment shipment = shipment(user(userId));
        ReflectionTestUtils.setField(shipment, "status", ShipmentStatus.CANCELLED);
        given(shipmentRepository.findByIdAndUser_Id(shipment.getId(), userId)).willReturn(Optional.of(shipment));

        assertThatThrownBy(() -> shipmentService.delete(userId, shipment.getId()))
                .isInstanceOf(InvalidShipmentStateException.class);
    }

    private CreateShipmentRequest createRequest() { return new CreateShipmentRequest("WARSAW", "GDANSK", "Books", new BigDecimal("1.00"), Instant.parse("2026-08-06T10:00:00Z"), Instant.parse("2026-08-07T10:00:00Z")); }
    private User user(UUID id) { User user = new User("john@example.com", "hash", "John", "Doe"); ReflectionTestUtils.setField(user, "id", id); return user; }
    private Shipment shipment(User user) { Shipment shipment = new Shipment(user, "DLX-11111111-1111-1111-1111-111111111111", ShipmentLocation.WARSAW, ShipmentLocation.GDANSK, "Books", new BigDecimal("1.00"), null, null); ReflectionTestUtils.setField(shipment, "id", UUID.randomUUID()); return shipment; }
}
