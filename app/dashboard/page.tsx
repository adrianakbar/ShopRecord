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

interface Transaction {
  id: string;
  item: string;
  amount: number;
  expenseDate: string;
  notes: string | null;
  category: Category | null;
}

interface CategoryData {
  name: string;
  amount: number;
  percentage: number;
  color: string;
  icon: string;
}

interface DashboardData {
  stats: {
    today: {
      total: number;
      trend: number;
    };
    monthly: {
      total: number;
      trend: number;
    };
  };
  topCategories: CategoryData[];
  recentTransactions: Transaction[];
}

export default function DashboardPage() {
  const [naturalInput, setNaturalInput] = useState('');
  const [userName, setUserName] = useState('User');
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch user data
  useEffect(() => {
    async function fetchUser() {
      try {
        const response = await fetch('/api/debug/user');
        if (response.ok) {
          const data = await response.json();
          if (data.user?.name) {
            setUserName(data.user.name);
          }
        }
      } catch (err) {
        console.error('Error fetching user:', err);
      }
    }
    fetchUser();
  }, []);

  // Fetch dashboard data
  useEffect(() => {
    async function fetchDashboard() {
      try {
        setLoading(true);
        const response = await fetch('/api/dashboard');
        
        if (!response.ok) {
          throw new Error('Failed to fetch dashboard data');
        }
        
        const data = await response.json();
        setDashboardData(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
        console.error('Error fetching dashboard:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchDashboard();
  }, []);

  const stats = dashboardData ? [
    {
      label: 'Total Hari Ini',
      amount: dashboardData.stats.today.total,
      trend: dashboardData.stats.today.trend,
      isPositive: dashboardData.stats.today.trend >= 0,
      icon: 'calendar_today',
      iconBgColor: 'bg-white/5 border-white/10'
    },
    {
      label: 'Total Bulan Ini',
      amount: dashboardData.stats.monthly.total,
      trend: dashboardData.stats.monthly.trend,
      isPositive: dashboardData.stats.monthly.trend >= 0,
      icon: 'date_range',
      iconBgColor: 'bg-white/5 dark:border-white/10'
    }
  ] : [];

  const topCategories = dashboardData?.topCategories || [];
  const recentTransactions = dashboardData?.recentTransactions || [];

  const handleAddExpense = () => {
    if (naturalInput.trim()) {
      // Redirect to quick-add page
      window.location.href = '/quick-add';
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleAddExpense();
    }
  };

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark">
      <GalaxyEffect />
      <Navigation variant="default" currentPage="dashboard" />
      
      <main className="flex-1 flex flex-col">
        <div className="w-full max-w-7xl mx-auto p-4 md:p-8 flex flex-col gap-8">
          {/* Header */}
          <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
            <div className="flex flex-col gap-1">
              <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight dark:text-white">
                Halo, {userName}
              </h2>
              <p className="text-gray-500 dark:text-text-dim">
                Ringkasan keuangan Anda hari ini.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-primary/20 text-primary text-xs font-bold uppercase tracking-wider border border-primary/20">
                AI Aktif
              </span>
              <span className="text-xs text-gray-400 dark:text-gray-500">
                Baru saja diperbarui
              </span>
            </div>
          </header>

          {/* Natural Language Input */}
          <div className="w-full">
            <label className="relative flex w-full group">
              <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                <span className="material-symbols-outlined text-primary group-focus-within:text-primary transition-colors">
                  auto_awesome
                </span>
              </div>
              <input
                className="w-full bg-white dark:bg-surface-dark text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 border-none ring-1 ring-gray-200 dark:ring-border-dark rounded-full py-4 pl-14 pr-32 shadow-lg dark:shadow-none focus:ring-2 focus:ring-primary focus:outline-none transition-all text-lg"
                placeholder='Coba: "Beli ayam 10rb, beli bensin 50rb..."'
                type="text"
                value={naturalInput}
                onChange={(e) => setNaturalInput(e.target.value)}
                onKeyPress={handleKeyPress}
              />
              <button
                onClick={handleAddExpense}
                className="absolute right-2 top-1.5 bottom-1.5 bg-primary hover:bg-primary-hover text-white px-6 rounded-full font-bold text-sm transition-transform active:scale-95 flex items-center gap-2 shadow-md shadow-primary/30"
              >
                <span>Tambah</span>
                <span className="material-symbols-outlined text-[18px]">arrow_upward</span>
              </button>
            </label>
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Today's Total - Featured Card */}
              {stats.length > 0 && (
                <div className="flex flex-col p-6 rounded-lg bg-surface-dark border border-border-dark text-white relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-40 h-40 bg-primary/10 rounded-full blur-[60px] -mr-10 -mt-10 group-hover:bg-primary/20 transition-all duration-500"></div>
                  <div className="flex justify-between items-start mb-4 relative z-10">
                    <div className="p-3 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-sm">
                      <span className="material-symbols-outlined text-primary">
                        {stats[0].icon}
                      </span>
                    </div>
                    {stats[0].trend !== 0 && (
                      <span className={`flex items-center text-sm font-bold px-3 py-1.5 rounded-full ${
                        stats[0].isPositive 
                          ? 'text-primary bg-primary/10 border border-primary/20' 
                          : 'text-red-400 bg-red-400/10 border border-red-400/20'
                      }`}>
                        <span className="material-symbols-outlined text-sm mr-1">
                          {stats[0].isPositive ? 'trending_up' : 'trending_down'}
                        </span>
                        {stats[0].isPositive ? '+' : ''}{stats[0].trend}%
                      </span>
                    )}
                  </div>
                  <div className="mt-auto relative z-10">
                    <p className="text-gray-400 text-sm font-medium mb-1">{stats[0].label}</p>
                    <h3 className="text-4xl font-extrabold tracking-tight text-white">
                      Rp {stats[0].amount.toLocaleString('id-ID')}
                    </h3>
                  </div>
                </div>
              )}

              {/* Monthly Total Card */}
              {stats.length > 1 && (
                <div className="flex flex-col p-6 rounded-lg bg-white dark:bg-surface-dark dark:text-white shadow-sm dark:shadow-none border border-gray-100 dark:border-border-dark relative overflow-hidden group">
                  <div className="flex justify-between items-start mb-4">
                    <div className="p-3 bg-gray-100 dark:bg-white/5 dark:border dark:border-white/10 rounded-2xl transition-colors">
                      <span className="material-symbols-outlined text-gray-600 dark:text-gray-300">
                        {stats[1].icon}
                      </span>
                    </div>
                    {stats[1].trend !== 0 && (
                      <span className={`flex items-center text-sm font-bold px-3 py-1.5 rounded-full ${
                        stats[1].isPositive 
                          ? 'text-primary bg-primary/10 border border-primary/20' 
                          : 'text-red-400 bg-red-400/10 border border-red-400/20'
                      }`}>
                        <span className="material-symbols-outlined text-sm mr-1">
                          {stats[1].isPositive ? 'trending_up' : 'trending_down'}
                        </span>
                        {stats[1].isPositive ? '+' : ''}{stats[1].trend}%
                      </span>
                    )}
                  </div>
                  <div className="mt-auto">
                    <p className="text-gray-500 dark:text-gray-400 text-sm font-medium mb-1">
                      {stats[1].label}
                    </p>
                    <h3 className="text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white">
                      Rp {stats[1].amount.toLocaleString('id-ID')}
                    </h3>
                  </div>
                </div>
              )}

              {/* Top Categories Card */}
              <div className="flex flex-col p-6 rounded-lg bg-white dark:bg-surface-dark shadow-sm dark:shadow-none border border-gray-100 dark:border-border-dark md:col-span-2 lg:col-span-1">
                <div className="flex justify-between items-center mb-5">
                  <h4 className="text-lg font-bold dark:text-white">Kategori Teratas</h4>
                  <a href="/history" className="text-xs font-semibold text-primary hover:text-primary-hover transition-colors">
                    Lihat Detail
                  </a>
                </div>
                {topCategories.length > 0 ? (
                  <div className="flex flex-col gap-5 justify-center h-full">
                    {topCategories.map((category, index) => (
                      <div key={index} className="flex flex-col gap-2">
                        <div className="flex justify-between text-sm items-center gap-2">
                          <div className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-gray-400 text-[20px]">
                              {category.icon}
                            </span>
                            <span className="font-medium text-gray-600 dark:text-gray-300">
                              {category.name}
                            </span>
                          </div>
                          <span className="font-bold text-gray-900 dark:text-white">
                            Rp {category.amount.toLocaleString('id-ID')}
                          </span>
                        </div>
                        <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-2 overflow-hidden">
                          <div
                            className="bg-primary h-2 rounded-full shadow-[0_0_10px_rgba(83,210,45,0.4)]"
                            style={{ width: `${category.percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full gap-2 text-gray-400 py-8">
                    <span className="material-symbols-outlined text-[48px]">category</span>
                    <p className="text-sm">Belum ada data kategori</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Recent Activity */}
          {!loading && !error && (
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold dark:text-white">Pengeluaran Hari ini</h2>
                <a href="/history" className="text-sm font-bold text-primary hover:text-primary-hover transition-colors">
                  Lihat Semua
                </a>
              </div>
              {recentTransactions.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 gap-3 bg-white dark:bg-surface-dark rounded-xl border border-gray-200 dark:border-white/5">
                  <span className="material-symbols-outlined text-gray-400 dark:text-gray-500 text-[48px]">receipt_long</span>
                  <p className="text-gray-400 dark:text-gray-400 text-sm">Belum ada transaksi</p>
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  {recentTransactions.map((transaction) => (
                    <TransactionItem key={transaction.id} transaction={transaction} showTime={true} />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      {/* Floating Action Button */}
      <FloatingActionButton />
    </div>
  );
}
