# Competitor Pricing Tracker

A comprehensive competitor pricing tracking system that monitors product prices from competitor websites, stores historical data, and alerts users via Discord and Email when prices change.

## 🏗️ Architecture

The system consists of four main components:

- **Next.js Dashboard** - User interface for managing competitors and viewing price history
- **PostgreSQL** - Database for storing competitors, price records, and settings
- **n8n** - Automation engine that runs scraping workflows every 6 hours
- **Playwright Scraper** - Headless browser service for scraping JavaScript-heavy websites

## 🚀 Features

- Real-time competitor price monitoring
- Beautiful dashboard with price history charts (Tremor)
- Email and Discord notifications on price changes
- User authentication (email/password)
- Support for complex JavaScript-heavy websites
- Price history tracking and visualization
- Easy-to-use CSS selector-based scraping

## 📋 Prerequisites

- Docker and Docker Compose
- Node.js 18+ (for local development)
- PostgreSQL 15+ (or use the Docker container)
- n8n account (or use the Docker container)

## 🛠️ Installation

### 1. Clone the Repository

```bash
git clone <repository-url>
cd tracks-competitor
```

### 2. Set Up Environment Variables

Copy the example environment files:

```bash
cp .env.example .env
cp frontend/.env.example frontend/.env.local
```

Edit the `.env` file and update the following values:

```bash
# PostgreSQL
POSTGRES_USER=tracker_user
POSTGRES_PASSWORD=your_secure_password_change_this
POSTGRES_DB=competitor_tracker

# n8n
N8N_BASIC_AUTH_USER=admin
N8N_BASIC_AUTH_PASSWORD=your_n8n_password_change_this
N8N_ENCRYPTION_KEY=your_encryption_key_must_be_at_least_32_characters_long

# Scraper
SCRAPER_API_KEY=your_scraper_api_key_change_this
```

Edit `frontend/.env.local`:

```bash
DATABASE_URL="postgresql://tracker_user:your_secure_password@localhost:5432/competitor_tracker?schema=public"
NEXTAUTH_SECRET=your_nextauth_secret_min_32_chars
NEXTAUTH_URL=http://localhost:3000

# Email (SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASSWORD=your_app_password
SMTP_FROM=Competitor Tracker <noreply@yourdomain.com>

# Discord
DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/your/webhook/url
```

### 3. Start Services with Docker Compose

```bash
docker-compose up -d
```

This will start:
- PostgreSQL on port 5432
- n8n on port 5678
- Redis on port 6379
- Scraper service on port 3000

### 4. Set Up the Database

```bash
cd frontend
npm install
npx prisma generate
npx prisma migrate dev --name init
```

### 5. Start the Next.js Dashboard

```bash
cd frontend
npm run dev
```

The dashboard will be available at `http://localhost:3000`

## 📖 Usage

### 1. Register an Account

1. Navigate to `http://localhost:3000`
2. Click "Get Started" or "Register"
3. Fill in your email and password
4. Click "Create account"

### 2. Add a Competitor

1. Log in to the dashboard
2. Click "Add Competitor"
3. Fill in the required fields:
   - **Competitor Name**: A friendly name for the competitor
   - **Product URL**: The full URL of the product page
   - **Price CSS Selector**: CSS selector for the price element
   - **Product Name CSS Selector** (optional): CSS selector for the product name
   - **Product Image CSS Selector** (optional): CSS selector for the product image

4. Click "Add Competitor"

### 3. Finding CSS Selectors

To find the CSS selector for an element:

1. Open the product page in your browser
2. Right-click on the price/name/image element
3. Select "Inspect" or "Inspect Element"
4. Right-click on the highlighted element in the DevTools
5. Select "Copy" → "Copy selector"

### 4. Configure n8n Workflow

1. Access n8n at `http://localhost:5678`
2. Log in with your n8n credentials
3. Import the workflow from `n8n-workflows/competitor-price-monitor.json`
4. Set up the following credentials:
   - **Postgres credentials**: Use the same credentials from `.env`
   - **SMTP credentials**: Use your email SMTP settings
5. Add environment variables to n8n:
   - `SCRAPER_API_KEY`: From your `.env` file
   - `DISCORD_WEBHOOK_URL`: Your Discord webhook URL
   - `USER_EMAIL`: Your email address for alerts
   - `SMTP_FROM`: Your from email address
6. Activate the workflow

### 5. Set Up Discord Webhook

1. Go to your Discord server settings
2. Create a new webhook or use an existing one
3. Copy the webhook URL
4. Add it to `frontend/.env.local` as `DISCORD_WEBHOOK_URL`
5. Add it to n8n environment variables

### 6. View Price History

1. Go to the dashboard
2. Click "View" on any competitor card
3. See the price history chart with all recorded prices

## 🧪 Testing

### Test the Scraper Service

```bash
curl -X POST http://localhost:3000/scrape \
  -H "Content-Type: application/json" \
  -H "x-api-key: your_scraper_api_key" \
  -d '{
    "url": "https://example.com/product",
    "priceSelector": ".price-value",
    "nameSelector": ".product-name",
    "imageSelector": ".product-image img"
  }'
```

### Test the Dashboard API

```bash
# Get competitors
curl http://localhost:3000/api/competitors

# Add a competitor
curl -X POST http://localhost:3000/api/competitors \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Competitor",
    "url": "https://example.com/product",
    "priceSelector": ".price"
  }'
```

## 📁 Project Structure

```
tracks-competitor/
├── frontend/                    # Next.js dashboard
│   ├── app/                   # Next.js App Router pages
│   ├── components/             # React components
│   ├── lib/                   # Utility functions and configs
│   ├── prisma/                # Database schema and migrations
│   └── public/                # Static assets
├── scraper/                    # Playwright scraper service
│   ├── src/                   # Source code
│   │   ├── index.ts          # Express server
│   │   ├── scraper.ts        # Playwright logic
│   │   ├── types.ts          # TypeScript types
│   │   └── utils.ts         # Helper functions
│   └── Dockerfile             # Docker configuration
├── n8n-workflows/             # n8n workflow definitions
├── plans/                     # Architecture and planning docs
├── docker-compose.yml          # Service orchestration
└── README.md                 # This file
```

## 🔧 Configuration

### Scraper Service

The scraper service exposes the following endpoints:

- `GET /health` - Health check
- `POST /scrape` - Scrape a single URL
- `POST /scrape/batch` - Scrape multiple URLs

### Dashboard API

The Next.js dashboard provides REST API endpoints:

- `GET /api/competitors` - List all competitors
- `POST /api/competitors` - Create a competitor
- `GET /api/competitors/:id` - Get competitor details
- `PUT /api/competitors/:id` - Update a competitor
- `DELETE /api/competitors/:id` - Delete a competitor
- `GET /api/history/:id` - Get price history
- `GET /api/settings` - Get notification settings
- `PUT /api/settings` - Update notification settings

## 🔒 Security

- All passwords are hashed using bcrypt
- API key authentication for scraper service
- Rate limiting on scraper endpoints
- Input validation using Zod
- SQL injection prevention via Prisma ORM

## 🚀 Deployment

### Production Deployment

1. **Database**: Use a managed PostgreSQL service (e.g., Supabase, Railway)
2. **n8n**: Deploy to n8n.cloud or self-host on a VPS
3. **Scraper**: Deploy to a VPS or serverless platform
4. **Frontend**: Deploy to Vercel, Netlify, or similar platform
5. **Environment Variables**: Configure all secrets in production

### Docker Production

```bash
# Build and start all services
docker-compose -f docker-compose.yml up -d --build
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) - React framework
- [Tremor](https://www.tremor.so/) - UI components and charts
- [Prisma](https://www.prisma.io/) - Database ORM
- [n8n](https://n8n.io/) - Workflow automation
- [Playwright](https://playwright.dev/) - Browser automation

## 📞 Support

For issues and questions, please open an issue on GitHub.
