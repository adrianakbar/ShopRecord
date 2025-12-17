## 3️⃣ Fitur Utama Website

### A. Fitur AI (Fokus & Minimal)

#### 🤖 1. Auto Parsing Pengeluaran (Gemini)
**Input:**
> “beli dada ayam mentah 19 rb kemarin”

**Output:**
- Item
- Harga
- Kategori
- Tanggal

📌 Mendukung **multi transaksi dalam satu input**

---

### B. Fitur Input & Manajemen Data

#### ✍️ 2. Form Input Cepat
- 1 textarea untuk input *natural language*
- Tombol **Proses AI**

---

#### 🧾 3. Review & Edit Hasil AI
Hasil pemrosesan AI ditampilkan dalam **tabel yang dapat diedit**, meliputi:
- Item
- Harga
- Kategori (dropdown)
- Tanggal (date picker)

⚠️ Fitur ini wajib disediakan agar pengguna tetap memiliki kontrol penuh terhadap data sebelum disimpan.

---

#### 📂 4. Riwayat Pengeluaran
- Tabel daftar pengeluaran
- Data dikelompokkan berdasarkan tanggal (*group by date*)
- Menampilkan total pengeluaran per hari

---

#### 🔍 5. Filter & Search
Pengguna dapat melakukan penyaringan data berdasarkan:
- Kategori
- Tanggal
- Rentang harga

---

### C. Visualisasi & Insight (Non-AI)

#### 📊 6. Dashboard Ringkas
Menampilkan ringkasan pengeluaran:
- Total pengeluaran hari ini
- Total pengeluaran bulan ini
- Kategori dengan pengeluaran terbesar

---

#### 📈 7. Grafik Pengeluaran
- **Pie Chart** untuk distribusi pengeluaran per kategori
- **Bar Chart** untuk pengeluaran harian atau bulanan

---

### D. Budget & Kontrol Keuangan

#### 💰 8. Budget per Kategori
- Pengaturan budget bulanan per kategori
- Tampilan *progress bar* penggunaan budget
- Notifikasi atau peringatan ketika budget hampir habis

---

### E. Fitur Pendukung (Nilai Tambah)

#### 🧩 9. Template Transaksi
- Menyimpan hasil transaksi (termasuk hasil AI) sebagai template
- Input transaksi cepat dengan **1 klik**

---

#### 📤 10. Export Data
- Ekspor data ke format **CSV / Excel**
- Pembuatan laporan **PDF bulanan**

---

#### 🔐 11. Autentikasi User
- Fitur **Login / Register**
- Data pengeluaran tersimpan dan terpisah untuk setiap pengguna

---

#### 🌙 12. UX & Aksesibilitas
- Mode gelap (*dark mode*)
- Tampilan **responsif** dan optimal untuk perangkat mobile