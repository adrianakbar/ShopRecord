interface ExpenseListItemProps {
  merchant: string;
  category: string;
  time: string;
  paymentMethod: string;
  amount: number;
  icon: string;
  onClick?: () => void;
}

export default function ExpenseListItem({
  merchant,
  category,
  time,
  paymentMethod,
  amount,
  icon,
  onClick
}: ExpenseListItemProps) {
  return (
    <div
      onClick={onClick}
      className="group flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl bg-surface-dark/40 hover:bg-surface-dark hover:shadow-md transition-all gap-4 sm:gap-0 cursor-pointer border border-transparent hover:border-primary/20"
    >
      <div className="flex items-center gap-4">
        <div className="size-12 rounded-full bg-[#1c2e18] flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-[#142210] transition-colors shrink-0">
          <span className="material-symbols-outlined">{icon}</span>
        </div>
        <div className="flex flex-col">
          <p className="text-white font-bold text-base">{merchant}</p>
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <span>{category}</span>
            <span className="size-1 bg-gray-600 rounded-full"></span>
            <span>{time}</span>
            <span className="size-1 bg-gray-600 rounded-full sm:hidden"></span>
            <span className="sm:hidden">{paymentMethod}</span>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between sm:justify-end gap-6 sm:pl-4">
        <div className="hidden sm:flex flex-col items-end gap-0.5">
          <span className="text-xs text-gray-500 bg-white/5 px-2 py-0.5 rounded">
            {paymentMethod}
          </span>
        </div>
        <div className="text-right">
          <p className="text-white font-bold text-lg">
            ${amount.toFixed(2)}
          </p>
        </div>
        <div className="w-8 flex justify-end opacity-0 group-hover:opacity-100 transition-opacity">
          <button className="text-gray-400 hover:text-white">
            <span className="material-symbols-outlined">more_vert</span>
          </button>
        </div>
      </div>
    </div>
  );
}
