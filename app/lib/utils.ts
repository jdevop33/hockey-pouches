import { ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Combines multiple class names and merges Tailwind CSS classes properly
 * 
 * @example
 * // Basic usage
 * cn('text-red-500', 'bg-blue-500')
 * 
 * @example
 * // With conditional classes
 * cn('text-lg', isLarge && 'font-bold', { 'opacity-50': isDisabled })
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Formats a price as a currency string
 * 
 * @param price - The price to format
 * @param currency - The currency code (default: 'CAD')
 * @returns Formatted price string
 * 
 * @example
 * // Returns "$15.00"
 * formatPrice(15)
 * 
 * @example
 * // Returns "$15.00 USD"
 * formatPrice(15, 'USD')
 */
export function formatPrice(price: number, currency: string = 'CAD'): string {
  return new Intl.NumberFormat('en-CA', {
    style: 'currency',
    currency,
  }).format(price);
}

/**
 * Truncates a string to a specified length and adds an ellipsis
 * 
 * @param str - The string to truncate
 * @param length - Maximum length (default: 50)
 * @returns Truncated string
 * 
 * @example
 * // Returns "This is a long..."
 * truncateString("This is a long string that needs truncating", 12)
 */
export function truncateString(str: string, length: number = 50): string {
  if (str.length <= length) return str;
  return `${str.slice(0, length)}...`;
}

/**
 * Generates a random ID string
 * 
 * @returns Random ID string
 */
export function generateId(): string {
  return Math.random().toString(36).substring(2, 9);
}

/**
 * Delays execution for a specified number of milliseconds
 * 
 * @param ms - Milliseconds to delay
 * @returns Promise that resolves after the delay
 * 
 * @example
 * // Usage with async/await
 * await sleep(1000); // Waits for 1 second
 */
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}
