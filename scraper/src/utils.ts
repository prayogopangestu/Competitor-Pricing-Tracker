/**
 * Utility functions for the scraper
 */

/**
 * Parse price string to number
 * Handles various currency formats: $99.99, €99.99, £99.99, 99.99 USD, etc.
 */
export function parsePrice(priceText: string): { price: number; currency: string } {
  if (!priceText) {
    throw new Error('Price text is empty');
  }

  // Remove extra whitespace
  const cleaned = priceText.trim();

  // Currency symbols and their codes
  const currencyPatterns = [
    { symbol: '$', code: 'USD' },
    { symbol: '€', code: 'EUR' },
    { symbol: '£', code: 'GBP' },
    { symbol: '¥', code: 'JPY' },
    { symbol: '₹', code: 'INR' },
    { symbol: '₽', code: 'RUB' },
    { symbol: '₩', code: 'KRW' },
  ];

  let currency = 'USD';
  let priceString = cleaned;

  // Check for currency symbols
  for (const { symbol, code } of currencyPatterns) {
    if (cleaned.includes(symbol)) {
      currency = code;
      priceString = cleaned.replace(symbol, '').trim();
      break;
    }
  }

  // Check for currency codes (e.g., "99.99 USD", "USD 99.99")
  const codePattern = /\b(USD|EUR|GBP|JPY|INR|RUB|KRW|CAD|AUD|CHF)\b/i;
  const codeMatch = cleaned.match(codePattern);
  if (codeMatch) {
    currency = codeMatch[1].toUpperCase();
    priceString = cleaned.replace(codePattern, '').trim();
  }

  // Remove common separators and formatting
  priceString = priceString
    .replace(/,/g, '') // Remove thousand separators
    .replace(/[^\d.-]/g, ''); // Keep only digits, decimal point, and minus

  // Parse the number
  const price = parseFloat(priceString);

  if (isNaN(price)) {
    throw new Error(`Could not parse price from: ${priceText}`);
  }

  return { price, currency };
}

/**
 * Extract text content from an element
 */
export function extractText(element: any): string {
  if (!element) return '';
  return element.textContent?.trim() || '';
}

/**
 * Extract attribute from an element
 */
export function extractAttribute(element: any, attribute: string): string | null {
  if (!element) return null;
  return element.getAttribute(attribute);
}

/**
 * Extract image URL from an element
 */
export function extractImageUrl(element: any): string | null {
  if (!element) return null;
  
  // Try src attribute first
  const src = extractAttribute(element, 'src');
  if (src) return src;
  
  // Try data-src (lazy loading)
  const dataSrc = extractAttribute(element, 'data-src');
  if (dataSrc) return dataSrc;
  
  // Try srcset (responsive images)
  const srcset = extractAttribute(element, 'srcset');
  if (srcset) {
    const urls = srcset.split(',').map(s => s.trim().split(' ')[0]);
    return urls[0] || null;
  }
  
  return null;
}

/**
 * Validate URL
 */
export function isValidUrl(url: string): boolean {
  try {
    // Simple URL validation using regex
    const urlPattern = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/;
    return urlPattern.test(url);
  } catch {
    return false;
  }
}

/**
 * Sanitize selector to prevent injection
 */
export function sanitizeSelector(selector: string): string {
  // Remove any script or event handler patterns
  return selector
    .replace(/on\w+\s*=/gi, '')
    .replace(/javascript:/gi, '')
    .trim();
}

/**
 * Common CSS selectors for price elements
 */
export const COMMON_PRICE_SELECTORS = [
  '.price',
  '.product-price',
  '.price-value',
  '.current-price',
  '.sale-price',
  '.amount',
  '[data-price]',
  '[class*="price"]',
  '.pricing',
  '.cost',
];

/**
 * Common CSS selectors for product name elements
 */
export const COMMON_NAME_SELECTORS = [
  '.product-name',
  '.product-title',
  '.title',
  'h1.product',
  'h1.product-name',
  '[data-product-name]',
  '[class*="product-name"]',
  '.product-title',
  '.item-name',
];

/**
 * Common CSS selectors for product image elements
 */
export const COMMON_IMAGE_SELECTORS = [
  '.product-image img',
  '.product-photo img',
  '.main-image img',
  'img.product-img',
  '[data-product-image]',
  '.product img',
  '.item-image img',
];

/**
 * Get a user agent string for the scraper
 */
export function getUserAgent(): string {
  return 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 CompetitorTracker/1.0';
}

/**
 * Sleep for a specified number of milliseconds
 */
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => {
    // Use a workaround for setTimeout type issue
    const timer: any = setTimeout(resolve, ms);
    return timer;
  });
}

/**
 * Retry a function with exponential backoff
 */
export async function retry<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> {
  let lastError: Error;
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      
      if (attempt < maxRetries - 1) {
        const delay = baseDelay * Math.pow(2, attempt);
        await sleep(delay);
      }
    }
  }
  
  throw lastError!;
}
