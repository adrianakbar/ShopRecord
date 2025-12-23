import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUser } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    // Get authenticated user
    const user = await getUser();
    
    // Development mode: use mock user if not authenticated
    const userId = user?.id || '00000000-0000-0000-0000-000000000001';

    // Get today's date range (local timezone)
    const now = new Date();
    const todayDateString = now.toISOString().split('T')[0]; // Format: YYYY-MM-DD
    const yesterdayDate = new Date(now);
    yesterdayDate.setDate(yesterdayDate.getDate() - 1);
    const yesterdayDateString = yesterdayDate.toISOString().split('T')[0];

    // Get current month's date range
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfNextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);

    // Get last month's date range for comparison
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // Fetch today's expenses (comparing date only)
    const todayExpenses = await prisma.expense.findMany({
      where: {
        userId,
        expenseDate: new Date(todayDateString),
      },
      select: {
        amount: true,
      },
    });

    // Fetch yesterday's expenses for trend calculation
    const yesterdayExpenses = await prisma.expense.findMany({
      where: {
        userId,
        expenseDate: new Date(yesterdayDateString),
      },
      select: {
        amount: true,
      },
    });

    // Fetch this month's expenses
    const thisMonthExpenses = await prisma.expense.findMany({
      where: {
        userId,
        expenseDate: {
          gte: startOfMonth,
          lt: startOfNextMonth,
        },
      },
      select: {
        amount: true,
      },
    });

    // Fetch last month's expenses for trend calculation
    const lastMonthExpenses = await prisma.expense.findMany({
      where: {
        userId,
        expenseDate: {
          gte: startOfLastMonth,
          lt: endOfLastMonth,
        },
      },
      select: {
        amount: true,
      },
    });

    // Calculate totals
    const todayTotal = todayExpenses.reduce((sum, exp) => sum + Number(exp.amount), 0);
    const yesterdayTotal = yesterdayExpenses.reduce((sum, exp) => sum + Number(exp.amount), 0);
    const thisMonthTotal = thisMonthExpenses.reduce((sum, exp) => sum + Number(exp.amount), 0);
    const lastMonthTotal = lastMonthExpenses.reduce((sum, exp) => sum + Number(exp.amount), 0);

    // Calculate trends
    const todayTrend = yesterdayTotal > 0
      ? Math.round(((todayTotal - yesterdayTotal) / yesterdayTotal) * 100)
      : 0;
      
    const monthlyTrend = lastMonthTotal > 0 
      ? Math.round(((thisMonthTotal - lastMonthTotal) / lastMonthTotal) * 100)
      : 0;

    // Get top categories for this month
    const categoryExpenses = await prisma.expense.groupBy({
      by: ['categoryId'],
      where: {
        userId,
        expenseDate: {
          gte: startOfMonth,
          lt: startOfNextMonth,
        },
      },
      _sum: {
        amount: true,
      },
      _count: {
        id: true,
      },
    });

    // Fetch category details
    const categoryIds = categoryExpenses.map(ce => ce.categoryId).filter(Boolean) as string[];
    const categories = await prisma.category.findMany({
      where: {
        id: { in: categoryIds },
      },
    });

    // Map categories with totals
    const topCategories = categoryExpenses
      .map(ce => {
        const category = categories.find(c => c.id === ce.categoryId);
        return {
          name: category?.name || 'Tanpa Kategori',
          amount: Number(ce._sum.amount || 0),
          count: ce._count.id,
          icon: category?.icon || 'payments',
          color: category?.color || '#53d22d',
        };
      })
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 3);

    // Calculate percentages for top categories
    const maxAmount = topCategories[0]?.amount || 1;
    const topCategoriesWithPercentage = topCategories.map(cat => ({
      ...cat,
      percentage: Math.round((cat.amount / maxAmount) * 100),
    }));

    // Get recent activity (expenses from today only)
    const recentExpenses = await prisma.expense.findMany({
      where: {
        userId,
        expenseDate: new Date(todayDateString),
      },
      include: {
        category: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 10,
    });

    // Format recent transactions
    const recentTransactions = recentExpenses.map(exp => ({
      id: exp.id,
      item: exp.item,
      amount: Number(exp.amount),
      expenseDate: exp.expenseDate.toISOString(),
      notes: exp.notes,
      category: exp.category ? {
        id: exp.category.id,
        name: exp.category.name,
        icon: exp.category.icon,
        color: exp.category.color,
      } : null,
    }));

    return NextResponse.json({
      stats: {
        today: {
          total: todayTotal,
          trend: todayTrend,
        },
        monthly: {
          total: thisMonthTotal,
          trend: monthlyTrend,
        },
      },
      topCategories: topCategoriesWithPercentage,
      recentTransactions,
    });
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard data' },
      { status: 500 }
    );
  }
}
