"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.autoCategorizeTransaction = autoCategorizeTransaction;
exports.detectAnomalousSpending = detectAnomalousSpending;
exports.generateMonthlyInsight = generateMonthlyInsight;
exports.forecastBalance = forecastBalance;
exports.generateSavingsTips = generateSavingsTips;
const database_1 = require("../../config/database");
/**
 * AI Service — Local statistical analysis for financial intelligence.
 * Uses keyword matching, historical averages, and trend analysis.
 */
// Category keyword mapping for auto-categorization
const CATEGORY_KEYWORDS = {
    'Alimentação': ['mercado', 'supermercado', 'restaurante', 'lanche', 'pizza', 'ifood', 'padaria', 'açougue', 'feira', 'comida', 'almoço', 'jantar', 'café', 'uber eats', 'rappi'],
    'Transporte': ['uber', '99', 'gasolina', 'combustível', 'estacionamento', 'pedágio', 'ônibus', 'metrô', 'táxi', 'passagem', 'ipva', 'seguro auto'],
    'Moradia': ['aluguel', 'condomínio', 'luz', 'energia', 'água', 'gás', 'internet', 'telefone', 'reforma', 'casa', 'apartamento', 'imobiliária'],
    'Saúde': ['farmácia', 'médico', 'hospital', 'exame', 'consulta', 'dentista', 'plano de saúde', 'academia', 'suplemento', 'psicólogo'],
    'Educação': ['curso', 'faculdade', 'escola', 'livro', 'udemy', 'coursera', 'material escolar', 'mensalidade', 'treinamento'],
    'Lazer': ['cinema', 'netflix', 'spotify', 'show', 'festa', 'bar', 'entretenimento', 'jogo', 'ingresso', 'parque', 'diversão'],
    'Vestuário': ['roupa', 'calçado', 'sapato', 'tênis', 'camisa', 'loja', 'shopping', 'moda', 'acessório'],
    'Serviços': ['conta', 'tarifa', 'taxa', 'serviço', 'manutenção', 'conserto', 'assinatura', 'plano'],
    'Investimentos': ['investimento', 'ação', 'fundo', 'cdb', 'tesouro', 'poupança', 'bitcoin', 'cripto', 'renda fixa'],
    'Salário': ['salário', 'pagamento', 'holerite', 'remuneração', 'pró-labore'],
    'Freelance': ['freelance', 'projeto', 'consultoria', 'serviço prestado', 'comissão'],
    'Assinaturas': ['assinatura', 'mensalidade', 'plano mensal', 'streaming', 'prime', 'hbo', 'disney'],
    'Viagens': ['viagem', 'hotel', 'hospedagem', 'passagem aérea', 'airbnb', 'mala', 'turismo'],
    'Pets': ['pet', 'veterinário', 'ração', 'pet shop', 'animal'],
};
/**
 * 1. Auto-categorize transaction based on description keywords.
 * Matches against user history first, then falls back to keyword classifier.
 */
async function autoCategorizeTransaction(description, amount, userId) {
    const descLower = description.toLowerCase();
    // First: check user's historical categorization
    const historical = await (0, database_1.query)(`SELECT category_id, COUNT(*) as cnt FROM transactions
     WHERE user_id = $1 AND LOWER(description) = $2 AND category_id IS NOT NULL
     GROUP BY category_id ORDER BY cnt DESC LIMIT 1`, [userId, descLower]);
    if (historical.length > 0) {
        return { category_id: historical[0].category_id, confidence_score: 0.95 };
    }
    // Second: keyword matching
    let bestMatch = null;
    let bestScore = 0;
    for (const [catName, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
        for (const keyword of keywords) {
            if (descLower.includes(keyword.toLowerCase())) {
                const score = keyword.length / descLower.length;
                if (score > bestScore) {
                    bestScore = score;
                    bestMatch = catName;
                }
            }
        }
    }
    if (bestMatch) {
        const cat = await (0, database_1.query)("SELECT id FROM categories WHERE name = $1 AND (user_id = $2 OR is_system = TRUE) LIMIT 1", [bestMatch, userId]);
        if (cat[0]) {
            return { category_id: cat[0].id, confidence_score: Math.min(bestScore + 0.5, 0.85) };
        }
    }
    // Fallback: "Outros"
    const outros = await (0, database_1.query)("SELECT id FROM categories WHERE name = 'Outros' AND is_system = TRUE LIMIT 1");
    return { category_id: outros[0]?.id || null, confidence_score: 0.1 };
}
/**
 * 2. Detect anomalous spending by comparing with 90-day historical average.
 */
async function detectAnomalousSpending(transaction, userId) {
    if (transaction.type !== 'expense') {
        return { is_anomalous: false, avg_historical: 0, deviation_percent: 0 };
    }
    const stats = await (0, database_1.query)(`SELECT AVG(amount) as avg, COALESCE(STDDEV(amount), 0) as stddev
     FROM transactions
     WHERE user_id = $1 AND category_id = $2 AND type = 'expense'
       AND date >= CURRENT_DATE - 90`, [userId, transaction.category_id]);
    const avg = parseFloat(stats[0]?.avg || '0');
    const stddev = parseFloat(stats[0]?.stddev || '0');
    if (avg === 0)
        return { is_anomalous: false, avg_historical: 0, deviation_percent: 0 };
    const threshold = avg + 2 * stddev;
    const deviationPct = ((transaction.amount - avg) / avg) * 100;
    return {
        is_anomalous: transaction.amount > threshold,
        avg_historical: Math.round(avg * 100) / 100,
        deviation_percent: Math.round(deviationPct),
    };
}
/**
 * 3. Generate monthly insight — analyzes spending and returns markdown text.
 */
async function generateMonthlyInsight(userId, month, year) {
    // Check cached insight first
    const cached = await (0, database_1.query)('SELECT insight FROM ai_insights WHERE user_id = $1 AND month = $2 AND year = $3', [userId, month, year]);
    if (cached[0])
        return cached[0].insight;
    const monthStart = `${year}-${String(month).padStart(2, '0')}-01`;
    const monthEnd = new Date(year, month, 0).toISOString().split('T')[0];
    // Current month data
    const currentData = await (0, database_1.query)(`SELECT type, COALESCE(SUM(amount), 0) as total FROM transactions
     WHERE user_id = $1 AND date >= $2 AND date <= $3 GROUP BY type`, [userId, monthStart, monthEnd]);
    const income = parseFloat(currentData.find(d => d.type === 'income')?.total || '0');
    const expenses = parseFloat(currentData.find(d => d.type === 'expense')?.total || '0');
    // Top expense categories
    const topCats = await (0, database_1.query)(`SELECT c.name, SUM(t.amount) as total FROM transactions t
     JOIN categories c ON t.category_id = c.id
     WHERE t.user_id = $1 AND t.type = 'expense' AND t.date >= $2 AND t.date <= $3
     GROUP BY c.name ORDER BY total DESC LIMIT 3`, [userId, monthStart, monthEnd]);
    // Compare with previous month
    const prevMonth = month === 1 ? 12 : month - 1;
    const prevYear = month === 1 ? year - 1 : year;
    const prevStart = `${prevYear}-${String(prevMonth).padStart(2, '0')}-01`;
    const prevEnd = new Date(prevYear, prevMonth, 0).toISOString().split('T')[0];
    const prevExpenses = await (0, database_1.query)(`SELECT COALESCE(SUM(amount), 0) as total FROM transactions
     WHERE user_id = $1 AND type = 'expense' AND date >= $2 AND date <= $3`, [userId, prevStart, prevEnd]);
    const prevTotal = parseFloat(prevExpenses[0]?.total || '0');
    const expenseChange = prevTotal > 0 ? ((expenses - prevTotal) / prevTotal) * 100 : 0;
    // Build insight
    const parts = [];
    if (income > 0) {
        const savingsRate = ((income - expenses) / income * 100).toFixed(1);
        parts.push(`💰 Sua taxa de poupança este mês é de **${savingsRate}%**.`);
    }
    if (topCats.length > 0) {
        const topList = topCats.map(c => `${c.name} (R$ ${parseFloat(c.total).toFixed(2)})`).join(', ');
        parts.push(`📊 Seus maiores gastos foram em: ${topList}.`);
    }
    if (prevTotal > 0) {
        const changeDir = expenseChange > 0 ? 'aumentaram' : 'diminuíram';
        parts.push(`📈 Seus gastos ${changeDir} **${Math.abs(expenseChange).toFixed(1)}%** em relação ao mês anterior.`);
    }
    if (expenses > income && income > 0) {
        parts.push(`⚠️ **Atenção**: seus gastos superaram suas receitas em R$ ${(expenses - income).toFixed(2)}. Considere revisar gastos não essenciais.`);
    }
    else if (income > 0) {
        parts.push(`✅ Parabéns! Você conseguiu poupar R$ ${(income - expenses).toFixed(2)} este mês.`);
    }
    const insight = parts.join('\n\n');
    // Cache the insight
    if (parts.length > 0) {
        await (0, database_1.query)(`INSERT INTO ai_insights (id, user_id, month, year, insight)
       VALUES (gen_random_uuid(), $1, $2, $3, $4)
       ON CONFLICT (user_id, month, year) DO UPDATE SET insight = $4, generated_at = NOW()`, [userId, month, year, insight]);
    }
    return insight || '📊 Ainda não há dados suficientes para gerar insights. Continue registrando suas transações!';
}
/**
 * 4. Forecast future balance using weighted moving average.
 */
async function forecastBalance(userId, daysAhead) {
    // Get last 180 days of daily net (income - expense)
    const history = await (0, database_1.query)(`SELECT date,
       SUM(CASE WHEN type = 'income' THEN amount ELSE -amount END) as net
     FROM transactions WHERE user_id = $1 AND date >= CURRENT_DATE - 180
     GROUP BY date ORDER BY date`, [userId]);
    if (history.length < 7)
        return [];
    // Calculate weighted moving average (recent days weighted more)
    const nets = history.map(h => parseFloat(h.net));
    const avgDaily = nets.reduce((sum, val, idx) => {
        const weight = (idx + 1) / nets.length;
        return sum + val * weight;
    }, 0) / nets.reduce((_, __, idx) => _ + (idx + 1) / nets.length, 0);
    // Get current balance
    const balanceResult = await (0, database_1.query)(`SELECT COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE -amount END), 0) as balance
     FROM transactions WHERE user_id = $1`, [userId]);
    let currentBalance = parseFloat(balanceResult[0]?.balance || '0');
    const forecast = [];
    for (let i = 1; i <= daysAhead; i++) {
        const date = new Date();
        date.setDate(date.getDate() + i);
        currentBalance += avgDaily;
        forecast.push({
            date: date.toISOString().split('T')[0],
            predicted_balance: Math.round(currentBalance * 100) / 100,
            confidence: Math.max(0.5, 1 - (i / daysAhead) * 0.5),
        });
    }
    return forecast;
}
/**
 * 5. Generate savings tips based on spending patterns.
 */
async function generateSavingsTips(userId) {
    const spending = await (0, database_1.query)(`SELECT c.name, AVG(t.amount) as avg, SUM(t.amount) as total
     FROM transactions t JOIN categories c ON t.category_id = c.id
     WHERE t.user_id = $1 AND t.type = 'expense' AND t.date >= CURRENT_DATE - 90
     GROUP BY c.name ORDER BY total DESC LIMIT 5`, [userId]);
    const tips = [];
    const tipMessages = {
        'Alimentação': 'Considere cozinhar mais em casa e preparar marmitas. Planeje suas compras no mercado com uma lista.',
        'Transporte': 'Avalie usar transporte público em alguns dias ou compartilhar corridas com colegas.',
        'Lazer': 'Busque opções de lazer gratuitas na sua cidade e aproveite promoções de streaming.',
        'Assinaturas': 'Revise suas assinaturas ativas e cancele as que não usa frequentemente.',
        'Vestuário': 'Aproveite liquidações sazonais e defina um orçamento mensal fixo para roupas.',
        'Serviços': 'Compare prestadores de serviço e negocie contratos anuais para obter descontos.',
    };
    for (const cat of spending) {
        const avgMonthly = parseFloat(cat.avg);
        const potentialSaving = avgMonthly * 0.15; // 15% reduction target
        tips.push({
            category: cat.name,
            current_avg: Math.round(avgMonthly * 100) / 100,
            potential_saving: Math.round(potentialSaving * 100) / 100,
            tip: tipMessages[cat.name] || `Analise seus gastos em ${cat.name} e defina um teto mensal.`,
        });
    }
    return tips;
}
//# sourceMappingURL=ai.service.js.map