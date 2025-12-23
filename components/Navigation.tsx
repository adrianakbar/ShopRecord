'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface NavigationProps {
  currentPage?: 'dashboard' | 'transactions' | 'history' | 'analytics' | 'quick-add';
  variant?: 'default' | 'simple';
  showNotifications?: boolean;
}

export default function Navigation({ 
  currentPage, 
  variant = 'default',
  showNotifications = false 
}: NavigationProps) {
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const router = useRouter();

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
      });

      if (response.ok) {
        // Redirect to home or login page
        router.push('/');
      } else {
        console.error('Logout failed');
      }
    } catch (error) {
      console.error('Error during logout:', error);
    } finally {
      setIsLoggingOut(false);
      setShowProfileDropdown(false);
    }
  };
  if (variant === 'simple') {
    return (
      <div className="w-full border-b border-border-dark bg-background-dark/50 backdrop-blur-md sticky top-0 z-50">
        <div className="px-4 sm:px-6 lg:px-10 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-4 text-white cursor-pointer">
            <div className="size-8 rounded-full bg-primary/20 flex items-center justify-center text-primary">
              <span className="material-symbols-outlined">account_balance_wallet</span>
            </div>
            <h2 className="text-white text-lg font-bold leading-tight tracking-[-0.015em]">ShopRecord</h2>
          </Link>
          <div className="flex items-center gap-4">
            {showNotifications && (
              <button className="hidden sm:flex size-10 items-center justify-center rounded-full bg-surface-input hover:bg-white/10 text-white transition-colors">
                <span className="material-symbols-outlined">notifications</span>
              </button>
            )}
            <div className="relative">
              <button
                onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                className="bg-center bg-no-repeat bg-cover rounded-full size-10 border-2 border-primary/30 hover:border-primary/50 transition-colors cursor-pointer" 
                style={{
                  backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuDTUru21QkcSZRx7Hlqbj0sGe8-w6sMYEO2aVkj-Iyn3dihsEaXWHMDPwFeW_DyOtGTOaUrrc2tF_JxiwHmdtcKriF8SE6NKWERf1c5_V_3hOyhj-pcK_jO-qfl8mZAW9IjdUFon43hxnoq45e-OJhCL5aeDnIrmVd85Ydvd1dkdd7LIy-RlhYY_eVnuG-VDZhAmBJCLQvDKvtGbNUBJnf6W-07mPpjqD03SGSHFX4xQ0CU_OzyP-o6Z5CN1EPzDjQBgU999s3KspI")'
                }}
                aria-label="User profile picture"
              />
              
              {showProfileDropdown && (
                <div className="absolute right-0 mt-2 w-48 bg-surface-dark border border-white/10 rounded-xl shadow-xl z-[200] overflow-hidden">
                  <button
                    onClick={handleLogout}
                    disabled={isLoggingOut}
                    className="w-full px-4 py-3 text-left hover:bg-white/5 transition-colors flex items-center gap-3 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span className="material-symbols-outlined text-red-400">logout</span>
                    <span>{isLoggingOut ? 'Logging out...' : 'Logout'}</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <nav 
      className="border-b border-gray-200 dark:border-border-dark bg-surface-light dark:bg-background-dark/80 backdrop-blur-md sticky top-0 z-50"
      onClick={() => {
        setShowProfileDropdown(false);
        setShowMobileMenu(false);
      }}
    >
      <div className="w-full mx-auto px-4 sm:px-6 lg:px-10">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 text-white">
            <div className="flex items-center justify-center size-8 rounded-full bg-primary/20 text-primary">
              <span className="material-symbols-outlined text-xl">
                account_balance_wallet
              </span>
            </div>
            <h2 className="text-white text-lg font-bold leading-tight tracking-tight">
              ShopRecord
            </h2>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex flex-1 justify-end items-center gap-8">
            <nav className="flex gap-6">
              <a
                className={`text-sm font-medium transition-colors ${
                  currentPage === 'dashboard'
                    ? 'text-primary'
                    : 'hover:text-primary'
                }`}
                href="/dashboard"
              >
                Dashboard
              </a>
              <a
                className={`text-sm font-medium transition-colors ${
                  currentPage === 'transactions'
                    ? 'text-primary'
                    : 'hover:text-primary'
                }`}
                href="/transactions"
              >
                Transactions
              </a>
              <a
                className={`text-sm font-medium transition-colors ${
                  currentPage === 'history'
                    ? 'text-primary'
                    : 'hover:text-primary'
                }`}
                href="/history"
              >
                History
              </a>
              <a
                className={`text-sm font-medium transition-colors ${
                  currentPage === 'analytics'
                    ? 'text-primary'
                    : 'hover:text-primary'
                }`}
                href="/analytics"
              >
                Analytics
              </a>
            </nav>

            {/* Profile */}
            <div className="flex items-center gap-3 pl-6 border-l border-gray-200 dark:border-border-dark relative">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowProfileDropdown(!showProfileDropdown);
                }}
                className="size-9 rounded-full bg-cover bg-center ring-2 ring-primary/20 hover:ring-primary/40 transition-all cursor-pointer"
                style={{
                  backgroundImage:
                    'url("https://lh3.googleusercontent.com/aida-public/AB6AXuDTUru21QkcSZRx7Hlqbj0sGe8-w6sMYEO2aVkj-Iyn3dihsEaXWHMDPwFeW_DyOtGTOaUrrc2tF_JxiwHmdtcKriF8SE6NKWERf1c5_V_3hOyhj-pcK_jO-qfl8mZAW9IjdUFon43hxnoq45e-OJhCL5aeDnIrmVd85Ydvd1dkdd7LIy-RlhYY_eVnuG-VDZhAmBJCLQvDKvtGbNUBJnf6W-07mPpjqD03SGSHFX4xQ0CU_OzyP-o6Z5CN1EPzDjQBgU999s3KspI")',
                }}
                aria-label="User profile avatar"
              />

              {showProfileDropdown && (
                <div 
                  className="absolute right-0 top-12 w-48 bg-surface-dark border border-white/10 rounded-xl shadow-xl z-[200] overflow-hidden"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    onClick={handleLogout}
                    disabled={isLoggingOut}
                    className="w-full px-4 py-3 text-left hover:bg-white/5 transition-colors flex items-center gap-3 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span className="material-symbols-outlined text-red-400">logout</span>
                    <span>{isLoggingOut ? 'Logging out...' : 'Logout'}</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button 
              onClick={(e) => {
                e.stopPropagation();
                setShowMobileMenu(!showMobileMenu);
              }}
              className="p-2 text-gray-500 hover:text-primary"
            >
              <span className="material-symbols-outlined">
                {showMobileMenu ? 'close' : 'menu'}
              </span>
            </button>
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        {showMobileMenu && (
          <div className="md:hidden border-t border-gray-200 dark:border-border-dark bg-surface-light dark:bg-surface-dark">
            <nav className="flex flex-col py-2">
              <a
                className={`px-4 py-3 text-sm font-medium transition-colors ${
                  currentPage === 'dashboard'
                    ? 'text-primary bg-primary/10'
                    : 'text-white hover:text-primary hover:bg-white/5'
                }`}
                href="/dashboard"
                onClick={() => setShowMobileMenu(false)}
              >
                Dashboard
              </a>
              <a
                className={`px-4 py-3 text-sm font-medium transition-colors ${
                  currentPage === 'transactions'
                    ? 'text-primary bg-primary/10'
                    : 'text-white hover:text-primary hover:bg-white/5'
                }`}
                href="/transactions"
                onClick={() => setShowMobileMenu(false)}
              >
                Transactions
              </a>
              <a
                className={`px-4 py-3 text-sm font-medium transition-colors ${
                  currentPage === 'history'
                    ? 'text-primary bg-primary/10'
                    : 'text-white hover:text-primary hover:bg-white/5'
                }`}
                href="/history"
                onClick={() => setShowMobileMenu(false)}
              >
                History
              </a>
              <a
                className={`px-4 py-3 text-sm font-medium transition-colors ${
                  currentPage === 'analytics'
                    ? 'text-primary bg-primary/10'
                    : 'text-white hover:text-primary hover:bg-white/5'
                }`}
                href="/analytics"
                onClick={() => setShowMobileMenu(false)}
              >
                Analytics
              </a>
            </nav>
          </div>
        )}
      </div>
    </nav>
  );
}
