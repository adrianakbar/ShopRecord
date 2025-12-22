import { DEFAULT_CATEGORIES } from './constants';

/**
 * Format number to Indonesian Rupiah currency format
 * @param amount - The amount to format
 * @returns Formatted currency string (e.g., "Rp 10.000")
 */
export function formatCurrency(amount: number): string {
  return `Rp ${Number(amount).toLocaleString('id-ID')}`;
}

/**
 * Format date to Indonesian short format
 * @param date - Date string or Date object
 * @returns Formatted date string (e.g., "22 Des")
 */
export function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString('id-ID', { 
    day: 'numeric', 
    month: 'short' 
  });
}

/**
 * Format date to Indonesian long format
 * @param date - Date string or Date object
 * @returns Formatted date string (e.g., "22 Desember 2025")
 */
export function formatDateLong(date: string | Date): string {
  return new Date(date).toLocaleDateString('id-ID', { 
    day: 'numeric', 
    month: 'long',
    year: 'numeric'
  });
}

/**
 * Format time to 12-hour format
 * @param date - Date string or Date object
 * @returns Formatted time string (e.g., "2:30 PM")
 */
export function formatTime(date: string | Date): string {
  return new Date(date).toLocaleTimeString('en-US', { 
    hour: 'numeric', 
    minute: '2-digit', 
    hour12: true 
  });
}

/**
 * Get category icon from category name
 * @param categoryName - The name of the category
 * @returns Material icon name
 */
export function getCategoryIcon(categoryName: string): string {
  const cat = DEFAULT_CATEGORIES.find(c => c.name === categoryName);
  return cat?.icon || 'payments';
}

/**
 * Calculate percentage
 * @param value - The current value
 * @param total - The total value
 * @returns Percentage as number
 */
export function calculatePercentage(value: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((value / total) * 100);
}

/**
 * Truncate text with ellipsis
 * @param text - Text to truncate
 * @param maxLength - Maximum length before truncation
 * @returns Truncated text
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}
