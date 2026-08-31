CREATE TABLE branches (
    id UUID PRIMARY KEY,
    code VARCHAR(20) NOT NULL,
    name VARCHAR(100) NOT NULL,
    country VARCHAR(2) NOT NULL,
    city VARCHAR(100) NOT NULL,
    postal_code VARCHAR(20) NOT NULL,
    address VARCHAR(255) NOT NULL,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    CONSTRAINT uq_branches_code UNIQUE (code)
);

INSERT INTO branches (
    id,
    code,
    name,
    country,
    city,
    postal_code,
    address
) VALUES
    (
        '10000000-0000-0000-0000-000000000001',
        'WARSAW',
        'Warsaw Central',
        'PL',
        'Warszawa',
        '00-001',
        'Marszałkowska 1'
    ),
    (
        '10000000-0000-0000-0000-000000000002',
        'KRAKOW',
        'Kraków Central',
        'PL',
        'Kraków',
        '30-001',
        'Floriańska 1'
    ),
    (
        '10000000-0000-0000-0000-000000000003',
        'WROCLAW',
        'Wrocław Central',
        'PL',
        'Wrocław',
        '50-001',
        'Rynek 1'
    ),
    (
        '10000000-0000-0000-0000-000000000004',
        'GDANSK',
        'Gdańsk Central',
        'PL',
        'Gdańsk',
        '80-001',
        'Długi Targ 1'
    );

ALTER TABLE users
    ADD COLUMN branch_id UUID,
    ADD CONSTRAINT fk_users_branch
        FOREIGN KEY (branch_id)
        REFERENCES branches(id)
        ON DELETE RESTRICT;

ALTER TABLE shipments
    ADD COLUMN origin_branch_id UUID,
    ADD COLUMN destination_branch_id UUID,
    ADD COLUMN current_branch_id UUID;

UPDATE shipments shipment
SET origin_branch_id = branch.id
FROM branches branch
WHERE branch.country = shipment.origin_country
    AND branch.city = shipment.origin_city
    AND branch.postal_code = shipment.origin_postal_code
    AND branch.address = shipment.origin_address;

UPDATE shipments shipment
SET destination_branch_id = branch.id
FROM branches branch
WHERE branch.country = shipment.destination_country
    AND branch.city = shipment.destination_city
    AND branch.postal_code = shipment.destination_postal_code
    AND branch.address = shipment.destination_address;

ALTER TABLE shipments
    ALTER COLUMN origin_branch_id SET NOT NULL,
    ALTER COLUMN destination_branch_id SET NOT NULL,
    ADD CONSTRAINT fk_shipments_origin_branch
        FOREIGN KEY (origin_branch_id)
        REFERENCES branches(id)
        ON DELETE RESTRICT,
    ADD CONSTRAINT fk_shipments_destination_branch
        FOREIGN KEY (destination_branch_id)
        REFERENCES branches(id)
        ON DELETE RESTRICT,
    ADD CONSTRAINT fk_shipments_current_branch
        FOREIGN KEY (current_branch_id)
        REFERENCES branches(id)
        ON DELETE RESTRICT;

UPDATE shipments
SET current_branch_id = CASE
    WHEN status = 'IN_TRANSIT' THEN NULL
    WHEN status = 'DELIVERED' THEN destination_branch_id
    ELSE origin_branch_id
END;

ALTER TABLE shipments
    DROP CONSTRAINT chk_shipments_status;

ALTER TABLE shipment_status_events
    DROP CONSTRAINT chk_shipment_status_events_previous_status,
    DROP CONSTRAINT chk_shipment_status_events_new_status;

ALTER TABLE shipments
    ALTER COLUMN status TYPE VARCHAR(30);

ALTER TABLE shipment_status_events
    ALTER COLUMN previous_status TYPE VARCHAR(30),
    ALTER COLUMN new_status TYPE VARCHAR(30),
    ADD COLUMN branch_id UUID,
    ADD CONSTRAINT fk_shipment_status_events_branch
        FOREIGN KEY (branch_id)
        REFERENCES branches(id)
        ON DELETE RESTRICT;

UPDATE shipments
SET status = 'ACCEPTED_AT_ORIGIN'
WHERE status = 'ACCEPTED';

UPDATE shipment_status_events
SET previous_status = 'ACCEPTED_AT_ORIGIN'
WHERE previous_status = 'ACCEPTED';

UPDATE shipment_status_events
SET new_status = 'ACCEPTED_AT_ORIGIN'
WHERE new_status = 'ACCEPTED';

ALTER TABLE shipments
    ADD CONSTRAINT chk_shipments_status
        CHECK (
            status IN (
                'CREATED',
                'ACCEPTED_AT_ORIGIN',
                'IN_TRANSIT',
                'ARRIVED_AT_DESTINATION',
                'DELIVERED',
                'CANCELLED'
            )
        );

ALTER TABLE shipment_status_events
    ADD CONSTRAINT chk_shipment_status_events_previous_status
        CHECK (
            previous_status IN (
                'CREATED',
                'ACCEPTED_AT_ORIGIN',
                'IN_TRANSIT',
                'ARRIVED_AT_DESTINATION',
                'DELIVERED',
                'CANCELLED'
            )
        ),
    ADD CONSTRAINT chk_shipment_status_events_new_status
        CHECK (
            new_status IN (
                'CREATED',
                'ACCEPTED_AT_ORIGIN',
                'IN_TRANSIT',
                'ARRIVED_AT_DESTINATION',
                'DELIVERED',
                'CANCELLED'
            )
        );

CREATE INDEX idx_users_branch
    ON users (branch_id);

CREATE INDEX idx_shipments_origin_branch_status_created_at
    ON shipments (origin_branch_id, status, created_at DESC);

CREATE INDEX idx_shipments_destination_branch_status_created_at
    ON shipments (destination_branch_id, status, created_at DESC);

CREATE INDEX idx_shipment_status_events_branch_changed_at
    ON shipment_status_events (branch_id, changed_at);
