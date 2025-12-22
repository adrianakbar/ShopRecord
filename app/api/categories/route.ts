import { prisma } from '@/lib/prisma';
import { createClient } from '@/lib/supabase/server';
import { SYSTEM_USER_ID } from '@/lib/constants';
import { NextResponse } from 'next/server';

// GET /api/categories - Get all categories (system + user custom)
export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get both system categories and user's custom categories
    const categories = await prisma.category.findMany({
      where: {
        OR: [
          { userId: SYSTEM_USER_ID },  // System/default categories
          { userId: user.id }           // User's custom categories
        ]
      },
      orderBy: [
        { userId: 'asc' },  // System categories first
        { name: 'asc' }
      ]
    });

    return NextResponse.json({ 
      categories,
      systemCount: categories.filter(c => c.userId === SYSTEM_USER_ID).length,
      userCount: categories.filter(c => c.userId === user.id).length
    });
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json(
      { error: 'Failed to fetch categories' },
      { status: 500 }
    );
  }
}

// POST /api/categories - Create new custom category for user
export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name, icon, color } = body;

    if (!name) {
      return NextResponse.json(
        { error: 'Name is required' },
        { status: 400 }
      );
    }

    // Check if user already has a category with this name
    const existing = await prisma.category.findFirst({
      where: {
        userId: user.id,
        name
      }
    });

    if (existing) {
      return NextResponse.json(
        { error: 'Category with this name already exists' },
        { status: 409 }
      );
    }

    const category = await prisma.category.create({
      data: {
        userId: user.id,
        name,
        icon: icon || 'category',
        color: color || '#9ca3af'
      }
    });

    return NextResponse.json(category);
  } catch (error) {
    console.error('Error creating category:', error);
    return NextResponse.json(
      { error: 'Failed to create category' },
      { status: 500 }
    );
  }
}

// DELETE /api/categories/:id - Delete user's custom category
export async function DELETE(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const url = new URL(request.url);
    const categoryId = url.searchParams.get('id');

    if (!categoryId) {
      return NextResponse.json(
        { error: 'Category ID is required' },
        { status: 400 }
      );
    }

    // Check if category exists and belongs to user
    const category = await prisma.category.findFirst({
      where: {
        id: categoryId,
        userId: user.id  // Only allow deleting own categories, not system categories
      }
    });

    if (!category) {
      return NextResponse.json(
        { error: 'Category not found or cannot be deleted' },
        { status: 404 }
      );
    }

    await prisma.category.delete({
      where: { id: categoryId }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting category:', error);
    return NextResponse.json(
      { error: 'Failed to delete category' },
      { status: 500 }
    );
  }
}
