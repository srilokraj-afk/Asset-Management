CREATE TABLE assets (
    id UUID PRIMARY KEY,
    asset_tag VARCHAR(100) NOT NULL UNIQUE,
    asset_type VARCHAR(50) NOT NULL,
    make VARCHAR(100) NOT NULL,
    model VARCHAR(100) NOT NULL,
    serial_number VARCHAR(150) NOT NULL UNIQUE,
    purchase_date DATE,
    warranty_expiry DATE,
    cost_minor BIGINT,
    currency VARCHAR(3),
    condition VARCHAR(50),
    notes VARCHAR(1000),
    status VARCHAR(20) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL,
    CONSTRAINT chk_asset_status CHECK (status IN ('IN_STOCK','ASSIGNED','IN_REPAIR','RETIRED'))
);
CREATE TABLE asset_events (
    id UUID PRIMARY KEY,
    asset_id UUID NOT NULL REFERENCES assets(id) ON DELETE CASCADE,
    from_status VARCHAR(20), to_status VARCHAR(20) NOT NULL,
    actor VARCHAR(150) NOT NULL, changed_at TIMESTAMPTZ NOT NULL,
    CONSTRAINT chk_event_from_status CHECK (from_status IS NULL OR from_status IN ('IN_STOCK','ASSIGNED','IN_REPAIR','RETIRED')),
    CONSTRAINT chk_event_to_status CHECK (to_status IN ('IN_STOCK','ASSIGNED','IN_REPAIR','RETIRED'))
);
CREATE INDEX idx_asset_events_asset_id_changed_at ON asset_events(asset_id,changed_at DESC);
CREATE INDEX idx_assets_status ON assets(status);
