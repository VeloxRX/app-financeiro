-- Migration 004: Goals table
CREATE TYPE goal_category AS ENUM ('emergency', 'travel', 'purchase', 'investment', 'debt', 'other');
CREATE TYPE goal_status AS ENUM ('active', 'completed', 'paused', 'cancelled');

CREATE TABLE goals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(150) NOT NULL,
  description TEXT,
  target_amount DECIMAL(12,2) NOT NULL,
  current_amount DECIMAL(12,2) DEFAULT 0,
  deadline DATE,
  category goal_category DEFAULT 'other',
  auto_save_amount DECIMAL(12,2),
  color CHAR(7),
  icon VARCHAR(50),
  status goal_status DEFAULT 'active',
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_goals_user_status ON goals(user_id, status);
