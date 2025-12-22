import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getUser } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    const user = await getUser();
    
    // Development mode: use mock user if not authenticated
    const isDev = process.env.NODE_ENV === 'development';
    const userId = user?.id || (isDev ? '00000000-0000-0000-0000-000000000001' : null);
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const categoryId = searchParams.get('categoryId');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    // Build where clause
    interface WhereClause {
      userId: string;
      OR?: Array<{ item?: { contains: string; mode: 'insensitive' }; notes?: { contains: string; mode: 'insensitive' } }>;
      categoryId?: string;
      expenseDate?: {
        gte?: Date;
        lte?: Date;
      };
    }

    const where: WhereClause = {
      userId: userId,
    };

    if (search) {
      where.OR = [
        { item: { contains: search, mode: 'insensitive' } },
        { notes: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (categoryId) {
      where.categoryId = categoryId;
    }

    if (startDate || endDate) {
      where.expenseDate = {};
      if (startDate) {
        where.expenseDate.gte = new Date(startDate);
      }
      if (endDate) {
        where.expenseDate.lte = new Date(endDate);
      }
    }

    // Fetch expenses with categories
    const expenses = await prisma.expense.findMany({
      where,
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
      orderBy: {
        expenseDate: 'desc',
      },
      take: 100, // Limit to 100 most recent
    });

    // Get monthly stats
    const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    const endOfMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0);

    const monthlyExpenses = await prisma.expense.aggregate({
      where: {
        userId: userId,
        expenseDate: {
          gte: startOfMonth,
          lte: endOfMonth,
        },
      },
      _sum: {
        amount: true,
      },
      _count: true,
    });

    // Get most active category this month
    const categoryStats = await prisma.expense.groupBy({
      by: ['categoryId'],
      where: {
        userId: userId,
        expenseDate: {
          gte: startOfMonth,
          lte: endOfMonth,
        },
      },
      _count: {
        categoryId: true,
      },
      _sum: {
        amount: true,
      },
      orderBy: {
        _count: {
          categoryId: 'desc',
        },
      },
      take: 1,
    });

    let topCategory = null;
    if (categoryStats.length > 0 && categoryStats[0].categoryId) {
      const category = await prisma.category.findUnique({
        where: { id: categoryStats[0].categoryId },
        select: { name: true },
      });
      topCategory = {
        name: category?.name || 'Unknown',
        count: categoryStats[0]._count.categoryId,
        total: categoryStats[0]._sum.amount,
      };
    }

    return NextResponse.json({
      expenses,
      stats: {
        monthlyTotal: monthlyExpenses._sum.amount || 0,
        monthlyCount: monthlyExpenses._count || 0,
        topCategory,
      },
    });
  } catch (error) {
    console.error('Error fetching expenses:', error);
    return NextResponse.json(
      { error: 'Failed to fetch expenses' },
      { status: 500 }
    );
  }
}
