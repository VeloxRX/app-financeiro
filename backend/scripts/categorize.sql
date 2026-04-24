DO $$
DECLARE
    uid UUID;
    cat_residenciais UUID;
    cat_cartoes UUID;
BEGIN
    -- Get User
    SELECT id INTO uid FROM users LIMIT 1;

    -- Create/Get "Contas Residenciais"
    SELECT id INTO cat_residenciais FROM categories WHERE name = 'Contas Residenciais' AND user_id = uid LIMIT 1;
    IF cat_residenciais IS NULL THEN
        cat_residenciais := gen_random_uuid();
        INSERT INTO categories (id, user_id, name, icon, color) 
        VALUES (cat_residenciais, uid, 'Contas Residenciais', '🏠', '#3b82f6');
    END IF;

    -- Create/Get "Cartão de Crédito"
    SELECT id INTO cat_cartoes FROM categories WHERE name = 'Cartões de Crédito' AND user_id = uid LIMIT 1;
    IF cat_cartoes IS NULL THEN
        cat_cartoes := gen_random_uuid();
        INSERT INTO categories (id, user_id, name, icon, color) 
        VALUES (cat_cartoes, uid, 'Cartões de Crédito', '💳', '#8b5cf6');
    END IF;

    -- Update existing
    UPDATE transactions SET category_id = cat_residenciais WHERE user_id = uid AND description IN ('Energia', 'Água');
    UPDATE transactions SET category_id = cat_cartoes WHERE user_id = uid AND description IN ('Cartão Neon', 'Cartão Nubank', 'Cartão PicPay');

    -- Insert Internet
    INSERT INTO transactions (id, user_id, type, amount, description, recurrence, date, category_id)
    VALUES (gen_random_uuid(), uid, 'expense', 0.01, 'Internet', 'monthly', CURRENT_DATE, cat_residenciais);

END $$;
