import { prisma } from '@/lib/prisma'
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// GET /api/expenses - Get expenses with filters
export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const categoryId = searchParams.get('categoryId')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    const expenses = await prisma.expense.findMany({
      where: {
        userId: user.id,
        ...(categoryId && { categoryId }),
        ...(startDate && { expenseDate: { gte: new Date(startDate) } }),
        ...(endDate && { expenseDate: { lte: new Date(endDate) } })
      },
      include: {
        category: true
      },
      orderBy: {
        expenseDate: 'desc'
      }
    })

    return NextResponse.json(expenses)
  } catch (error) {
    console.error('Error fetching expenses:', error)
    return NextResponse.json(
      { error: 'Failed to fetch expenses' },
      { status: 500 }
    )
  }
}

// POST /api/expenses - Create new expense
export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { categoryId, item, amount, expenseDate, notes } = body

    if (!item || !amount || !expenseDate) {
      return NextResponse.json(
        { error: 'Item, amount, and date are required' },
        { status: 400 }
      )
    }

    const expense = await prisma.expense.create({
      data: {
        userId: user.id,
        categoryId,
        item,
        amount: parseFloat(amount),
        expenseDate: new Date(expenseDate),
        notes
      },
      include: {
        category: true
      }
    })

    return NextResponse.json(expense)
  } catch (error) {
    console.error('Error creating expense:', error)
    return NextResponse.json(
      { error: 'Failed to create expense' },
      { status: 500 }
    )
  }
}
