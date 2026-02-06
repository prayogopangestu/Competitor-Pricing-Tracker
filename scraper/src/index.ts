/**
 * Express server for the scraper service
 */

import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { z } from 'zod';
import { getScraper, closeScraper } from './scraper';
import type {
  ScrapeRequest,
  ScrapeBatchRequest,
  ScrapeResponse,
  ScrapeBatchResponse,
} from './types';

// Load environment variables
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;
const API_KEY = process.env.API_KEY || '';

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
});
app.use('/api/', limiter);

// API Key validation middleware
const validateApiKey = (req: Request, res: Response, next: NextFunction) => {
  const apiKey = req.headers['x-api-key'] as string;
  
  if (!API_KEY) {
    // If no API key is configured, skip validation (development mode)
    return next();
  }
  
  if (!apiKey || apiKey !== API_KEY) {
    return res.status(401).json({
      success: false,
      error: 'Invalid or missing API key',
    });
  }
  
  next();
};

// Request validation schemas
const scrapeRequestSchema = z.object({
  url: z.string().url(),
  priceSelector: z.string().min(1),
  nameSelector: z.string().optional(),
  imageSelector: z.string().optional(),
  currency: z.string().optional(),
  waitForSelector: z.string().optional(),
  timeout: z.number().optional(),
});

const scrapeBatchRequestSchema = z.object({
  competitors: z.array(
    z.object({
      id: z.string(),
      url: z.string().url(),
      priceSelector: z.string().min(1),
      nameSelector: z.string().optional(),
      imageSelector: z.string().optional(),
      currency: z.string().optional(),
      waitForSelector: z.string().optional(),
      timeout: z.number().optional(),
    })
  ).min(1).max(50), // Limit to 50 competitors per batch
});

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// Root endpoint
app.get('/', (req: Request, res: Response) => {
  res.json({
    name: 'Competitor Tracker Scraper Service',
    version: '1.0.0',
    endpoints: {
      health: 'GET /health',
      scrape: 'POST /scrape',
      scrapeBatch: 'POST /scrape/batch',
    },
  });
});

// Scrape single competitor endpoint
app.post(
  '/scrape',
  validateApiKey,
  async (req: Request, res: Response) => {
    try {
      // Validate request body
      const validatedData = scrapeRequestSchema.parse(req.body);

      const scraper = await getScraper();
      const result = await scraper.scrapeWithRetry(
        validatedData.url,
        validatedData.priceSelector,
        validatedData.nameSelector,
        validatedData.imageSelector,
        {
          timeout: validatedData.timeout || 30000,
          waitForSelector: validatedData.waitForSelector,
        }
      );

      const response: ScrapeResponse = {
        success: true,
        data: {
          price: result.price,
          currency: result.currency,
          productName: result.productName,
          imageUrl: result.imageUrl,
          scrapedAt: new Date().toISOString(),
          rawPrice: result.rawPrice,
        },
      };

      res.json(response);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({
          success: false,
          error: 'Invalid request body',
          details: error.errors,
        } as ScrapeResponse);
      } else {
        console.error('Scrape error:', error);
        res.status(500).json({
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        } as ScrapeResponse);
      }
    }
  }
);

// Scrape multiple competitors endpoint
app.post(
  '/scrape/batch',
  validateApiKey,
  async (req: Request, res: Response) => {
    try {
      // Validate request body
      const validatedData = scrapeBatchRequestSchema.parse(req.body);

      const scraper = await getScraper();
      const results = await scraper.scrapeBatch(
        validatedData.competitors.map(c => ({
          url: c.url,
          priceSelector: c.priceSelector,
          nameSelector: c.nameSelector,
          imageSelector: c.imageSelector,
        })),
        {
          timeout: validatedData.competitors[0]?.timeout || 30000,
          waitForSelector: validatedData.competitors[0]?.waitForSelector,
        }
      );

      const response: ScrapeBatchResponse = {
        success: true,
        results: results.map((result, index) => ({
          id: validatedData.competitors[index].id,
          success: result.success,
          data: result.data ? {
            price: result.data.price,
            currency: result.data.currency,
            productName: result.data.productName,
            imageUrl: result.data.imageUrl,
            scrapedAt: new Date().toISOString(),
            rawPrice: result.data.rawPrice,
          } : undefined,
          error: result.error,
        })),
      };

      res.json(response);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({
          success: false,
          error: 'Invalid request body',
          details: error.errors,
        });
      } else {
        console.error('Batch scrape error:', error);
        res.status(500).json({
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }
  }
);

// Error handling middleware
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    success: false,
    error: 'Internal server error',
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Scraper service running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
  console.log(`Scrape endpoint: http://localhost:${PORT}/scrape`);
  console.log(`Batch scrape endpoint: http://localhost:${PORT}/scrape/batch`);
});

// Graceful shutdown
const shutdown = async () => {
  console.log('Shutting down gracefully...');
  await closeScraper();
  process.exit(0);
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

export default app;
