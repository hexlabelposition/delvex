CREATE TABLE shipments (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL,
    reference_number VARCHAR(40) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'CREATED',
    origin_country VARCHAR(2) NOT NULL,
    origin_city VARCHAR(100) NOT NULL,
    origin_postal_code VARCHAR(20) NOT NULL,
    origin_address VARCHAR(255) NOT NULL,
    destination_country VARCHAR(2) NOT NULL,
    destination_city VARCHAR(100) NOT NULL,
    destination_postal_code VARCHAR(20) NOT NULL,
    destination_address VARCHAR(255) NOT NULL,
    cargo_description VARCHAR(500) NOT NULL,
    weight_kg NUMERIC(10, 2) NOT NULL,
    pickup_at TIMESTAMPTZ,
    delivery_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_shipments_user
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT uq_shipments_reference_number UNIQUE (reference_number),
    CONSTRAINT chk_shipments_status
        CHECK (status IN ('CREATED', 'IN_TRANSIT', 'DELIVERED', 'CANCELLED')),
    CONSTRAINT chk_shipments_weight CHECK (weight_kg > 0),
    CONSTRAINT chk_shipments_schedule
        CHECK (pickup_at IS NULL OR delivery_at IS NULL OR delivery_at >= pickup_at)
);

CREATE INDEX idx_shipments_user_created_at
    ON shipments (user_id, created_at DESC);
