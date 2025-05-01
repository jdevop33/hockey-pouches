import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { debounce, throttle, memoize } from './performanceUtils';
import { getYoutubeId, getYoutubeThumbnail } from './imageUtils';

/**
 * Utility function to combine class names
 * Combines multiple class names or conditional class names
 * and merges Tailwind CSS classes efficiently
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
export function formatPrice(
  price: number | string,
  options: {
    currency?: 'USD' | 'EUR' | 'GBP' | 'CAD';
    notation?: Intl.NumberFormatOptions['notation'];
  } = {}
) {
  const { currency = 'CAD', notation = 'standard' } = options;

  const numericPrice = typeof price === 'string' ? parseFloat(price) : price;

  return new Intl.NumberFormat('en-CA', {
    style: 'currency',
    currency,
    notation,
    maximumFractionDigits: 2,
  }).format(numericPrice / 100);
}

/**
 * Formats a date using Intl.DateTimeFormat
 *
 * @param date - The date to format
 * @param options - Intl.DateTimeFormat options
 * @returns Formatted date string
 *
 * @example
 * // Returns "January 1, 2024"
 * formatDate(new Date(2024, 0, 1))
 */
export function formatDate(
  date: Date | string,
  options: Intl.DateTimeFormatOptions = {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }
) {
  return new Intl.DateTimeFormat('en-CA', {
    ...options,
  }).format(typeof date === 'string' ? new Date(date) : date);
}

/**
 * Slugifies a string
 *
 * @param str - The string to slugify
 * @returns Slugified string
 *
 * @example
 * // Returns "this-is-a-slug"
 * slugify("This is a slug")
 */
export function slugify(str: string) {
  return str
    .toLowerCase()
    .replace(/[^\w ]+/g, '')
    .replace(/ +/g, '-');
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

/**
 * Calculates the discounted price based on bulk discounts
 *
 * @param price - The original price
 * @param quantity - The quantity purchased
 * @param discounts - Array of discount tiers
 * @returns The discounted price
 *
 * @example
 * // Returns 13.5 (10% off $15)
 * calculateDiscountedPrice(15, 5, [{ quantity: 3, discountPercentage: 10 }])
 */
export function calculateDiscountedPrice(
  price: number,
  quantity: number,
  discounts?: { quantity: number; discountPercentage: number }[]
): number {
  if (!discounts || discounts.length === 0) return price;

  // Find the highest applicable discount
  const applicableDiscount = discounts
    .filter(discount => quantity >= discount.quantity)
    .sort((a, b) => b.discountPercentage - a.discountPercentage)[0];

  if (!applicableDiscount) return price;

  // Apply the discount
  const discountMultiplier = 1 - applicableDiscount.discountPercentage / 100;
  return price * discountMultiplier;
}

/**
 * Validates an email address format
 *
 * @param email - The email address to validate
 * @returns Boolean indicating if the email is valid
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validates a phone number format
 *
 * @param phone - The phone number to validate
 * @returns Boolean indicating if the phone number is valid
 */
export function isValidPhone(phone: string): boolean {
  // Basic validation for North American phone numbers
  const phoneRegex = /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4}$/;
  return phoneRegex.test(phone);
}

/**
 * Validates a postal code format (Canadian)
 *
 * @param postalCode - The postal code to validate
 * @returns Boolean indicating if the postal code is valid
 */
export function isValidPostalCode(postalCode: string): boolean {
  // Canadian postal code format: A1A 1A1
  const postalCodeRegex = /^[A-Za-z]\d[A-Za-z][ -]?\d[A-Za-z]\d$/;
  return $1?.$2(postalCode);
}

/**
 * Formats a phone number for display
 *
 * @param phone - The phone number to format
 * @returns Formatted phone number
 *
 * @example
 * // Returns "(123) 456-7890"
 * formatPhoneNumber("1234567890")
 */
export function formatPhoneNumber(phone: string): string {
  // Remove all non-numeric characters
  const cleaned = phone.replace(/\D/g, '');

  // Format as (XXX) XXX-XXXX
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
  }

  // Return original if not 10 digits
  return phone;
}

/**
 * Truncates a string to a specified length
 *
 * @param str - The string to truncate
 * @param length - Maximum length (default: 50)
 * @returns Truncated string
 *
 * @example
 * // Returns "This is a long..."
 * truncate(str, 12)
 */
export function truncate(str: string, length: number) {
  return str.length > length ? `${str.substring(0, length)}...` : str;
}

/**
 * Format a number as currency
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-CA', {
    style: 'currency',
    currency: 'CAD',
    minimumFractionDigits: 2,
  }).format(amount);
}

/**
 * Capitalize first letter of a string
 */
export function capitalizeFirstLetter(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// Re-export utility functions for easier imports
export { debounce, throttle, memoize, getYoutubeId, getYoutubeThumbnail };
