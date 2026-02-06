# Implementation Plan - Competitor Pricing Tracker

## Overview

This document breaks down the implementation into clear, actionable steps for building the competitor pricing tracker system.

## Phase 1: Infrastructure Setup

### 1.1 Initialize Project Structure
- [ ] Create root directory structure
- [ ] Set up Git repository with .gitignore
- [ ] Create environment variable template (.env.example)
- [ ] Set up TypeScript configuration files

### 1.2 Docker Compose Setup
- [ ] Create docker-compose.yml with:
  - PostgreSQL service (port 5432)
  - n8n service (port 5678)
  - Network configuration for inter-service communication
- [ ] Create Dockerfile for PostgreSQL (if needed)
- [ ] Create Dockerfile for n8n (if needed)
- [ ] Test Docker Compose startup

### 1.3 Database Initialization
- [ ] Create Prisma schema file
- [ ] Define all models: User, Competitor, PriceRecord, NotificationSetting, Alert
- [ ] Run Prisma migrations
- [ ] Seed database with test data (optional)

## Phase 2: Scraper Service

### 2.1 Initialize Scraper Project
- [ ] Create Node.js + Express project
- [ ] Install dependencies: express, playwright, typescript, @types/node, @types/express
- [ ] Set up TypeScript configuration
- [ ] Create project structure

### 2.2 Implement Scraper Core
- [ ] Create Express server with /scrape endpoint
- [ ] Implement Playwright browser initialization
- [ ] Create scraper function with error handling
- [ ] Implement selector-based data extraction
- [ ] Add retry logic for failed scrapes
- [ ] Implement timeout handling

### 2.3 Scraper API Endpoints
- [ ] POST /scrape - Single competitor scraping
- [ ] POST /scrape/batch - Multiple competitors
- [ ] GET /health - Health check endpoint
- [ ] Add request validation middleware
- [ ] Add rate limiting middleware

### 2.4 Scraper Utilities
- [ ] Create common selector patterns library
- [ ] Implement currency detection
- [ ] Add price parsing utilities (handle $, €, £, etc.)
- [ ] Create error logging system

### 2.5 Scraper Testing
- [ ] Write unit tests for scraper functions
- [ ] Test with sample e-commerce sites
- [ ] Test error handling scenarios
- [ ] Verify JSON response format

## Phase 3: Next.js Dashboard

### 3.1 Initialize Next.js Project
- [ ] Create Next.js 14+ project with App Router
- [ ] Install dependencies: tremor, next-auth, prisma, @prisma/client
- [ ] Set up TypeScript configuration
- [ ] Configure Tailwind CSS (included with Tremor)

### 3.2 Authentication Setup
- [ ] Install and configure NextAuth.js
- [ ] Create authentication API routes (/api/auth/[...nextauth])
- [ ] Implement credentials provider (email/password)
- [ ] Create login page (/login)
- [ ] Create register page (/register)
- [ ] Set up session management
- [ ] Add protected route middleware

### 3.3 Database Integration
- [ ] Configure Prisma Client
- [ ] Create database utility functions
- [ ] Set up connection pooling
- [ ] Create seed script for development

### 3.4 API Routes
- [ ] GET /api/competitors - List all competitors
- [ ] POST /api/competitors - Create new competitor
- [ ] PUT /api/competitors/:id - Update competitor
- [ ] DELETE /api/competitors/:id - Delete competitor
- [ ] GET /api/history/:id - Get price history for competitor
- [ ] GET /api/settings - Get user notification settings
- [ ] PUT /api/settings - Update notification settings
- [ ] Add input validation for all routes
- [ ] Add error handling middleware

### 3.5 Dashboard UI Components
- [ ] Create layout components (Header, Sidebar, Footer)
- [ ] Create competitor card component
- [ ] Create competitor list component
- [ ] Create add competitor form
- [ ] Create edit competitor form
- [ ] Create settings form
- [ ] Implement loading states
- [ ] Implement error states

### 3.6 Charts and Visualizations
- [ ] Install Tremor components
- [ ] Create price history line chart
- [ ] Create price change indicator (up/down arrows)
- [ ] Create summary cards (Total competitors, Recent changes)
- [ ] Implement date range filter for charts
- [ ] Add chart tooltips and legends

### 3.7 Dashboard Pages
- [ ] Create main dashboard page (/)
- [ ] Create competitors management page (/competitors)
- [ ] Create history view page (/history/:id)
- [ ] Create settings page (/settings)
- [ ] Create landing page (public)
- [ ] Add navigation between pages

### 3.8 Responsive Design
- [ ] Test dashboard on mobile devices
- [ ] Test dashboard on tablet devices
- [ ] Implement responsive charts
- [ ] Optimize for different screen sizes

## Phase 4: n8n Workflow Configuration

### 4.1 n8n Setup
- [ ] Start n8n via Docker Compose
- [ ] Access n8n UI (http://localhost:5678)
- [ ] Create n8n credentials for PostgreSQL
- [ ] Create n8n credentials for Discord
- [ ] Create n8n credentials for Email (SMTP)

### 4.2 Workflow Creation
- [ ] Create new workflow: "Competitor Price Monitor"
- [ ] Add Cron trigger node (every 6 hours)
- [ ] Add PostgreSQL node to fetch active competitors
- [ ] Add Split In Batches node
- [ ] Add HTTP Request node to call scraper
- [ ] Add PostgreSQL node to get last price
- [ ] Add IF node to compare prices
- [ ] Add PostgreSQL node to insert new price
- [ ] Add Discord webhook node
- [ ] Add Send Email node
- [ ] Add PostgreSQL node to log alert

### 4.3 Workflow Testing
- [ ] Test workflow manually
- [ ] Verify database inserts
- [ ] Test Discord webhook delivery
- [ ] Test email delivery
- [ ] Test error handling
- [ ] Verify 6-hour trigger

### 4.4 Workflow Optimization
- [ ] Add error handling nodes
- [ ] Add logging nodes
- [ ] Optimize database queries
- [ ] Add retry logic for failed scrapes

## Phase 5: Notification Services

### 5.1 Discord Integration
- [ ] Create Discord webhook utility
- [ ] Design Discord embed message format
- [ ] Implement webhook caller
- [ ] Test Discord message delivery
- [ ] Handle Discord API errors

### 5.2 Email Integration
- [ ] Set up Nodemailer with SMTP
- [ ] Create email template system
- [ ] Design price change alert email
- [ ] Implement email sender
- [ ] Test email delivery
- [ ] Handle email errors

### 5.3 Notification Preferences
- [ ] Implement user notification settings
- [ ] Create toggle for Email/Discord
- [ ] Store webhook URLs securely
- [ ] Add notification history

## Phase 6: Environment Configuration

### 6.1 Environment Variables
- [ ] Create .env.example with all required variables
- [ ] Document each environment variable
- [ ] Create .env file for local development
- [ ] Set up production environment variables

### 6.2 Configuration Files
- [ ] Create docker-compose.yml
- [ ] Create .dockerignore files
- [ ] Create tsconfig.json files
- [ ] Create .eslintrc.json files
- [ ] Create .prettierrc files

## Phase 7: Documentation

### 7.1 User Documentation
- [ ] Create README.md with project overview
- [ ] Write installation instructions
- [ ] Write configuration guide
- [ ] Write usage guide
- [ ] Create screenshots of dashboard

### 7.2 Developer Documentation
- [ ] Document API endpoints
- [ ] Document database schema
- [ ] Document scraper API
- [ ] Document n8n workflow
- [ ] Add code comments

### 7.3 Deployment Documentation
- [ ] Write deployment guide
- [ ] Document Docker setup
- [ ] Document production configuration
- [ ] Create troubleshooting guide

## Phase 8: Testing

### 8.1 Unit Testing
- [ ] Write tests for scraper functions
- [ ] Write tests for API routes
- [ ] Write tests for database operations
- [ ] Write tests for utility functions

### 8.2 Integration Testing
- [ ] Test scraper → database flow
- [ ] Test n8n → scraper flow
- [ ] Test notification delivery
- [ ] Test authentication flow

### 8.3 End-to-End Testing
- [ ] Test complete user registration
- [ ] Test competitor addition
- [ ] Test price change detection
- [ ] Test alert delivery
- [ ] Test dashboard visualization

### 8.4 Performance Testing
- [ ] Test scraper performance
- [ ] Test database query performance
- [ ] Test dashboard load times
- [ ] Test concurrent scraping

## Phase 9: Deployment

### 9.1 Local Deployment
- [ ] Start all services with docker-compose
- [ ] Verify all services are running
- [ ] Test complete flow locally
- [ ] Fix any deployment issues

### 9.2 Production Preparation
- [ ] Set up production database
- [ ] Configure production environment variables
- [ ] Set up SSL certificates
- [ ] Configure domain names
- [ ] Set up monitoring

### 9.3 Production Deployment
- [ ] Deploy PostgreSQL (managed service)
- [ ] Deploy n8n (cloud or VPS)
- [ ] Deploy scraper service (VPS or serverless)
- [ ] Deploy Next.js (Vercel or similar)
- [ ] Verify all services are connected
- [ ] Run smoke tests

## Phase 10: Monitoring and Maintenance

### 10.1 Monitoring Setup
- [ ] Set up application logging
- [ ] Set up error tracking (Sentry optional)
- [ ] Set up uptime monitoring
- [ ] Set up database monitoring

### 10.2 Maintenance Tasks
- [ ] Create backup strategy for database
- [ ] Set up log rotation
- [ ] Create update procedures
- [ ] Document common issues and solutions

## File-by-File Implementation Order

### Priority 1: Core Infrastructure
1. `docker-compose.yml` - Service orchestration
2. `frontend/prisma/schema.prisma` - Database schema
3. `.env.example` - Environment variables template

### Priority 2: Scraper Service
4. `scraper/package.json` - Scraper dependencies
5. `scraper/src/index.ts` - Express server
6. `scraper/src/scraper.ts` - Playwright scraper logic
7. `scraper/src/types.ts` - TypeScript types

### Priority 3: Next.js Authentication
8. `frontend/package.json` - Next.js dependencies
9. `frontend/lib/auth.ts` - NextAuth configuration
10. `frontend/app/(auth)/login/page.tsx` - Login page
11. `frontend/app/(auth)/register/page.tsx` - Register page

### Priority 4: Next.js API Routes
12. `frontend/app/api/competitors/route.ts` - Competitors CRUD
13. `frontend/app/api/history/[id]/route.ts` - History endpoint
14. `frontend/app/api/settings/route.ts` - Settings endpoint

### Priority 5: Next.js Dashboard UI
15. `frontend/app/(dashboard)/page.tsx` - Main dashboard
16. `frontend/components/ui/competitor-card.tsx` - Competitor card
17. `frontend/components/charts/price-history.tsx` - Price chart
18. `frontend/components/forms/add-competitor.tsx` - Add form

### Priority 6: n8n Workflow
19. Import n8n workflow JSON
20. Configure n8n credentials
21. Test n8n workflow

### Priority 7: Documentation
22. `README.md` - Main documentation
23. `plans/architecture.md` - Architecture docs (done)
24. `plans/implementation-plan.md` - This file (done)

## Success Criteria

- [ ] User can register and login to dashboard
- [ ] User can add competitors with URLs and selectors
- [ ] Scraper successfully extracts prices from competitor sites
- [ ] n8n workflow runs every 6 hours automatically
- [ ] Price changes are detected and stored in database
- [ ] Discord alerts are sent when prices change
- [ ] Email alerts are sent when prices change
- [ ] Dashboard displays current prices and history
- [ ] Tremor charts show price trends
- [ ] All services run reliably in Docker Compose

## Risk Mitigation

| Risk | Mitigation |
|------|------------|
| Scraper blocked by competitor sites | Implement rate limiting, user-agent rotation, respect robots.txt |
| n8n workflow fails | Add error handling, retry logic, monitoring alerts |
| Database connection issues | Use connection pooling, implement retry logic |
| Notification delivery failures | Implement queue system, retry failed notifications |
| Performance issues | Implement caching, optimize queries, use Redis if needed |

## Next Steps

Once you approve this plan, switch to **Code mode** to begin implementation. The work will proceed in the order specified above, with each phase completed before moving to the next.
