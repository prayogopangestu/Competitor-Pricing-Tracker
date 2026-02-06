# Quick Reference - Competitor Pricing Tracker

## Environment Variables

### Root .env (Docker Compose)
```bash
# PostgreSQL
POSTGRES_USER=tracker_user
POSTGRES_PASSWORD=your_secure_password
POSTGRES_DB=competitor_tracker
POSTGRES_PORT=5432

# n8n
N8N_PORT=5678
N8N_HOST=localhost
N8N_PROTOCOL=http
N8N_BASIC_AUTH_ACTIVE=true
N8N_BASIC_AUTH_USER=admin
N8N_BASIC_AUTH_PASSWORD=your_n8n_password
N8N_ENCRYPTION_KEY=your_encryption_key_min_32_chars

# Scraper Service
SCRAPER_PORT=3000
SCRAPER_API_KEY=your_scraper_api_key
```

### Frontend .env.local (Next.js)
```bash
# Database
DATABASE_URL="postgresql://tracker_user:your_secure_password@localhost:5432/competitor_tracker?schema=public"

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret_min_32_chars

# Scraper Service
SCRAPER_API_URL=http://localhost:3000
SCRAPER_API_KEY=your_scraper_api_key

# Email (SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASSWORD=your_app_password
SMTP_FROM=Competitor Tracker <noreply@yourdomain.com>

# Discord (optional - for testing)
DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/your/webhook/url
```

### Scraper .env
```bash
PORT=3000
API_KEY=your_scraper_api_key
NODE_ENV=development
```

## Docker Compose Services

### Start All Services
```bash
docker-compose up -d
```

### Stop All Services
```bash
docker-compose down
```

### View Logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f postgres
docker-compose logs -f n8n
```

### Access Services
- **PostgreSQL**: `localhost:5432`
- **n8n UI**: `http://localhost:5678`
- **Scraper API**: `http://localhost:3000`
- **Next.js Dashboard**: `http://localhost:3000` (when running locally)

## Database Commands

### Run Prisma Migrations
```bash
cd frontend
npx prisma migrate dev --name init
```

### Generate Prisma Client
```bash
cd frontend
npx prisma generate
```

### Open Prisma Studio
```bash
cd frontend
npx prisma studio
```

### Seed Database (Optional)
```bash
cd frontend
npx prisma db seed
```

## Scraper API Endpoints

### Scrape Single Competitor
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

### Scrape Multiple Competitors
```bash
curl -X POST http://localhost:3000/scrape/batch \
  -H "Content-Type: application/json" \
  -H "x-api-key: your_scraper_api_key" \
  -d '{
    "competitors": [
      {
        "id": "uuid-1",
        "url": "https://example.com/product1",
        "priceSelector": ".price",
        "nameSelector": ".title"
      },
      {
        "id": "uuid-2",
        "url": "https://example.com/product2",
        "priceSelector": ".cost",
        "nameSelector": ".name"
      }
    ]
  }'
```

### Health Check
```bash
curl http://localhost:3000/health
```

## Next.js Development

### Start Development Server
```bash
cd frontend
npm run dev
```

### Build for Production
```bash
cd frontend
npm run build
```

### Start Production Server
```bash
cd frontend
npm start
```

## Common CSS Selectors for Scraping

### E-commerce Price Selectors
```css
/* Common price selectors */
.price
.product-price
.price-value
.current-price
.sale-price
.amount
[data-price]
[class*="price"]
```

### Product Name Selectors
```css
/* Common name selectors */
.product-name
.product-title
.title
h1.product
[data-product-name]
[class*="product-name"]
```

### Product Image Selectors
```css
/* Common image selectors */
.product-image img
.product-photo img
.main-image img
img.product-img
[data-product-image]
```

## n8n Workflow Quick Setup

### 1. Create PostgreSQL Credentials
- Go to Settings > Credentials
- Click "Add Credential"
- Select "Postgres"
- Enter connection details from .env

### 2. Create Discord Credentials
- Go to Settings > Credentials
- Click "Add Credential"
- Select "Discord"
- Enter webhook URL

### 3. Create Email Credentials
- Go to Settings > Credentials
- Click "Add Credential"
- Select "Send Email"
- Enter SMTP details from .env

### 4. Import Workflow
- Go to Workflows
- Click "Import from File"
- Select the workflow JSON file
- Update node credentials

### 5. Activate Workflow
- Click "Active" toggle
- Verify next run time

## Troubleshooting

### Scraper Returns No Data
- Check if selector is correct (use browser DevTools)
- Verify the page is fully loaded (add wait for selector)
- Check if content is loaded via JavaScript (increase timeout)
- Verify the URL is accessible

### n8n Workflow Not Running
- Check if Cron trigger is configured correctly
- Verify workflow is "Active"
- Check n8n logs for errors
- Verify credentials are set up

### Database Connection Issues
- Verify PostgreSQL is running: `docker-compose ps`
- Check DATABASE_URL in .env.local
- Verify credentials match
- Check if port 5432 is available

### Discord Webhook Not Working
- Verify webhook URL is correct
- Check if webhook has permissions
- Test webhook with curl:
  ```bash
  curl -X POST YOUR_WEBHOOK_URL \
    -H "Content-Type: application/json" \
    -d '{"content": "Test message"}'
  ```

### Email Not Sending
- Verify SMTP credentials
- Check if app password is used (not regular password)
- Verify SMTP host and port
- Check firewall settings

## Performance Tips

### Scraper Optimization
- Use specific selectors (avoid too generic)
- Implement caching for static content
- Set appropriate timeouts
- Use browser context reuse

### Database Optimization
- Add indexes on frequently queried columns
- Use connection pooling
- Archive old price records
- Implement pagination for history queries

### n8n Optimization
- Use batch processing when possible
- Set appropriate timeouts
- Implement error handling
- Use workflow execution history

## Security Checklist

- [ ] Change all default passwords
- [ ] Use strong API keys (32+ characters)
- [ ] Enable HTTPS in production
- [ ] Restrict database access to Docker network
- [ ] Use environment variables for secrets
- [ ] Implement rate limiting on scraper API
- [ ] Add authentication to n8n
- [ ] Regularly update dependencies
- [ ] Use prepared statements for database queries
- [ ] Validate all user inputs

## Useful Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Tremor Components](https://www.tremor.so/)
- [NextAuth.js](https://next-auth.js.org/)
- [Prisma](https://www.prisma.io/docs)
- [Playwright](https://playwright.dev/)
- [n8n Documentation](https://docs.n8n.io/)
- [Docker Compose](https://docs.docker.com/compose/)
