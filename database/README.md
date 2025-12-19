# Database Setup Guide - ShopRecord

## 📋 Overview

Database ini dirancang untuk mendukung semua fitur ShopRecord:
- ✅ Auto Parsing Pengeluaran (AI)
- ✅ Manajemen Kategori
- ✅ Budget Tracking per Kategori
- ✅ Template Transaksi
- ✅ Riwayat & Filter Pengeluaran
- ✅ Dashboard & Visualisasi
- ✅ User Preferences
- ✅ Multi-user Support dengan RLS

## 🗂️ Struktur Tabel

### 1. **categories**
Menyimpan kategori pengeluaran untuk setiap user.

**Kolom:**
- `id` - UUID primary key
- `user_id` - Reference ke auth.users
- `name` - Nama kategori (e.g., "Makanan", "Transportasi")
- `icon` - Nama icon untuk UI
- `color` - Hex color code untuk visual
- `created_at`, `updated_at` - Timestamps

**Default Categories:**
Setiap user baru otomatis mendapat 8 kategori default:
- Makanan & Minuman 🍔
- Transportasi 🚗
- Belanja 🛒
- Hiburan 🎬
- Kesehatan 🏥
- Tagihan 📄
- Pendidikan 📚
- Lainnya ⋯

---

### 2. **expenses**
Tabel utama untuk menyimpan semua pengeluaran.

**Kolom:**
- `id` - UUID primary key
- `user_id` - Reference ke auth.users
- `category_id` - Reference ke categories
- `item` - Nama item yang dibeli
- `amount` - Jumlah uang (decimal)
- `expense_date` - Tanggal pengeluaran
- `notes` - Catatan tambahan
- `is_template` - Flag untuk template transaksi
- `created_at`, `updated_at` - Timestamps

**Indexes:**
- User ID untuk query cepat per user
- Date untuk filter berdasarkan tanggal
- Category untuk grouping
- Template flag untuk quick access

---

### 3. **budgets**
Budget per kategori per bulan.

**Kolom:**
- `id` - UUID primary key
- `user_id` - Reference ke auth.users
- `category_id` - Reference ke categories
- `amount` - Budget amount
- `month`, `year` - Periode budget
- `alert_threshold` - Persentase untuk warning (default 80%)
- `created_at`, `updated_at` - Timestamps

**Use Case:**
- Set budget Makanan: Rp 1.000.000/bulan
- Alert ketika sudah 80% (Rp 800.000)

---

### 4. **templates**
Template transaksi favorit untuk quick add.

**Kolom:**
- `id` - UUID primary key
- `user_id` - Reference ke auth.users
- `category_id` - Reference ke categories
- `name` - Nama template
- `item` - Item name
- `amount` - Default amount (bisa null)
- `notes` - Default notes
- `usage_count` - Tracking berapa kali digunakan
- `last_used_at` - Timestamp terakhir digunakan

**Contoh Template:**
- "Kopi Pagi" → Rp 15.000, Kategori: Makanan
- "Bensin Motor" → Rp 50.000, Kategori: Transportasi

---

### 5. **ai_parsing_logs**
Log untuk tracking AI parsing (debugging & analytics).

**Kolom:**
- `id` - UUID primary key
- `user_id` - Reference ke auth.users
- `input_text` - Text yang di-parse
- `parsed_result` - JSON hasil parsing
- `success` - Boolean success/fail
- `error_message` - Error jika gagal
- `processing_time_ms` - Performance tracking
- `created_at` - Timestamp

**Use Case:**
- Debugging AI parsing issues
- Analytics untuk improve model
- User feedback tracking

---

### 6. **user_preferences**
Preferensi user (dark mode, currency, dll).

**Kolom:**
- `user_id` - Primary key, reference ke auth.users
- `dark_mode` - Boolean (default: true)
- `currency` - Currency code (default: 'IDR')
- `date_format` - Format tanggal preference
- `default_category_id` - Default category untuk quick add
- `notifications_enabled` - Boolean untuk notifikasi
- `created_at`, `updated_at` - Timestamps

---

## 🔐 Row Level Security (RLS)

Setiap tabel dilindungi dengan RLS policies:
- User hanya bisa **SELECT**, **INSERT**, **UPDATE**, **DELETE** data mereka sendiri
- Automatic filtering by `auth.uid() = user_id`
- Security enforced at database level

---

## 📊 Views untuk Query Optimization

### **expenses_with_category**
Join expenses dengan categories untuk menampilkan nama kategori.

### **daily_expense_summary**
Summary pengeluaran per hari (count, total, categories used).

### **monthly_category_expenses**
Total pengeluaran per kategori per bulan.

---

## 🚀 Setup Instructions

### Option 1: Via Supabase Dashboard (Recommended)

1. **Login ke Supabase Dashboard**
   - Buka [https://app.supabase.com](https://app.supabase.com)
   - Pilih project Anda

2. **Buka SQL Editor**
   - Sidebar → SQL Editor → New Query

3. **Copy & Run Schema**
   - Copy seluruh isi `database/schema.sql`
   - Paste ke SQL Editor
   - Klik **Run** atau tekan `Ctrl+Enter`

4. **Verify**
   - Cek Table Editor untuk melihat tabel yang baru dibuat
   - Coba register user baru untuk test default categories

### Option 2: Via Supabase CLI

```bash
# Install Supabase CLI (jika belum)
npm install -g supabase

# Login
supabase login

# Link ke project
supabase link --project-ref your-project-ref

# Run migration
supabase db push
```

---

## 🧪 Testing Database

### 1. Test Default Categories
```sql
-- Register user baru via auth, lalu cek:
SELECT * FROM categories WHERE user_id = 'your-user-id';
-- Harusnya ada 8 kategori default
```

### 2. Test Insert Expense
```sql
INSERT INTO expenses (user_id, category_id, item, amount, expense_date)
VALUES (
    auth.uid(),
    (SELECT id FROM categories WHERE name = 'Makanan & Minuman' LIMIT 1),
    'Nasi Goreng',
    25000,
    CURRENT_DATE
);
```

### 3. Test Budget Tracking
```sql
-- Set budget
INSERT INTO budgets (user_id, category_id, amount, month, year)
VALUES (
    auth.uid(),
    (SELECT id FROM categories WHERE name = 'Makanan & Minuman' LIMIT 1),
    1000000,
    EXTRACT(MONTH FROM CURRENT_DATE),
    EXTRACT(YEAR FROM CURRENT_DATE)
);

-- Check progress
SELECT 
    c.name,
    b.amount as budget,
    COALESCE(SUM(e.amount), 0) as spent,
    ROUND((COALESCE(SUM(e.amount), 0) / b.amount * 100), 2) as percentage
FROM budgets b
JOIN categories c ON b.category_id = c.id
LEFT JOIN expenses e ON e.category_id = c.id 
    AND e.user_id = b.user_id
    AND EXTRACT(MONTH FROM e.expense_date) = b.month
WHERE b.user_id = auth.uid()
GROUP BY c.name, b.amount;
```

---

## 📝 TypeScript Types

Buat file `types/database.ts` untuk type safety:

```typescript
export type Category = {
  id: string;
  user_id: string;
  name: string;
  icon: string | null;
  color: string | null;
  created_at: string;
  updated_at: string;
};

export type Expense = {
  id: string;
  user_id: string;
  category_id: string | null;
  item: string;
  amount: number;
  expense_date: string;
  notes: string | null;
  is_template: boolean;
  created_at: string;
  updated_at: string;
};

export type Budget = {
  id: string;
  user_id: string;
  category_id: string | null;
  amount: number;
  month: number;
  year: number;
  alert_threshold: number;
  created_at: string;
  updated_at: string;
};

export type Template = {
  id: string;
  user_id: string;
  category_id: string | null;
  name: string;
  item: string;
  amount: number | null;
  notes: string | null;
  usage_count: number;
  last_used_at: string | null;
  created_at: string;
  updated_at: string;
};

export type UserPreferences = {
  user_id: string;
  dark_mode: boolean;
  currency: string;
  date_format: string;
  default_category_id: string | null;
  notifications_enabled: boolean;
  created_at: string;
  updated_at: string;
};
```

---

## 🔄 Migration Strategy

Jika perlu update schema di masa depan:

1. **Buat file migration baru**: `database/migrations/001_add_new_feature.sql`
2. **Test di development** terlebih dahulu
3. **Backup production** data
4. **Run migration** di production
5. **Verify** data integrity

---

## 📈 Performance Tips

1. **Indexes sudah ditambahkan** untuk query yang sering digunakan
2. **Views** untuk query kompleks yang sering dipanggil
3. **RLS policies** tetap performant dengan proper indexes
4. Gunakan **pagination** untuk list expenses (LIMIT + OFFSET)
5. **Aggregate functions** untuk dashboard summary

---

## 🛠️ Maintenance

### Cleanup Old AI Logs (Optional)
```sql
-- Delete AI logs older than 3 months
DELETE FROM ai_parsing_logs 
WHERE created_at < NOW() - INTERVAL '3 months';
```

### Update Statistics
```sql
-- Refresh materialized views (if any)
-- REFRESH MATERIALIZED VIEW view_name;
```

---

## 🆘 Troubleshooting

### Issue: RLS blocking queries
**Solution:** Pastikan user sudah login dan `auth.uid()` return valid UUID.

### Issue: Trigger tidak jalan
**Solution:** Cek apakah trigger sudah dibuat dengan `\df` di psql.

### Issue: Foreign key constraint error
**Solution:** Pastikan category_id yang di-insert sudah exists dan belongs to user.

---

## 📞 Support

Jika ada masalah dengan database:
1. Cek Supabase Logs di Dashboard
2. Test query di SQL Editor
3. Verify RLS policies dengan test user
4. Check table permissions
