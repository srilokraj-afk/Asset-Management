CREATE TABLE asset_requests (
 id UUID PRIMARY KEY,
 employee VARCHAR(100) NOT NULL,
 employee_name VARCHAR(150) NOT NULL,
 department VARCHAR(100) NOT NULL,
 asset_type VARCHAR(50) NOT NULL,
 reason VARCHAR(1000) NOT NULL,
 priority VARCHAR(20) NOT NULL,
 required_date DATE,
 comments VARCHAR(1000),
 status VARCHAR(20) NOT NULL,
 rejection_reason VARCHAR(1000),
 approved_by VARCHAR(100),
 approved_at TIMESTAMPTZ,
 assigned_asset_id UUID REFERENCES assets(id) ON DELETE SET NULL,
 assigned_asset_tag VARCHAR(100),
 created_at TIMESTAMPTZ NOT NULL,
 updated_at TIMESTAMPTZ NOT NULL,
 CONSTRAINT chk_request_status CHECK(status IN ('PENDING','APPROVED','REJECTED'))
);
CREATE INDEX idx_asset_requests_employee ON asset_requests(employee,created_at DESC);
CREATE INDEX idx_asset_requests_status ON asset_requests(status,created_at DESC);
CREATE TABLE audit_logs (
 id UUID PRIMARY KEY,
 actor VARCHAR(100) NOT NULL,
 action VARCHAR(100) NOT NULL,
 entity_type VARCHAR(100) NOT NULL,
 entity_id VARCHAR(100) NOT NULL,
 details VARCHAR(2000),
 created_at TIMESTAMPTZ NOT NULL
);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at DESC);
CREATE TABLE notifications (
 id UUID PRIMARY KEY,
 username VARCHAR(100) NOT NULL,
 title VARCHAR(200) NOT NULL,
 message VARCHAR(1000) NOT NULL,
 read_flag BOOLEAN NOT NULL DEFAULT FALSE,
 created_at TIMESTAMPTZ NOT NULL
);
CREATE INDEX idx_notifications_username_created_at ON notifications(username,created_at DESC);
