DROP TABLE shipment_status_events;

DROP INDEX idx_users_branch;

ALTER TABLE users
    DROP CONSTRAINT fk_users_branch,
    DROP CONSTRAINT chk_users_role,
    DROP COLUMN branch_id,
    DROP COLUMN role;

ALTER TABLE shipments
    DROP CONSTRAINT fk_shipments_current_branch,
    DROP COLUMN current_branch_id;
