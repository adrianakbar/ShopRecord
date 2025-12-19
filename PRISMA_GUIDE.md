# Prisma ORM Setup Guide

## 🎯 Mengapa Menggunakan Prisma?

### Keuntungan Prisma vs Raw SQL:

✅ **Type Safety** - Auto-generated TypeScript types
✅ **Auto-completion** - IntelliSense untuk query
✅ **Migrations** - Version control untuk database schema
✅ **Relation Handling** - Mudah query dengan relations
✅ **Connection Pooling** - Built-in optimization
✅ **Less Boilerplate** - Code lebih bersih dan readable
✅ **Query Builder** - Tidak perlu menulis SQL manual
✅ **Validation** - Type checking di compile time

## 📦 Installation

```bash
# Sudah diinstall:
npm install @prisma/client
npm install -D prisma
```

## 🚀 Setup Database

### 1. Dapatkan Database Credentials dari Supabase

1. Buka [Supabase Dashboard](https://app.supabase.com)
2. Pilih project Anda
3. Settings → Database
4. Scroll ke **Connection string**
5. Copy **Connection pooling** (untuk `DATABASE_URL`)
6. Copy **Direct connection** (untuk `DIRECT_URL`)

### 2. Update `.env.local`

Ganti `[YOUR-PASSWORD]` dengan password database Anda:

```env
DATABASE_URL="postgresql://postgres.blvptzochxmazecxhruw:[YOUR-PASSWORD]@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres.blvptzochxmazecxhruw:[YOUR-PASSWORD]@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres"
```

### 3. Push Schema ke Database

**Karena tabel sudah ada di database (dari schema.sql), gunakan:**

```bash
# Pull existing schema dari database
npx prisma db pull

# Generate Prisma Client
npx prisma generate
```

**ATAU jika ingin create from scratch:**

```bash
# Push schema ke database (akan create/update tables)
npx prisma db push

# Generate Prisma Client
npx prisma generate
```

## 📝 Contoh Penggunaan

### 1. Get All Categories

```typescript
import { prisma } from '@/lib/prisma'

// Di API route atau Server Component
export async function getCategories(userId: string) {
  const categories = await prisma.category.findMany({
    where: { userId },
    orderBy: { name: 'asc' }
  })
  
  return categories
}
```

### 2. Create Expense

```typescript
import { prisma } from '@/lib/prisma'

export async function createExpense(data: {
  userId: string
  categoryId: string
  item: string
  amount: number
  expenseDate: Date
  notes?: string
}) {
  const expense = await prisma.expense.create({
    data: {
      userId: data.userId,
      categoryId: data.categoryId,
      item: data.item,
      amount: data.amount,
      expenseDate: data.expenseDate,
      notes: data.notes
    },
    include: {
      category: true // Include category data
    }
  })
  
  return expense
}
```

### 3. Get Expenses with Category

```typescript
import { prisma } from '@/lib/prisma'

export async function getExpenses(userId: string, date?: Date) {
  const expenses = await prisma.expense.findMany({
    where: {
      userId,
      ...(date && { expenseDate: date })
    },
    include: {
      category: true // Auto-join dengan category
    },
    orderBy: {
      expenseDate: 'desc'
    }
  })
  
  return expenses
}
```

### 4. Get Budget with Progress

```typescript
import { prisma } from '@/lib/prisma'

export async function getBudgetProgress(userId: string, month: number, year: number) {
  const budgets = await prisma.budget.findMany({
    where: { userId, month, year },
    include: {
      category: true,
      _count: {
        select: { category: { expenses: true } }
      }
    }
  })
  
  // Calculate spent amount
  const budgetsWithProgress = await Promise.all(
    budgets.map(async (budget) => {
      const spent = await prisma.expense.aggregate({
        where: {
          userId,
          categoryId: budget.categoryId,
          expenseDate: {
            gte: new Date(year, month - 1, 1),
            lt: new Date(year, month, 1)
          }
        },
        _sum: { amount: true }
      })
      
      return {
        ...budget,
        spent: spent._sum.amount || 0,
        remaining: budget.amount - (spent._sum.amount || 0),
        percentage: ((spent._sum.amount || 0) / budget.amount) * 100
      }
    })
  )
  
  return budgetsWithProgress
}
```

### 5. Create Template

```typescript
import { prisma } from '@/lib/prisma'

export async function createTemplate(data: {
  userId: string
  categoryId: string
  name: string
  item: string
  amount?: number
  notes?: string
}) {
  const template = await prisma.template.create({
    data,
    include: { category: true }
  })
  
  return template
}
```

### 6. Use Template (1-click add)

```typescript
import { prisma } from '@/lib/prisma'

export async function useTemplate(templateId: string, userId: string) {
  // Get template
  const template = await prisma.template.findUnique({
    where: { id: templateId }
  })
  
  if (!template || template.userId !== userId) {
    throw new Error('Template not found')
  }
  
  // Create expense from template
  const expense = await prisma.expense.create({
    data: {
      userId: template.userId,
      categoryId: template.categoryId,
      item: template.item,
      amount: template.amount || 0,
      expenseDate: new Date(),
      notes: template.notes
    }
  })
  
  // Update template usage
  await prisma.template.update({
    where: { id: templateId },
    data: {
      usageCount: { increment: 1 },
      lastUsedAt: new Date()
    }
  })
  
  return expense
}
```

### 7. Daily Summary

```typescript
import { prisma } from '@/lib/prisma'

export async function getDailySummary(userId: string, date: Date) {
  const summary = await prisma.expense.groupBy({
    by: ['categoryId'],
    where: {
      userId,
      expenseDate: date
    },
    _sum: { amount: true },
    _count: true
  })
  
  // Get category details
  const summaryWithCategories = await Promise.all(
    summary.map(async (item) => {
      const category = await prisma.category.findUnique({
        where: { id: item.categoryId || undefined }
      })
      
      return {
        category,
        total: item._sum.amount || 0,
        count: item._count
      }
    })
  )
  
  return summaryWithCategories
}
```

### 8. Monthly Category Expenses (for Charts)

```typescript
import { prisma } from '@/lib/prisma'

export async function getMonthlyExpensesByCategory(userId: string, year: number, month: number) {
  const expenses = await prisma.expense.groupBy({
    by: ['categoryId'],
    where: {
      userId,
      expenseDate: {
        gte: new Date(year, month - 1, 1),
        lt: new Date(year, month, 1)
      }
    },
    _sum: { amount: true },
    _count: true
  })
  
  const result = await Promise.all(
    expenses.map(async (item) => {
      const category = await prisma.category.findUnique({
        where: { id: item.categoryId || undefined }
      })
      
      return {
        categoryId: item.categoryId,
        categoryName: category?.name || 'Uncategorized',
        categoryColor: category?.color || '#9E9E9E',
        total: item._sum.amount || 0,
        transactionCount: item._count
      }
    })
  )
  
  return result
}
```

### 9. Search & Filter

```typescript
import { prisma } from '@/lib/prisma'

export async function searchExpenses(params: {
  userId: string
  search?: string
  categoryId?: string
  startDate?: Date
  endDate?: Date
  minAmount?: number
  maxAmount?: number
}) {
  const expenses = await prisma.expense.findMany({
    where: {
      userId: params.userId,
      ...(params.search && {
        OR: [
          { item: { contains: params.search, mode: 'insensitive' } },
          { notes: { contains: params.search, mode: 'insensitive' } }
        ]
      }),
      ...(params.categoryId && { categoryId: params.categoryId }),
      ...(params.startDate && { expenseDate: { gte: params.startDate } }),
      ...(params.endDate && { expenseDate: { lte: params.endDate } }),
      ...(params.minAmount && { amount: { gte: params.minAmount } }),
      ...(params.maxAmount && { amount: { lte: params.maxAmount } })
    },
    include: { category: true },
    orderBy: { expenseDate: 'desc' }
  })
  
  return expenses
}
```

### 10. Update User Preferences

```typescript
import { prisma } from '@/lib/prisma'

export async function updateUserPreferences(userId: string, data: {
  darkMode?: boolean
  currency?: string
  dateFormat?: string
  defaultCategoryId?: string
  notificationsEnabled?: boolean
}) {
  const preferences = await prisma.userPreferences.upsert({
    where: { userId },
    create: {
      userId,
      ...data
    },
    update: data
  })
  
  return preferences
}
```

## 🔧 Prisma Commands

```bash
# Generate Prisma Client (after schema changes)
npx prisma generate

# Format schema file
npx prisma format

# Open Prisma Studio (GUI for database)
npx prisma studio

# Pull schema from existing database
npx prisma db pull

# Push schema to database (without migrations)
npx prisma db push

# Create migration
npx prisma migrate dev --name migration_name

# Reset database (WARNING: deletes all data)
npx prisma migrate reset
```

## 📊 Prisma Studio

GUI untuk explore database:

```bash
npx prisma studio
```

Buka di browser: http://localhost:5555

## 🎨 VS Code Extension

Install extension untuk better DX:
- **Prisma** (by Prisma) - Syntax highlighting & auto-complete

## 🚨 Common Issues

### Issue: Can't generate client
```bash
# Solution: Clear cache
rm -rf node_modules/.prisma
npx prisma generate
```

### Issue: Migration conflicts
```bash
# Solution: Pull and regenerate
npx prisma db pull
npx prisma generate
```

### Issue: Type errors after schema change
```bash
# Solution: Regenerate client
npx prisma generate
# Then restart TS server in VS Code (Cmd+Shift+P → "TypeScript: Restart TS Server")
```

## 📚 Resources

- [Prisma Docs](https://www.prisma.io/docs)
- [Prisma with Next.js](https://www.prisma.io/docs/guides/other/nextjs)
- [Prisma with Supabase](https://supabase.com/docs/guides/integrations/prisma)
