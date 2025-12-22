import { NextResponse } from 'next/server';
import { getUser } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { SYSTEM_USER_ID } from '@/lib/constants';

export async function POST(request: Request) {
  try {
    const user = await getUser();
    
    // Development mode: use mock user if not authenticated
    const isDev = process.env.NODE_ENV === 'development';
    const userId = user?.id || (isDev ? '00000000-0000-0000-0000-000000000001' : null);
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { expenses } = body;

    if (!expenses || !Array.isArray(expenses) || expenses.length === 0) {
      return NextResponse.json(
        { error: 'Expenses array is required' },
        { status: 400 }
      );
    }

    // Get or create categories
    const categoryNames = [...new Set(expenses.map((e: { category: string }) => e.category))];
    
    // Find categories in both system and user categories
    const categories = await prisma.category.findMany({
      where: {
        OR: [
          { userId: SYSTEM_USER_ID, name: { in: categoryNames } },
          { userId, name: { in: categoryNames } }
        ]
      }
    });

    // Map category names to IDs
    const categoryMap = new Map(categories.map(c => [c.name, c.id]));

    // Create missing categories as USER categories only (not system)
    const missingCategories = categoryNames.filter(name => !categoryMap.has(name));
    if (missingCategories.length > 0) {
      const newCategories = await Promise.all(
        missingCategories.map(name =>
          prisma.category.create({
            data: {
              userId, // Create as user's custom category
              name,
              icon: 'payments',
              color: '#' + Math.floor(Math.random()*16777215).toString(16),
            }
          })
        )
      );
      newCategories.forEach(c => categoryMap.set(c.name, c.id));
    }

    // Create expenses
    const createdExpenses = await prisma.expense.createMany({
      data: expenses.map((expense: {
        item: string;
        amount: number;
        category: string;
        date: string;
        notes?: string;
      }) => ({
        userId,
        categoryId: categoryMap.get(expense.category),
        item: expense.item,
        amount: expense.amount,
        expenseDate: new Date(expense.date),
        notes: expense.notes || null,
      }))
    });

    return NextResponse.json({
      success: true,
      count: createdExpenses.count,
      message: `${createdExpenses.count} expenses saved successfully`,
    });
  } catch (error) {
    console.error('Error saving expenses:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
      },
      { status: 500 }
    );
  }
}
