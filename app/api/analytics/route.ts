import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUser } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const user = await getUser();
    const userId = user?.id || '00000000-0000-0000-0000-000000000001';

    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || 'this_month'; // this_month, last_month, custom

    // Calculate date ranges based on period
    const now = new Date();
    let startDate: Date;
    let endDate: Date;
    let prevStartDate: Date;
    let prevEndDate: Date;

    if (period === 'this_month') {
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
      prevStartDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      prevEndDate = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);
    } else if (period === 'last_month') {
      startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      endDate = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);
      prevStartDate = new Date(now.getFullYear(), now.getMonth() - 2, 1);
      prevEndDate = new Date(now.getFullYear(), now.getMonth() - 1, 0, 23, 59, 59);
    } else {
      // Default to this month
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
      prevStartDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      prevEndDate = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);
    }

    // Fetch current period expenses
    const currentExpenses = await prisma.expense.findMany({
      where: {
        userId,
        expenseDate: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: {
        category: true,
      },
    });

    // Fetch previous period expenses for comparison
    const previousExpenses = await prisma.expense.findMany({
      where: {
        userId,
        expenseDate: {
          gte: prevStartDate,
          lte: prevEndDate,
        },
      },
      select: {
        amount: true,
      },
    });

    // Calculate totals
    const totalSpent = currentExpenses.reduce((sum, exp) => sum + Number(exp.amount), 0);
    const prevTotalSpent = previousExpenses.reduce((sum, exp) => sum + Number(exp.amount), 0);
    const spentTrend = prevTotalSpent > 0 
      ? Math.round(((totalSpent - prevTotalSpent) / prevTotalSpent) * 100)
      : 0;

    // Calculate daily average
    const daysInPeriod = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    const dailyAverage = totalSpent / daysInPeriod;

    // Group by category
    const categoryMap = new Map<string, { name: string; total: number; color: string; icon: string }>();
    currentExpenses.forEach((exp) => {
      const categoryId = exp.category?.id || 'uncategorized';
      const categoryName = exp.category?.name || 'Uncategorized';
      const existing = categoryMap.get(categoryId);
      
      if (existing) {
        existing.total += Number(exp.amount);
      } else {
        categoryMap.set(categoryId, {
          name: categoryName,
          total: Number(exp.amount),
          color: exp.category?.color || '#46ec13',
          icon: exp.category?.icon || 'payments',
        });
      }
    });

    const categoriesData = Array.from(categoryMap.values())
      .sort((a, b) => b.total - a.total)
      .map((cat, index) => ({
        ...cat,
        percentage: totalSpent > 0 ? Math.round((cat.total / totalSpent) * 100) : 0,
      }));

    const highestCategory = categoriesData[0] || { name: 'N/A', total: 0 };

    // Daily spending for last 7 days
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - i));
      return date.toISOString().split('T')[0];
    });

    const dailySpending = last7Days.map((dateStr) => {
      const dayExpenses = currentExpenses.filter(
        (exp) => exp.expenseDate.toISOString().split('T')[0] === dateStr
      );
      const total = dayExpenses.reduce((sum, exp) => sum + Number(exp.amount), 0);
      const date = new Date(dateStr);
      return {
        day: date.toLocaleDateString('en-US', { weekday: 'short' }),
        date: dateStr,
        total,
      };
    });

    // Get recent transactions
    const recentTransactions = currentExpenses
      .sort((a, b) => b.expenseDate.getTime() - a.expenseDate.getTime())
      .slice(0, 10)
      .map((exp) => ({
        id: exp.id,
        item: exp.item,
        amount: Number(exp.amount),
        expenseDate: exp.expenseDate.toISOString(),
        category: exp.category ? {
          id: exp.category.id,
          name: exp.category.name,
          icon: exp.category.icon,
          color: exp.category.color,
        } : null,
      }));

    return NextResponse.json({
      stats: {
        totalSpent,
        spentTrend,
        highestCategory: {
          name: highestCategory.name,
          total: highestCategory.total,
        },
        dailyAverage,
      },
      categoriesData,
      dailySpending,
      recentTransactions,
    });
  } catch (error) {
    console.error('Error fetching analytics data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics data' },
      { status: 500 }
    );
  }
}
