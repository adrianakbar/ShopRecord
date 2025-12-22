interface StatCardProps {
  label: string;
  amount: number;
  trend: number;
  isPositive: boolean;
  icon: string;
  featured?: boolean;
}

export default function StatCard({
  label,
  amount,
  trend,
  isPositive,
  icon,
  featured = false
}: StatCardProps) {
  if (featured) {
    return (
      <div className="flex flex-col p-6 rounded-lg bg-surface-dark border border-border-dark text-white relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-40 h-40 bg-primary/10 rounded-full blur-[60px] -mr-10 -mt-10 group-hover:bg-primary/20 transition-all duration-500"></div>
        <div className="flex justify-between items-start mb-4 relative z-10">
          <div className="p-3 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-sm">
            <span className="material-symbols-outlined text-primary">{icon}</span>
          </div>
          <span className={`flex items-center text-sm font-bold px-3 py-1.5 rounded-full ${
            isPositive 
              ? 'text-primary bg-primary/10 border border-primary/20' 
              : 'text-red-400 bg-red-400/10 border border-red-400/20'
          }`}>
            <span className="material-symbols-outlined text-sm mr-1">
              {isPositive ? 'trending_up' : 'trending_down'}
            </span>
            {isPositive ? '+' : ''}{trend}%
          </span>
        </div>
        <div className="mt-auto relative z-10">
          <p className="text-gray-400 text-sm font-medium mb-1">{label}</p>
          <h3 className="text-4xl font-extrabold tracking-tight text-white">
            ${amount.toFixed(2)}
          </h3>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col p-6 rounded-lg bg-white dark:bg-surface-dark dark:text-white shadow-sm dark:shadow-none border border-gray-100 dark:border-border-dark relative overflow-hidden group">
      <div className="flex justify-between items-start mb-4">
        <div className="p-3 bg-gray-100 dark:bg-white/5 dark:border dark:border-white/10 rounded-2xl transition-colors">
          <span className="material-symbols-outlined text-gray-600 dark:text-gray-300">
            {icon}
          </span>
        </div>
        <span className={`flex items-center text-sm font-bold px-3 py-1.5 rounded-full ${
          isPositive 
            ? 'text-primary bg-primary/10 border border-primary/20' 
            : 'text-red-400 bg-red-400/10 border border-red-400/20'
        }`}>
          <span className="material-symbols-outlined text-sm mr-1">
            {isPositive ? 'trending_up' : 'trending_down'}
          </span>
          {isPositive ? '+' : ''}{trend}%
        </span>
      </div>
      <div className="mt-auto">
        <p className="text-gray-500 dark:text-gray-400 text-sm font-medium mb-1">
          {label}
        </p>
        <h3 className="text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white">
          ${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </h3>
      </div>
    </div>
  );
}
