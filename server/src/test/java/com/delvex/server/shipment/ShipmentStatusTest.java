package com.delvex.server.shipment;

import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class ShipmentStatusTest {

    @Test
    void shouldAllowForwardAndCancellationTransitions() {
        assertThat(ShipmentStatus.CREATED.canTransitionTo(
                ShipmentStatus.IN_TRANSIT))
                .isTrue();
        assertThat(ShipmentStatus.CREATED.canTransitionTo(
                ShipmentStatus.CANCELLED))
                .isTrue();
        assertThat(ShipmentStatus.IN_TRANSIT.canTransitionTo(
                ShipmentStatus.DELIVERED))
                .isTrue();
        assertThat(ShipmentStatus.IN_TRANSIT.canTransitionTo(
                ShipmentStatus.CANCELLED))
                .isTrue();
    }

    @Test
    void shouldRejectSkippedBackwardAndTerminalTransitions() {
        assertThat(ShipmentStatus.CREATED.canTransitionTo(
                ShipmentStatus.DELIVERED))
                .isFalse();
        assertThat(ShipmentStatus.IN_TRANSIT.canTransitionTo(
                ShipmentStatus.CREATED))
                .isFalse();
        assertThat(ShipmentStatus.DELIVERED.canTransitionTo(
                ShipmentStatus.IN_TRANSIT))
                .isFalse();
        assertThat(ShipmentStatus.CANCELLED.canTransitionTo(
                ShipmentStatus.CREATED))
                .isFalse();
    }

    @Test
    void shouldIdentifyTerminalAndDeletableStatuses() {
        assertThat(ShipmentStatus.DELIVERED.isTerminal()).isTrue();
        assertThat(ShipmentStatus.CANCELLED.isTerminal()).isTrue();
        assertThat(ShipmentStatus.CREATED.isTerminal()).isFalse();
        assertThat(ShipmentStatus.IN_TRANSIT.isTerminal()).isFalse();

        assertThat(ShipmentStatus.CREATED.canBeDeleted()).isTrue();
        assertThat(ShipmentStatus.CANCELLED.canBeDeleted()).isTrue();
        assertThat(ShipmentStatus.IN_TRANSIT.canBeDeleted()).isFalse();
        assertThat(ShipmentStatus.DELIVERED.canBeDeleted()).isFalse();
    }
}
