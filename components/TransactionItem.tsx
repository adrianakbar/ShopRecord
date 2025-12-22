import { formatCurrency, formatDate, formatDateLong, formatTime, getCategoryIcon } from '@/lib/utils';

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

interface TransactionItemProps {
  transaction: Transaction;
  showTime?: boolean;
  showDelete?: boolean;
  onClick?: () => void;
  onDelete?: (id: string) => void;
}

export default function TransactionItem({ 
  transaction, 
  showTime = false,
  showDelete = false,
  onClick,
  onDelete
}: TransactionItemProps) {

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent onClick from firing
    if (onDelete) {
      onDelete(transaction.id);
    }
  };

  // Get icon: prioritize category.icon from DB, fallback to default mapping, then default icon
  const getIcon = () => {
    if (transaction.category?.icon) {
      return transaction.category.icon;
    }
    if (transaction.category?.name) {
      return getCategoryIcon(transaction.category.name);
    }
    return 'payments';
  };

  return (
    <div
      onClick={onClick}
      className={`group flex items-center justify-between p-4 rounded-xl bg-surface-dark/40 hover:bg-surface-dark transition-all border border-transparent hover:border-primary/20 ${onClick ? 'cursor-pointer' : ''}`}
    >
      <div className="flex items-center gap-3">
        <div className="size-10 rounded-full bg-[#1c2e18] group-hover:bg-primary flex items-center justify-center text-primary group-hover:text-[#1c2e18] shrink-0 transition-colors">
          <span className="material-symbols-outlined text-[20px]">
            {getIcon()}
          </span>
        </div>
        <div className="flex flex-col">
          <p className="text-white font-semibold text-sm">{transaction.item}</p>
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <span>{transaction.category?.name || 'Tanpa Kategori'}</span>
            {transaction.notes && (
              <>
                <span className="size-1 bg-gray-600 rounded-full"></span>
                <span className="line-clamp-1">{transaction.notes}</span>
              </>
            )}
          </div>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <div className="text-right">
          <p className="text-white font-bold text-sm">
            {formatCurrency(transaction.amount)}
          </p>
          <p className="text-xs text-gray-400">
            {formatDateLong(transaction.expenseDate)} 
          </p>
        </div>
        {showDelete && onDelete && (
          <button
            onClick={handleDelete}
            className=" text-gray-400 hover:text-red-400 transition-all p-2 hover:bg-red-500/10 rounded-lg"
            aria-label="Delete transaction"
          >
            <span className="material-symbols-outlined text-[20px]">delete</span>
          </button>
        )}
      </div>
    </div>
  );
}
