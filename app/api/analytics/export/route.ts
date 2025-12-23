import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUser } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const user = await getUser();
    const userId = user?.id || '00000000-0000-0000-0000-000000000001';

    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || 'this_month';
    const format = searchParams.get('format') || 'csv'; // csv or json

    // Calculate date ranges based on period
    const now = new Date();
    let startDate: Date;
    let endDate: Date;

    if (period === 'this_month') {
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
    } else if (period === 'last_month') {
      startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      endDate = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);
    } else if (period === 'all') {
      // Export all time data
      startDate = new Date(2000, 0, 1);
      endDate = new Date();
    } else {
      // Default to this month
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
    }

    // Fetch expenses
    const expenses = await prisma.expense.findMany({
      where: {
        userId,
        expenseDate: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: {
        category: {
          select: {
            name: true,
            icon: true,
            color: true,
          },
        },
      },
      orderBy: {
        expenseDate: 'desc',
      },
    });

    if (format === 'json') {
      // Return JSON format
      const jsonData = expenses.map(exp => ({
        id: exp.id,
        item: exp.item,
        amount: Number(exp.amount),
        category: exp.category?.name || 'Uncategorized',
        date: exp.expenseDate.toISOString().split('T')[0],
        notes: exp.notes || '',
        createdAt: exp.createdAt.toISOString(),
      }));

      return NextResponse.json({
        data: jsonData,
        summary: {
          totalExpenses: expenses.length,
          totalAmount: expenses.reduce((sum, exp) => sum + Number(exp.amount), 0),
          period: period,
          exportDate: new Date().toISOString(),
        },
      });
    } else {
      // Return CSV format
      const csvHeaders = ['Date', 'Item', 'Amount (Rp)', 'Category', 'Notes'];
      const csvRows = expenses.map(exp => [
        exp.expenseDate.toISOString().split('T')[0],
        `"${exp.item.replace(/"/g, '""')}"`, // Escape quotes
        Number(exp.amount).toFixed(2),
        `"${exp.category?.name || 'Uncategorized'}"`,
        `"${(exp.notes || '').replace(/"/g, '""')}"`,
      ]);

      // Add summary row
      const totalAmount = expenses.reduce((sum, exp) => sum + Number(exp.amount), 0);
      csvRows.push(['', '', '', '', '']);
      csvRows.push(['TOTAL', '', totalAmount.toFixed(2), '', '']);
      csvRows.push(['Total Transactions', expenses.length.toString(), '', '', '']);

      const csvContent = [
        csvHeaders.join(','),
        ...csvRows.map(row => row.join(',')),
      ].join('\n');

      // Generate filename with period
      const filename = `shoprecord-expenses-${period}-${new Date().toISOString().split('T')[0]}.csv`;

      return new NextResponse(csvContent, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="${filename}"`,
        },
      });
    }
  } catch (error) {
    console.error('Error exporting data:', error);
    return NextResponse.json(
      { error: 'Failed to export data' },
      { status: 500 }
    );
  }
}
