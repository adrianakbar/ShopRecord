# Perbandingan: Raw SQL vs Prisma ORM

## 📊 Contoh Query: Get Expenses dengan Category

### ❌ Tanpa ORM (Raw SQL dengan Supabase)

```typescript
import { createClient } from '@/lib/supabase/server'

export async function getExpenses(userId: string) {
  const supabase = await createClient()
  
  // Query manual, rawan typo
  const { data, error } = await supabase
    .from('expenses')
    .select(`
      id,
      user_id,
      category_id,
      item,
      amount,
      expense_date,
      notes,
      created_at,
      updated_at,
      categories (
        id,
        name,
        icon,
        color
      )
    `)
    .eq('user_id', userId)
    .order('expense_date', { ascending: false })

  if (error) throw error
  
  // Type tidak dijamin sesuai database
  // Harus manual type assertion
  return data as Array<{
    id: string
    user_id: string
    category_id: string
    item: string
    amount: number
    expense_date: string
    notes: string | null
    created_at: string
    updated_at: string
    categories: {
      id: string
      name: string
      icon: string | null
      color: string | null
    } | null
  }>
}
```

**Masalah:**
- ❌ Tidak ada type safety
- ❌ Rawan typo di nama kolom
- ❌ Manual type assertion
- ❌ Sulit refactor
- ❌ Tidak ada auto-complete
- ❌ Join query ribet dengan nested select

---

### ✅ Dengan Prisma ORM

```typescript
import { prisma } from '@/lib/prisma'

export async function getExpenses(userId: string) {
  // Auto-complete, type-safe, bersih!
  const expenses = await prisma.expense.findMany({
    where: { userId },
    include: {
      category: true // Auto-join, simple!
    },
    orderBy: {
      expenseDate: 'desc'
    }
  })
  
  // Return type sudah auto-generated dan 100% accurate!
  return expenses
}
```

**Keuntungan:**
- ✅ Full type safety
- ✅ Auto-complete di VS Code
- ✅ Typo langsung error saat compile
- ✅ Easy refactoring
- ✅ Clean & readable code
- ✅ Relasi super mudah dengan `include`

---

## 📊 Contoh: Create Expense dengan Validation

### ❌ Raw SQL

```typescript
export async function createExpense(data: {
  userId: string
  categoryId: string
  item: string
  amount: number
  expenseDate: Date
}) {
  const supabase = await createClient()
  
  // Manual validation
  if (!data.item || data.item.length > 255) {
    throw new Error('Invalid item')
  }
  
  if (data.amount <= 0) {
    throw new Error('Amount must be positive')
  }
  
  // Insert query
  const { data: expense, error } = await supabase
    .from('expenses')
    .insert({
      user_id: data.userId,
      category_id: data.categoryId,
      item: data.item,
      amount: data.amount,
      expense_date: data.expenseDate.toISOString()
    })
    .select()
    .single()
  
  if (error) throw error
  
  return expense
}
```

---

### ✅ Dengan Prisma

```typescript
export async function createExpense(data: {
  userId: string
  categoryId: string
  item: string
  amount: number
  expenseDate: Date
}) {
  // Prisma auto-validate berdasarkan schema
  // Type checking di compile time!
  const expense = await prisma.expense.create({
    data: {
      userId: data.userId,
      categoryId: data.categoryId,
      item: data.item,
      amount: data.amount,
      expenseDate: data.expenseDate
    },
    include: {
      category: true
    }
  })
  
  return expense
}
```

**Keuntungan:**
- ✅ Validation otomatis dari schema
- ✅ Type safety untuk input
- ✅ Automatic error handling
- ✅ Bisa langsung include relation

---

## 📊 Contoh: Complex Query (Budget Progress)

### ❌ Raw SQL

```typescript
export async function getBudgetProgress(
  userId: string,
  month: number,
  year: number
) {
  const supabase = await createClient()
  
  // Get budgets
  const { data: budgets, error: budgetError } = await supabase
    .from('budgets')
    .select('*')
    .eq('user_id', userId)
    .eq('month', month)
    .eq('year', year)
  
  if (budgetError) throw budgetError
  
  // Calculate spent for each budget
  const budgetsWithProgress = await Promise.all(
    budgets.map(async (budget) => {
      // Manual aggregation query
      const { data: expenses } = await supabase
        .from('expenses')
        .select('amount')
        .eq('user_id', userId)
        .eq('category_id', budget.category_id)
        .gte('expense_date', `${year}-${month.toString().padStart(2, '0')}-01`)
        .lt('expense_date', `${year}-${(month + 1).toString().padStart(2, '0')}-01`)
      
      const spent = expenses?.reduce((sum, e) => sum + e.amount, 0) || 0
      
      return {
        ...budget,
        spent,
        remaining: budget.amount - spent,
        percentage: (spent / budget.amount) * 100
      }
    })
  )
  
  return budgetsWithProgress
}
```

---

### ✅ Dengan Prisma

```typescript
export async function getBudgetProgress(
  userId: string,
  month: number,
  year: number
) {
  const budgets = await prisma.budget.findMany({
    where: { userId, month, year },
    include: { category: true }
  })
  
  const budgetsWithProgress = await Promise.all(
    budgets.map(async (budget) => {
      // Aggregate query, clean & type-safe
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
      
      const spentAmount = spent._sum.amount || 0
      
      return {
        ...budget,
        spent: spentAmount,
        remaining: budget.amount - spentAmount,
        percentage: (spentAmount / budget.amount) * 100
      }
    })
  )
  
  return budgetsWithProgress
}
```

**Keuntungan:**
- ✅ Aggregate functions built-in
- ✅ Type-safe date operations
- ✅ Cleaner code
- ✅ Better performance with optimized queries

---

## 📊 Perbandingan Fitur

| Fitur | Raw SQL / Supabase Client | Prisma ORM |
|-------|---------------------------|------------|
| **Type Safety** | ❌ Manual types | ✅ Auto-generated |
| **Auto-complete** | ❌ Limited | ✅ Full IntelliSense |
| **Refactoring** | ❌ Manual search & replace | ✅ Auto-refactor |
| **Relations** | ⚠️ Manual joins | ✅ Simple `include` |
| **Migrations** | ❌ Manual SQL | ✅ Version controlled |
| **Query Builder** | ⚠️ Method chaining | ✅ Fluent API |
| **Validation** | ❌ Manual | ✅ Schema-based |
| **Testing** | ⚠️ Mock supabase client | ✅ Easy mocking |
| **Performance** | ✅ Direct | ✅ Optimized + pooling |
| **Learning Curve** | Medium | Easy |
| **Code Maintainability** | ⚠️ Medium | ✅ High |

---

## 🎯 Kesimpulan

### Kapan Pakai Prisma?
✅ **Project besar & kompleks**
✅ **Butuh type safety**
✅ **Tim development**
✅ **Long-term maintenance**
✅ **Complex relations & queries**

### Kapan Pakai Raw SQL?
⚠️ Simple CRUD operations
⚠️ Prototype cepat
⚠️ Very specific SQL optimizations
⚠️ Database-specific features

---

## 💡 Rekomendasi untuk ShopRecord

Karena ShopRecord memiliki:
- ✅ Multiple tables dengan relations
- ✅ Complex queries (budgets, aggregations, etc)
- ✅ Need type safety untuk TypeScript
- ✅ Long-term maintenance
- ✅ Team collaboration potential

**→ Prisma adalah pilihan terbaik! 🎉**

---

## 🚀 Next Steps

1. ✅ Install Prisma (sudah done)
2. ✅ Setup schema (sudah done)
3. ⏳ Update DATABASE_URL di `.env.local`
4. ⏳ Run `npx prisma db pull` atau `npx prisma db push`
5. ⏳ Run `npx prisma generate`
6. ⏳ Mulai gunakan Prisma di API routes

Happy coding with Prisma! 🎨
