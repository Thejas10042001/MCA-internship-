import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function parseDate(dateStr: string | Date | undefined | null): Date {
  if (!dateStr) return new Date();
  if (dateStr instanceof Date) return dateStr;
  
  const cleanStr = String(dateStr).trim();
  
  // Try direct parsing first
  let parsed = new Date(cleanStr);
  if (!isNaN(parsed.getTime())) {
    return parsed;
  }
  
  // Manual regex splitting for DD/MM/YYYY vs MM/DD/YYYY to avoid invalid JS parsing
  const parts = cleanStr.split(/[-/.\s]/).filter(Boolean);
  if (parts.length === 3) {
    const p0 = parseInt(parts[0], 10);
    const p1 = parseInt(parts[1], 10);
    const p2 = parseInt(parts[2], 10);
    
    if (parts[2].length === 4) {
      // p2 is Year (e.g. 11/08/2021)
      if (p0 > 12) {
        // DD/MM/YYYY
        return new Date(p2, p1 - 1, p0);
      } else {
        // MM/DD/YYYY
        return new Date(p2, p0 - 1, p1);
      }
    } else if (parts[0].length === 4) {
      // p0 is Year (e.g. 2021/08/11)
      if (p2 > 12) {
        // YYYY/DD/MM fallback
        return new Date(p0, p2 - 1, p1);
      } else {
        // YYYY/MM/DD standard
        return new Date(p0, p1 - 1, p2);
      }
    }
  }
  
  return new Date();
}

export function formatCurrency(value: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatNumber(value: number) {
  return new Intl.NumberFormat('en-US').format(value);
}

export function formatPercent(value: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'percent',
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }).format(value / 100);
}

