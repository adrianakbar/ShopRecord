-- =====================================================
-- ShopRecord Database Schema for Supabase
-- =====================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- 1. CATEGORIES TABLE
-- Untuk menyimpan kategori pengeluaran
-- =====================================================
CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    icon VARCHAR(50), -- nama icon untuk UI
    color VARCHAR(7), -- hex color code
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, name)
);

-- Index untuk query yang lebih cepat
CREATE INDEX idx_categories_user_id ON categories(user_id);

-- =====================================================
-- 2. EXPENSES TABLE
-- Tabel utama untuk menyimpan pengeluaran
-- =====================================================
CREATE TABLE expenses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    item VARCHAR(255) NOT NULL,
    amount DECIMAL(15, 2) NOT NULL,
    expense_date DATE NOT NULL,
    notes TEXT,
    is_template BOOLEAN DEFAULT FALSE, -- untuk fitur template transaksi
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes untuk performa query
CREATE INDEX idx_expenses_user_id ON expenses(user_id);
CREATE INDEX idx_expenses_category_id ON expenses(category_id);
CREATE INDEX idx_expenses_date ON expenses(expense_date);
CREATE INDEX idx_expenses_user_date ON expenses(user_id, expense_date);
CREATE INDEX idx_expenses_template ON expenses(user_id, is_template) WHERE is_template = TRUE;

-- =====================================================
-- 3. BUDGETS TABLE
-- Untuk menyimpan budget per kategori per bulan
-- =====================================================
CREATE TABLE budgets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    category_id UUID REFERENCES categories(id) ON DELETE CASCADE,
    amount DECIMAL(15, 2) NOT NULL,
    month INTEGER NOT NULL CHECK (month >= 1 AND month <= 12),
    year INTEGER NOT NULL CHECK (year >= 2000),
    alert_threshold INTEGER DEFAULT 80 CHECK (alert_threshold >= 0 AND alert_threshold <= 100), -- persentase untuk alert
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, category_id, month, year)
);

-- Index
CREATE INDEX idx_budgets_user_id ON budgets(user_id);
CREATE INDEX idx_budgets_period ON budgets(user_id, year, month);

-- =====================================================
-- 4. TEMPLATES TABLE
-- Untuk menyimpan template transaksi favorit
-- =====================================================
CREATE TABLE templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    name VARCHAR(255) NOT NULL,
    item VARCHAR(255) NOT NULL,
    amount DECIMAL(15, 2),
    notes TEXT,
    usage_count INTEGER DEFAULT 0,
    last_used_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index
CREATE INDEX idx_templates_user_id ON templates(user_id);
CREATE INDEX idx_templates_usage ON templates(user_id, usage_count DESC);

-- =====================================================
-- 5. AI_PARSING_LOGS TABLE
-- Untuk tracking dan debugging AI parsing
-- =====================================================
CREATE TABLE ai_parsing_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    input_text TEXT NOT NULL,
    parsed_result JSONB, -- hasil parsing dalam format JSON
    success BOOLEAN DEFAULT TRUE,
    error_message TEXT,
    processing_time_ms INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index
CREATE INDEX idx_ai_logs_user_id ON ai_parsing_logs(user_id);
CREATE INDEX idx_ai_logs_created ON ai_parsing_logs(created_at DESC);

-- =====================================================
-- 6. USER_PREFERENCES TABLE
-- Untuk menyimpan preferensi user (dark mode, dll)
-- =====================================================
CREATE TABLE user_preferences (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    dark_mode BOOLEAN DEFAULT TRUE,
    currency VARCHAR(3) DEFAULT 'IDR',
    date_format VARCHAR(20) DEFAULT 'DD/MM/YYYY',
    default_category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    notifications_enabled BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- Memastikan user hanya bisa akses data mereka sendiri
-- =====================================================

-- Enable RLS
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_parsing_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

-- Categories Policies
CREATE POLICY "Users can view their own categories" 
    ON categories FOR SELECT 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own categories" 
    ON categories FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own categories" 
    ON categories FOR UPDATE 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own categories" 
    ON categories FOR DELETE 
    USING (auth.uid() = user_id);

-- Expenses Policies
CREATE POLICY "Users can view their own expenses" 
    ON expenses FOR SELECT 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own expenses" 
    ON expenses FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own expenses" 
    ON expenses FOR UPDATE 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own expenses" 
    ON expenses FOR DELETE 
    USING (auth.uid() = user_id);

-- Budgets Policies
CREATE POLICY "Users can view their own budgets" 
    ON budgets FOR SELECT 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own budgets" 
    ON budgets FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own budgets" 
    ON budgets FOR UPDATE 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own budgets" 
    ON budgets FOR DELETE 
    USING (auth.uid() = user_id);

-- Templates Policies
CREATE POLICY "Users can view their own templates" 
    ON templates FOR SELECT 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own templates" 
    ON templates FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own templates" 
    ON templates FOR UPDATE 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own templates" 
    ON templates FOR DELETE 
    USING (auth.uid() = user_id);

-- AI Parsing Logs Policies
CREATE POLICY "Users can view their own AI logs" 
    ON ai_parsing_logs FOR SELECT 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own AI logs" 
    ON ai_parsing_logs FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

-- User Preferences Policies
CREATE POLICY "Users can view their own preferences" 
    ON user_preferences FOR SELECT 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own preferences" 
    ON user_preferences FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own preferences" 
    ON user_preferences FOR UPDATE 
    USING (auth.uid() = user_id);

-- =====================================================
-- FUNCTIONS & TRIGGERS
-- =====================================================

-- Function untuk update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers untuk auto-update updated_at
CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON categories
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_expenses_updated_at BEFORE UPDATE ON expenses
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_budgets_updated_at BEFORE UPDATE ON budgets
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_templates_updated_at BEFORE UPDATE ON templates
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_preferences_updated_at BEFORE UPDATE ON user_preferences
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- VIEWS untuk Query yang Sering Digunakan
-- =====================================================

-- View untuk expenses dengan nama kategori
CREATE OR REPLACE VIEW expenses_with_category AS
SELECT 
    e.id,
    e.user_id,
    e.item,
    e.amount,
    e.expense_date,
    e.notes,
    e.is_template,
    e.created_at,
    e.updated_at,
    c.id as category_id,
    c.name as category_name,
    c.icon as category_icon,
    c.color as category_color
FROM expenses e
LEFT JOIN categories c ON e.category_id = c.id;

-- View untuk total pengeluaran per hari
CREATE OR REPLACE VIEW daily_expense_summary AS
SELECT 
    user_id,
    expense_date,
    COUNT(*) as transaction_count,
    SUM(amount) as total_amount,
    array_agg(DISTINCT category_id) as categories_used
FROM expenses
GROUP BY user_id, expense_date;

-- View untuk total pengeluaran per kategori per bulan
CREATE OR REPLACE VIEW monthly_category_expenses AS
SELECT 
    user_id,
    category_id,
    EXTRACT(YEAR FROM expense_date) as year,
    EXTRACT(MONTH FROM expense_date) as month,
    COUNT(*) as transaction_count,
    SUM(amount) as total_amount
FROM expenses
GROUP BY user_id, category_id, year, month;

-- =====================================================
-- DEFAULT CATEGORIES untuk User Baru
-- Function untuk insert default categories saat user register
-- =====================================================
CREATE OR REPLACE FUNCTION create_default_categories()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO categories (user_id, name, icon, color) VALUES
        (NEW.id, 'Makanan & Minuman', 'fastfood', '#FF6B6B'),
        (NEW.id, 'Transportasi', 'directions_car', '#4ECDC4'),
        (NEW.id, 'Belanja', 'shopping_cart', '#95E1D3'),
        (NEW.id, 'Hiburan', 'movie', '#F38181'),
        (NEW.id, 'Kesehatan', 'local_hospital', '#AA96DA'),
        (NEW.id, 'Tagihan', 'receipt_long', '#FCBAD3'),
        (NEW.id, 'Pendidikan', 'school', '#A8D8EA'),
        (NEW.id, 'Lainnya', 'more_horiz', '#9E9E9E');
    
    INSERT INTO user_preferences (user_id) VALUES (NEW.id);
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger untuk auto-create default categories
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION create_default_categories();

-- =====================================================
-- HELPFUL QUERIES (untuk reference)
-- =====================================================

-- Total pengeluaran hari ini per user
-- SELECT user_id, SUM(amount) as total
-- FROM expenses
-- WHERE expense_date = CURRENT_DATE
-- GROUP BY user_id;

-- Total pengeluaran bulan ini per user
-- SELECT user_id, SUM(amount) as total
-- FROM expenses
-- WHERE EXTRACT(YEAR FROM expense_date) = EXTRACT(YEAR FROM CURRENT_DATE)
--   AND EXTRACT(MONTH FROM expense_date) = EXTRACT(MONTH FROM CURRENT_DATE)
-- GROUP BY user_id;

-- Kategori dengan pengeluaran terbesar bulan ini
-- SELECT c.name, SUM(e.amount) as total
-- FROM expenses e
-- JOIN categories c ON e.category_id = c.id
-- WHERE e.user_id = 'user-uuid-here'
--   AND EXTRACT(YEAR FROM e.expense_date) = EXTRACT(YEAR FROM CURRENT_DATE)
--   AND EXTRACT(MONTH FROM e.expense_date) = EXTRACT(MONTH FROM CURRENT_DATE)
-- GROUP BY c.name
-- ORDER BY total DESC;

-- Progress budget per kategori
-- SELECT 
--     c.name as category,
--     b.amount as budget,
--     COALESCE(SUM(e.amount), 0) as spent,
--     b.amount - COALESCE(SUM(e.amount), 0) as remaining,
--     ROUND((COALESCE(SUM(e.amount), 0) / b.amount * 100), 2) as percentage_used
-- FROM budgets b
-- JOIN categories c ON b.category_id = c.id
-- LEFT JOIN expenses e ON e.category_id = c.id 
--     AND e.user_id = b.user_id
--     AND EXTRACT(YEAR FROM e.expense_date) = b.year
--     AND EXTRACT(MONTH FROM e.expense_date) = b.month
-- WHERE b.user_id = 'user-uuid-here'
--   AND b.year = EXTRACT(YEAR FROM CURRENT_DATE)
--   AND b.month = EXTRACT(MONTH FROM CURRENT_DATE)
-- GROUP BY c.name, b.amount;
