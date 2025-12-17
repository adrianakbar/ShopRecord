'use client';

interface NavigationProps {
  currentPage?: 'dashboard' | 'quick-add' | 'reports' | 'settings' | 'review';
  variant?: 'default' | 'simple';
  showNotifications?: boolean;
}

export default function Navigation({ 
  currentPage, 
  variant = 'default',
  showNotifications = false 
}: NavigationProps) {
  if (variant === 'simple') {
    return (
      <div className="w-full border-b border-[#2e4328] bg-background-dark/50 backdrop-blur-md sticky top-0 z-50">
        <div className="px-4 sm:px-6 lg:px-10 py-3 flex items-center justify-between">
          <a href="/" className="flex items-center gap-4 text-white cursor-pointer">
            <div className="size-8 rounded-full bg-primary/20 flex items-center justify-center text-primary">
              <span className="material-symbols-outlined">account_balance_wallet</span>
            </div>
            <h2 className="text-white text-lg font-bold leading-tight tracking-[-0.015em]">ShopRecord</h2>
          </a>
          <div className="flex items-center gap-4">
            {showNotifications && (
              <button className="hidden sm:flex size-10 items-center justify-center rounded-full bg-surface-input hover:bg-white/10 text-white transition-colors">
                <span className="material-symbols-outlined">notifications</span>
              </button>
            )}
            <div 
              className="bg-center bg-no-repeat bg-cover rounded-full size-10 border-2 border-primary/30" 
              style={{
                backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuDTUru21QkcSZRx7Hlqbj0sGe8-w6sMYEO2aVkj-Iyn3dihsEaXWHMDPwFeW_DyOtGTOaUrrc2tF_JxiwHmdtcKriF8SE6NKWERf1c5_V_3hOyhj-pcK_jO-qfl8mZAW9IjdUFon43hxnoq45e-OJhCL5aeDnIrmVd85Ydvd1dkdd7LIy-RlhYY_eVnuG-VDZhAmBJCLQvDKvtGbNUBJnf6W-07mPpjqD03SGSHFX4xQ0CU_OzyP-o6Z5CN1EPzDjQBgU999s3KspI")'
              }}
              aria-label="User profile picture showing a smiling person"
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <nav className="border-b border-gray-200 dark:border-[#2e4328] bg-surface-light dark:bg-background-dark/80 backdrop-blur-md sticky top-0 z-50">
      <div className="w-full mx-auto px-4 sm:px-6 lg:px-10">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <a href="/" className="flex items-center gap-3 text-white">
            <div className="flex items-center justify-center size-8 rounded-full bg-primary/20 text-primary">
              <span className="material-symbols-outlined text-xl">
                account_balance_wallet
              </span>
            </div>
            <h2 className="text-white text-lg font-bold leading-tight tracking-tight">
              ShopRecord
            </h2>
          </a>

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
                  currentPage === 'quick-add'
                    ? 'text-primary'
                    : 'hover:text-primary'
                }`}
                href="/quick-add"
              >
                Quick Add
              </a>
              <a
                className={`text-sm font-medium transition-colors ${
                  currentPage === 'reports'
                    ? 'text-primary'
                    : 'hover:text-primary'
                }`}
                href="/reports"
              >
                Reports
              </a>
              <a
                className={`text-sm font-medium transition-colors ${
                  currentPage === 'settings'
                    ? 'text-primary'
                    : 'hover:text-primary'
                }`}
                href="/settings"
              >
                Settings
              </a>
            </nav>

            {/* Profile */}
            <div className="flex items-center gap-3 pl-6 border-l border-gray-200 dark:border-[#2e4328]">
              <div
                className="size-9 rounded-full bg-cover bg-center ring-2 ring-primary/20"
                style={{
                  backgroundImage:
                    'url("https://lh3.googleusercontent.com/aida-public/AB6AXuDTUru21QkcSZRx7Hlqbj0sGe8-w6sMYEO2aVkj-Iyn3dihsEaXWHMDPwFeW_DyOtGTOaUrrc2tF_JxiwHmdtcKriF8SE6NKWERf1c5_V_3hOyhj-pcK_jO-qfl8mZAW9IjdUFon43hxnoq45e-OJhCL5aeDnIrmVd85Ydvd1dkdd7LIy-RlhYY_eVnuG-VDZhAmBJCLQvDKvtGbNUBJnf6W-07mPpjqD03SGSHFX4xQ0CU_OzyP-o6Z5CN1EPzDjQBgU999s3KspI")',
                }}
                aria-label="User profile avatar showing a smiling person"
              />
            </div>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button className="p-2 text-gray-500 hover:text-primary">
              <span className="material-symbols-outlined">menu</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
