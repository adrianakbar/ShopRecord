interface ActivityItemProps {
  name: string;
  category: string;
  amount: number;
  timestamp: string;
  icon: string;
  iconColor: string;
  iconBgColor: string;
  onClick?: () => void;
}

export default function ActivityItem({
  name,
  category,
  amount,
  timestamp,
  icon,
  iconColor,
  iconBgColor,
  onClick
}: ActivityItemProps) {
  return (
    <div
      onClick={onClick}
      className="flex items-center justify-between p-4 rounded-2xl bg-white dark:bg-surface-dark border border-gray-100 dark:border-border-dark hover:border-primary/50 hover:bg-gray-50 dark:hover:bg-card-hover transition-all cursor-pointer group"
    >
      <div className="flex items-center gap-4">
        <div className={`h-12 w-12 rounded-full ${iconBgColor} ${iconColor} flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors border border-transparent group-hover:border-primary`}>
          <span className="material-symbols-outlined">{icon}</span>
        </div>
        <div className="flex flex-col">
          <p className="font-bold text-gray-900 dark:text-white text-base">
            {name}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {timestamp} • {category}
          </p>
        </div>
      </div>
      <p className="font-bold text-gray-900 dark:text-white text-lg">
        -${amount.toFixed(2)}
      </p>
    </div>
  );
}
