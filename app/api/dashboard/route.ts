import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUser } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    // Get authenticated user
    const user = await getUser();
    
    // Development mode: use mock user if not authenticated
    const userId = user?.id || '00000000-0000-0000-0000-000000000001';

    // Get today's date range
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Get current month's date range
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const startOfNextMonth = new Date(today.getFullYear(), today.getMonth() + 1, 1);

    // Get last month's date range for comparison
    const startOfLastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
    const endOfLastMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    // Fetch today's expenses
    const todayExpenses = await prisma.expense.findMany({
      where: {
        userId,
        expenseDate: {
          gte: today,
          lt: tomorrow,
        },
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
    const thisMonthTotal = thisMonthExpenses.reduce((sum, exp) => sum + Number(exp.amount), 0);
    const lastMonthTotal = lastMonthExpenses.reduce((sum, exp) => sum + Number(exp.amount), 0);

    // Calculate trends
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

    // Get recent activity (last 10 expenses)
    const recentExpenses = await prisma.expense.findMany({
      where: {
        userId,
      },
      include: {
        category: true,
      },
      orderBy: {
        expenseDate: 'desc',
      },
      take: 10,
    });

    // Format recent activity
    const recentActivity = recentExpenses.map(exp => {
      const expenseDate = new Date(exp.expenseDate);
      const isToday = expenseDate.toDateString() === today.toDateString();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      const isYesterday = expenseDate.toDateString() === yesterday.toDateString();

      let timestamp = '';
      if (isToday) {
        timestamp = `Hari ini, ${expenseDate.toLocaleTimeString('id-ID', { hour: 'numeric', minute: '2-digit' })}`;
      } else if (isYesterday) {
        timestamp = `Kemarin, ${expenseDate.toLocaleTimeString('id-ID', { hour: 'numeric', minute: '2-digit' })}`;
      } else {
        timestamp = expenseDate.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
      }

      return {
        id: exp.id,
        name: exp.item,
        category: exp.category?.name || 'Tanpa Kategori',
        amount: Number(exp.amount),
        timestamp,
        icon: exp.category?.icon || 'payments',
        iconColor: exp.category?.color || '#53d22d',
      };
    });

    return NextResponse.json({
      stats: {
        today: {
          total: todayTotal,
          trend: 0, // Could calculate based on yesterday if needed
        },
        monthly: {
          total: thisMonthTotal,
          trend: monthlyTrend,
        },
      },
      topCategories: topCategoriesWithPercentage,
      recentActivity,
    });
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard data' },
      { status: 500 }
    );
  }
}
