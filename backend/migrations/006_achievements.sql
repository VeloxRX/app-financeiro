-- Migration 006: Achievements table
CREATE TABLE achievements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  badge_code VARCHAR(50) NOT NULL,
  earned_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_achievements_user ON achievements(user_id);
CREATE UNIQUE INDEX idx_achievements_unique ON achievements(user_id, badge_code);
