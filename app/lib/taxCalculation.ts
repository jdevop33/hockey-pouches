// app/lib/taxCalculation.ts
import { CartItem } from '@/context/CartContext';

// Define tax rates by province/territory
const TAX_RATES: Record<string, { gst: number; pst?: number; hst?: number; qst?: number }> = {
  // HST provinces
  'ON': { gst: 0, hst: 0.13 }, // Ontario: 13% HST
  'NB': { gst: 0, hst: 0.15 }, // New Brunswick: 15% HST
  'NS': { gst: 0, hst: 0.15 }, // Nova Scotia: 15% HST
  'NL': { gst: 0, hst: 0.15 }, // Newfoundland and Labrador: 15% HST
  'PE': { gst: 0, hst: 0.15 }, // Prince Edward Island: 15% HST
  
  // GST + PST provinces
  'BC': { gst: 0.05, pst: 0.07 }, // British Columbia: 5% GST + 7% PST
  'SK': { gst: 0.05, pst: 0.06 }, // Saskatchewan: 5% GST + 6% PST
  'MB': { gst: 0.05, pst: 0.07 }, // Manitoba: 5% GST + 7% PST
  
  // GST + QST province
  'QC': { gst: 0.05, qst: 0.09975 }, // Quebec: 5% GST + 9.975% QST
  
  // GST only territories and Alberta
  'AB': { gst: 0.05 }, // Alberta: 5% GST
  'NT': { gst: 0.05 }, // Northwest Territories: 5% GST
  'NU': { gst: 0.05 }, // Nunavut: 5% GST
  'YT': { gst: 0.05 }, // Yukon: 5% GST
};

// Define tax exemption rules
const TAX_EXEMPTIONS: Record<string, boolean> = {
  // Add any tax-exempt products or categories here
  // Example: 'basic-groceries': true,
};

/**
 * Calculate taxes for a cart based on province
 * @param items Cart items
 * @param provinceCode Province code (e.g., 'ON', 'BC')
 * @param subtotal Cart subtotal (pre-tax)
 * @returns Tax breakdown and total
 */
export function calculateTaxes(
  items: CartItem[],
  provinceCode: string,
  subtotal: number
): {
  gst: number;
  pst?: number;
  hst?: number;
  qst?: number;
  total: number;
} {
  // Default to Ontario if province not found
  const taxRates = TAX_RATES[provinceCode.toUpperCase()] || TAX_RATES['ON'];
  
  // Initialize tax amounts
  let gstAmount = 0;
  let pstAmount = 0;
  let hstAmount = 0;
  let qstAmount = 0;
  
  // Calculate taxes based on the province's tax structure
  if (taxRates.hst) {
    // HST provinces
    hstAmount = subtotal * taxRates.hst;
  } else {
    // GST provinces
    gstAmount = subtotal * taxRates.gst;
    
    // Add PST if applicable
    if (taxRates.pst) {
      pstAmount = subtotal * taxRates.pst;
    }
    
    // Add QST if applicable (Quebec)
    if (taxRates.qst) {
      qstAmount = subtotal * taxRates.qst;
    }
  }
  
  // Calculate total tax
  const totalTax = gstAmount + pstAmount + hstAmount + qstAmount;
  
  return {
    gst: parseFloat(gstAmount.toFixed(2)),
    ...(pstAmount > 0 && { pst: parseFloat(pstAmount.toFixed(2)) }),
    ...(hstAmount > 0 && { hst: parseFloat(hstAmount.toFixed(2)) }),
    ...(qstAmount > 0 && { qst: parseFloat(qstAmount.toFixed(2)) }),
    total: parseFloat(totalTax.toFixed(2)),
  };
}

/**
 * Get tax rate for a province
 * @param provinceCode Province code (e.g., 'ON', 'BC')
 * @returns Combined tax rate
 */
export function getTaxRate(provinceCode: string): number {
  const taxRates = TAX_RATES[provinceCode.toUpperCase()] || TAX_RATES['ON'];
  
  if (taxRates.hst) {
    return taxRates.hst;
  }
  
  let combinedRate = taxRates.gst;
  
  if (taxRates.pst) {
    combinedRate += taxRates.pst;
  }
  
  if (taxRates.qst) {
    combinedRate += taxRates.qst;
  }
  
  return combinedRate;
}

/**
 * Format tax amount for display
 * @param amount Tax amount
 * @returns Formatted tax amount
 */
export function formatTaxAmount(amount: number): string {
  return amount.toFixed(2);
}

/**
 * Get tax breakdown for display
 * @param taxes Tax object
 * @returns Formatted tax breakdown
 */
export function getTaxBreakdown(taxes: {
  gst: number;
  pst?: number;
  hst?: number;
  qst?: number;
  total: number;
}): string[] {
  const breakdown: string[] = [];
  
  if (taxes.hst) {
    breakdown.push(`HST (${(taxes.hst / taxes.total * 100).toFixed(0)}%): $${formatTaxAmount(taxes.hst)}`);
  } else {
    if (taxes.gst) {
      breakdown.push(`GST (5%): $${formatTaxAmount(taxes.gst)}`);
    }
    
    if (taxes.pst) {
      const pstRate = taxes.pst / (taxes.total - taxes.gst) * 100;
      breakdown.push(`PST (${pstRate.toFixed(0)}%): $${formatTaxAmount(taxes.pst)}`);
    }
    
    if (taxes.qst) {
      breakdown.push(`QST (9.975%): $${formatTaxAmount(taxes.qst)}`);
    }
  }
  
  return breakdown;
}
