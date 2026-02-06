/**
 * Playwright-based web scraper
 */

import { chromium, Browser, Page, BrowserContext } from 'playwright';
import { ScraperOptions, ScrapedData } from './types';
import { parsePrice, extractText, extractImageUrl, getUserAgent, sleep, retry } from './utils';

export class Scraper {
  private browser: Browser | null = null;
  private context: BrowserContext | null = null;
  private page: Page | null = null;

  /**
   * Initialize the browser
   */
  async initialize(options: ScraperOptions = {}): Promise<void> {
    if (this.browser) {
      return; // Already initialized
    }

    const launchOptions: any = {
      headless: options.headless !== false, // Default to true
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--disable-gpu',
      ],
    };

    this.browser = await chromium.launch(launchOptions);
    this.context = await this.browser.newContext({
      userAgent: options.userAgent || getUserAgent(),
      viewport: { width: 1920, height: 1080 },
    });
    this.page = await this.context.newPage();
  }

  /**
   * Close the browser
   */
  async close(): Promise<void> {
    if (this.page) {
      await this.page.close();
      this.page = null;
    }
    if (this.context) {
      await this.context.close();
      this.context = null;
    }
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }

  /**
   * Scrape a single URL for pricing data
   */
  async scrape(
    url: string,
    priceSelector: string,
    nameSelector?: string,
    imageSelector?: string,
    options: ScraperOptions = {}
  ): Promise<ScrapedData> {
    await this.initialize(options);

    if (!this.page) {
      throw new Error('Page not initialized');
    }

    const timeout = options.timeout || 30000;

    try {
      // Navigate to the URL with timeout
      await this.page.goto(url, {
        waitUntil: 'networkidle',
        timeout,
      });

      // Wait for a specific selector if provided
      if (options.waitForSelector) {
        await this.page.waitForSelector(options.waitForSelector, { timeout: 5000 });
      }

      // Wait a bit for any dynamic content to load
      await sleep(1000);

      // Extract price
      const priceElement = await this.page.$(priceSelector);
      if (!priceElement) {
        throw new Error(`Price element not found with selector: ${priceSelector}`);
      }

      const priceText = await priceElement.textContent();
      if (!priceText) {
        throw new Error('Price element has no text content');
      }

      const { price, currency } = parsePrice(priceText);

      // Extract product name if selector provided
      let productName: string | undefined;
      if (nameSelector) {
        const nameElement = await this.page.$(nameSelector);
        if (nameElement) {
          productName = await nameElement.textContent();
          productName = productName?.trim();
        }
      }

      // Extract image URL if selector provided
      let imageUrl: string | undefined;
      if (imageSelector) {
        const imageElement = await this.page.$(imageSelector);
        if (imageElement) {
          imageUrl = await imageElement.getAttribute('src');
          // Try data-src for lazy loading
          if (!imageUrl) {
            imageUrl = await imageElement.getAttribute('data-src');
          }
        }
      }

      return {
        price,
        currency,
        productName,
        imageUrl,
        rawPrice: priceText.trim(),
      };
    } catch (error) {
      throw new Error(`Failed to scrape ${url}: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Scrape with retry logic
   */
  async scrapeWithRetry(
    url: string,
    priceSelector: string,
    nameSelector?: string,
    imageSelector?: string,
    options: ScraperOptions = {},
    maxRetries: number = 3
  ): Promise<ScrapedData> {
    return retry(
      () => this.scrape(url, priceSelector, nameSelector, imageSelector, options),
      maxRetries,
      1000
    );
  }

  /**
   * Scrape multiple URLs
   */
  async scrapeBatch(
    requests: Array<{
      url: string;
      priceSelector: string;
      nameSelector?: string;
      imageSelector?: string;
    }>,
    options: ScraperOptions = {},
    maxRetries: number = 3
  ): Promise<Array<{ success: boolean; data?: ScrapedData; error?: string; url: string }>> {
    const results = [];

    for (const request of requests) {
      try {
        const data = await this.scrapeWithRetry(
          request.url,
          request.priceSelector,
          request.nameSelector,
          request.imageSelector,
          options,
          maxRetries
        );
        results.push({ success: true, data, url: request.url });
      } catch (error) {
        results.push({
          success: false,
          error: error instanceof Error ? error.message : String(error),
          url: request.url,
        });
      }
    }

    return results;
  }
}

/**
 * Singleton scraper instance
 */
let scraperInstance: Scraper | null = null;

export async function getScraper(): Promise<Scraper> {
  if (!scraperInstance) {
    scraperInstance = new Scraper();
    await scraperInstance.initialize();
  }
  return scraperInstance;
}

export async function closeScraper(): Promise<void> {
  if (scraperInstance) {
    await scraperInstance.close();
    scraperInstance = null;
  }
}
