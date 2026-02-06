/**
 * Request types for the scraper API
 */

export interface ScrapeRequest {
  url: string;
  priceSelector: string;
  nameSelector?: string;
  imageSelector?: string;
  currency?: string;
  waitForSelector?: string;
  timeout?: number;
}

export interface ScrapeBatchRequest {
  competitors: Array<{
    id: string;
    url: string;
    priceSelector: string;
    nameSelector?: string;
    imageSelector?: string;
    currency?: string;
    waitForSelector?: string;
    timeout?: number;
  }>;
}

/**
 * Response types for the scraper API
 */

export interface ScrapeResult {
  price: number;
  currency: string;
  productName?: string;
  imageUrl?: string;
  scrapedAt: string;
  rawPrice: string;
}

export interface ScrapeSuccessResponse {
  success: true;
  data: ScrapeResult;
}

export interface ScrapeErrorResponse {
  success: false;
  error: string;
  details?: string;
}

export type ScrapeResponse = ScrapeSuccessResponse | ScrapeErrorResponse;

export interface ScrapeBatchResult {
  id: string;
  success: boolean;
  data?: ScrapeResult;
  error?: string;
}

export interface ScrapeBatchResponse {
  success: boolean;
  results: ScrapeBatchResult[];
}

/**
 * Internal scraper types
 */

export interface ScraperOptions {
  timeout?: number;
  waitForSelector?: string;
  headless?: boolean;
  userAgent?: string;
}

export interface ScrapedData {
  price: number;
  currency: string;
  productName?: string;
  imageUrl?: string;
  rawPrice: string;
}
