ALTER TABLE asset_requests DROP CONSTRAINT IF EXISTS chk_request_status;
ALTER TABLE asset_requests ADD CONSTRAINT chk_request_status CHECK(status IN ('PENDING','UNDER_REVIEW','APPROVAL_PENDING','APPROVED','IN_PROGRESS','COMPLETED','REJECTED','CLOSED'));

CREATE TABLE workflow_requests (
 id UUID PRIMARY KEY,
 request_no VARCHAR(40) NOT NULL UNIQUE,
 workflow_type VARCHAR(30) NOT NULL,
 status VARCHAR(30) NOT NULL,
 stage VARCHAR(40) NOT NULL,
 requester_username VARCHAR(100) NOT NULL,
 requester_name VARCHAR(150) NOT NULL,
 employee_name VARCHAR(150),
 employee_id VARCHAR(100),
 department VARCHAR(100),
 asset_type VARCHAR(100),
 reason VARCHAR(2000),
 priority VARCHAR(20),
 required_date DATE,
 items_json TEXT,
 estimated_cost_minor BIGINT,
 currency VARCHAR(10) DEFAULT 'INR',
 budget_minor BIGINT,
 vendor_name VARCHAR(200),
 purchase_order_no VARCHAR(100),
 goods_receipt_no VARCHAR(100),
 rejection_reason VARCHAR(2000),
 closed_at TIMESTAMPTZ,
 created_at TIMESTAMPTZ NOT NULL,
 updated_at TIMESTAMPTZ NOT NULL,
 CONSTRAINT chk_workflow_type CHECK(workflow_type IN ('PROCUREMENT','ONBOARDING','SECONDARY','MAINTENANCE')),
 CONSTRAINT chk_workflow_status CHECK(status IN ('PENDING','UNDER_REVIEW','APPROVAL_PENDING','APPROVED','IN_PROGRESS','COMPLETED','REJECTED','CLOSED'))
);
CREATE INDEX idx_workflow_requests_stage ON workflow_requests(stage, status, created_at DESC);
CREATE INDEX idx_workflow_requests_requester ON workflow_requests(requester_username, created_at DESC);

CREATE TABLE workflow_approvals (
 id UUID PRIMARY KEY,
 request_id UUID NOT NULL REFERENCES workflow_requests(id) ON DELETE CASCADE,
 approver_role VARCHAR(30) NOT NULL,
 approver_username VARCHAR(100),
 decision VARCHAR(20) NOT NULL DEFAULT 'PENDING',
 comments VARCHAR(2000),
 decided_at TIMESTAMPTZ,
 created_at TIMESTAMPTZ NOT NULL,
 CONSTRAINT chk_workflow_decision CHECK(decision IN ('PENDING','APPROVED','REJECTED','RETURNED'))
);
CREATE INDEX idx_workflow_approvals_request ON workflow_approvals(request_id, created_at);

CREATE TABLE asset_reservations (
 id UUID PRIMARY KEY,
 request_id UUID NOT NULL REFERENCES workflow_requests(id) ON DELETE CASCADE,
 asset_id UUID NOT NULL REFERENCES assets(id) ON DELETE CASCADE,
 reserved_for VARCHAR(150) NOT NULL,
 status VARCHAR(20) NOT NULL DEFAULT 'RESERVED',
 reserved_at TIMESTAMPTZ NOT NULL,
 released_at TIMESTAMPTZ,
 UNIQUE(request_id, asset_id),
 CONSTRAINT chk_reservation_status CHECK(status IN ('RESERVED','RELEASED','ALLOCATED'))
);
CREATE INDEX idx_asset_reservations_asset ON asset_reservations(asset_id, status);

CREATE TABLE purchase_orders (
 id UUID PRIMARY KEY,
 request_id UUID NOT NULL REFERENCES workflow_requests(id) ON DELETE CASCADE,
 po_number VARCHAR(100) NOT NULL UNIQUE,
 vendor_name VARCHAR(200) NOT NULL,
 amount_minor BIGINT,
 currency VARCHAR(10) DEFAULT 'INR',
 status VARCHAR(30) NOT NULL DEFAULT 'CREATED',
 created_at TIMESTAMPTZ NOT NULL,
 updated_at TIMESTAMPTZ NOT NULL
);

CREATE TABLE goods_receipts (
 id UUID PRIMARY KEY,
 request_id UUID NOT NULL REFERENCES workflow_requests(id) ON DELETE CASCADE,
 po_id UUID REFERENCES purchase_orders(id) ON DELETE SET NULL,
 grn_number VARCHAR(100) NOT NULL UNIQUE,
 received_quantity INTEGER NOT NULL,
 condition VARCHAR(100),
 received_at TIMESTAMPTZ NOT NULL,
 inspected BOOLEAN NOT NULL DEFAULT FALSE,
 notes VARCHAR(2000)
);

CREATE TABLE maintenance_tickets (
 id UUID PRIMARY KEY,
 request_id UUID REFERENCES workflow_requests(id) ON DELETE SET NULL,
 asset_id UUID NOT NULL REFERENCES assets(id) ON DELETE CASCADE,
 reported_by VARCHAR(100) NOT NULL,
 issue_description VARCHAR(2000) NOT NULL,
 diagnosis VARCHAR(2000),
 repairable BOOLEAN,
 resolution VARCHAR(2000),
 status VARCHAR(30) NOT NULL DEFAULT 'REPORTED',
 created_at TIMESTAMPTZ NOT NULL,
 updated_at TIMESTAMPTZ NOT NULL
);
CREATE INDEX idx_maintenance_asset ON maintenance_tickets(asset_id, created_at DESC);
ALTER TABLE app_users DROP CONSTRAINT IF EXISTS chk_app_users_role;
ALTER TABLE app_users ADD CONSTRAINT chk_app_users_role CHECK(role IN ('ADMIN','EMPLOYEE','HR','MANAGER','FINANCE','VP','PROCUREMENT'));
