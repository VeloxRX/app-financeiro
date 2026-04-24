DO $$
DECLARE
    uid UUID;
    cat_id UUID;
    now_date DATE := CURRENT_DATE;
BEGIN
    SELECT id INTO uid FROM users LIMIT 1;
    SELECT id INTO cat_id FROM categories WHERE name = 'Aluguel' LIMIT 1;
    
    INSERT INTO transactions (id, user_id, type, amount, description, recurrence, date, category_id) VALUES 
    (gen_random_uuid(), uid, 'expense', 0.01, 'Aluguel', 'monthly', now_date, cat_id),
    (gen_random_uuid(), uid, 'expense', 0.01, 'Energia', 'monthly', now_date, NULL),
    (gen_random_uuid(), uid, 'expense', 0.01, 'Água', 'monthly', now_date, NULL),
    (gen_random_uuid(), uid, 'expense', 0.01, 'Cartão Neon', 'monthly', now_date, NULL),
    (gen_random_uuid(), uid, 'expense', 0.01, 'Cartão Nubank', 'monthly', now_date, NULL),
    (gen_random_uuid(), uid, 'expense', 0.01, 'Cartão PicPay', 'monthly', now_date, NULL);
END $$;
