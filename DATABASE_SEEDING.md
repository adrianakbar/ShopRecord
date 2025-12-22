# Database Seeding Guide

## Prerequisites
Make sure you have:
1. Database connection configured in `.env.local` file with `DIRECT_URL`
2. Prisma Client generated (`npm run postinstall` or `npx prisma generate`)
3. Required packages installed: `tsx`, `@prisma/adapter-pg`, `pg`

## Running the Seed Script

### Step 1: Install dependencies (if not already installed)
```bash
npm install -D tsx
npm install @prisma/adapter-pg pg
```

### Step 2: Run the seed script
```bash
npm run db:seed
```

This will:
- Clean existing data for the mock user (development only)
- Create 8 categories (Food & Dining, Groceries, Transportation, Utilities, Entertainment, Shopping, Healthcare, Coffee & Cafe)
- Create 17 dummy expense transactions spanning the last 2 weeks
- Display a summary of created records

## Mock User ID

The seed script uses a mock user ID: `00000000-0000-0000-0000-000000000001`

**Important:** To test with a real user:
1. Sign up/login to get a real user ID from Supabase Auth
2. Update the `MOCK_USER_ID` in `prisma/seed.ts`
3. Re-run the seed script

## Database Schema

The expenses table includes:
- `id`: UUID primary key
- `userId`: References Supabase auth.users
- `categoryId`: References categories table (nullable)
- `item`: Merchant/expense name
- `amount`: Decimal amount
- `expenseDate`: Date of expense
- `notes`: Additional notes (includes payment method info)
- `createdAt`, `updatedAt`: Timestamps

## Viewing the Data

After seeding, you can:
1. Visit `/history` page to see the expenses
2. Use Prisma Studio: `npx prisma studio`
3. Query directly via API: `GET /api/expenses`

## API Endpoint

The History page fetches data from `/api/expenses` which:
- Requires authentication (user must be logged in)
- Returns expenses with category information
- Includes monthly statistics (total spent, transaction count, top category)
- Supports search and filtering parameters:
  - `search`: Search in item name or notes
  - `categoryId`: Filter by category
  - `startDate`: Filter expenses from date
  - `endDate`: Filter expenses to date

## Prisma 7 Configuration

This project uses Prisma 7 which requires:
- PostgreSQL adapter (`@prisma/adapter-pg`) for database connections
- Configuration in `prisma.config.ts` for datasource URL
- Adapter passed to PrismaClient constructor in `lib/prisma.ts`
