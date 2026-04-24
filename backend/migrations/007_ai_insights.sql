-- Migration 007: AI Insights cache table
CREATE TABLE ai_insights (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  month INT NOT NULL,
  year INT NOT NULL,
  insight TEXT NOT NULL,
  generated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, month, year)
);
