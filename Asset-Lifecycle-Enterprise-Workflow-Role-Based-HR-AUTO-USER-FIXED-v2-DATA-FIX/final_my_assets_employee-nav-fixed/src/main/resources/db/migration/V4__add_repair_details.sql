ALTER TABLE assets ADD COLUMN repair_notes VARCHAR(2000);
ALTER TABLE assets ADD COLUMN repair_started_at TIMESTAMPTZ;
ALTER TABLE assets ADD COLUMN repair_completed_at TIMESTAMPTZ;
