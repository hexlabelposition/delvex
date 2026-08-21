package com.delvex.server.shipment;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import com.delvex.server.branch.Branch;
import com.delvex.server.user.User;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class ShipmentBranchWorkflowTest {

    @Test
    void shouldMoveShipmentBetweenOriginAndDestinationBranches() {
        Branch origin = branch("WARSAW");
        Branch destination = branch("GDANSK");
        Shipment shipment = shipment(origin, destination);

        shipment.changeStatus(
                ShipmentStatus.ACCEPTED_AT_ORIGIN,
                0L,
                origin);
        assertThat(shipment.getCurrentBranch()).isSameAs(origin);

        shipment.changeStatus(
                ShipmentStatus.IN_TRANSIT,
                0L,
                origin);
        assertThat(shipment.getCurrentBranch()).isNull();

        shipment.changeStatus(
                ShipmentStatus.ARRIVED_AT_DESTINATION,
                0L,
                destination);
        assertThat(shipment.getCurrentBranch()).isSameAs(destination);

        shipment.changeStatus(
                ShipmentStatus.DELIVERED,
                0L,
                destination);
        assertThat(shipment.getStatus()).isEqualTo(ShipmentStatus.DELIVERED);
        assertThat(shipment.getCurrentBranch()).isSameAs(destination);
    }

    @Test
    void shouldRejectDestinationActionFromOriginBranch() {
        Branch origin = branch("WARSAW");
        Branch destination = branch("GDANSK");
        Shipment shipment = shipment(origin, destination);
        ReflectionTestUtils.setField(
                shipment,
                "status",
                ShipmentStatus.IN_TRANSIT);
        ReflectionTestUtils.setField(shipment, "currentBranch", null);

        assertThatThrownBy(() -> shipment.changeStatus(
                ShipmentStatus.ARRIVED_AT_DESTINATION,
                0L,
                origin))
                .isInstanceOf(InvalidShipmentStateException.class)
                .hasMessage(
                        "Shipment transition is not allowed from this branch");
    }

    @Test
    void shouldExposeOnlyTransitionsOwnedByEachBranch() {
        Branch origin = branch("WARSAW");
        Branch destination = branch("GDANSK");
        Shipment shipment = shipment(origin, destination);

        assertThat(shipment.allowedTransitionsFor(origin))
                .containsExactly(
                        ShipmentStatus.ACCEPTED_AT_ORIGIN,
                        ShipmentStatus.CANCELLED);
        assertThat(shipment.allowedTransitionsFor(destination)).isEmpty();

        shipment.changeStatus(
                ShipmentStatus.ACCEPTED_AT_ORIGIN,
                0L,
                origin);
        shipment.changeStatus(
                ShipmentStatus.IN_TRANSIT,
                0L,
                origin);

        assertThat(shipment.allowedTransitionsFor(origin)).isEmpty();
        assertThat(shipment.allowedTransitionsFor(destination))
                .containsExactly(ShipmentStatus.ARRIVED_AT_DESTINATION);

        shipment.changeStatus(
                ShipmentStatus.ARRIVED_AT_DESTINATION,
                0L,
                destination);

        assertThat(shipment.allowedTransitionsFor(destination))
                .isEqualTo(List.of(ShipmentStatus.DELIVERED));
    }

    private Shipment shipment(Branch origin, Branch destination) {
        User customer = new User(
                "john@example.com",
                "hash",
                "John",
                "Doe");

        return new Shipment(
                customer,
                "DLX-11111111-1111-1111-1111-111111111111",
                origin,
                destination,
                "Books",
                new BigDecimal("1.00"),
                null,
                null);
    }

    private Branch branch(String code) {
        Branch branch = new Branch(
                code,
                code + " Central",
                "PL",
                code,
                "00-001",
                "Main 1");
        ReflectionTestUtils.setField(branch, "id", UUID.randomUUID());
        return branch;
    }
}
