import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number, currency = 'PKR') {
  return `${currency} ${amount.toLocaleString('en-PK')}`;
}

export function formatCrore(amount: number) {
  return `${(amount / 1e7).toFixed(2)} Cr`;
}
