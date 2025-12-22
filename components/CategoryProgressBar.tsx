interface CategoryProgressBarProps {
  name: string;
  amount: number;
  percentage: number;
  color: string;
}

export default function CategoryProgressBar({
  name,
  amount,
  percentage,
  color
}: CategoryProgressBarProps) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex justify-between text-sm items-end">
        <span className="font-medium text-gray-600 dark:text-gray-300">
          {name}
        </span>
        <span className="font-bold text-gray-900 dark:text-white">
          ${amount}
        </span>
      </div>
      <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-2 overflow-hidden">
        <div
          className={`${color} h-2 rounded-full shadow-[0_0_10px_rgba(83,210,45,0.4)]`}
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
    </div>
  );
}
