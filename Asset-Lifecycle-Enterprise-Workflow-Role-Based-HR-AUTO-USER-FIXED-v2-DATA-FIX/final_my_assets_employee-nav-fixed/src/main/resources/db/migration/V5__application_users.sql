CREATE TABLE app_users (
                           id UUID PRIMARY KEY,
                           username VARCHAR(100) NOT NULL,
                           password_hash VARCHAR(128) NOT NULL,
                           role VARCHAR(20) NOT NULL,
                           display_name VARCHAR(150) NOT NULL,
                           email VARCHAR(200),
                           department VARCHAR(100),
                           active BOOLEAN NOT NULL DEFAULT TRUE,
                           created_at TIMESTAMPTZ NOT NULL,
                           CONSTRAINT uk_app_users_username UNIQUE (username),
                           CONSTRAINT chk_app_users_role CHECK (role IN ('ADMIN','EMPLOYEE'))
);

CREATE INDEX idx_app_users_role ON app_users(role);