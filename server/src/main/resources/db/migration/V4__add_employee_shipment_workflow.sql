ALTER TABLE users
    ADD COLUMN role VARCHAR(20) NOT NULL DEFAULT 'CUSTOMER',
    ADD CONSTRAINT chk_users_role
        CHECK (role IN ('CUSTOMER', 'EMPLOYEE'));

ALTER TABLE shipments
    ADD COLUMN version BIGINT NOT NULL DEFAULT 0;

ALTER TABLE shipments
    DROP CONSTRAINT chk_shipments_status;

ALTER TABLE shipments
    ADD CONSTRAINT chk_shipments_status
        CHECK (
            status IN (
                'CREATED',
                'ACCEPTED',
                'IN_TRANSIT',
                'DELIVERED',
                'CANCELLED'
            )
        );

CREATE TABLE shipment_status_events (
    id UUID PRIMARY KEY,
    shipment_id UUID NOT NULL,
    previous_status VARCHAR(20) NOT NULL,
    new_status VARCHAR(20) NOT NULL,
    changed_by_user_id UUID NOT NULL,
    changed_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_shipment_status_events_shipment
        FOREIGN KEY (shipment_id)
        REFERENCES shipments(id)
        ON DELETE CASCADE,
    CONSTRAINT fk_shipment_status_events_changed_by
        FOREIGN KEY (changed_by_user_id)
        REFERENCES users(id)
        ON DELETE RESTRICT,
    CONSTRAINT chk_shipment_status_events_previous_status
        CHECK (
            previous_status IN (
                'CREATED',
                'ACCEPTED',
                'IN_TRANSIT',
                'DELIVERED',
                'CANCELLED'
            )
        ),
    CONSTRAINT chk_shipment_status_events_new_status
        CHECK (
            new_status IN (
                'CREATED',
                'ACCEPTED',
                'IN_TRANSIT',
                'DELIVERED',
                'CANCELLED'
            )
        )
);

CREATE INDEX idx_shipments_status_created_at
    ON shipments (status, created_at DESC);

CREATE INDEX idx_shipment_status_events_shipment_changed_at
    ON shipment_status_events (shipment_id, changed_at);
