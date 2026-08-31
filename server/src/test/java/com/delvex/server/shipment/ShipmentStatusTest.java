package com.delvex.server.shipment;

import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class ShipmentStatusTest {

    @Test
    void shouldOnlyAllowCreatedShipmentsToBeDeleted() {
        assertThat(ShipmentStatus.CREATED.canBeDeleted()).isTrue();
        assertThat(ShipmentStatus.CANCELLED.canBeDeleted()).isFalse();
        assertThat(ShipmentStatus.IN_TRANSIT.canBeDeleted()).isFalse();
        assertThat(ShipmentStatus.ACCEPTED_AT_ORIGIN.canBeDeleted()).isFalse();
        assertThat(ShipmentStatus.ARRIVED_AT_DESTINATION.canBeDeleted()).isFalse();
        assertThat(ShipmentStatus.DELIVERED.canBeDeleted()).isFalse();
    }
}
