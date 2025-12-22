'use client';

import { useState, useEffect } from 'react';
import Navigation from '@/components/Navigation';

interface Category {
  id: string;
  name: string;
  icon: string | null;
  color: string | null;
}

interface Transaction {
  id: string;
  item: string;
  amount: number;
  expenseDate: string;
  notes: string | null;
  category: Category | null;
}

const DEFAULT_CATEGORIES = [
  { name: 'Makanan & Minuman', icon: 'restaurant', color: '#ef4444' },
  { name: 'Belanjaan', icon: 'shopping_cart', color: '#f97316' },
  { name: 'Transportasi', icon: 'directions_car', color: '#eab308' },
  { name: 'Utilitas', icon: 'receipt_long', color: '#22c55e' },
  { name: 'Hiburan', icon: 'movie', color: '#3b82f6' },
  { name: 'Belanja', icon: 'shopping_bag', color: '#a855f7' },
  { name: 'Kesehatan', icon: 'local_hospital', color: '#ec4899' },
  { name: 'Kopi & Kafe', icon: 'local_cafe', color: '#8b5cf6' },
];

export default function TransactionsPage() {
  // Form state
  const [item, setItem] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');
  
  // UI state
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoadingTransactions, setIsLoadingTransactions] = useState(true);

  // Fetch recent transactions
  useEffect(() => {
    fetchTransactions();
  }, []);

  async function fetchTransactions() {
    try {
      setIsLoadingTransactions(true);
      const response = await fetch('/api/expenses?limit=10');
      
      if (!response.ok) {
        throw new Error('Failed to fetch transactions');
      }
      
      const data = await response.json();
      setTransactions(data.expenses);
    } catch (err) {
      console.error('Error fetching transactions:', err);
    } finally {
      setIsLoadingTransactions(false);
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!item.trim()) {
      setSaveError('Nama item harus diisi');
      return;
    }
    
    const amountNum = parseFloat(amount);
    if (!amount || isNaN(amountNum) || amountNum <= 0) {
      setSaveError('Jumlah harus diisi dengan angka yang valid');
      return;
    }
    
    if (!category) {
      setSaveError('Kategori harus dipilih');
      return;
    }
    
    if (!date) {
      setSaveError('Tanggal harus dipilih');
      return;
    }

    try {
      setIsSaving(true);
      setSaveError(null);
      setSaveSuccess(false);

      const expense = {
        item: item.trim(),
        amount: amountNum,
        category,
        date,
        notes: notes.trim() || undefined,
        confidence: 1, // Manual entry has 100% confidence
      };

      const response = await fetch('/api/expenses/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ expenses: [expense] }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Gagal menyimpan transaksi');
      }

      // Reset form
      setItem('');
      setAmount('');
      setCategory('');
      setDate(new Date().toISOString().split('T')[0]);
      setNotes('');
      
      setSaveSuccess(true);
      
      // Refresh transactions list
      await fetchTransactions();
      
      // Hide success message after 3 seconds
      setTimeout(() => {
        setSaveSuccess(false);
      }, 3000);
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Terjadi kesalahan');
      console.error('Error saving transaction:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const getCategoryIcon = (categoryName: string): string => {
    const cat = DEFAULT_CATEGORIES.find(c => c.name === categoryName);
    return cat?.icon || 'payments';
  };

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark">
      <Navigation variant="default" currentPage="transactions" />
      
      <main className="flex-1 flex justify-center py-8 px-4 lg:px-40 pb-28">
        <div className="flex flex-col max-w-4xl flex-1 w-full gap-8">
          {/* Page Heading */}
          <div className="flex flex-col gap-2">
            <h1 className="text-white text-3xl md:text-4xl font-black leading-tight tracking-tight">
              Tambah Transaksi Manual
            </h1>
            <p className="text-gray-400 text-sm">
              Catat pengeluaran Anda secara manual tanpa AI
            </p>
          </div>

          {/* Manual Entry Form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            <div className="bg-surface-dark border border-white/5 rounded-xl p-6">
              <div className="flex flex-col gap-5">
                {/* Item Name */}
                <div className="flex flex-col gap-2">
                  <label htmlFor="item" className="text-gray-400 text-sm font-medium">
                    Nama Item <span className="text-red-400">*</span>
                  </label>
                  <input
                    id="item"
                    type="text"
                    value={item}
                    onChange={(e) => setItem(e.target.value)}
                    placeholder="Contoh: Ayam, Bensin, Kopi"
                    className="h-12 bg-background-dark border border-white/10 rounded-lg px-4 text-white placeholder-gray-500 focus:ring-2 focus:ring-primary/50 focus:border-transparent transition-all"
                  />
                </div>

                {/* Amount */}
                <div className="flex flex-col gap-2">
                  <label htmlFor="amount" className="text-gray-400 text-sm font-medium">
                    Jumlah (Rp) <span className="text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                      Rp
                    </span>
                    <input
                      id="amount"
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="10000"
                      min="0"
                      step="100"
                      className="h-12 w-full bg-background-dark border border-white/10 rounded-lg pl-12 pr-4 text-white placeholder-gray-500 focus:ring-2 focus:ring-primary/50 focus:border-transparent transition-all"
                    />
                  </div>
                </div>

                {/* Category */}
                <div className="flex flex-col gap-2">
                  <label htmlFor="category" className="text-gray-400 text-sm font-medium">
                    Kategori <span className="text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                      <span className="material-symbols-outlined text-[20px]">category</span>
                    </span>
                    <select
                      id="category"
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="h-12 w-full bg-background-dark border border-white/10 rounded-lg pl-12 pr-10 text-white appearance-none cursor-pointer focus:ring-2 focus:ring-primary/50 focus:border-transparent transition-all"
                    >
                      <option value="" className="bg-surface-dark">Pilih kategori...</option>
                      {DEFAULT_CATEGORIES.map((cat) => (
                        <option key={cat.name} value={cat.name} className="bg-surface-dark">
                          {cat.name}
                        </option>
                      ))}
                    </select>
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none">
                      <span className="material-symbols-outlined text-[20px]">arrow_drop_down</span>
                    </span>
                  </div>
                </div>

                {/* Date */}
                <div className="flex flex-col gap-2">
                  <label htmlFor="date" className="text-gray-400 text-sm font-medium">
                    Tanggal <span className="text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                      <span className="material-symbols-outlined text-[20px]">calendar_today</span>
                    </span>
                    <input
                      id="date"
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      max={new Date().toISOString().split('T')[0]}
                      className="h-12 w-full bg-background-dark border border-white/10 rounded-lg pl-12 pr-4 text-white focus:ring-2 focus:ring-primary/50 focus:border-transparent transition-all"
                    />
                  </div>
                </div>

                {/* Notes */}
                <div className="flex flex-col gap-2">
                  <label htmlFor="notes" className="text-gray-400 text-sm font-medium">
                    Catatan (Opsional)
                  </label>
                  <textarea
                    id="notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Tambahkan catatan atau deskripsi..."
                    rows={3}
                    className="bg-background-dark border border-white/10 rounded-lg p-4 text-white placeholder-gray-500 focus:ring-2 focus:ring-primary/50 focus:border-transparent transition-all resize-none"
                  />
                </div>
              </div>
            </div>

            {/* Success Message */}
            {saveSuccess && (
              <div className="bg-primary/10 border border-primary/20 rounded-xl p-4 flex items-center gap-3 text-primary animate-in fade-in slide-in-from-top-2 duration-300">
                <span className="material-symbols-outlined">check_circle</span>
                <span className="font-medium">Transaksi berhasil disimpan!</span>
              </div>
            )}

            {/* Error Message */}
            {saveError && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex items-center gap-3 text-red-400 animate-in fade-in slide-in-from-top-2 duration-300">
                <span className="material-symbols-outlined">error</span>
                <span className="font-medium">{saveError}</span>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSaving}
              className="h-14 bg-primary hover:bg-primary-hover disabled:bg-gray-600 disabled:cursor-not-allowed rounded-xl font-bold text-[#142210] flex items-center justify-center gap-2 transition-all shadow-lg hover:shadow-primary/20"
            >
              {isSaving ? (
                <>
                  <span className="material-symbols-outlined animate-spin">progress_activity</span>
                  <span>Menyimpan...</span>
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined">save</span>
                  <span>Simpan Transaksi</span>
                </>
              )}
            </button>
          </form>

          {/* Recent Transactions */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h2 className="text-white text-xl font-bold">Transaksi Terbaru</h2>
              <a
                href="/history"
                className="text-primary hover:text-primary-hover text-sm font-medium flex items-center gap-1 transition-colors"
              >
                Lihat Semua
                <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
              </a>
            </div>

            {isLoadingTransactions ? (
              <div className="flex justify-center items-center py-12">
                <div className="text-gray-400">Memuat transaksi...</div>
              </div>
            ) : transactions.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 gap-3 bg-surface-dark/40 rounded-xl border border-white/5">
                <span className="material-symbols-outlined text-gray-500 text-[48px]">receipt_long</span>
                <p className="text-gray-400 text-sm">Belum ada transaksi</p>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {transactions.map((transaction) => (
                  <div
                    key={transaction.id}
                    className="group flex items-center justify-between p-4 rounded-xl bg-surface-dark/40 hover:bg-surface-dark transition-all border border-transparent hover:border-primary/20"
                  >
                    <div className="flex items-center gap-3">
                      <div className="size-10 rounded-full bg-[#1c2e18] flex items-center justify-center text-primary shrink-0">
                        <span className="material-symbols-outlined text-[20px]">
                          {transaction.category?.icon || getCategoryIcon(transaction.category?.name || '')}
                        </span>
                      </div>
                      <div className="flex flex-col">
                        <p className="text-white font-semibold text-sm">{transaction.item}</p>
                        <div className="flex items-center gap-2 text-xs text-gray-400">
                          <span>{transaction.category?.name || 'Tanpa Kategori'}</span>
                          {transaction.notes && (
                            <>
                              <span className="size-1 bg-gray-600 rounded-full"></span>
                              <span className="line-clamp-1">{transaction.notes}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-white font-bold text-sm">
                        Rp {Number(transaction.amount).toLocaleString('id-ID')}
                      </p>
                      <p className="text-xs text-gray-400">
                        {new Date(transaction.expenseDate).toLocaleDateString('id-ID', { 
                          day: 'numeric', 
                          month: 'short' 
                        })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
