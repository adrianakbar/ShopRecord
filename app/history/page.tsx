'use client';

import { useState, useEffect } from 'react';
import Navigation from '@/components/Navigation';
import FloatingActionButton from '@/components/FloatingActionButton';
import TransactionItem from '@/components/TransactionItem';
import GalaxyEffect from '@/components/GalaxyEffect';
import Popup, { PopupType } from '@/components/Popup';

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
  const [selectedMonth, setSelectedMonth] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [priceRange, setPriceRange] = useState<{ min: number; max: number }>({ min: 0, max: Infinity });
  const [showMonthDropdown, setShowMonthDropdown] = useState(false);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [showPriceDropdown, setShowPriceDropdown] = useState(false);
  
  const [expenses, setExpenses] = useState<ExpenseItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [stats, setStats] = useState<Stats>({
    monthlyTotal: 0,
    monthlyCount: 0,
    topCategory: null,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Edit modal states
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingExpense, setEditingExpense] = useState<ExpenseItem | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  
  // Toast notification state
  const [popup, setPopup] = useState<{ message: string; type: PopupType } | null>(null);

  // Fetch expenses and categories from API
  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        
        // Fetch expenses
        const expensesResponse = await fetch('/api/expenses');
        if (!expensesResponse.ok) {
          throw new Error('Failed to fetch expenses');
        }
        const expensesData = await expensesResponse.json();
        setExpenses(expensesData.expenses);
        setStats(expensesData.stats);
        
        // Fetch categories
        const categoriesResponse = await fetch('/api/categories');
        if (categoriesResponse.ok) {
          const categoriesData = await categoriesResponse.json();
          setCategories(categoriesData.categories || []);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
        console.error('Error fetching data:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  // Filter expenses based on search, month, category, and price range
  const filteredExpenses = expenses.filter((expense) => {
    // Search filter
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch = 
      searchQuery === '' ||
      expense.item.toLowerCase().includes(searchLower) ||
      expense.notes?.toLowerCase().includes(searchLower) ||
      expense.category?.name.toLowerCase().includes(searchLower);
    
    // Month filter
    const expenseDate = new Date(expense.expenseDate);
    const matchesMonth = selectedMonth === 'all' || (() => {
      const [year, month] = selectedMonth.split('-');
      return expenseDate.getFullYear() === parseInt(year) && 
             expenseDate.getMonth() === parseInt(month);
    })();
    
    // Category filter
    const matchesCategory = 
      selectedCategory === 'all' || 
      expense.category?.id === selectedCategory;
    
    // Price range filter
    const matchesPrice = 
      expense.amount >= priceRange.min && 
      expense.amount <= priceRange.max;
    
    return matchesSearch && matchesMonth && matchesCategory && matchesPrice;
  });

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

  const expenseGroups = groupExpensesByDate(filteredExpenses);

  // Get available months from expenses
  const availableMonths = Array.from(
    new Set(
      expenses.map((expense) => {
        const date = new Date(expense.expenseDate);
        return `${date.getFullYear()}-${date.getMonth()}`;
      })
    )
  )
    .sort((a, b) => {
      const [yearA, monthA] = a.split('-').map(Number);
      const [yearB, monthB] = b.split('-').map(Number);
      return yearB * 12 + monthB - (yearA * 12 + monthA);
    })
    .map((key) => {
      const [year, month] = key.split('-').map(Number);
      const date = new Date(year, month);
      return {
        value: key,
        label: date.toLocaleDateString('id-ID', { month: 'short', year: 'numeric' }),
      };
    });

  // Price range options
  const priceRangeOptions = [
    { label: 'Semua Harga', min: 0, max: Infinity },
    { label: '< Rp 50.000', min: 0, max: 50000 },
    { label: 'Rp 50.000 - Rp 100.000', min: 50000, max: 100000 },
    { label: 'Rp 100.000 - Rp 500.000', min: 100000, max: 500000 },
    { label: '> Rp 500.000', min: 500000, max: Infinity },
  ];

  const getMonthLabel = () => {
    if (selectedMonth === 'all') return 'Semua Bulan';
    const month = availableMonths.find(m => m.value === selectedMonth);
    return month?.label || 'Pilih Bulan';
  };

  const getCategoryLabel = () => {
    if (selectedCategory === 'all') return 'Semua Kategori';
    const category = categories.find(c => c.id === selectedCategory);
    return category?.name || 'Pilih Kategori';
  };

  const getPriceRangeLabel = () => {
    const option = priceRangeOptions.find(
      opt => opt.min === priceRange.min && opt.max === priceRange.max
    );
    return option?.label || 'Semua Harga';
  };

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
      
      // Show success popup
      setPopup({ message: 'Pengeluaran berhasil dihapus', type: 'success' });
    } catch (err) {
      console.error('Error deleting expense:', err);
      setPopup({ message: 'Gagal menghapus pengeluaran. Silakan coba lagi.', type: 'error' });
    }
  };

  const handleEditClick = (expense: ExpenseItem) => {
    setEditingExpense(expense);
    setShowEditModal(true);
  };

  const handleSaveEdit = async () => {
    if (!editingExpense) return;

    setIsSaving(true);
    try {
      const response = await fetch(`/api/expenses/${editingExpense.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          item: editingExpense.item,
          amount: editingExpense.amount,
          categoryId: editingExpense.category?.id || null,
          expenseDate: editingExpense.expenseDate,
          notes: editingExpense.notes,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update expense');
      }

      const updatedExpense = await response.json();

      // Update expense in state
      setExpenses((prevExpenses) =>
        prevExpenses.map((exp) => (exp.id === editingExpense.id ? updatedExpense.expense : exp))
      );

      setShowEditModal(false);
      setEditingExpense(null);
      
      // Show success popup
      setPopup({ message: 'Pengeluaran berhasil diperbarui', type: 'success' });
    } catch (err) {
      console.error('Error updating expense:', err);
      setPopup({ message: 'Gagal memperbarui pengeluaran. Silakan coba lagi.', type: 'error' });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div 
      className="min-h-screen bg-background-light dark:bg-background-dark"
      onClick={() => {
        setShowMonthDropdown(false);
        setShowCategoryDropdown(false);
        setShowPriceDropdown(false);
      }}
    >
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
              <div className="flex-1 relative group" onClick={(e) => e.stopPropagation()}>
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
              <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-hide" onClick={(e) => e.stopPropagation()}>
                {/* Month Filter */}
                <div className="relative z-[100] shrink-0">
                  <button 
                    onClick={() => {
                      setShowMonthDropdown(!showMonthDropdown);
                      setShowCategoryDropdown(false);
                      setShowPriceDropdown(false);
                    }}
                    className="h-12 px-4 bg-surface-dark hover:bg-white/10 rounded-xl flex items-center gap-2 text-white whitespace-nowrap transition-colors border border-transparent hover:border-white/10"
                  >
                    <span className="material-symbols-outlined text-gray-400 text-[20px]">
                      calendar_month
                    </span>
                    <span className="text-sm font-medium">{getMonthLabel()}</span>
                    <span className="material-symbols-outlined text-gray-500 text-[16px]">
                      arrow_drop_down
                    </span>
                  </button>
                  
                  {showMonthDropdown && (
                    <div className="absolute top-14 left-0 bg-surface-dark border border-white/10 rounded-xl shadow-xl z-[100] min-w-[200px] max-h-[300px] overflow-y-auto">
                      <button
                        onClick={() => {
                          setSelectedMonth('all');
                          setShowMonthDropdown(false);
                        }}
                        className={`w-full px-4 py-3 text-left hover:bg-white/5 transition-colors ${
                          selectedMonth === 'all' ? 'text-primary' : 'text-white'
                        }`}
                      >
                        Semua Bulan
                      </button>
                      {availableMonths.map((month) => (
                        <button
                          key={month.value}
                          onClick={() => {
                            setSelectedMonth(month.value);
                            setShowMonthDropdown(false);
                          }}
                          className={`w-full px-4 py-3 text-left hover:bg-white/5 transition-colors ${
                            selectedMonth === month.value ? 'text-primary' : 'text-white'
                          }`}
                        >
                          {month.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Category Filter */}
                <div className="relative z-[100] shrink-0">
                  <button 
                    onClick={() => {
                      setShowCategoryDropdown(!showCategoryDropdown);
                      setShowMonthDropdown(false);
                      setShowPriceDropdown(false);
                    }}
                    className="h-12 px-4 bg-surface-dark hover:bg-white/10 rounded-xl flex items-center gap-2 text-white whitespace-nowrap transition-colors border border-transparent hover:border-white/10"
                  >
                    <span className="material-symbols-outlined text-gray-400 text-[20px]">
                      category
                    </span>
                    <span className="text-sm font-medium">{getCategoryLabel()}</span>
                    <span className="material-symbols-outlined text-gray-500 text-[16px]">
                      arrow_drop_down
                    </span>
                  </button>
                  
                  {showCategoryDropdown && (
                    <div className="absolute top-14 left-0 bg-surface-dark border border-white/10 rounded-xl shadow-xl z-[100] min-w-[200px] max-h-[300px] overflow-y-auto">
                      <button
                        onClick={() => {
                          setSelectedCategory('all');
                          setShowCategoryDropdown(false);
                        }}
                        className={`w-full px-4 py-3 text-left hover:bg-white/5 transition-colors ${
                          selectedCategory === 'all' ? 'text-primary' : 'text-white'
                        }`}
                      >
                        Semua Kategori
                      </button>
                      {categories.map((category) => (
                        <button
                          key={category.id}
                          onClick={() => {
                            setSelectedCategory(category.id);
                            setShowCategoryDropdown(false);
                          }}
                          className={`w-full px-4 py-3 text-left hover:bg-white/5 transition-colors flex items-center gap-2 ${
                            selectedCategory === category.id ? 'text-primary' : 'text-white'
                          }`}
                        >
                          <span>{category.name}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Price Range Filter */}
                <div className="relative z-[100] shrink-0">
                  <button 
                    onClick={() => {
                      setShowPriceDropdown(!showPriceDropdown);
                      setShowMonthDropdown(false);
                      setShowCategoryDropdown(false);
                    }}
                    className="h-12 px-4 bg-surface-dark hover:bg-white/10 rounded-xl flex items-center gap-2 text-white whitespace-nowrap transition-colors border border-transparent hover:border-white/10"
                  >
                    <span className="material-symbols-outlined text-gray-400 text-[20px]">
                      attach_money
                    </span>
                    <span className="text-sm font-medium">{getPriceRangeLabel()}</span>
                    <span className="material-symbols-outlined text-gray-500 text-[16px]">
                      arrow_drop_down
                    </span>
                  </button>
                  
                  {showPriceDropdown && (
                    <div className="absolute top-14 right-0 bg-surface-dark border border-white/10 rounded-xl shadow-xl z-[100] min-w-[240px]">
                      {priceRangeOptions.map((option, index) => (
                        <button
                          key={index}
                          onClick={() => {
                            setPriceRange({ min: option.min, max: option.max });
                            setShowPriceDropdown(false);
                          }}
                          className={`w-full px-4 py-3 text-left hover:bg-white/5 transition-colors ${
                            priceRange.min === option.min && priceRange.max === option.max
                              ? 'text-primary'
                              : 'text-white'
                          }`}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
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
                    <TransactionItem 
                      key={expense.id} 
                      transaction={expense} 
                      showDelete={true} 
                      onDelete={handleDelete}
                      onClick={() => handleEditClick(expense)}
                    />
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

      {/* Toast Notification */}
      {popup && (
        <Popup
          message={popup.message}
          type={popup.type}
          onClose={() => setPopup(null)}
        />
      )}

      {/* Edit Modal */}
      {showEditModal && editingExpense && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[200] p-4">
          <div className="bg-surface-dark border border-white/10 rounded-2xl p-6 max-w-2xl w-full shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-white">Edit Pengeluaran</h3>
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setEditingExpense(null);
                }}
                className="size-10 rounded-full hover:bg-white/10 flex items-center justify-center text-gray-400 hover:text-white transition-colors"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="space-y-5">
              {/* Item Name */}
              <div>
                <label htmlFor="edit-item" className="block text-sm font-medium text-gray-400 mb-2">
                  Nama Item
                </label>
                <input
                  id="edit-item"
                  type="text"
                  value={editingExpense.item}
                  onChange={(e) => setEditingExpense({ ...editingExpense, item: e.target.value })}
                  placeholder="Contoh: Kopi Starbucks, Bensin, dll"
                  className="w-full bg-surface-input text-white text-base font-medium px-4 py-3 rounded-xl border border-white/10 focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-all"
                />
              </div>

              {/* Amount */}
              <div>
                <label htmlFor="edit-amount" className="block text-sm font-medium text-gray-400 mb-2">
                  Jumlah
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">Rp</span>
                  <input
                    id="edit-amount"
                    type="number"
                    value={editingExpense.amount}
                    onChange={(e) => setEditingExpense({ ...editingExpense, amount: parseFloat(e.target.value) || 0 })}
                    placeholder="0"
                    className="w-full bg-surface-input text-white text-base font-medium pl-12 pr-4 py-3 rounded-xl border border-white/10 focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-all"
                    step="1000"
                  />
                </div>
              </div>

              {/* Category */}
              <div>
                <label htmlFor="edit-category" className="block text-sm font-medium text-gray-400 mb-2">
                  Kategori
                </label>
                <select
                  id="edit-category"
                  value={editingExpense.category?.id || ''}
                  onChange={(e) => {
                    const categoryId = e.target.value;
                    if (categoryId) {
                      const selectedCategory = categories.find(c => c.id === categoryId);
                      setEditingExpense({ ...editingExpense, category: selectedCategory || null });
                    } else {
                      setEditingExpense({ ...editingExpense, category: null });
                    }
                  }}
                  className="w-full appearance-none bg-surface-input text-white text-base font-medium px-4 py-3 rounded-xl border border-white/10 focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-all"
                >
                  <option value="">Pilih Kategori</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id} className='bg-surface-dark'>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Date */}
              <div>
                <label htmlFor="edit-date" className="block text-sm font-medium text-gray-400 mb-2">
                  Tanggal
                </label>
                <input
                  id="edit-date"
                  type="date"
                  value={editingExpense.expenseDate.split('T')[0]}
                  onChange={(e) => {
                    // Convert date string to ISO datetime format
                    const dateValue = e.target.value;
                    const isoDateTime = dateValue ? new Date(dateValue + 'T00:00:00').toISOString() : editingExpense.expenseDate;
                    setEditingExpense({ ...editingExpense, expenseDate: isoDateTime });
                  }}
                  className="w-full bg-surface-input text-white text-base font-medium px-4 py-3 rounded-xl border border-white/10 focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-all"
                />
              </div>

              {/* Notes */}
              <div>
                <label htmlFor="edit-notes" className="block text-sm font-medium text-gray-400 mb-2">
                  Catatan (Opsional)
                </label>
                <textarea
                  id="edit-notes"
                  value={editingExpense.notes || ''}
                  onChange={(e) => setEditingExpense({ ...editingExpense, notes: e.target.value })}
                  placeholder="Tambahkan catatan tambahan..."
                  rows={3}
                  className="w-full bg-surface-input text-white text-base font-medium px-4 py-3 rounded-xl border border-white/10 focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-all resize-none"
                />
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingExpense(null);
                  }}
                  className="flex-1 h-12 px-6 rounded-xl border border-white/10 text-white hover:bg-white/5 font-bold text-base transition-colors"
                >
                  Batal
                </button>
                <button
                  onClick={handleSaveEdit}
                  disabled={isSaving || !editingExpense.item || editingExpense.amount <= 0}
                  className="flex-1 h-12 px-6 rounded-xl bg-primary hover:bg-primary/90 text-background-dark font-bold text-base shadow-lg shadow-primary/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isSaving ? (
                    <>
                      <span className="material-symbols-outlined animate-spin">progress_activity</span>
                      <span>Menyimpan...</span>
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined">check</span>
                      <span>Simpan Perubahan</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
