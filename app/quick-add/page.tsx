"use client";

import Navigation from "@/components/Navigation";
import { useState } from "react";

interface ParsedExpense {
  item: string;
  amount: number;
  category: string;
  date: string;
  confidence: number;
  notes?: string;
}

interface ParseResponse {
  success: boolean;
  expenses?: ParsedExpense[];
  error?: string;
}

const CATEGORIES = [
  { value: "Makanan & Minuman", color: "primary", icon: "restaurant" },
  { value: "Belanjaan", color: "[#e8a95e]", icon: "shopping_cart" },
  { value: "Transportasi", color: "[#5ea9e8]", icon: "directions_car" },
  { value: "Utilitas", color: "[#a95ee8]", icon: "lightbulb" },
  { value: "Hiburan", color: "[#e85e5e]", icon: "movie" },
  { value: "Belanja", color: "[#5ee8a9]", icon: "shopping_bag" },
  { value: "Kesehatan", color: "[#e8d95e]", icon: "medical_services" },
  { value: "Kopi & Kafe", color: "[#8e5ee8]", icon: "local_cafe" },
];

const getCategoryIcon = (category: string, customCats: typeof CATEGORIES = []) => {
  const cat = [...CATEGORIES, ...customCats].find(c => c.value === category);
  return cat?.icon || "payments";
};

const getCategoryColor = (category: string, customCats: typeof CATEGORIES = []) => {
  const cat = [...CATEGORIES, ...customCats].find(c => c.value === category);
  return cat?.color || "primary";
};

// Normalize confidence to 0-1 range (if it comes as 0-100, divide by 100)
const normalizeConfidence = (confidence: number): number => {
  if (confidence > 1) {
    return Math.min(confidence / 100, 1);
  }
  return Math.min(confidence, 1);
};

export default function QuickAdd() {
  const [inputText, setInputText] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [parsedExpenses, setParsedExpenses] = useState<ParsedExpense[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [showSourceText, setShowSourceText] = useState(false);
  const [customCategories, setCustomCategories] = useState<Array<{value: string, color: string, icon: string}>>([]);
  const [showAddCategoryModal, setShowAddCategoryModal] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [editingExpenseIndex, setEditingExpenseIndex] = useState<number | null>(null);

  const allCategories = [...CATEGORIES, ...customCategories];

  const handleProcess = async () => {
    if (!inputText.trim()) return;

    setIsProcessing(true);
    setError(null);

    try {
      const response = await fetch("/api/ai/parse", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text: inputText }),
      });

      const data: ParseResponse = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to process expenses");
      }

      if (data.success && data.expenses) {
        // Normalize confidence scores to 0-1 range
        const normalized = data.expenses.map(exp => ({
          ...exp,
          confidence: normalizeConfidence(exp.confidence)
        }));
        setParsedExpenses(normalized);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
      e.preventDefault();
      handleProcess();
    }
  };

  const handleUpdateExpense = (index: number, field: keyof ParsedExpense, value: string | number) => {
    const updated = [...parsedExpenses];
    updated[index] = { ...updated[index], [field]: value };
    setParsedExpenses(updated);
  };

  const handleDeleteExpense = (index: number) => {
    setParsedExpenses(parsedExpenses.filter((_, i) => i !== index));
  };

  const handleAddExpense = () => {
    const newExpense: ParsedExpense = {
      item: "",
      amount: 0,
      category: "Makanan & Minuman",
      date: new Date().toISOString().split('T')[0],
      confidence: 1,
      notes: "",
    };
    setParsedExpenses([...parsedExpenses, newExpense]);
  };

  const handleSaveExpenses = async () => {
    setIsSaving(true);
    setError(null);

    try {
      const response = await fetch('/api/expenses/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          expenses: parsedExpenses.map(exp => ({
            item: exp.item,
            amount: exp.amount,
            category: exp.category,
            date: exp.date,
            notes: exp.notes || null,
          }))
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to save expenses');
      }

      // Success - clear form
      setParsedExpenses([]);
      setInputText("");
      alert(`${data.count} expenses saved successfully!`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save expenses");
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddCategory = () => {
    if (!newCategoryName.trim()) return;
    
    const newCategory = {
      value: newCategoryName.trim(),
      color: "[#" + Math.floor(Math.random()*16777215).toString(16) + "]", // Random color
      icon: "payments"
    };
    
    setCustomCategories([...customCategories, newCategory]);
    
    // Update expense with new category if editing
    if (editingExpenseIndex !== null) {
      handleUpdateExpense(editingExpenseIndex, 'category', newCategory.value);
      setEditingExpenseIndex(null);
    }
    
    setNewCategoryName("");
    setShowAddCategoryModal(false);
  };

  const handleCategoryChange = (index: number, value: string) => {
    if (value === "__ADD_NEW__") {
      setEditingExpenseIndex(index);
      setShowAddCategoryModal(true);
    } else {
      handleUpdateExpense(index, 'category', value);
    }
  };

  const totalAmount = parsedExpenses.reduce((sum, exp) => sum + exp.amount, 0);
  const avgConfidence = parsedExpenses.length > 0 
    ? parsedExpenses.reduce((sum, exp) => sum + normalizeConfidence(exp.confidence), 0) / parsedExpenses.length 
    : 0;

  return (
    <>
      {/* <Navigation currentPage="quick-add" /> */}

      {/* Main Content */}
      <main className="flex-grow flex flex-col items-center py-8 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-6xl">
          {/* Show input form if no parsed results */}
          {parsedExpenses.length === 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
              {/* Left Column: Input Area (Span 7) */}
              <div className="lg:col-span-7 flex flex-col justify-center">
              <div className="mb-8">
                <h2 className="text-4xl md:text-5xl font-black leading-tight tracking-tight mb-4">
                  Track spending at the{" "}
                  <span className="text-primary">speed of thought</span>
                </h2>
                <p className="text-gray-600 dark:text-[#a2c398] text-lg">
                  Just type what you bought. Our AI extracts the merchant, date,
                  category, and amount automatically.
                </p>
              </div>

              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-primary to-green-600 rounded-2xl blur opacity-20 group-hover:opacity-30 transition duration-1000 group-hover:duration-200" />

                <div className="relative bg-surface-light dark:bg-surface-dark rounded-xl p-1 shadow-xl border border-gray-200 dark:border-[#2e4328]">
                  <label className="sr-only" htmlFor="expense-input">
                    Expense Input
                  </label>
                  <textarea
                    autoFocus
                    className="w-full bg-transparent border-0 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-[#5a7053] text-xl md:text-2xl font-medium leading-relaxed p-6 min-h-[280px] focus:ring-0 resize-none rounded-lg"
                    id="expense-input"
                    placeholder="Contoh: beli dada ayam 19rb kemarin, makan siang 25rb di warteg, bensin 50rb hari ini..."
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    onKeyDown={handleKeyDown}
                    disabled={isProcessing}
                  />

                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 border-t border-gray-100 dark:border-[#2e4328]">
                    <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-[#a2c398]">
                      <span className="material-symbols-outlined text-lg">
                        keyboard_command_key
                      </span>
                      <span>+</span>
                      <span className="material-symbols-outlined text-lg">
                        keyboard_return
                      </span>
                      <span className="hidden sm:inline">
                        to submit instantly
                      </span>
                    </div>

                    <button 
                      onClick={handleProcess}
                      disabled={isProcessing || !inputText.trim()}
                      className="w-full sm:w-auto flex items-center justify-center gap-2 bg-primary hover:bg-[#45b025] text-[#162013] font-bold py-3 px-8 rounded-full transition-all transform active:scale-95 shadow-lg shadow-primary/25 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <span className="material-symbols-outlined">
                        {isProcessing ? "hourglass_empty" : "auto_awesome"}
                      </span>
                      <span>{isProcessing ? "Processing..." : "Process AI Expenses"}</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="mt-4 p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
                  <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
                    <span className="material-symbols-outlined">error</span>
                    <span className="font-medium">{error}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Right Column: Sidebar (Span 5) */}
            <div className="lg:col-span-5 flex flex-col gap-6 mt-8 lg:mt-0">
              {/* Tips Card */}
              <div className="bg-surface-light dark:bg-surface-dark rounded-2xl p-6 border border-gray-200 dark:border-[#2e4328]">
                <div className="flex items-center gap-3 mb-4 text-primary">
                  <span className="material-symbols-outlined">lightbulb</span>
                  <h3 className="font-bold text-lg">Smart Tips</h3>
                </div>

                <ul className="space-y-4">
                  <li className="flex gap-3 text-sm text-gray-600 dark:text-gray-300">
                    <span className="material-symbols-outlined text-[#a2c398] shrink-0 text-base mt-0.5">
                      check_circle
                    </span>
                    <span>
                      <strong>Multi transaksi:</strong> Pisahkan dengan koma atau baris baru untuk beberapa transaksi sekaligus.
                    </span>
                  </li>
                  <li className="flex gap-3 text-sm text-gray-600 dark:text-gray-300">
                    <span className="material-symbols-outlined text-[#a2c398] shrink-0 text-base mt-0.5">
                      check_circle
                    </span>
                    <span>
                      <strong>Tanggal:</strong> &quot;kemarin&quot;, &quot;2 hari lalu&quot;, &quot;minggu lalu&quot;, atau tanggal spesifik.
                    </span>
                  </li>
                  <li className="flex gap-3 text-sm text-gray-600 dark:text-gray-300">
                    <span className="material-symbols-outlined text-[#a2c398] shrink-0 text-base mt-0.5">
                      check_circle
                    </span>
                    <span>
                      <strong>Format harga:</strong> Tulis 19rb, 19k, atau 19000 - semua format didukung AI.
                    </span>
                  </li>
                </ul>
              </div>

              {/* Recent Processed */}
              <div className="bg-surface-light dark:bg-surface-dark rounded-2xl p-6 border border-gray-200 dark:border-[#2e4328] flex-1">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-bold text-lg dark:text-white">
                    Just Added
                  </h3>
                  <a
                    className="text-xs font-bold text-primary hover:underline uppercase tracking-wider"
                    href="#"
                  >
                    View All
                  </a>
                </div>

                <div className="space-y-4">
                  {/* Item 1 */}
                  <div className="flex items-center justify-between group cursor-pointer hover:bg-gray-50 dark:hover:bg-white/5 p-2 -mx-2 rounded-lg transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="size-10 rounded-full bg-blue-500/10 text-blue-500 flex items-center justify-center">
                        <span className="material-symbols-outlined">
                          local_cafe
                        </span>
                      </div>
                      <div className="flex flex-col">
                        <span className="font-bold text-sm dark:text-gray-200">
                          Starbucks Coffee
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          Food &amp; Drink • Today
                        </span>
                      </div>
                    </div>
                    <span className="font-bold text-gray-900 dark:text-white">
                      -$5.40
                    </span>
                  </div>

                  {/* Item 2 */}
                  <div className="flex items-center justify-between group cursor-pointer hover:bg-gray-50 dark:hover:bg-white/5 p-2 -mx-2 rounded-lg transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="size-10 rounded-full bg-orange-500/10 text-orange-500 flex items-center justify-center">
                        <span className="material-symbols-outlined">
                          local_taxi
                        </span>
                      </div>
                      <div className="flex flex-col">
                        <span className="font-bold text-sm dark:text-gray-200">
                          Uber Trip
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          Transport • Yesterday
                        </span>
                      </div>
                    </div>
                    <span className="font-bold text-gray-900 dark:text-white">
                      -$24.50
                    </span>
                  </div>

                  {/* Item 3 */}
                  <div className="flex items-center justify-between group cursor-pointer hover:bg-gray-50 dark:hover:bg-white/5 p-2 -mx-2 rounded-lg transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="size-10 rounded-full bg-purple-500/10 text-purple-500 flex items-center justify-center">
                        <span className="material-symbols-outlined">
                          shopping_bag
                        </span>
                      </div>
                      <div className="flex flex-col">
                        <span className="font-bold text-sm dark:text-gray-200">
                          Apple Store
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          Electronics • Oct 24
                        </span>
                      </div>
                    </div>
                    <span className="font-bold text-gray-900 dark:text-white">
                      -$129.00
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          ) : (
            /* Review & Edit Section */
            <div className="flex flex-col gap-8">
              {/* Page Heading */}
              <div className="flex flex-col gap-6">
                <div className="flex flex-wrap justify-between items-end gap-4">
                  <div className="flex flex-col gap-2">
                    <h1 className="text-white text-3xl md:text-4xl font-black leading-tight tracking-tight">
                      Review & Edit Hasil AI
                    </h1>
                    <p className="text-[#a2c398] text-base font-normal max-w-2xl">
                      Kami menemukan {parsedExpenses.length} transaksi. Silakan review dan edit sebelum menyimpan.
                    </p>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-xs font-bold text-primary uppercase tracking-wider mb-1">
                      Confidence Score
                    </span>
                    <div className="flex items-center gap-2 bg-surface-input px-3 py-1 rounded-full border border-[#426039]">
                      <span className="size-2 rounded-full bg-primary animate-pulse"></span>
                      <span className="text-white font-bold text-sm">
                        {Math.round(avgConfidence * 100)}%
                      </span>
                    </div>
                  </div>
                </div>

                {/* Collapsible Source Text */}
                <details 
                  open={showSourceText}
                  onToggle={(e) => setShowSourceText(e.currentTarget.open)}
                  className="group flex flex-col rounded-xl border border-[#426039] bg-surface-dark overflow-hidden transition-all duration-300 open:pb-4"
                >
                  <summary className="flex cursor-pointer items-center justify-between gap-6 px-5 py-4 bg-surface-dark hover:bg-white/5 transition-colors select-none">
                    <div className="flex items-center gap-3">
                      <span className="material-symbols-outlined text-primary">description</span>
                      <p className="text-white text-sm font-bold uppercase tracking-wider">
                        Teks Input Asli
                      </p>
                    </div>
                    <div className="text-[#a2c398] transition-transform duration-300 group-open:rotate-180 flex items-center">
                      <span className="material-symbols-outlined">expand_more</span>
                    </div>
                  </summary>
                  <div className="px-5 pt-2">
                    <div className="p-4 rounded-lg bg-black/20 border border-white/5 font-mono text-sm text-[#a2c398] leading-relaxed whitespace-pre-wrap">
                      {inputText}
                    </div>
                  </div>
                </details>
              </div>

              {/* Editable Table */}
              <div className="flex flex-col bg-surface-dark rounded-xl border border-[#426039] overflow-hidden shadow-2xl shadow-black/20">
                <div className="overflow-x-auto custom-scrollbar pb-2 sm:pb-0">
                  <table className="w-full min-w-[800px] text-left border-collapse">
                    <thead>
                      <tr className="bg-[#21301c] border-b border-[#426039]">
                        <th className="p-4 w-[25%] text-xs font-bold text-[#a2c398] uppercase tracking-wider">
                          Item / Nama
                        </th>
                        <th className="p-4 w-[12%] text-xs font-bold text-[#a2c398] uppercase tracking-wider">
                          Harga
                        </th>
                        <th className="p-4 w-[18%] text-xs font-bold text-[#a2c398] uppercase tracking-wider">
                          Kategori
                        </th>
                        <th className="p-4 w-[20%] text-xs font-bold text-[#a2c398] uppercase tracking-wider">
                          Deskripsi
                        </th>
                        <th className="p-4 w-[13%] text-xs font-bold text-[#a2c398] uppercase tracking-wider">
                          Tanggal
                        </th>
                        <th className="p-4 w-[8%] text-xs font-bold text-[#a2c398] uppercase tracking-wider">
                          Confidence
                        </th>
                        <th className="p-4 w-[4%] text-center text-xs font-bold text-[#a2c398] uppercase tracking-wider">
                          Action
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#426039]">
                      {parsedExpenses.map((expense, index) => (
                        <tr key={index} className="group hover:bg-white/5 transition-colors">
                          <td className="p-3">
                            <div className="flex items-center gap-2">
                              <div className={`size-8 rounded-full bg-${getCategoryColor(expense.category, customCategories)}/20 flex items-center justify-center shrink-0`}>
                                <span className={`material-symbols-outlined text-sm text-${getCategoryColor(expense.category, customCategories)}`}>
                                  {getCategoryIcon(expense.category, customCategories)}
                                </span>
                              </div>
                              <input
                                type="text"
                                value={expense.item}
                                onChange={(e) => handleUpdateExpense(index, 'item', e.target.value)}
                                className="flex-1 bg-surface-input text-white text-sm font-medium px-4 py-2.5 rounded-full border border-transparent focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-all placeholder-[#a2c398]/50"
                                placeholder="Nama item..."
                              />
                            </div>
                          </td>
                          <td className="p-3">
                            <div className="relative flex items-center">
                              {normalizeConfidence(expense.confidence) < 0.8 && (
                                <span className="absolute -top-1 -right-1 flex h-3 w-3">
                                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75"></span>
                                  <span className="relative inline-flex rounded-full h-3 w-3 bg-yellow-500"></span>
                                </span>
                              )}
                              <span className="absolute left-3 text-[#a2c398] text-sm">Rp</span>
                              <input
                                type="number"
                                value={expense.amount}
                                onChange={(e) => handleUpdateExpense(index, 'amount', parseFloat(e.target.value) || 0)}
                                className={`w-full bg-surface-input text-white text-sm font-medium pl-8 pr-4 py-2.5 rounded-full border border-transparent focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-all ${
                                  normalizeConfidence(expense.confidence) < 0.8 ? 'ring-1 ring-yellow-500/50' : ''
                                }`}
                                step="100"
                              />
                            </div>
                          </td>
                          <td className="p-3">
                            <div className="relative">
                              <select
                                value={expense.category}
                                onChange={(e) => handleCategoryChange(index, e.target.value)}
                                className="w-full appearance-none bg-primary/20 text-primary hover:bg-primary/30 cursor-pointer text-sm font-bold px-4 py-2.5 rounded-full border border-transparent focus:border-primary focus:ring-0 focus:outline-none transition-all pr-10"
                              >
                                <optgroup label="Default Categories">
                                  {CATEGORIES.map((cat) => (
                                    <option key={cat.value} value={cat.value}>
                                      {cat.value}
                                    </option>
                                  ))}
                                </optgroup>
                                {customCategories.length > 0 && (
                                  <optgroup label="Custom Categories">
                                    {customCategories.map((cat) => (
                                      <option key={cat.value} value={cat.value}>
                                        {cat.value}
                                      </option>
                                    ))}
                                  </optgroup>
                                )}
                                <option value="__ADD_NEW__" className="font-bold text-primary">
                                  + Add New Category
                                </option>
                              </select>
                              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-primary">
                                <span className="material-symbols-outlined text-sm">expand_more</span>
                              </div>
                            </div>
                          </td>
                          <td className="p-3">
                            <input
                              type="text"
                              value={expense.notes || ""}
                              onChange={(e) => handleUpdateExpense(index, 'notes', e.target.value)}
                              className="w-full bg-surface-input text-white text-sm font-medium px-4 py-2.5 rounded-full border border-transparent focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-all placeholder-[#a2c398]/50"
                              placeholder="Catatan tambahan..."
                            />
                          </td>
                          <td className="p-3">
                            <input
                              type="date"
                              value={expense.date}
                              onChange={(e) => handleUpdateExpense(index, 'date', e.target.value)}
                              className="w-full bg-surface-input text-white text-sm font-medium px-4 py-2.5 rounded-full border border-transparent focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-all text-left uppercase tracking-wide"
                            />
                          </td>
                          <td className="p-3">
                            <div className="flex items-center gap-2">
                              <div className="flex-1 bg-gray-700 rounded-full h-2">
                                <div
                                  className={`h-2 rounded-full ${
                                    normalizeConfidence(expense.confidence) >= 0.8 ? 'bg-primary' : 'bg-yellow-500'
                                  }`}
                                  style={{ width: `${normalizeConfidence(expense.confidence) * 100}%` }}
                                />
                              </div>
                              <span className="text-xs text-gray-400 min-w-[36px] text-right">
                                {Math.round(normalizeConfidence(expense.confidence) * 100)}%
                              </span>
                            </div>
                          </td>
                          <td className="p-3 text-center">
                            <button
                              onClick={() => handleDeleteExpense(index)}
                              className="size-9 rounded-full text-[#a2c398] hover:text-red-400 hover:bg-red-400/10 flex items-center justify-center transition-colors mx-auto"
                              aria-label="Delete expense"
                            >
                              <span className="material-symbols-outlined">delete</span>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Add Item Button */}
                <div className="p-3 bg-[#1a2617] border-t border-[#426039]">
                  <button
                    onClick={handleAddExpense}
                    className="flex items-center justify-center gap-2 w-full py-3 rounded-xl border border-dashed border-[#426039] hover:border-primary hover:bg-primary/5 text-[#a2c398] hover:text-primary transition-all group"
                  >
                    <span className="material-symbols-outlined group-hover:scale-110 transition-transform">
                      add_circle
                    </span>
                    <span className="text-sm font-bold">Tambah Item</span>
                  </button>
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
                  <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
                    <span className="material-symbols-outlined">error</span>
                    <span className="font-medium">{error}</span>
                  </div>
                </div>
              )}

              {/* Summary & Actions */}
              <div className="flex flex-col-reverse md:flex-row justify-between items-center gap-6 p-6 rounded-2xl bg-surface-dark border border-[#426039] mb-10">
                <button
                  onClick={() => {
                    setParsedExpenses([]);
                    setInputText("");
                  }}
                  className="text-[#a2c398] hover:text-white text-sm font-bold py-2 px-4 rounded-full hover:bg-white/5 transition-colors"
                >
                  Discard All
                </button>
                <div className="flex flex-col md:flex-row items-center gap-6 w-full md:w-auto">
                  <div className="flex items-baseline gap-2">
                    <span className="text-[#a2c398] text-sm font-medium uppercase tracking-wider">
                      Total:
                    </span>
                    <span className="text-white text-2xl font-black tracking-tight">
                      Rp {totalAmount.toLocaleString('id-ID')}
                    </span>
                  </div>
                  <div className="flex gap-3 w-full md:w-auto">
                    <button
                      onClick={() => {
                        setParsedExpenses([]);
                        setInputText("");
                      }}
                      className="flex-1 md:flex-none h-12 px-6 rounded-full border border-[#426039] text-white hover:bg-white/5 font-bold text-sm transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSaveExpenses}
                      disabled={isSaving || parsedExpenses.length === 0}
                      className="flex-1 md:flex-none h-12 px-8 rounded-full bg-primary hover:bg-primary/90 text-background-dark font-bold text-sm shadow-lg shadow-primary/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <span className="material-symbols-outlined text-[20px]">
                        {isSaving ? "hourglass_empty" : "check"}
                      </span>
                      <span>{isSaving ? "Saving..." : `Save ${parsedExpenses.length} Expenses`}</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Add Category Modal */}
      {showAddCategoryModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-surface-dark border border-[#426039] rounded-2xl p-6 max-w-md w-full shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-white">Add New Category</h3>
              <button
                onClick={() => {
                  setShowAddCategoryModal(false);
                  setNewCategoryName("");
                  setEditingExpenseIndex(null);
                }}
                className="size-8 rounded-full hover:bg-white/10 flex items-center justify-center text-gray-400 hover:text-white transition-colors"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label htmlFor="category-name" className="block text-sm font-medium text-[#a2c398] mb-2">
                  Category Name
                </label>
                <input
                  id="category-name"
                  type="text"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleAddCategory();
                    }
                  }}
                  placeholder="e.g., Pet Care, Education, Gifts..."
                  className="w-full bg-surface-input text-white text-sm font-medium px-4 py-3 rounded-xl border border-[#426039] focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-all"
                  autoFocus
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => {
                    setShowAddCategoryModal(false);
                    setNewCategoryName("");
                    setEditingExpenseIndex(null);
                  }}
                  className="flex-1 h-11 px-6 rounded-full border border-[#426039] text-white hover:bg-white/5 font-bold text-sm transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddCategory}
                  disabled={!newCategoryName.trim()}
                  className="flex-1 h-11 px-6 rounded-full bg-primary hover:bg-primary/90 text-background-dark font-bold text-sm shadow-lg shadow-primary/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Add Category
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
