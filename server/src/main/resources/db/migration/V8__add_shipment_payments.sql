CREATE TABLE payments (
    id UUID PRIMARY KEY,
    shipment_id UUID NOT NULL UNIQUE,
    method VARCHAR(20) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'UNPAID',
    amount NUMERIC(10, 2) NOT NULL,
    currency VARCHAR(3) NOT NULL DEFAULT 'PLN',
    provider_checkout_session_id VARCHAR(255) UNIQUE,
    provider_payment_intent_id VARCHAR(255) UNIQUE,
    paid_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_payments_shipment
        FOREIGN KEY (shipment_id) REFERENCES shipments(id) ON DELETE CASCADE,
    CONSTRAINT chk_payments_method
        CHECK (method IN ('CARD', 'AT_BRANCH')),
    CONSTRAINT chk_payments_status
        CHECK (status IN ('UNPAID', 'PROCESSING', 'PAID', 'FAILED', 'REFUNDED')),
    CONSTRAINT chk_payments_amount CHECK (amount > 0)
);

INSERT INTO payments (id, shipment_id, method, status, amount, currency)
SELECT gen_random_uuid(), id, 'AT_BRANCH', 'UNPAID',
       CASE
           WHEN weight_kg <= 10 THEN 29.00
           WHEN weight_kg <= 20 THEN 49.00
           ELSE 79.00
       END,
       'PLN'
FROM shipments;
