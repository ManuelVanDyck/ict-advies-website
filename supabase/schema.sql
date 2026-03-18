-- Supabase Schema for ICT-Advies Opdrachtensysteem
-- Run this in the SQL Editor: https://supabase.com/dashboard/project/sddepssclfnmelilxijh/sql

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Opdracht inzendingen tabel
CREATE TABLE opdracht_inzendingen (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  
  -- Koppeling met gebruiker (via NextAuth)
  user_email TEXT NOT NULL,
  user_name TEXT,
  
  -- Koppeling met tutorial/opdracht
  tutorial_id TEXT NOT NULL,
  tutorial_slug TEXT NOT NULL,
  opdracht_titel TEXT NOT NULL,
  
  -- Inzending data
  sheet_url TEXT NOT NULL,
  
  -- AI Correctie resultaat
  score INTEGER,
  feedback TEXT,
  correctie_data JSONB,
  
  -- Status
  status TEXT DEFAULT 'ingediend' CHECK (status IN ('ingediend', 'bezig', 'voltooid', 'mislukt')),
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Index for faster queries
CREATE INDEX idx_opdracht_inzendingen_user ON opdracht_inzendingen(user_email);
CREATE INDEX idx_opdracht_inzendingen_tutorial ON opdracht_inzendingen(tutorial_id);

-- Row Level Security (RLS)
ALTER TABLE opdracht_inzendingen ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own submissions
CREATE POLICY "Users can view own submissions" ON opdracht_inzendingen
  FOR SELECT USING (user_email = auth.jwt() ->> 'email');

-- Policy: Users can insert their own submissions
CREATE POLICY "Users can insert own submissions" ON opdracht_inzendingen
  FOR INSERT WITH CHECK (user_email = auth.jwt() ->> 'email');

-- Policy: Service role can do everything (for backend)
CREATE POLICY "Service role full access" ON opdracht_inzendingen
  FOR ALL USING (auth.role() = 'service_role');

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update updated_at
CREATE TRIGGER update_opdracht_inzendingen_updated_at
  BEFORE UPDATE ON opdracht_inzendingen
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- Opdracht Voortgang Tabel (Nieuw - 18/03/2026)
-- ============================================================

-- Opdracht voortgang tabel
-- Trackt voortgang van leerkrachten per opdracht
CREATE TABLE IF NOT EXISTS opdracht_voortgang (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
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

-- Trigger voor updated_at (hergebruik bestaande functie)
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
  USING (user_email = auth.jwt() ->> 'email');

-- Users kunnen hun eigen voortgang aanmaken
CREATE POLICY "Users can insert own progress"
  ON opdracht_voortgang
  FOR INSERT
  WITH CHECK (user_email = auth.jwt() ->> 'email');

-- Users kunnen hun eigen voortgang updaten
CREATE POLICY "Users can update own progress"
  ON opdracht_voortgang
  FOR UPDATE
  USING (user_email = auth.jwt() ->> 'email');

-- Service role kan alles (voor admin endpoints)
CREATE POLICY "Service role full access on voortgang"
  ON opdracht_voortgang
  FOR ALL USING (auth.role() = 'service_role');
