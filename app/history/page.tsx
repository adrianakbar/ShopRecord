'use client';

import { useState, useEffect } from 'react';
import Navigation from '@/components/Navigation';
import FloatingActionButton from '@/components/FloatingActionButton';
import TransactionItem from '@/components/TransactionItem';
import GalaxyEffect from '@/components/GalaxyEffect';

// Type definitions
interface Category {
  id: string;
  name: string;
  icon: string | null;
  color: string | null;
}

interface ExpenseItem {
  id: string;
  item: string;
  amount: number;
  expenseDate: string;
  notes: string | null;
  category: Category | null;
}

interface ExpenseGroup {
  date: string;
  total: number;
  expenses: ExpenseItem[];
}

interface Stats {
  monthlyTotal: number;
  monthlyCount: number;
  topCategory: {
    name: string;
    count: number;
    total: number;
  } | null;
}

export default function HistoryPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const selectedMonth = 'Oct 2023';
  const selectedCategory = 'All Categories';
  
  const [expenses, setExpenses] = useState<ExpenseItem[]>([]);
  const [stats, setStats] = useState<Stats>({
    monthlyTotal: 0,
    monthlyCount: 0,
    topCategory: null,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch expenses from API
  useEffect(() => {
    async function fetchExpenses() {
      try {
        setLoading(true);
        const response = await fetch('/api/expenses');
        
        if (!response.ok) {
          throw new Error('Failed to fetch expenses');
        }
        
        const data = await response.json();
        setExpenses(data.expenses);
        setStats(data.stats);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
        console.error('Error fetching expenses:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchExpenses();
  }, []);

  // Group expenses by date
  const groupExpensesByDate = (expenses: ExpenseItem[]): ExpenseGroup[] => {
    const groups: { [key: string]: ExpenseItem[] } = {};
    
    expenses.forEach((expense) => {
      const date = new Date(expense.expenseDate);
      const dateKey = date.toISOString().split('T')[0];
      
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(expense);
    });

    return Object.entries(groups).map(([dateKey, expenses]) => {
      const date = new Date(dateKey);
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      
      let dateLabel = '';
      if (date.toDateString() === today.toDateString()) {
        dateLabel = `Today, ${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
      } else if (date.toDateString() === yesterday.toDateString()) {
        dateLabel = `Yesterday, ${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
      } else {
        dateLabel = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      }

      const total = expenses.reduce((sum, exp) => sum + Number(exp.amount), 0);

      return {
        date: dateLabel,
        total,
        expenses,
      };
    }).sort((a, b) => {
      // Sort by most recent first
      return new Date(b.expenses[0].expenseDate).getTime() - new Date(a.expenses[0].expenseDate).getTime();
    });
  };

  const expenseGroups = groupExpensesByDate(expenses);

  const handleDelete = async (expenseId: string) => {
    try {
      const response = await fetch(`/api/expenses/${expenseId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete expense');
      }

      // Remove deleted expense from state
      setExpenses((prevExpenses) => prevExpenses.filter(exp => exp.id !== expenseId));
    } catch (err) {
      console.error('Error deleting expense:', err);
      alert('Gagal menghapus pengeluaran. Silakan coba lagi.');
    }
  };

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark">
      <GalaxyEffect />
      <Navigation variant="default" currentPage="history" />
      
      <main className="flex-1 flex justify-center py-8 px-4 lg:px-40 pb-28">
        <div className="flex flex-col max-w-4xl flex-1 w-full gap-8">
          {/* Page Heading & Stats */}
          <div className="flex flex-col gap-6">
            {/* Heading */}
            <div className="flex flex-wrap justify-between items-center gap-4">
              <h1 className="text-white text-3xl md:text-4xl font-black leading-tight tracking-tight">
                Riwayat Pengeluaran
              </h1>
            </div>

            {/* Loading State */}
            {loading && (
              <div className="flex justify-center items-center py-12">
                <div className="text-gray-400">Memuat data...</div>
              </div>
            )}

            {/* Error State */}
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-red-400">
                {error}
              </div>
            )}

            {/* Stats Cards */}
            {!loading && !error && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-2 rounded-xl p-6 bg-surface-dark border border-white/5 relative overflow-hidden group">
                  <div className="absolute -right-5 -top-5 opacity-5 rotate-12 group-hover:opacity-10 transition-opacity">
                    <span className="material-symbols-outlined text-[150px] text-primary">
                      payments
                    </span>
                  </div>
                  <p className="text-gray-400 text-sm font-medium uppercase tracking-wider">
                    Total Pengeluaran Bulan Ini
                  </p>
                  <div className="flex items-end gap-3">
                    <p className="text-white tracking-tight text-3xl font-bold">
                      Rp {Number(stats.monthlyTotal).toLocaleString('id-ID')}
                    </p>
                    <span className="text-gray-400 text-sm font-medium mb-1">
                      {stats.monthlyCount} transaksi
                    </span>
                  </div>
                </div>

                <div className="flex flex-col gap-2 rounded-xl p-6 bg-surface-dark border border-white/5 relative overflow-hidden group">
                  <div className="absolute -right-5 -top-5 opacity-5 rotate-12 group-hover:opacity-10 transition-opacity">
                    <span className="material-symbols-outlined text-[150px] text-white">
                      restaurant
                    </span>
                  </div>
                  <p className="text-gray-400 text-sm font-medium uppercase tracking-wider">
                    Kategori Terbanyak
                  </p>
                  <div className="flex items-end gap-3">
                    <p className="text-white tracking-tight text-3xl font-bold">
                      {stats.topCategory?.name || 'N/A'}
                    </p>
                    {stats.topCategory && (
                      <span className="text-gray-400 text-sm font-medium mb-1">
                        {stats.topCategory.count} transaksi
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Filter & Search Bar */}
          <div className="flex flex-col gap-4">
            <div className="flex flex-col md:flex-row gap-3">
              {/* Search Input */}
              <div className="flex-1 relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors">
                  <span className="material-symbols-outlined">search</span>
                </div>
                <input
                  className="w-full h-12 bg-surface-dark border-none rounded-xl pl-12 pr-4 text-white placeholder-gray-500 focus:ring-2 focus:ring-primary/50 transition-all shadow-sm"
                  placeholder="Cari merchant, catatan, atau tag..."
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              {/* Filter Buttons */}
              <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 no-scrollbar">
                <button className="h-12 px-4 bg-surface-dark hover:bg-white/10 rounded-xl flex items-center gap-2 text-white whitespace-nowrap transition-colors border border-transparent hover:border-white/10">
                  <span className="material-symbols-outlined text-gray-400 text-[20px]">
                    calendar_month
                  </span>
                  <span className="text-sm font-medium">{selectedMonth}</span>
                  <span className="material-symbols-outlined text-gray-500 text-[16px]">
                    arrow_drop_down
                  </span>
                </button>

                <button className="h-12 px-4 bg-surface-dark hover:bg-white/10 rounded-xl flex items-center gap-2 text-white whitespace-nowrap transition-colors border border-transparent hover:border-white/10">
                  <span className="material-symbols-outlined text-gray-400 text-[20px]">
                    category
                  </span>
                  <span className="text-sm font-medium">{selectedCategory}</span>
                  <span className="material-symbols-outlined text-gray-500 text-[16px]">
                    arrow_drop_down
                  </span>
                </button>

                <button className="h-12 px-4 bg-surface-dark hover:bg-white/10 rounded-xl flex items-center gap-2 text-white whitespace-nowrap transition-colors border border-transparent hover:border-white/10">
                  <span className="material-symbols-outlined text-gray-400 text-[20px]">
                    attach_money
                  </span>
                  <span className="text-sm font-medium">Price Range</span>
                  <span className="material-symbols-outlined text-gray-500 text-[16px]">
                    arrow_drop_down
                  </span>
                </button>
              </div>
            </div>
          </div>

          {/* Expense Table */}
          {!loading && !error && expenseGroups.length > 0 && (
            <div className="flex flex-col gap-6">
              {expenseGroups.map((group, groupIndex) => (
                <div
                  key={groupIndex}
                  className={`flex flex-col gap-2 ${groupIndex > 1 ? 'opacity-75 hover:opacity-100 transition-opacity' : ''}`}
                >
                  {/* Group Header */}
                  <div className="flex items-center justify-between px-2 pb-2 border-b border-surface-dark">
                    <h3 className="text-white font-bold text-lg">{group.date}</h3>
                    <p className="text-gray-400 text-sm font-medium">
                      Total: <span className="text-white font-bold">Rp {group.total.toLocaleString('id-ID')}</span>
                    </p>
                  </div>

                  {/* Expense Items */}
                  {group.expenses.map((expense) => (
                    <TransactionItem key={expense.id} transaction={expense} showDelete={true} onDelete={handleDelete} />
                  ))}
                </div>
              ))}

              {/* Load More */}
              <div className="flex justify-center mt-6">
                <button className="text-primary hover:text-primary-hover font-bold text-sm flex items-center gap-2 px-6 py-2 rounded-lg hover:bg-white/5 transition-colors">
                  Muat Lebih Banyak
                  <span className="material-symbols-outlined">expand_more</span>
                </button>
              </div>
            </div>
          )}

          {/* Empty State */}
          {!loading && !error && expenseGroups.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 gap-4">
              <div className="text-gray-400 text-6xl">
                <span className="material-symbols-outlined text-[72px]">receipt_long</span>
              </div>
              <h3 className="text-white text-xl font-bold">Belum ada pengeluaran</h3>
              <p className="text-gray-400 text-center max-w-md">
                Mulai catat pengeluaran Anda dengan menambahkan transaksi pertama menggunakan tombol Quick Add.
              </p>
            </div>
          )}
        </div>
      </main>

      {/* Floating Action Button */}
      <FloatingActionButton />
    </div>
  );
}
