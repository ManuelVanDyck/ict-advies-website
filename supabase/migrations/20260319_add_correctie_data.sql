-- Add correctie_data column to opdracht_voortgang
ALTER TABLE opdracht_voortgang ADD COLUMN IF NOT EXISTS correctie_data JSONB;
