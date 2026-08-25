DROP TABLE shipment_status_events;

DROP INDEX idx_users_branch;
DROP INDEX idx_shipments_origin_branch_status_created_at;
DROP INDEX idx_shipments_destination_branch_status_created_at;

ALTER TABLE users
    DROP CONSTRAINT fk_users_branch,
    DROP CONSTRAINT chk_users_role,
    DROP COLUMN branch_id,
    DROP COLUMN role;

ALTER TABLE shipments
    DROP CONSTRAINT fk_shipments_origin_branch,
    DROP CONSTRAINT fk_shipments_destination_branch,
    DROP CONSTRAINT fk_shipments_current_branch,
    DROP COLUMN origin_branch_id,
    DROP COLUMN destination_branch_id,
    DROP COLUMN current_branch_id;

DROP TABLE branches;
