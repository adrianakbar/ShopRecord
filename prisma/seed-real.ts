import prisma from '../lib/prisma';
import { config } from 'dotenv';

config({ path: '.env.local' });

// Get user ID from environment variable or use mock
const USER_ID = process.env.USER_ID || '00000000-0000-0000-0000-000000000001';

async function main() {
  console.log('🌱 Starting seed for user:', USER_ID);

  // Clean existing data for this user
  await prisma.expense.deleteMany({ where: { userId: USER_ID } });
  await prisma.category.deleteMany({ where: { userId: USER_ID } });
  
  console.log('🗑️  Cleaned existing data');

  // Create Categories
  const categories = await Promise.all([
    prisma.category.create({
      data: {
        userId: USER_ID,
        name: 'Makanan & Minuman',
        icon: 'restaurant',
        color: '#FF6B6B',
      },
    }),
    prisma.category.create({
      data: {
        userId: USER_ID,
        name: 'Belanjaan',
        icon: 'shopping_cart',
        color: '#4ECDC4',
      },
    }),
    prisma.category.create({
      data: {
        userId: USER_ID,
        name: 'Transportasi',
        icon: 'directions_car',
        color: '#95E1D3',
      },
    }),
    prisma.category.create({
      data: {
        userId: USER_ID,
        name: 'Utilitas',
        icon: 'receipt_long',
        color: '#F38181',
      },
    }),
    prisma.category.create({
      data: {
        userId: USER_ID,
        name: 'Hiburan',
        icon: 'movie',
        color: '#AA96DA',
      },
    }),
    prisma.category.create({
      data: {
        userId: USER_ID,
        name: 'Belanja',
        icon: 'shopping_bag',
        color: '#FCBAD3',
      },
    }),
    prisma.category.create({
      data: {
        userId: USER_ID,
        name: 'Kesehatan',
        icon: 'local_hospital',
        color: '#FFFFD2',
      },
    }),
    prisma.category.create({
      data: {
        userId: USER_ID,
        name: 'Kopi & Kafe',
        icon: 'local_cafe',
        color: '#A8DADC',
      },
    }),
  ]);

  console.log('✅ Created categories');

  // Helper to get date
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const threeDaysAgo = new Date(today);
  threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
  const fiveDaysAgo = new Date(today);
  fiveDaysAgo.setDate(fiveDaysAgo.getDate() - 5);
  const oneWeekAgo = new Date(today);
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
  const twoWeeksAgo = new Date(today);
  twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);

  // Create Expenses
  const expenses = [
    // Today's expenses
    {
      userId: USER_ID,
      categoryId: categories.find(c => c.name === 'Kopi & Kafe')?.id,
      item: 'Starbucks Coffee',
      amount: 5.50,
      expenseDate: today,
      notes: 'Grande Caramel Macchiato - Visa •••• 4242',
    },
    {
      userId: USER_ID,
      categoryId: categories.find(c => c.name === 'Belanjaan')?.id,
      item: 'Whole Foods Market',
      amount: 39.50,
      expenseDate: today,
      notes: 'Weekly groceries - Apple Pay',
    },
    {
      userId: USER_ID,
      categoryId: categories.find(c => c.name === 'Makanan & Minuman')?.id,
      item: 'Lunch at Chipotle',
      amount: 12.75,
      expenseDate: today,
      notes: 'Burrito bowl - MasterCard •••• 8812',
    },

    // Yesterday's expenses
    {
      userId: USER_ID,
      categoryId: categories.find(c => c.name === 'Transportasi')?.id,
      item: 'Uber Trip',
      amount: 25.00,
      expenseDate: yesterday,
      notes: 'Home to office - MasterCard •••• 8812',
    },
    {
      userId: USER_ID,
      categoryId: categories.find(c => c.name === 'Utilitas')?.id,
      item: 'Electric Bill',
      amount: 95.00,
      expenseDate: yesterday,
      notes: 'Monthly electric bill - Bank Transfer',
    },
    {
      userId: USER_ID,
      categoryId: categories.find(c => c.name === 'Makanan & Minuman')?.id,
      item: 'Pizza Hut Dinner',
      amount: 28.50,
      expenseDate: yesterday,
      notes: 'Family dinner - Visa •••• 4242',
    },

    // 3 days ago
    {
      userId: USER_ID,
      categoryId: categories.find(c => c.name === 'Hiburan')?.id,
      item: 'Netflix Subscription',
      amount: 12.99,
      expenseDate: threeDaysAgo,
      notes: 'Monthly subscription - Visa •••• 4242',
    },
    {
      userId: USER_ID,
      categoryId: categories.find(c => c.name === 'Kopi & Kafe')?.id,
      item: 'Dunkin Donuts',
      amount: 8.25,
      expenseDate: threeDaysAgo,
      notes: 'Coffee and donuts - Cash',
    },

    // 5 days ago
    {
      userId: USER_ID,
      categoryId: categories.find(c => c.name === 'Belanja')?.id,
      item: 'Amazon Purchase',
      amount: 45.99,
      expenseDate: fiveDaysAgo,
      notes: 'Books and office supplies - Visa •••• 4242',
    },
    {
      userId: USER_ID,
      categoryId: categories.find(c => c.name === 'Transportasi')?.id,
      item: 'Gas Station',
      amount: 52.00,
      expenseDate: fiveDaysAgo,
      notes: 'Shell gas station - Visa •••• 4242',
    },
    {
      userId: USER_ID,
      categoryId: categories.find(c => c.name === 'Makanan & Minuman')?.id,
      item: 'Sushi Restaurant',
      amount: 65.00,
      expenseDate: fiveDaysAgo,
      notes: 'Dinner for two - MasterCard •••• 8812',
    },

    // 1 week ago
    {
      userId: USER_ID,
      categoryId: categories.find(c => c.name === 'Kesehatan')?.id,
      item: 'Pharmacy - CVS',
      amount: 23.50,
      expenseDate: oneWeekAgo,
      notes: 'Prescription medication - Visa •••• 4242',
    },
    {
      userId: USER_ID,
      categoryId: categories.find(c => c.name === 'Belanjaan')?.id,
      item: 'Walmart Groceries',
      amount: 78.25,
      expenseDate: oneWeekAgo,
      notes: 'Weekly shopping - Debit Card',
    },
    {
      userId: USER_ID,
      categoryId: categories.find(c => c.name === 'Hiburan')?.id,
      item: 'Movie Tickets',
      amount: 32.00,
      expenseDate: oneWeekAgo,
      notes: 'Cinema - 2 tickets - Visa •••• 4242',
    },

    // 2 weeks ago
    {
      userId: USER_ID,
      categoryId: categories.find(c => c.name === 'Belanja')?.id,
      item: 'Target Shopping',
      amount: 125.50,
      expenseDate: twoWeeksAgo,
      notes: 'Household items - MasterCard •••• 8812',
    },
    {
      userId: USER_ID,
      categoryId: categories.find(c => c.name === 'Makanan & Minuman')?.id,
      item: 'Olive Garden',
      amount: 48.75,
      expenseDate: twoWeeksAgo,
      notes: 'Lunch meeting - Visa •••• 4242',
    },
    {
      userId: USER_ID,
      categoryId: categories.find(c => c.name === 'Transportasi')?.id,
      item: 'Lyft Ride',
      amount: 18.50,
      expenseDate: twoWeeksAgo,
      notes: 'Airport pickup - Apple Pay',
    },
  ];

  await prisma.expense.createMany({
    data: expenses,
  });

  console.log('✅ Created expenses');

  // Get stats
  const expenseCount = await prisma.expense.count({ where: { userId: USER_ID } });
  const categoryCount = await prisma.category.count({ where: { userId: USER_ID } });

  console.log(`\n📊 Seed Summary:`);
  console.log(`   User ID: ${USER_ID}`);
  console.log(`   Categories: ${categoryCount}`);
  console.log(`   Expenses: ${expenseCount}`);
  console.log(`\n✨ Seed completed successfully!`);
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
