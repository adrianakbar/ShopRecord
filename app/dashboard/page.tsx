'use client';

import { useState } from 'react';
import Navigation from '@/components/Navigation';
import FloatingActionButton from '@/components/FloatingActionButton';

// Type definitions
interface ExpenseStat {
  label: string;
  amount: number;
  trend: number;
  isPositive: boolean;
  icon: string;
  iconBgColor: string;
}

interface CategoryData {
  name: string;
  amount: number;
  percentage: number;
  color: string;
}

interface ActivityItem {
  id: string;
  name: string;
  category: string;
  amount: number;
  timestamp: string;
  icon: string;
  iconColor: string;
  iconBgColor: string;
}

export default function DashboardPage() {
  const [naturalInput, setNaturalInput] = useState('');
  const userName = 'Alex';

  // Mock data - will be replaced with API calls
  const stats: ExpenseStat[] = [
    {
      label: 'Total Today',
      amount: 45.50,
      trend: 12,
      isPositive: true,
      icon: 'calendar_today',
      iconBgColor: 'bg-white/5 border-white/10'
    },
    {
      label: 'Total This Month',
      amount: 1205.00,
      trend: -5,
      isPositive: false,
      icon: 'date_range',
      iconBgColor: 'bg-white/5 dark:border-white/10'
    }
  ];

  const topCategories: CategoryData[] = [
    { name: 'Food & Dining', amount: 450, percentage: 65, color: 'bg-primary' },
    { name: 'Transportation', amount: 120, percentage: 35, color: 'bg-yellow-400' },
    { name: 'Entertainment', amount: 85, percentage: 20, color: 'bg-blue-400' }
  ];

  const recentActivity: ActivityItem[] = [
    {
      id: '1',
      name: 'Starbucks Coffee',
      category: 'Food & Drink',
      amount: 5.50,
      timestamp: 'Today, 9:41 AM',
      icon: 'local_cafe',
      iconColor: 'text-orange-600 dark:text-orange-400',
      iconBgColor: 'bg-orange-100 dark:bg-orange-500/10 dark:border-orange-500/20'
    },
    {
      id: '2',
      name: 'Uber Ride',
      category: 'Transport',
      amount: 18.25,
      timestamp: 'Yesterday, 6:20 PM',
      icon: 'directions_car',
      iconColor: 'text-blue-600 dark:text-blue-400',
      iconBgColor: 'bg-blue-100 dark:bg-blue-500/10 dark:border-blue-500/20'
    },
    {
      id: '3',
      name: 'Whole Foods Market',
      category: 'Groceries',
      amount: 82.10,
      timestamp: 'Yesterday, 12:30 PM',
      icon: 'shopping_bag',
      iconColor: 'text-purple-600 dark:text-purple-400',
      iconBgColor: 'bg-purple-100 dark:bg-purple-500/10 dark:border-purple-500/20'
    }
  ];

  const handleAddExpense = () => {
    if (naturalInput.trim()) {
      // TODO: Send to AI parser endpoint
      console.log('Adding expense:', naturalInput);
      setNaturalInput('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleAddExpense();
    }
  };

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark">
      <Navigation variant="default" currentPage="dashboard" />
      
      <main className="flex-1 flex flex-col">
        <div className="w-full max-w-7xl mx-auto p-4 md:p-8 flex flex-col gap-8">
          {/* Header */}
          <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
            <div className="flex flex-col gap-1">
              <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight dark:text-white">
                Hello, {userName}
              </h2>
              <p className="text-gray-500 dark:text-text-dim">
                Here is your financial summary for today.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-primary/20 text-primary text-xs font-bold uppercase tracking-wider border border-primary/20">
                AI Active
              </span>
              <span className="text-xs text-gray-400 dark:text-gray-500">
                Last updated: Just now
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
                placeholder='Try: "Spent $15 on coffee at Starbucks..."'
                type="text"
                value={naturalInput}
                onChange={(e) => setNaturalInput(e.target.value)}
                onKeyPress={handleKeyPress}
              />
              <button
                onClick={handleAddExpense}
                className="absolute right-2 top-1.5 bottom-1.5 bg-primary hover:bg-primary-hover text-white px-6 rounded-full font-bold text-sm transition-transform active:scale-95 flex items-center gap-2 shadow-md shadow-primary/30"
              >
                <span>Add</span>
                <span className="material-symbols-outlined text-[18px]">arrow_upward</span>
              </button>
            </label>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Today's Total - Featured Card */}
            <div className="flex flex-col p-6 rounded-lg bg-surface-dark border border-border-dark text-white relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-40 h-40 bg-primary/10 rounded-full blur-[60px] -mr-10 -mt-10 group-hover:bg-primary/20 transition-all duration-500"></div>
              <div className="flex justify-between items-start mb-4 relative z-10">
                <div className="p-3 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-sm">
                  <span className="material-symbols-outlined text-primary">
                    {stats[0].icon}
                  </span>
                </div>
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
              </div>
              <div className="mt-auto relative z-10">
                <p className="text-gray-400 text-sm font-medium mb-1">{stats[0].label}</p>
                <h3 className="text-4xl font-extrabold tracking-tight text-white">
                  ${stats[0].amount.toFixed(2)}
                </h3>
              </div>
            </div>

            {/* Monthly Total Card */}
            <div className="flex flex-col p-6 rounded-lg bg-white dark:bg-surface-dark dark:text-white shadow-sm dark:shadow-none border border-gray-100 dark:border-border-dark relative overflow-hidden group">
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-gray-100 dark:bg-white/5 dark:border dark:border-white/10 rounded-2xl transition-colors">
                  <span className="material-symbols-outlined text-gray-600 dark:text-gray-300">
                    {stats[1].icon}
                  </span>
                </div>
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
              </div>
              <div className="mt-auto">
                <p className="text-gray-500 dark:text-gray-400 text-sm font-medium mb-1">
                  {stats[1].label}
                </p>
                <h3 className="text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white">
                  ${stats[1].amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </h3>
              </div>
            </div>

            {/* Top Categories Card */}
            <div className="flex flex-col p-6 rounded-lg bg-white dark:bg-surface-dark shadow-sm dark:shadow-none border border-gray-100 dark:border-border-dark md:col-span-2 lg:col-span-1">
              <div className="flex justify-between items-center mb-5">
                <h4 className="text-lg font-bold dark:text-white">Top Categories</h4>
                <button className="text-xs font-semibold text-primary hover:text-primary-hover transition-colors">
                  See Details
                </button>
              </div>
              <div className="flex flex-col gap-5 justify-center h-full">
                {topCategories.map((category, index) => (
                  <div key={index} className="flex flex-col gap-2">
                    <div className="flex justify-between text-sm items-end">
                      <span className="font-medium text-gray-600 dark:text-gray-300">
                        {category.name}
                      </span>
                      <span className="font-bold text-gray-900 dark:text-white">
                        ${category.amount}
                      </span>
                    </div>
                    <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-2 overflow-hidden">
                      <div
                        className={`${category.color} h-2 rounded-full shadow-[0_0_10px_rgba(83,210,45,0.4)]`}
                        style={{ width: `${category.percentage}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold dark:text-white">Recent Activity</h2>
              <button className="text-sm font-bold text-primary hover:text-primary-hover transition-colors">
                View All
              </button>
            </div>
            <div className="flex flex-col gap-3">
              {recentActivity.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-center justify-between p-4 rounded-2xl bg-white dark:bg-surface-dark border border-gray-100 dark:border-border-dark hover:border-primary/50 hover:bg-gray-50 dark:hover:bg-card-hover transition-all cursor-pointer group"
                >
                  <div className="flex items-center gap-4">
                    <div className={`h-12 w-12 rounded-full ${activity.iconBgColor} ${activity.iconColor} flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors border border-transparent group-hover:border-primary`}>
                      <span className="material-symbols-outlined">{activity.icon}</span>
                    </div>
                    <div className="flex flex-col">
                      <p className="font-bold text-gray-900 dark:text-white text-base">
                        {activity.name}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {activity.timestamp} • {activity.category}
                      </p>
                    </div>
                  </div>
                  <p className="font-bold text-gray-900 dark:text-white text-lg">
                    -${activity.amount.toFixed(2)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      {/* Floating Action Button */}
      <FloatingActionButton />
    </div>
  );
}
