'use client';

import { useState, useEffect } from 'react';
import Navigation from '@/components/Navigation';
import GalaxyEffect from '@/components/GalaxyEffect';

interface CategoryData {
  name: string;
  total: number;
  percentage: number;
  color: string;
  icon: string;
}

interface DailySpending {
  day: string;
  date: string;
  total: number;
}

interface Transaction {
  id: string;
  item: string;
  amount: number;
  expenseDate: string;
  category: {
    id: string;
    name: string;
    icon: string | null;
    color: string | null;
  } | null;
}

interface AnalyticsData {
  stats: {
    totalSpent: number;
    spentTrend: number;
    highestCategory: {
      name: string;
      total: number;
    };
    dailyAverage: number;
  };
  categoriesData: CategoryData[];
  dailySpending: DailySpending[];
  recentTransactions: Transaction[];
}

export default function AnalyticsPage() {
  const [period, setPeriod] = useState<'this_month' | 'last_month' | 'all'>('this_month');
  const [chartView, setChartView] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);

  useEffect(() => {
    fetchAnalytics();
  }, [period]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/analytics?period=${period}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch analytics data');
      }
      
      const data = await response.json();
      setAnalyticsData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Error fetching analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return `Today, ${date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`;
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    }
  };

  const getMaxSpending = () => {
    if (!analyticsData) return 0;
    return Math.max(...analyticsData.dailySpending.map(d => d.total));
  };

  const handleExport = async (format: 'csv' | 'json', exportPeriod: 'this_month' | 'last_month' | 'all') => {
    setIsExporting(true);
    setShowExportMenu(false);
    
    try {
      const response = await fetch(`/api/analytics/export?period=${exportPeriod}&format=${format}`);
      
      if (!response.ok) {
        throw new Error('Failed to export data');
      }

      if (format === 'json') {
        const data = await response.json();
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `shoprecord-expenses-${exportPeriod}-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        // CSV format
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `shoprecord-expenses-${exportPeriod}-${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (err) {
      console.error('Error exporting data:', err);
      alert('Gagal mengekspor data. Silakan coba lagi.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark" onClick={() => setShowExportMenu(false)}>
      <GalaxyEffect />
      <Navigation variant="default" currentPage="analytics" />
      
      <main className="flex-1 flex justify-center py-6 px-4 md:px-8 lg:px-12">
        <div className="flex flex-col max-w-[1280px] w-full gap-6">
          {/* Page Heading & Controls */}
          <div className="flex flex-col md:flex-row flex-wrap justify-between items-start md:items-center gap-4">
            <div className="flex flex-col gap-1">
              <h1 className="text-gray-900 dark:text-white text-3xl md:text-4xl font-black leading-tight tracking-tight">
                Analisa
              </h1>
              <p className="text-gray-500 dark:text-text-secondary text-base font-normal">
                Gambaran pengeluaran Anda secara mendalam
              </p>
            </div>
            <div className="flex items-center gap-3">
              {/* Export Button */}
              <div className="relative">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowExportMenu(!showExportMenu);
                  }}
                  disabled={isExporting}
                  className="flex items-center gap-2 px-5 py-2.5 bg-primary hover:bg-primary/90 text-background-dark font-bold text-sm rounded-full shadow-lg shadow-primary/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="material-symbols-outlined text-[18px]">
                    {isExporting ? 'hourglass_empty' : 'download'}
                  </span>
                  <span>{isExporting ? 'Exporting...' : 'Export Report'}</span>
                </button>

                {showExportMenu && (
                  <div 
                    className="absolute right-0 mt-2 w-64 bg-surface-dark border border-white/10 rounded-xl shadow-xl z-[100] overflow-hidden"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="p-3 border-b border-white/10">
                      <p className="text-white text-xs font-bold uppercase tracking-wider">Export Format</p>
                    </div>
                    <div className="p-2">
                      <button
                        onClick={() => handleExport('csv', period)}
                        className="w-full px-3 py-2.5 text-left hover:bg-white/5 transition-colors flex items-center gap-3 text-white rounded-lg"
                      >
                        <span className="material-symbols-outlined text-primary">description</span>
                        <div className="flex-1">
                          <div className="font-medium text-sm">CSV File</div>
                          <div className="text-xs text-gray-400">Current period</div>
                        </div>
                      </button>
                      <button
                        onClick={() => handleExport('json', period)}
                        className="w-full px-3 py-2.5 text-left hover:bg-white/5 transition-colors flex items-center gap-3 text-white rounded-lg"
                      >
                        <span className="material-symbols-outlined text-primary">code</span>
                        <div className="flex-1">
                          <div className="font-medium text-sm">JSON File</div>
                          <div className="text-xs text-gray-400">Current period</div>
                        </div>
                      </button>
                    </div>
                    <div className="p-3 border-t border-white/10">
                      <p className="text-white text-xs font-bold uppercase tracking-wider mb-2">Export Period</p>
                    </div>
                    <div className="p-2">
                      <button
                        onClick={() => handleExport('csv', 'this_month')}
                        className="w-full px-3 py-2 text-left hover:bg-white/5 transition-colors text-white text-sm rounded-lg"
                      >
                        This Month (CSV)
                      </button>
                      <button
                        onClick={() => handleExport('csv', 'last_month')}
                        className="w-full px-3 py-2 text-left hover:bg-white/5 transition-colors text-white text-sm rounded-lg"
                      >
                        Last Month (CSV)
                      </button>
                      <button
                        onClick={() => handleExport('csv', 'all')}
                        className="w-full px-3 py-2 text-left hover:bg-white/5 transition-colors text-white text-sm rounded-lg"
                      >
                        All Time (CSV)
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Period Selector */}
              <div className="flex items-center bg-white dark:bg-surface-dark rounded-full p-1 border border-gray-200 dark:border-transparent">
                <button
                  onClick={() => setPeriod('this_month')}
                  className={`px-5 py-2 rounded-full text-sm font-bold transition-all ${
                    period === 'this_month'
                      ? 'bg-primary text-background-dark shadow-sm'
                      : 'text-gray-500 dark:text-white/60 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  Bulan Ini
                </button>
                <button
                  onClick={() => setPeriod('last_month')}
                  className={`px-5 py-2 rounded-full text-sm transition-all ${
                    period === 'last_month'
                      ? 'bg-primary text-background-dark font-bold shadow-sm'
                      : 'text-gray-500 dark:text-white/60 hover:text-gray-900 dark:hover:text-white font-medium'
                  }`}
                >
                  Bulan Lalu
                </button>
                <button
                  onClick={() => setPeriod('all')}
                  className={`px-5 py-2 rounded-full text-sm transition-all ${
                    period === 'all'
                      ? 'bg-primary text-background-dark font-bold shadow-sm'
                      : 'text-gray-500 dark:text-white/60 hover:text-gray-900 dark:hover:text-white font-medium'
                  }`}
                >
                  Semua
                </button>
              </div>
            </div>
          </div>

          {loading && (
            <div className="flex justify-center items-center py-12">
              <div className="text-gray-400">Loading analytics...</div>
            </div>
          )}

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-red-400">
              {error}
            </div>
          )}

          {!loading && !error && analyticsData && (
            <>
              {/* Stats Overview */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex flex-col gap-3 rounded-2xl p-6 bg-white dark:bg-surface-dark border border-gray-100 dark:border-transparent shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start">
                    <div className="p-2 bg-primary/10 rounded-full text-primary">
                      <span className="material-symbols-outlined">account_balance_wallet</span>
                    </div>
                    <span className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold ${
                      analyticsData.stats.spentTrend < 0
                        ? 'text-primary bg-primary/10'
                        : 'text-red-500 bg-red-500/10'
                    }`}>
                      <span className="material-symbols-outlined text-sm">
                        {analyticsData.stats.spentTrend < 0 ? 'trending_down' : 'trending_up'}
                      </span>
                      {Math.abs(analyticsData.stats.spentTrend)}%
                    </span>
                  </div>
                  <div>
                    <p className="text-gray-500 dark:text-white/60 text-sm font-medium mb-1">Total Spent</p>
                    <p className="text-gray-900 dark:text-white text-2xl md:text-3xl font-bold tracking-tight">
                      Rp {analyticsData.stats.totalSpent.toLocaleString('id-ID')}
                    </p>
                  </div>
                </div>

                <div className="flex flex-col gap-3 rounded-2xl p-6 bg-white dark:bg-surface-dark border border-gray-100 dark:border-transparent shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start">
                    <div className="p-2 bg-primary/10 rounded-full text-primary">
                      <span className="material-symbols-outlined">category</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-gray-500 dark:text-white/60 text-sm font-medium mb-1">Highest Category</p>
                    <p className="text-gray-900 dark:text-white text-2xl md:text-3xl font-bold tracking-tight">
                      {analyticsData.stats.highestCategory.name}
                    </p>
                  </div>
                </div>

                <div className="flex flex-col gap-3 rounded-2xl p-6 bg-white dark:bg-surface-dark border border-gray-100 dark:border-transparent shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start">
                    <div className="p-2 bg-primary/10 rounded-full text-primary">
                      <span className="material-symbols-outlined">calendar_today</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-gray-500 dark:text-white/60 text-sm font-medium mb-1">Daily Average</p>
                    <p className="text-gray-900 dark:text-white text-2xl md:text-3xl font-bold tracking-tight">
                      ~Rp {Math.round(analyticsData.stats.dailyAverage).toLocaleString('id-ID')}
                    </p>
                  </div>
                </div>
              </div>

              {/* Charts Section */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Pie Chart Card */}
                <div className="lg:col-span-1 bg-white dark:bg-surface-dark rounded-3xl p-6 border border-gray-100 dark:border-transparent flex flex-col h-full min-h-[400px]">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-gray-900 dark:text-white font-bold text-lg">Expenses by Category</h3>
                  </div>
                  <div className="relative flex-1 flex items-center justify-center">
                    {/* Donut Chart with categories */}
                    {analyticsData.categoriesData.length > 0 ? (
                      <div className="size-60 rounded-full relative bg-gradient-to-br from-primary/20 to-surface-darker flex items-center justify-center">
                        <div className="absolute inset-4 bg-white dark:bg-surface-dark rounded-full flex flex-col items-center justify-center z-10">
                          <span className="text-gray-500 dark:text-white/60 text-sm font-medium">Top Spending</span>
                          <span className="text-gray-900 dark:text-white text-2xl font-bold">
                            {analyticsData.categoriesData[0]?.percentage}%
                          </span>
                          <span className="text-primary text-sm font-bold">
                            {analyticsData.categoriesData[0]?.name}
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className="text-gray-400 text-center">No data available</div>
                    )}
                  </div>
                  <div className="mt-6 flex flex-col gap-3">
                    {analyticsData.categoriesData.slice(0, 4).map((cat, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="size-3 rounded-full" style={{ backgroundColor: cat.color }}></div>
                          <span className="text-gray-600 dark:text-white/80 text-sm font-medium">{cat.name}</span>
                        </div>
                        <span className="text-gray-900 dark:text-white font-bold text-sm">
                          Rp {cat.total.toLocaleString('id-ID')}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Bar Chart Card */}
                <div className="lg:col-span-2 bg-white dark:bg-surface-dark rounded-3xl p-6 border border-gray-100 dark:border-transparent flex flex-col h-full min-h-[400px]">
                  <div className="flex flex-wrap items-center justify-between mb-8 gap-4">
                    <h3 className="text-gray-900 dark:text-white font-bold text-lg">Spending History</h3>
                    <div className="flex items-center gap-2 bg-gray-100 dark:bg-surface-darker p-1 rounded-lg">
                      <button
                        onClick={() => setChartView('daily')}
                        className={`px-3 py-1 rounded-md text-xs transition-all ${
                          chartView === 'daily'
                            ? 'bg-white dark:bg-primary text-gray-900 dark:text-background-dark font-bold shadow-sm'
                            : 'text-gray-500 dark:text-white/60 hover:text-gray-900 dark:hover:text-white font-medium'
                        }`}
                      >
                        Daily
                      </button>
                      <button
                        onClick={() => setChartView('weekly')}
                        className={`px-3 py-1 rounded-md text-xs transition-all ${
                          chartView === 'weekly'
                            ? 'bg-white dark:bg-primary text-gray-900 dark:text-background-dark font-bold shadow-sm'
                            : 'text-gray-500 dark:text-white/60 hover:text-gray-900 dark:hover:text-white font-medium'
                        }`}
                      >
                        Weekly
                      </button>
                      <button
                        onClick={() => setChartView('monthly')}
                        className={`px-3 py-1 rounded-md text-xs transition-all ${
                          chartView === 'monthly'
                            ? 'bg-white dark:bg-primary text-gray-900 dark:text-background-dark font-bold shadow-sm'
                            : 'text-gray-500 dark:text-white/60 hover:text-gray-900 dark:hover:text-white font-medium'
                        }`}
                      >
                        Monthly
                      </button>
                    </div>
                  </div>
                  <div className="flex-1 flex items-end gap-2 sm:gap-4 md:gap-6 justify-between h-64 pb-2">
                    {analyticsData.dailySpending.map((day, index) => {
                      const maxSpending = getMaxSpending();
                      const heightPercentage = maxSpending > 0 ? (day.total / maxSpending) * 95 : 0;
                      const isHighest = day.total === maxSpending && maxSpending > 0;

                      return (
                        <div key={index} className="flex flex-col items-center gap-2 flex-1 group cursor-pointer">
                          <div className="relative w-full bg-gray-100 dark:bg-surface-darker rounded-t-xl h-48 overflow-hidden">
                            <div
                              className={`absolute bottom-0 left-0 right-0 transition-all duration-300 w-full rounded-t-xl ${
                                isHighest
                                  ? 'bg-primary'
                                  : 'bg-[#3b6b32] group-hover:bg-primary'
                              }`}
                              style={{ height: `${heightPercentage}%` }}
                            />
                            {day.total > 0 && (
                              <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs font-bold py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-20 pointer-events-none">
                                Rp {day.total.toLocaleString('id-ID')}
                              </div>
                            )}
                          </div>
                          <span className={`text-xs font-medium ${isHighest ? 'text-primary font-bold' : 'text-gray-400'}`}>
                            {day.day}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
