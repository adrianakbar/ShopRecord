import { NextResponse } from 'next/server';
import { parseExpenseWithAI } from '@/lib/gemini';
import { getUser } from '@/lib/auth';
import prisma from '@/lib/prisma';

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
    const { text } = body;

    if (!text || typeof text !== 'string' || text.trim().length === 0) {
      return NextResponse.json(
        { error: 'Text input is required' },
        { status: 400 }
      );
    }

    // Record start time for performance tracking
    const startTime = Date.now();

    // Parse with AI
    const parseResult = await parseExpenseWithAI(text.trim());

    const processingTime = Date.now() - startTime;

    // Log AI parsing attempt
    await prisma.aiParsingLog.create({
      data: {
        userId,
        inputText: text.trim(),
        parsedResult: parseResult.expenses as any,
        success: parseResult.success,
        errorMessage: parseResult.error || null,
        processingTimeMs: processingTime,
      },
    });

    if (!parseResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: parseResult.error || 'Failed to parse expenses',
          expenses: [],
        },
        { status: 400 }
      );
    }

    // Enhance with category IDs from database
    const categories = await prisma.category.findMany({
      where: { userId },
      select: { id: true, name: true },
    });

    const expensesWithCategoryIds = parseResult.expenses.map((expense) => {
      const category = categories.find(
        (cat: { id: string; name: string }) => cat.name.toLowerCase() === expense.category.toLowerCase()
      );
      return {
        ...expense,
        categoryId: category?.id || null,
      };
    });

    return NextResponse.json({
      success: true,
      expenses: expensesWithCategoryIds,
      originalText: parseResult.originalText,
      processingTimeMs: processingTime,
    });
  } catch (error) {
    console.error('Parse API Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
        expenses: [],
      },
      { status: 500 }
    );
  }
}

// Test endpoint
export async function GET() {
  try {
    const { testAIConnection } = await import('@/lib/gemini');
    const isConnected = await testAIConnection();
    
    return NextResponse.json({
      status: isConnected ? 'connected' : 'disconnected',
      apiKeyConfigured: !!process.env.GOOGLE_AI_API_KEY,
      model: 'gemini-2.5-flash',
    });
  } catch (error) {
    return NextResponse.json(
      {
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
