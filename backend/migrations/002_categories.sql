-- Migration 002: Categories table
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  icon VARCHAR(50),
  color CHAR(7),
  monthly_budget DECIMAL(12,2),
  is_system BOOLEAN DEFAULT FALSE
);

CREATE INDEX idx_categories_user ON categories(user_id);
