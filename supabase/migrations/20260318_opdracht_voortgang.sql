-- Opdracht voortgang tabel
-- Trackt voortgang van leerkrachten per opdracht

CREATE TABLE IF NOT EXISTS opdracht_voortgang (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_email TEXT NOT NULL,
  user_name TEXT NOT NULL,
  tutorial_id TEXT NOT NULL,
  tutorial_slug TEXT NOT NULL,
  opdracht_id TEXT NOT NULL,
  opdracht_titel TEXT NOT NULL,
  antwoorden JSONB NOT NULL DEFAULT '{}',
  voltooid BOOLEAN NOT NULL DEFAULT FALSE,
  score INTEGER CHECK (score >= 0 AND score <= 100),
  feedback TEXT,
  pdf_url TEXT,
  status TEXT NOT NULL DEFAULT 'niet_begonnen' CHECK (status IN ('niet_begonnen', 'bezig', 'ingediend', 'gekeurd', 'voltooid')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Indexen voor performantie
CREATE INDEX idx_voortgang_user_email ON opdracht_voortgang(user_email);
CREATE INDEX idx_voortgang_tutorial_id ON opdracht_voortgang(tutorial_id);
CREATE INDEX idx_voortgang_status ON opdracht_voortgang(status);

-- Trigger voor updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_opdracht_voortgang_updated_at
  BEFORE UPDATE ON opdracht_voortgang
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- RLS Policies
ALTER TABLE opdracht_voortgang ENABLE ROW LEVEL SECURITY;

-- Users zien alleen hun eigen voortgang
CREATE POLICY "Users can view own progress"
  ON opdracht_voortgang
  FOR SELECT
  USING (auth.uid()::text = user_email OR user_email IN (
    SELECT email FROM auth.users WHERE id = auth.uid()
  ));

-- Users kunnen hun eigen voortgang aanmaken
CREATE POLICY "Users can insert own progress"
  ON opdracht_voortgang
  FOR INSERT
  WITH CHECK (auth.uid()::text = user_email OR user_email IN (
    SELECT email FROM auth.users WHERE id = auth.uid()
  ));

-- Users kunnen hun eigen voortgang updaten
CREATE POLICY "Users can update own progress"
  ON opdracht_voortgang
  FOR UPDATE
  USING (auth.uid()::text = user_email OR user_email IN (
    SELECT email FROM auth.users WHERE id = auth.uid()
  ));
