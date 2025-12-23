import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getUser } from '@/lib/auth';

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getUser();
    
    // Development mode: use mock user if not authenticated
    const isDev = process.env.NODE_ENV === 'development';
    const userId = user?.id || (isDev ? '00000000-0000-0000-0000-000000000001' : null);
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: expenseId } = await params;

    if (!expenseId) {
      return NextResponse.json(
        { error: 'Expense ID is required' },
        { status: 400 }
      );
    }

    // Check if expense exists and belongs to user
    const expense = await prisma.expense.findFirst({
      where: {
        id: expenseId,
        userId: userId, // Ensure user owns this expense
      },
    });

    if (!expense) {
      return NextResponse.json(
        { error: 'Expense not found or unauthorized' },
        { status: 404 }
      );
    }

    // Delete the expense
    await prisma.expense.delete({
      where: { id: expenseId },
    });

    return NextResponse.json({ 
      success: true,
      message: 'Expense deleted successfully' 
    });
  } catch (error) {
    console.error('Error deleting expense:', error);
    return NextResponse.json(
      { error: 'Failed to delete expense' },
      { status: 500 }
    );
  }
}

// GET /api/expenses/[id] - Get single expense
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getUser();
    
    const isDev = process.env.NODE_ENV === 'development';
    const userId = user?.id || (isDev ? '00000000-0000-0000-0000-000000000001' : null);
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: expenseId } = await params;

    const expense = await prisma.expense.findFirst({
      where: {
        id: expenseId,
        userId: userId,
      },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            icon: true,
            color: true,
          },
        },
      },
    });

    if (!expense) {
      return NextResponse.json(
        { error: 'Expense not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(expense);
  } catch (error) {
    console.error('Error fetching expense:', error);
    return NextResponse.json(
      { error: 'Failed to fetch expense' },
      { status: 500 }
    );
  }
}

// PUT /api/expenses/[id] - Update expense
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getUser();
    
    const isDev = process.env.NODE_ENV === 'development';
    const userId = user?.id || (isDev ? '00000000-0000-0000-0000-000000000001' : null);
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: expenseId } = await params;
    const body = await request.json();

    const { item, amount, categoryId, expenseDate, notes } = body;

    // Validate required fields
    if (!item || !amount || amount <= 0) {
      return NextResponse.json(
        { error: 'Item and valid amount are required' },
        { status: 400 }
      );
    }

    // Check if expense exists and belongs to user
    const existingExpense = await prisma.expense.findFirst({
      where: {
        id: expenseId,
        userId: userId,
      },
    });

    if (!existingExpense) {
      return NextResponse.json(
        { error: 'Expense not found or unauthorized' },
        { status: 404 }
      );
    }

    // If categoryId is provided, verify it exists and belongs to user
    if (categoryId) {
      const category = await prisma.category.findFirst({
        where: {
          id: categoryId,
          userId: userId,
        },
      });

      if (!category) {
        return NextResponse.json(
          { error: 'Category not found or unauthorized' },
          { status: 404 }
        );
      }
    }

    // Update the expense
    const updatedExpense = await prisma.expense.update({
      where: { id: expenseId },
      data: {
        item,
        amount: parseFloat(amount),
        categoryId: categoryId || null,
        expenseDate: expenseDate ? new Date(expenseDate) : existingExpense.expenseDate,
        notes: notes || null,
        updatedAt: new Date(),
      },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            icon: true,
            color: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Expense updated successfully',
      expense: updatedExpense,
    });
  } catch (error) {
    console.error('Error updating expense:', error);
    return NextResponse.json(
      { error: 'Failed to update expense' },
      { status: 500 }
    );
  }
}
